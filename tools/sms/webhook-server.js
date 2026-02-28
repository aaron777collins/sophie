#!/usr/bin/env node
/**
 * SMS Webhook Server for Sophie
 * Receives Twilio SMS webhooks and routes to Clawdbot gateway
 * 
 * Port: 8089
 * Endpoints:
 *   POST /sms/inbound - Twilio SMS webhook
 *   GET /health - Health check
 */

const http = require('http');
const { URL } = require('url');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.SMS_PORT || 8089;
const LOG_DIR = path.join(process.env.HOME, 'clawd/data/sms/logs');
const DB_FILE = path.join(process.env.HOME, 'clawd/data/contacts/contacts.db');
const CREDS_FILE = path.join(process.env.HOME, 'clawd/data/twilio-credentials.secret');

// Load Twilio credentials
let TWILIO_AUTH_TOKEN = '';
try {
  const creds = fs.readFileSync(CREDS_FILE, 'utf8');
  const match = creds.match(/TWILIO_AUTH_TOKEN=(\S+)/);
  if (match) TWILIO_AUTH_TOKEN = match[1];
} catch (e) {
  console.error('Warning: Could not load Twilio credentials');
}

// Gateway config
const GATEWAY_URL = 'http://127.0.0.1:18789';
const GATEWAY_TOKEN = '0d06bec1b3a5d6863d861d3664e86097d0d01131577519b6';

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log to file
function logToFile(filename, data) {
  const logPath = path.join(LOG_DIR, filename);
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `${timestamp} ${JSON.stringify(data)}\n`);
}

// Normalize phone number
function normalizePhone(num) {
  const digits = num.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return `+${digits}`;
}

// Get trust level for phone number
function getTrustLevel(phone) {
  const normalized = normalizePhone(phone);
  try {
    // Check trusted_phones table
    const result = execSync(
      `sqlite3 "${DB_FILE}" "SELECT trust_level, owner FROM trusted_phones WHERE phone = '${normalized}' OR phone = '${normalized.slice(1)}' OR phone = '${normalized.slice(2)}';"`,
      { encoding: 'utf8' }
    ).trim();
    
    if (result) {
      const [level, owner] = result.split('|');
      return { level, owner, normalized };
    }
    
    // Check contact_identifiers
    const contactResult = execSync(
      `sqlite3 "${DB_FILE}" "SELECT c.name, c.trust_level FROM contacts c JOIN contact_identifiers ci ON c.id = ci.contact_id WHERE ci.platform = 'phone' AND ci.identifier = '${normalized}';"`,
      { encoding: 'utf8' }
    ).trim();
    
    if (contactResult) {
      const [name, trustLevel] = contactResult.split('|');
      const level = trustLevel === 'verified_owner' ? 'full' : (trustLevel === 'trusted' ? 'partial' : 'none');
      return { level, owner: name, normalized };
    }
    
    return { level: 'none', owner: null, normalized };
  } catch (e) {
    console.error('Trust lookup error:', e.message);
    return { level: 'none', owner: null, normalized };
  }
}

// Log SMS to database
function logSMS(direction, from, to, body, sid, trustLevel, status = 'received') {
  try {
    const escapedBody = body.replace(/'/g, "''");
    execSync(
      `sqlite3 "${DB_FILE}" "INSERT INTO sms_messages (direction, from_number, to_number, body, twilio_sid, trust_level, status) VALUES ('${direction}', '${from}', '${to}', '${escapedBody}', '${sid || ''}', '${trustLevel}', '${status}');"`,
      { encoding: 'utf8' }
    );
  } catch (e) {
    console.error('DB log error:', e.message);
  }
}

// Send to Clawdbot gateway
async function sendToGateway(from, body, trustLevel, ownerName) {
  const trustContext = ownerName 
    ? `[SMS from ${ownerName} (${from}) - Trust: ${trustLevel.toUpperCase()}]`
    : `[SMS from ${from} - Trust: ${trustLevel.toUpperCase()} - UNKNOWN NUMBER]`;
  
  const message = `${trustContext}\n\n${body}`;
  
  const payload = JSON.stringify({
    message,
    channel: 'sms',
    userId: from,
    metadata: {
      source: 'twilio-sms',
      trustLevel,
      phone: from
    }
  });
  
  return new Promise((resolve, reject) => {
    const url = new URL('/agent', GATEWAY_URL);
    
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Gateway returned ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Validate Twilio signature
function validateTwilioSignature(req, body, signature) {
  if (!TWILIO_AUTH_TOKEN) return true; // Skip if no token
  if (!signature) return false;
  
  // Build the full URL
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const url = `${protocol}://${host}${req.url}`;
  
  // Sort params and concatenate
  const params = Object.entries(body)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}${v}`)
    .join('');
  
  const dataToSign = url + params;
  const expected = crypto
    .createHmac('sha1', TWILIO_AUTH_TOKEN)
    .update(dataToSign)
    .digest('base64');
  
  return signature === expected;
}

// Parse URL-encoded body
function parseUrlEncoded(body) {
  const params = {};
  body.split('&').forEach(pair => {
    const [key, value] = pair.split('=').map(decodeURIComponent);
    params[key] = value;
  });
  return params;
}

// TwiML response
function twimlResponse(message = '') {
  if (message) {
    return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
  }
  return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
}

// Request handler
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Health check
  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'sms-webhook' }));
    return;
  }
  
  // Inbound SMS webhook
  if (url.pathname === '/sms/inbound' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const params = parseUrlEncoded(body);
        const { From, To, Body, MessageSid } = params;
        
        console.log(`[${new Date().toISOString()}] Inbound SMS from ${From}: ${Body?.substring(0, 50)}...`);
        logToFile('inbound.log', { from: From, to: To, body: Body, sid: MessageSid });
        
        // Validate signature (optional in dev)
        const signature = req.headers['x-twilio-signature'];
        if (TWILIO_AUTH_TOKEN && !validateTwilioSignature(req, params, signature)) {
          console.warn('Invalid Twilio signature');
          // Continue anyway for now (signature validation is tricky with proxies)
        }
        
        // Get trust level
        const trust = getTrustLevel(From);
        console.log(`Trust: ${trust.level} (${trust.owner || 'unknown'})`);
        
        // Log to DB
        logSMS('inbound', From, To, Body, MessageSid, trust.level);
        
        // Route based on trust
        let replyMessage = '';
        
        if (trust.level === 'full') {
          // Aaron - full access
          try {
            await sendToGateway(From, Body, trust.level, trust.owner);
            replyMessage = ''; // Don't auto-reply, let Sophie respond via sms-cli
          } catch (e) {
            console.error('Gateway error:', e.message);
            replyMessage = '[Sophie] Received, but had trouble processing. Check Slack!';
          }
        } else if (trust.level === 'partial') {
          // Known contact - limited
          try {
            await sendToGateway(From, Body, trust.level, trust.owner);
            replyMessage = '';
          } catch (e) {
            console.error('Gateway error:', e.message);
          }
        } else {
          // Unknown - minimal, log only
          console.log('Unknown number - logging only');
          // Don't send to gateway, just log
          // Could optionally batch-notify Aaron later
        }
        
        // Send TwiML response
        res.writeHead(200, { 'Content-Type': 'application/xml' });
        res.end(twimlResponse(replyMessage));
        
      } catch (e) {
        console.error('Error processing SMS:', e);
        logToFile('errors.log', { error: e.message, body });
        res.writeHead(500, { 'Content-Type': 'application/xml' });
        res.end(twimlResponse());
      }
    });
    return;
  }
  
  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`SMS Webhook Server listening on port ${PORT}`);
  console.log(`  Inbound: POST http://localhost:${PORT}/sms/inbound`);
  console.log(`  Health:  GET http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  console.log('Interrupted, shutting down...');
  server.close(() => process.exit(0));
});
