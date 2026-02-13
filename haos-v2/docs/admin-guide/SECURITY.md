# HAOS Security Guide

## Table of Contents

1. [Security Overview](#security-overview)
2. [Security Architecture](#security-architecture)
3. [Network Security](#network-security)
4. [Authentication & Authorization](#authentication--authorization)
5. [Encryption & Privacy](#encryption--privacy)
6. [Matrix Security Configuration](#matrix-security-configuration)
7. [Application Security](#application-security)
8. [Infrastructure Security](#infrastructure-security)
9. [Monitoring & Incident Response](#monitoring--incident-response)
10. [Security Compliance](#security-compliance)
11. [Security Hardening Checklist](#security-hardening-checklist)
12. [Threat Modeling](#threat-modeling)
13. [Security Maintenance](#security-maintenance)

---

## Security Overview

HAOS (Homelab-as-a-Service) prioritizes security through a multi-layered approach that combines Matrix protocol security features with enterprise-grade deployment practices. This guide provides comprehensive security configuration and hardening procedures for production deployments.

### Security Principles

1. **Defense in Depth**: Multiple security layers to protect against various attack vectors
2. **Zero Trust Architecture**: Verify every request regardless of source
3. **Principle of Least Privilege**: Minimal necessary access rights
4. **End-to-End Encryption**: Client-to-client encryption for all communications
5. **Privacy by Design**: Data protection built into system architecture
6. **Continuous Monitoring**: Real-time security monitoring and alerting

### Security Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **E2E Encryption** | Matrix Olm/Megolm protocols | Automatic for private messages |
| **Federation Security** | Cryptographic server verification | Matrix key exchange |
| **Transport Security** | TLS 1.3 for all connections | Nginx + Let's Encrypt |
| **Authentication** | Multi-factor authentication support | Matrix auth + HAOS layer |
| **Authorization** | Role-based access control | Matrix power levels + HAOS roles |
| **Audit Logging** | Comprehensive activity logs | Application + Matrix logs |
| **Data Protection** | GDPR compliance features | Privacy controls + data retention |

---

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        HAOS Security Stack                      │
├─────────────────────────────────────────────────────────────────┤
│ Application Security (HAOS)                                    │
│ • Input validation • XSS protection • CSRF protection         │
│ • Session management • Rate limiting • Content filtering       │
├─────────────────────────────────────────────────────────────────┤
│ Protocol Security (Matrix)                                     │
│ • End-to-end encryption • Device verification • Key rotation   │
│ • Federation authentication • Message integrity               │
├─────────────────────────────────────────────────────────────────┤
│ Transport Security (TLS/HTTPS)                                 │
│ • TLS 1.3 • Perfect forward secrecy • Certificate validation   │
│ • HSTS • Certificate pinning • Secure ciphers                 │
├─────────────────────────────────────────────────────────────────┤
│ Network Security                                               │
│ • Firewall • DDoS protection • Network segmentation           │
│ • VPN access • IDS/IPS • Network monitoring                   │
├─────────────────────────────────────────────────────────────────┤
│ Infrastructure Security                                         │
│ • OS hardening • Container security • Secrets management      │
│ • Backup encryption • Access controls • Security updates      │
└─────────────────────────────────────────────────────────────────┘
```

### Trust Boundaries

1. **Internet ↔ Reverse Proxy**: Public internet to nginx
2. **Reverse Proxy ↔ Application**: Nginx to HAOS app
3. **Application ↔ Matrix**: HAOS app to Matrix homeserver
4. **Matrix ↔ Database**: Matrix homeserver to PostgreSQL
5. **Internal Services**: LiveKit, Redis, monitoring services

---

## Network Security

### Firewall Configuration

#### UFW (Uncomplicated Firewall) Setup

```bash
#!/bin/bash
# /opt/haos/scripts/configure-firewall.sh

# Reset UFW to defaults
sudo ufw --force reset

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port if using non-standard)
sudo ufw limit 22/tcp comment "SSH"

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp comment "HTTP"
sudo ufw allow 443/tcp comment "HTTPS"

# Allow Matrix federation
sudo ufw allow 8448/tcp comment "Matrix Federation"

# Allow LiveKit signaling
sudo ufw allow 7880/tcp comment "LiveKit Signaling"

# Allow LiveKit RTC (UDP range)
sudo ufw allow 50000:60000/udp comment "LiveKit RTC"

# Enable logging
sudo ufw logging medium

# Enable firewall
sudo ufw --force enable

# Show status
sudo ufw status numbered
```

#### Advanced iptables Rules

```bash
#!/bin/bash
# /opt/haos/scripts/advanced-firewall.sh

# Flush existing rules
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X

# Set default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP  
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Rate limiting for SSH
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name ssh --rsource
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 --rttl --name ssh --rsource -j DROP
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Web traffic
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Matrix federation with rate limiting
iptables -A INPUT -p tcp --dport 8448 -m limit --limit 25/min --limit-burst 100 -j ACCEPT

# LiveKit with connection limiting
iptables -A INPUT -p tcp --dport 7880 -m connlimit --connlimit-above 100 -j DROP
iptables -A INPUT -p tcp --dport 7880 -j ACCEPT

# LiveKit RTC (UDP)
iptables -A INPUT -p udp --dport 50000:60000 -j ACCEPT

# Log dropped packets
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables denied: " --log-level 7

# Drop everything else
iptables -A INPUT -j DROP

# Save rules (Ubuntu/Debian)
iptables-save > /etc/iptables/rules.v4
```

### DDoS Protection

#### Rate Limiting Configuration

```nginx
# /etc/nginx/conf.d/rate-limiting.conf

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=global:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=media:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=federation:10m rate=100r/m;

# Connection limiting
limit_conn_zone $binary_remote_addr zone=perip:10m;
limit_conn_zone $server_name zone=perserver:10m;

# Geographic blocking (optional)
geo $blocked_country {
    default 0;
    # Add countries to block
    # CN 1; # China
    # RU 1; # Russia
}

# User agent blocking
map $http_user_agent $blocked_agent {
    default 0;
    "~*bot" 1;
    "~*crawler" 1; 
    "~*spider" 1;
    "" 1; # Empty user agent
}

# Malicious request patterns
map $request_uri $blocked_uri {
    default 0;
    "~*\.(php|asp|jsp)" 1;
    "~*/wp-admin" 1;
    "~*/admin" 1;
    "~*\.env" 1;
}
```

#### Nginx Security Configuration

```nginx
# /etc/nginx/conf.d/security.conf

# Hide nginx version
server_tokens off;

# Buffer overflow protection
client_body_buffer_size 1k;
client_header_buffer_size 1k;
client_max_body_size 50M;
large_client_header_buffers 2 1k;

# Timeout protection
client_body_timeout 10;
client_header_timeout 10;
keepalive_timeout 5 5;
send_timeout 10;

# Limit simultaneous connections
limit_conn perip 10;
limit_conn perserver 100;

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Content Security Policy
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' wss: https:;
    media-src 'self' https:;
    object-src 'none';
    frame-ancestors 'none';
    upgrade-insecure-requests;
" always;

# HSTS
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

### Network Segmentation

#### Docker Network Security

```yaml
# /opt/haos/docker-compose.yml - Network configuration

version: '3.8'

networks:
  # Frontend network (nginx, app)
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.1.0/24
    
  # Backend network (database, cache)  
  backend:
    driver: bridge
    internal: true  # No external access
    ipam:
      config:
        - subnet: 172.20.2.0/24
        
  # Matrix network (synapse, workers)
  matrix:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.3.0/24

services:
  nginx:
    networks:
      - frontend
      
  haos:
    networks:
      - frontend
      - matrix
      
  synapse:
    networks:
      - matrix
      - backend
      
  postgres:
    networks:
      - backend  # Only accessible from backend
      
  redis:
    networks:
      - backend
      - matrix
```

---

## Authentication & Authorization

### Matrix Authentication Security

#### Strong Password Policy

```yaml
# /opt/haos/matrix/homeserver.yaml

# Password configuration
password_config:
  enabled: true
  policy:
    min_length: 14
    max_length: 128
    require_lowercase: true
    require_uppercase: true
    require_digit: true
    require_symbol: true
    
    # Custom validation
    reject_weak_passwords: true
    
    # Prohibit common passwords
    enabled_password_complexity_check: true
```

#### Account Security Settings

```yaml
# Account lockout policy
account_threepid_delegates:
  email: identity.vector.im
  msisdn: identity.vector.im

# Rate limiting for authentication
rc_login:
  account:
    per_second: 0.17
    burst_count: 3
  address:
    per_second: 0.17  
    burst_count: 3
  failed_attempts:
    per_second: 0.17
    burst_count: 3

# Session management
session_lifetime: 604800000  # 7 days
require_auth_for_profile_requests: true
limit_profile_requests_to_users_who_share_rooms: true
```

### Multi-Factor Authentication

#### TOTP (Time-based One-Time Password) Setup

```javascript
// /opt/haos/app/config/mfa.js

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

module.exports = {
  totp: {
    enabled: true,
    issuer: 'HAOS',
    
    // Generate secret for new user
    generateSecret: (userId) => {
      return speakeasy.generateSecret({
        name: userId,
        issuer: 'HAOS',
        length: 32,
      });
    },
    
    // Verify TOTP token
    verifyToken: (secret, token) => {
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2, // Allow 2 time steps tolerance
      });
    },
    
    // Generate QR code
    generateQRCode: async (secret) => {
      return await qrcode.toDataURL(secret.otpauth_url);
    },
  },
  
  // Backup codes
  backupCodes: {
    enabled: true,
    count: 10,
    length: 8,
  },
  
  // Recovery options
  recovery: {
    emailEnabled: true,
    adminOverride: true,
    securityQuestions: false,
  },
};
```

### Role-Based Access Control

#### Matrix Power Levels

```javascript
// /opt/haos/app/config/roles.js

module.exports = {
  // Default power levels for rooms
  defaultPowerLevels: {
    // User roles
    users_default: 0,
    
    // Action requirements
    ban: 50,
    kick: 50,
    redact: 50,
    invite: 25,
    
    // State events
    state_default: 50,
    events_default: 0,
    
    // Room events
    events: {
      "m.room.name": 50,
      "m.room.power_levels": 100,
      "m.room.history_visibility": 100,
      "m.room.encryption": 100,
      "m.room.server_acl": 100,
    },
    
    // Notifications
    notifications: {
      room: 50,
    },
  },
  
  // HAOS-specific roles
  roles: {
    owner: {
      powerLevel: 100,
      permissions: ['*'],
      description: 'Server owner with full permissions',
    },
    
    admin: {
      powerLevel: 75,
      permissions: [
        'user.manage',
        'room.manage',
        'server.configure',
        'audit.view',
      ],
      description: 'Administrator with management permissions',
    },
    
    moderator: {
      powerLevel: 50,
      permissions: [
        'message.moderate',
        'user.kick',
        'user.ban',
        'room.moderate',
      ],
      description: 'Moderator with content management permissions',
    },
    
    member: {
      powerLevel: 0,
      permissions: [
        'message.send',
        'file.upload',
        'voice.join',
      ],
      description: 'Regular member with basic permissions',
    },
    
    guest: {
      powerLevel: -10,
      permissions: [
        'message.read',
      ],
      description: 'Guest with read-only access',
    },
  },
};
```

### Single Sign-On (SSO) Integration

#### SAML 2.0 Configuration

```yaml
# /opt/haos/matrix/homeserver.yaml - SAML configuration

saml2_config:
  sp_config:
    metadata:
      inline:
        - entityID: "https://your.domain.com/_matrix/saml2/metadata.xml"
          service:
            sp:
              endpoints:
                assertion_consumer_service:
                  - Binding: urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST
                    Location: "https://your.domain.com/_matrix/saml2/authn_response"
                    index: "1"
              nameid_format: urn:oasis:names:tc:SAML:2.0:nameid-format:persistent
              
  idp_config:
    metadata:
      remote:
        - url: "https://your-idp.com/metadata"
          
  # User mapping
  user_mapping_provider:
    config:
      mxid_source_attribute: "uid"
      mxid_mapping: "dotreplace"
      display_name_template: "{{ user.first_name }} {{ user.last_name }}"
      email_template: "{{ user.email }}"
      
  # Attribute mapping  
  attribute_requirements:
    - attribute: "uid"
      value: ".*"
    - attribute: "email" 
      value: ".*@your-domain\\.com"
```

---

## Encryption & Privacy

### End-to-End Encryption

#### Matrix Encryption Configuration

```yaml
# /opt/haos/matrix/homeserver.yaml - Encryption settings

# Enable encryption by default
encryption_enabled_by_default_for_room_type: all

# Key backup settings
key_backup_settings:
  enabled: true
  backup_algorithm: "m.megolm_backup.v1.curve25519-aes-sha2"
  
# Cross-signing configuration
cross_signing:
  enabled: true
  master_key_backup: true
  
# Device verification
device_verification:
  enabled: true
  require_verification_for_new_devices: true
  
# Key sharing policies
key_sharing:
  enabled: true
  history_visibility: "joined"
  max_age: 604800  # 7 days
```

#### HAOS Encryption Features

```javascript
// /opt/haos/app/config/encryption.js

module.exports = {
  // Matrix encryption settings
  matrix: {
    enableEncryptionByDefault: true,
    requireEncryptionForPrivateRooms: true,
    deviceVerificationRequired: false, // Optional for UX
    
    // Key backup
    keyBackup: {
      enabled: true,
      algorithm: 'm.megolm_backup.v1.curve25519-aes-sha2',
      autoBackup: true,
    },
    
    // Cross-signing
    crossSigning: {
      enabled: true,
      autoSign: false, // Require manual verification
    },
  },
  
  // Transport encryption
  transport: {
    requireTLS: true,
    minTLSVersion: '1.2',
    preferTLS13: true,
    hsts: {
      enabled: true,
      maxAge: 31536000,
      includeSubdomains: true,
      preload: true,
    },
  },
  
  // Data at rest encryption
  dataAtRest: {
    database: {
      enabled: true,
      algorithm: 'AES-256-GCM',
    },
    
    media: {
      enabled: true, 
      algorithm: 'AES-256-CBC',
    },
    
    backups: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotation: 90, // days
    },
  },
};
```

### Privacy Controls

#### Data Retention Policies

```yaml
# /opt/haos/matrix/homeserver.yaml - Data retention

# Media retention
media_retention:
  default_policy:
    min_lifetime: 1d
    max_lifetime: 365d
    
  per_room_policy:
    "!private:your.domain.com":
      min_lifetime: 30d
      max_lifetime: 2555d  # 7 years
      
# Message retention (requires Synapse workers)
retention:
  enabled: true
  default_policy:
    min_lifetime: 1d
    max_lifetime: 365d
    
  purge_jobs:
    - shortest_max_lifetime: 1d
    - longest_max_lifetime: 365d

# User data retention
user_ips_max_age: 30d
```

#### Privacy Features

```javascript
// /opt/haos/app/config/privacy.js

module.exports = {
  // User privacy controls
  userPrivacy: {
    defaultVisibility: 'private',
    allowPublicProfile: true,
    allowDirectoryListing: false,
    
    // Contact discovery
    contactDiscovery: {
      enabled: false,
      requireConsent: true,
    },
    
    // Read receipts
    readReceipts: {
      enabled: true,
      defaultSetting: 'private',
      allowDisable: true,
    },
    
    // Typing indicators
    typingIndicators: {
      enabled: true,
      defaultSetting: 'enabled',
      allowDisable: true,
    },
  },
  
  // Data subject rights (GDPR)
  dataSubjectRights: {
    dataExport: {
      enabled: true,
      format: 'json',
      includeMedia: false, // Due to size
    },
    
    dataErasure: {
      enabled: true,
      retentionPeriod: 30, // days
      confirmationRequired: true,
    },
    
    dataPortability: {
      enabled: true,
      formats: ['json', 'csv'],
    },
  },
  
  // Audit logging
  auditLogging: {
    enabled: true,
    logLevel: 'info',
    includeContent: false, // Metadata only for privacy
    
    events: [
      'user.login',
      'user.logout', 
      'room.join',
      'room.leave',
      'message.send',
      'file.upload',
      'admin.action',
    ],
  },
};
```

---

## Matrix Security Configuration

### Homeserver Hardening

#### Security-Focused Synapse Configuration

```yaml
# /opt/haos/matrix/homeserver.yaml - Security hardening

# Disable unnecessary features
enable_registration: false
enable_registration_without_verification: false
allow_guest_access: false
enable_metrics: false  # Or restrict access

# Federation security
federation_verify_certificates: true
federation_domain_whitelist: []  # Restrict as needed

# Rate limiting (aggressive)
rc_message:
  per_second: 2
  burst_count: 10

rc_registration:
  per_second: 0.1
  burst_count: 1

rc_login:
  address:
    per_second: 0.1
    burst_count: 3
  account:
    per_second: 0.1
    burst_count: 3
  failed_attempts:
    per_second: 0.1
    burst_count: 3

# Admin contact
admin_contact: 'security@your.domain.com'

# Security headers for media
content_disposition_filename: true

# Disable URL previews for external content (optional)
url_preview_enabled: false

# Strict event authorization
event_cache_size: 1000
disable_federation: false  # Set to true for private deployments
```

### Federation Security

#### Server Access Control Lists

```yaml
# Room-level server ACLs
server_acls:
  allow:
    - "your.domain.com"
    - "trusted-partner.com"
    - "matrix.org"
  
  deny:
    - "*.suspicious-domain.com"
    - "known-bad-server.com"
    
# Homeserver federation restrictions
federation_whitelist:
  - "matrix.org"
  - "vector.im" 
  - "trusted-partners.com"
  
# IP-based restrictions
federation_ip_range_blacklist:
  - '127.0.0.0/8'
  - '10.0.0.0/8' 
  - '172.16.0.0/12'
  - '192.168.0.0/16'
  - '100.64.0.0/10'
  - '169.254.0.0/16'
  - '::1/128'
  - 'fe80::/10'
  - 'fc00::/7'
```

### Room Security Settings

#### Default Room Configuration

```javascript
// /opt/haos/app/config/rooms.js

module.exports = {
  defaultRoomSettings: {
    // Basic settings
    preset: "private_chat",
    visibility: "private",
    
    // Encryption
    encryption: {
      algorithm: "m.megolm.v1.aes-sha2",
      rotation_period_ms: 604800000, // 7 days
      rotation_period_msgs: 100,
    },
    
    // History visibility
    history_visibility: "joined",
    
    // Guest access
    guest_access: "forbidden",
    
    // Join rules
    join_rules: "invite",
    
    // Power levels (secure defaults)
    power_levels: {
      users_default: 0,
      events_default: 0,
      state_default: 50,
      
      ban: 50,
      kick: 50,
      redact: 50,
      invite: 25,
      
      events: {
        "m.room.name": 50,
        "m.room.power_levels": 75,
        "m.room.history_visibility": 50,
        "m.room.encryption": 100,
        "m.room.server_acl": 100,
      },
    },
  },
  
  // Security policies
  security: {
    // File sharing restrictions
    allowedFileTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'text/plain', 'application/pdf',
    ],
    
    maxFileSize: 50 * 1024 * 1024, // 50MB
    
    // Link sharing
    urlPreviewEnabled: false,
    
    // Message retention
    messageRetention: {
      enabled: true,
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    },
  },
};
```

---

## Application Security

### Input Validation & Sanitization

#### Content Security Policies

```javascript
// /opt/haos/app/middleware/security.js

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const xss = require('xss');

// Content Security Policy
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'", 
      "'unsafe-inline'", // Required for some Matrix client functionality
      "'unsafe-eval'",   // Required for Matrix SDK
    ],
    styleSrc: [
      "'self'", 
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
    ],
    imgSrc: [
      "'self'", 
      "data:", 
      "https:",
      "blob:", // Required for Matrix media
    ],
    mediaSrc: ["'self'", "https:", "blob:"],
    fontSrc: [
      "'self'", 
      "https://fonts.gstatic.com",
    ],
    connectSrc: [
      "'self'", 
      "wss:", // WebSocket for Matrix sync
      "https:",
    ],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: [],
  },
};

// Rate limiting
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateInput = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Invalid input',
      details: error.details.map(d => d.message),
    });
  }
  
  req.body = value;
  next();
};

// XSS protection
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key], {
          whiteList: {}, // No HTML allowed
        });
      }
    }
  }
  next();
};

module.exports = {
  helmet: helmet({
    contentSecurityPolicy: cspConfig,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
  
  rateLimiting: {
    global: createRateLimit(15 * 60 * 1000, 1000, 'Too many requests'),
    auth: createRateLimit(15 * 60 * 1000, 5, 'Too many login attempts'),
    api: createRateLimit(60 * 1000, 100, 'API rate limit exceeded'),
  },
  
  validateInput,
  sanitizeInput,
};
```

### Session Management

#### Secure Session Configuration

```javascript
// /opt/haos/app/config/session.js

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 3, // Separate database for sessions
});

module.exports = {
  session: session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.HAOS_SESSION_SECRET,
    
    name: 'haos.sid', // Don't use default name
    
    resave: false,
    saveUninitialized: false,
    
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only
      httpOnly: true, // Prevent XSS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax', // CSRF protection
    },
    
    // Session rotation for security
    genid: () => {
      return require('crypto').randomBytes(32).toString('hex');
    },
  }),
  
  // Session security middleware
  sessionSecurity: (req, res, next) => {
    // Regenerate session ID on login
    if (req.session && req.session.loginTime) {
      const sessionAge = Date.now() - req.session.loginTime;
      
      // Force re-authentication after 24 hours
      if (sessionAge > 24 * 60 * 60 * 1000) {
        req.session.destroy();
        return res.status(401).json({ error: 'Session expired' });
      }
      
      // Regenerate session ID hourly
      if (sessionAge % (60 * 60 * 1000) < 1000) {
        req.session.regenerate((err) => {
          if (err) console.error('Session regeneration failed:', err);
          next();
        });
      } else {
        next();
      }
    } else {
      next();
    }
  },
};
```

### API Security

#### Authentication & Authorization Middleware

```javascript
// /opt/haos/app/middleware/auth.js

const jwt = require('jsonwebtoken');
const { MatrixAuth } = require('matrix-js-sdk');

// JWT configuration
const jwtConfig = {
  secret: process.env.HAOS_JWT_SECRET,
  expiresIn: '1h',
  issuer: 'haos',
  audience: 'haos-api',
};

// Matrix authentication
const authenticateMatrix = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.substring(7);
    
    // Validate Matrix access token
    const matrixClient = new MatrixAuth({
      baseUrl: process.env.MATRIX_HOMESERVER,
      accessToken: token,
    });
    
    const user = await matrixClient.getProfile();
    req.user = user;
    req.matrixToken = token;
    
    next();
  } catch (error) {
    console.error('Matrix authentication failed:', error);
    res.status(401).json({ error: 'Invalid Matrix token' });
  }
};

// Role-based authorization
const requireRole = (requiredRole) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Check user role in Matrix power levels
  const userRole = getUserRole(req.user.user_id, req.room_id);
  
  if (!hasPermission(userRole, requiredRole)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  next();
};

// Permission checking
const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    guest: 0,
    member: 10,
    moderator: 50,
    admin: 75,
    owner: 100,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

module.exports = {
  authenticateMatrix,
  requireRole,
  jwtConfig,
};
```

---

## Infrastructure Security

### Container Security

#### Docker Security Configuration

```yaml
# /opt/haos/docker-compose.yml - Security-hardened containers

version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: haos-postgres
    
    # Security configuration
    security_opt:
      - no-new-privileges:true
    
    # Read-only root filesystem
    read_only: true
    
    # Temporary filesystem for writable areas
    tmpfs:
      - /tmp
      - /var/run/postgresql
    
    # User namespace
    user: "70:70"  # postgres user
    
    # Resource limits
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
    
    # Capabilities
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    
    # Environment variables (use secrets in production)
    environment:
      POSTGRES_DB: synapse
      POSTGRES_USER: synapse
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    
    secrets:
      - postgres_password
    
    volumes:
      - postgres_data:/var/lib/postgresql/data:Z
    
    networks:
      - backend

  synapse:
    image: matrixdotorg/synapse:latest
    container_name: haos-synapse
    
    # Security configuration  
    security_opt:
      - no-new-privileges:true
    
    # Non-root user
    user: "991:991"
    
    # Resource limits
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
    
    # Capabilities
    cap_drop:
      - ALL
    
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8008/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    
    volumes:
      - synapse_data:/data:Z
    
    networks:
      - matrix
      - backend

secrets:
  postgres_password:
    file: ./secrets/postgres_password
  matrix_signing_key:
    file: ./secrets/matrix_signing_key

volumes:
  postgres_data:
    driver: local
  synapse_data:
    driver: local

networks:
  backend:
    driver: bridge
    internal: true
  matrix:
    driver: bridge
```

### Host Security

#### System Hardening Script

```bash
#!/bin/bash
# /opt/haos/scripts/harden-system.sh

echo "Starting system hardening..."

# Update system
apt update && apt upgrade -y

# Install security tools
apt install -y \
    fail2ban \
    ufw \
    rkhunter \
    chkrootkit \
    aide \
    auditd \
    apparmor \
    apparmor-utils

# Configure fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 2
EOF

# SSH hardening
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#Protocol 2/Protocol 2/' /etc/ssh/sshd_config
echo "AllowUsers haos" >> /etc/ssh/sshd_config

# Kernel parameters
cat > /etc/sysctl.d/99-security.conf << 'EOF'
# IP Spoofing protection
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.rp_filter = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Ignore ping requests
net.ipv4.icmp_echo_ignore_all = 1

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Log Martians
net.ipv4.conf.all.log_martians = 1

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0
EOF

# Apply sysctl settings
sysctl -p /etc/sysctl.d/99-security.conf

# File system security
echo "tmpfs /tmp tmpfs defaults,rw,nosuid,nodev,noexec,relatime 0 0" >> /etc/fstab
echo "tmpfs /var/tmp tmpfs defaults,rw,nosuid,nodev,noexec,relatime 0 0" >> /etc/fstab

# Set file permissions
chmod 700 /opt/haos
chmod 600 /opt/haos/secrets/*
chmod 644 /opt/haos/nginx/*.conf

# Enable services
systemctl enable fail2ban
systemctl enable ufw
systemctl enable auditd

# Start services
systemctl start fail2ban
systemctl start auditd

echo "System hardening completed."
```

### Secrets Management

#### HashiCorp Vault Integration

```bash
#!/bin/bash
# /opt/haos/scripts/setup-vault.sh

# Install Vault
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
apt update && apt install vault

# Configure Vault
mkdir -p /opt/vault/data
mkdir -p /etc/vault.d

cat > /etc/vault.d/vault.hcl << 'EOF'
storage "file" {
  path = "/opt/vault/data"
}

listener "tcp" {
  address     = "127.0.0.1:8200"
  tls_disable = "true"
}

api_addr = "http://127.0.0.1:8200"
cluster_addr = "http://127.0.0.1:8201"
ui = true
disable_mlock = true
EOF

# Vault service
systemctl enable vault
systemctl start vault

# Initialize Vault (run once)
export VAULT_ADDR='http://127.0.0.1:8200'
vault operator init -key-shares=5 -key-threshold=3 > /opt/haos/vault-keys.txt

# Store secrets
vault kv put secret/haos/postgres password="$(openssl rand -base64 32)"
vault kv put secret/haos/matrix signing_key="$(openssl rand -base64 64)"
vault kv put secret/haos/session secret="$(openssl rand -base64 32)"
```

---

## Monitoring & Incident Response

### Security Monitoring

#### Comprehensive Logging Configuration

```yaml
# /opt/haos/monitoring/promtail.yml

server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # System logs
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: syslog
          __path__: /var/log/syslog
          
  # Authentication logs
  - job_name: auth
    static_configs:
      - targets:
          - localhost
        labels:
          job: auth
          __path__: /var/log/auth.log
          
  # Nginx logs
  - job_name: nginx
    static_configs:
      - targets:
          - localhost
        labels:
          job: nginx-access
          __path__: /var/log/nginx/access.log
          
  - job_name: nginx-error
    static_configs:
      - targets:
          - localhost
        labels:
          job: nginx-error
          __path__: /var/log/nginx/error.log
          
  # HAOS application logs
  - job_name: haos
    static_configs:
      - targets:
          - localhost
        labels:
          job: haos-app
          __path__: /opt/haos/logs/haos.log
          
  # Matrix logs
  - job_name: matrix
    static_configs:
      - targets:
          - localhost
        labels:
          job: matrix
          __path__: /opt/haos/matrix/logs/homeserver.log
```

#### Security Alerting Rules

```yaml
# /opt/haos/monitoring/alerts.yml

groups:
  - name: security
    rules:
      # Failed login attempts
      - alert: HighFailedLogins
        expr: rate(haos_login_failures_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High rate of failed login attempts"
          description: "{{ $value }} failed logins per second in the last 5 minutes"
          
      # Unauthorized access attempts
      - alert: UnauthorizedAccess
        expr: rate(nginx_http_requests_total{status=~"4.."}[5m]) > 1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High rate of 4xx responses"
          description: "Possible unauthorized access attempt"
          
      # Database connection failures
      - alert: DatabaseConnectionFailure
        expr: postgres_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "Database connection has failed"
          
      # Matrix federation issues
      - alert: FederationFailure
        expr: rate(synapse_federation_client_failures_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Matrix federation failures"
          description: "High rate of federation failures detected"
          
      # Disk space
      - alert: DiskSpaceWarning
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 20
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space"
          description: "Less than 20% disk space remaining"
          
      # Memory usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"
          description: "Less than 10% memory available"
```

### Incident Response

#### Security Incident Response Plan

```markdown
# HAOS Security Incident Response Plan

## Incident Classification

### Severity Levels
- **P0 - Critical**: Data breach, system compromise, service unavailable
- **P1 - High**: Unauthorized access, security control bypass
- **P2 - Medium**: Failed security controls, suspicious activity
- **P3 - Low**: Policy violation, minor security concerns

## Response Procedures

### Immediate Response (0-30 minutes)
1. **Assess Severity**: Determine incident classification
2. **Contain Threat**: 
   - Isolate affected systems
   - Block malicious IP addresses
   - Revoke compromised credentials
3. **Alert Team**: Notify security team and stakeholders
4. **Document**: Begin incident log with timestamps

### Investigation Phase (30 minutes - 2 hours)
1. **Preserve Evidence**: Take system snapshots, log backups
2. **Analyze Logs**: Review security logs for attack vectors
3. **Scope Assessment**: Determine full extent of compromise
4. **Root Cause**: Identify how incident occurred

### Recovery Phase (2-24 hours)
1. **Remove Threat**: Clean infected systems, patch vulnerabilities
2. **Restore Services**: Bring systems back online safely
3. **Monitor**: Enhanced monitoring for 72 hours
4. **Communicate**: Update stakeholders on status

### Post-Incident (1-7 days)
1. **Lessons Learned**: Document what went wrong and why
2. **Process Improvement**: Update procedures based on findings
3. **Security Hardening**: Implement additional controls
4. **Training**: Update security awareness training
```

#### Automated Incident Response

```bash
#!/bin/bash
# /opt/haos/scripts/incident-response.sh

INCIDENT_TYPE="$1"
SEVERITY="$2"
DETAILS="$3"

case "$INCIDENT_TYPE" in
  "failed_logins")
    # Block IP after failed login attempts
    IP=$(echo "$DETAILS" | grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b')
    if [[ -n "$IP" ]]; then
      ufw deny from "$IP"
      echo "Blocked IP: $IP"
    fi
    ;;
    
  "unauthorized_access")
    # Enable enhanced logging
    systemctl restart rsyslog
    systemctl restart auditd
    echo "Enhanced logging enabled"
    ;;
    
  "malware_detected")
    # Isolate affected container
    CONTAINER=$(echo "$DETAILS" | cut -d: -f2)
    docker pause "$CONTAINER"
    echo "Container $CONTAINER paused"
    ;;
    
  "data_breach")
    # Emergency lockdown
    ufw reset
    ufw default deny incoming
    ufw default deny outgoing
    ufw enable
    echo "Emergency lockdown activated"
    ;;
esac

# Log incident
echo "$(date): $INCIDENT_TYPE - $SEVERITY - $DETAILS" >> /var/log/security-incidents.log

# Notify administrators
curl -X POST "$SLACK_WEBHOOK" \
  -H 'Content-type: application/json' \
  --data "{\"text\":\"🚨 Security Incident: $INCIDENT_TYPE ($SEVERITY)\n$DETAILS\"}"
```

---

## Security Compliance

### GDPR Compliance

#### Data Protection Implementation

```javascript
// /opt/haos/app/config/gdpr.js

module.exports = {
  // Data processing legal bases
  legalBases: {
    userConsent: 'consent',
    contractPerformance: 'contract',
    legalObligation: 'legal_obligation',
    legitimateInterest: 'legitimate_interest',
  },
  
  // Data categories and retention
  dataCategories: {
    personalData: {
      retention: '7 years',
      legalBasis: 'contract',
      fields: ['user_id', 'email', 'display_name'],
    },
    
    communicationData: {
      retention: '1 year',
      legalBasis: 'legitimate_interest', 
      fields: ['message_content', 'timestamp', 'room_id'],
    },
    
    technicalData: {
      retention: '90 days',
      legalBasis: 'legitimate_interest',
      fields: ['ip_address', 'user_agent', 'device_id'],
    },
  },
  
  // Data subject rights
  dataSubjectRights: {
    // Right to access (Article 15)
    access: {
      enabled: true,
      responseTime: '30 days',
      format: 'json',
    },
    
    // Right to rectification (Article 16)
    rectification: {
      enabled: true,
      selfService: true,
    },
    
    // Right to erasure (Article 17)
    erasure: {
      enabled: true,
      confirmationRequired: true,
      retentionOverride: false,
    },
    
    // Right to data portability (Article 20)
    portability: {
      enabled: true,
      formats: ['json', 'csv'],
    },
    
    // Right to object (Article 21)
    objection: {
      enabled: true,
      processingHalt: true,
    },
  },
  
  // Consent management
  consent: {
    granular: true,
    withdrawable: true,
    recordKeeping: true,
    
    categories: {
      essential: {
        required: true,
        description: 'Essential for service functionality',
      },
      analytics: {
        required: false,
        description: 'Help us improve the service',
      },
      marketing: {
        required: false,
        description: 'Product updates and announcements',
      },
    },
  },
};
```

### SOC 2 Compliance

#### Security Controls Framework

```yaml
# /opt/haos/compliance/soc2-controls.yml

# SOC 2 Type II Controls Implementation

Common_Criteria:
  CC1_Control_Environment:
    CC1.1_Integrity_Ethical_Values:
      description: "Code of conduct and security policies"
      implementation: "/opt/haos/policies/code-of-conduct.md"
      evidence: "/opt/haos/compliance/evidence/CC1.1/"
      
    CC1.2_Board_Oversight:
      description: "Security governance and oversight"
      implementation: "Security committee reviews"
      evidence: "/opt/haos/compliance/evidence/CC1.2/"

  CC2_Communication_Information:
    CC2.1_Security_Policies:
      description: "Security policies communicated to users"
      implementation: "/opt/haos/policies/security-policy.md"
      evidence: "/opt/haos/compliance/evidence/CC2.1/"

Trust_Services_Security:
  CC3_Risk_Assessment:
    CC3.1_Risk_Identification:
      description: "Regular security risk assessments"
      implementation: "Quarterly risk assessment process"
      evidence: "/opt/haos/compliance/evidence/CC3.1/"
      
  CC4_Monitoring:
    CC4.1_Security_Monitoring:
      description: "Continuous security monitoring"
      implementation: "24/7 SIEM monitoring"
      evidence: "/opt/haos/compliance/evidence/CC4.1/"

  CC5_Logical_Access:
    CC5.1_Access_Control:
      description: "Role-based access controls"
      implementation: "RBAC with Matrix power levels"
      evidence: "/opt/haos/compliance/evidence/CC5.1/"
      
    CC5.2_Authentication:
      description: "Multi-factor authentication"
      implementation: "TOTP-based 2FA"
      evidence: "/opt/haos/compliance/evidence/CC5.2/"

  CC6_System_Operations:
    CC6.1_Vulnerability_Management:
      description: "Regular vulnerability scanning"
      implementation: "Weekly automated scans"
      evidence: "/opt/haos/compliance/evidence/CC6.1/"
      
    CC6.2_Incident_Response:
      description: "Security incident response procedures"
      implementation: "Documented IR playbooks"
      evidence: "/opt/haos/compliance/evidence/CC6.2/"

  CC7_Change_Management:
    CC7.1_Change_Control:
      description: "Change management process"
      implementation: "Git-based change control"
      evidence: "/opt/haos/compliance/evidence/CC7.1/"
```

---

## Security Hardening Checklist

### Pre-Deployment Security Checklist

```markdown
# HAOS Security Hardening Checklist

## System Level
- [ ] Operating system fully updated
- [ ] Unnecessary services disabled
- [ ] Fail2ban configured and active
- [ ] UFW firewall configured with minimal open ports
- [ ] SSH hardened (key-only, non-root, custom port)
- [ ] System logging configured (rsyslog/journald)
- [ ] NTP configured for accurate timestamps
- [ ] File system permissions properly set
- [ ] Temporary filesystems configured (tmpfs)
- [ ] Kernel parameters tuned for security

## Network Security
- [ ] TLS 1.3 configured for all endpoints
- [ ] HSTS enabled with long max-age
- [ ] Strong cipher suites configured
- [ ] Certificate auto-renewal working
- [ ] Rate limiting configured on reverse proxy
- [ ] DDoS protection mechanisms in place
- [ ] Network segmentation implemented
- [ ] VPN access configured for admin tasks

## Application Security
- [ ] All default passwords changed
- [ ] Strong password policies enforced
- [ ] Multi-factor authentication enabled
- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] SQL injection protection verified
- [ ] File upload restrictions in place
- [ ] Content Security Policy configured
- [ ] Security headers properly set

## Matrix Security
- [ ] Registration disabled (invite-only)
- [ ] Strong rate limiting configured
- [ ] Federation whitelist configured (if applicable)
- [ ] End-to-end encryption enabled by default
- [ ] Media retention policies configured
- [ ] User IP logging limited
- [ ] Server ACLs configured
- [ ] Signing keys properly secured

## Infrastructure Security
- [ ] Container images updated to latest versions
- [ ] Container security policies applied
- [ ] Secrets management implemented
- [ ] Database encryption at rest enabled
- [ ] Backup encryption configured
- [ ] Resource limits set on containers
- [ ] Health checks configured
- [ ] Security scanning enabled

## Monitoring & Logging
- [ ] Security event logging configured
- [ ] Log aggregation working
- [ ] Alerting rules configured
- [ ] Incident response procedures documented
- [ ] Regular security scans scheduled
- [ ] Audit logging enabled
- [ ] Log retention policies configured
- [ ] SIEM integration completed (if applicable)

## Compliance
- [ ] Privacy policy published and accessible
- [ ] Terms of service updated
- [ ] Data retention policies implemented
- [ ] GDPR compliance measures active
- [ ] Security documentation up to date
- [ ] Staff security training completed
- [ ] Regular security assessments scheduled
```

### Post-Deployment Security Verification

```bash
#!/bin/bash
# /opt/haos/scripts/security-verification.sh

echo "Running HAOS security verification..."

# Check TLS configuration
echo "=== TLS Configuration ==="
testssl --quiet --color 0 https://your.domain.com

# Check HTTP security headers
echo "=== Security Headers ==="
curl -I https://your.domain.com | grep -E "(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Content-Security-Policy)"

# Check firewall status
echo "=== Firewall Status ==="
ufw status verbose

# Check for open ports
echo "=== Open Ports ==="
nmap -sS localhost

# Check service status
echo "=== Service Status ==="
systemctl is-active docker haos nginx fail2ban

# Check log permissions
echo "=== Log Permissions ==="
ls -la /var/log/auth.log /opt/haos/logs/

# Check certificate expiry
echo "=== Certificate Expiry ==="
echo | openssl s_client -servername your.domain.com -connect your.domain.com:443 2>/dev/null | openssl x509 -noout -dates

# Check Matrix security
echo "=== Matrix Security ==="
curl -s https://your.domain.com/_matrix/client/versions | jq .

# Check for known vulnerabilities
echo "=== Vulnerability Check ==="
if command -v lynis &> /dev/null; then
    lynis audit system --quiet --no-colors
fi

echo "Security verification completed."
```

---

## Threat Modeling

### STRIDE Threat Analysis

#### Spoofing Threats

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|---------|
| **Identity Spoofing** | Fake Matrix user registration | Strong authentication, verification required | ✅ Implemented |
| **Server Spoofing** | Malicious Matrix homeserver | Federation verification, certificate validation | ✅ Implemented |
| **DNS Spoofing** | Malicious DNS responses | DNSSEC, certificate pinning | ⚠️ Partial |

#### Tampering Threats

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|---------|
| **Message Tampering** | Man-in-the-middle attacks | End-to-end encryption | ✅ Implemented |
| **Configuration Tampering** | Unauthorized config changes | File permissions, access controls | ✅ Implemented |
| **Database Tampering** | Direct database access | Network segmentation, authentication | ✅ Implemented |

#### Repudiation Threats

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|---------|
| **Message Repudiation** | User denies sending message | Digital signatures, audit logs | ✅ Implemented |
| **Action Repudiation** | Admin denies performing action | Comprehensive audit logging | ✅ Implemented |

#### Information Disclosure Threats

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|---------|
| **Data Leakage** | Unauthorized access to messages | Access controls, encryption | ✅ Implemented |
| **Metadata Leakage** | Connection pattern analysis | Metadata minimization, privacy controls | ⚠️ Partial |
| **System Information** | Banner grabbing, error messages | Information hiding, custom error pages | ✅ Implemented |

#### Denial of Service Threats

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|---------|
| **Resource Exhaustion** | High-volume requests | Rate limiting, resource quotas | ✅ Implemented |
| **Matrix Bombing** | Large message floods | Message rate limiting, moderation | ✅ Implemented |
| **Federation DoS** | Malicious federation traffic | Federation rate limiting, blacklisting | ✅ Implemented |

#### Elevation of Privilege Threats

| Threat | Attack Vector | Mitigation | Status |
|--------|---------------|------------|---------|
| **Privilege Escalation** | Exploiting application vulnerabilities | Input validation, secure coding | ✅ Implemented |
| **Container Escape** | Container runtime vulnerabilities | Container hardening, updates | ✅ Implemented |
| **Matrix Power Level Abuse** | Social engineering, credential theft | MFA, audit logging, approval processes | ✅ Implemented |

---

## Security Maintenance

### Regular Security Tasks

#### Daily Security Tasks

```bash
#!/bin/bash
# /opt/haos/scripts/daily-security-check.sh

# Check for security updates
apt list --upgradable | grep -i security

# Review security logs
tail -n 100 /var/log/auth.log | grep -E "(FAILED|ERROR|WARNING)"

# Check fail2ban status
fail2ban-client status

# Monitor resource usage
df -h | awk '$5 > 80 { print "Disk usage warning: " $0 }'
free -h | awk '/^Mem:/ { if ($3/$2 > 0.8) print "Memory usage warning: " $0 }'

# Check SSL certificate expiry (warn if < 30 days)
openssl x509 -in /etc/letsencrypt/live/your.domain.com/cert.pem -noout -checkend 2592000

# Review active connections
netstat -tuln | grep LISTEN
```

#### Weekly Security Tasks

```bash
#!/bin/bash
# /opt/haos/scripts/weekly-security-tasks.sh

# Update system packages
apt update && apt list --upgradable

# Run vulnerability scanner (if available)
if command -v nmap &> /dev/null; then
    nmap -sV --script vuln localhost
fi

# Check for rootkits
if command -v rkhunter &> /dev/null; then
    rkhunter --update
    rkhunter --check --sk
fi

# Review user accounts
cut -d: -f1 /etc/passwd | sort

# Check for world-writable files
find / -type f -perm -002 -exec ls -l {} \; 2>/dev/null | head -20

# Database security check
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog');"
```

#### Monthly Security Tasks

```bash
#!/bin/bash
# /opt/haos/scripts/monthly-security-tasks.sh

# Full system security audit
if command -v lynis &> /dev/null; then
    lynis audit system --report-file /opt/haos/security-reports/$(date +%Y-%m)-lynis-report.log
fi

# Review and rotate logs
find /opt/haos/logs -name "*.log" -mtime +30 -delete
find /var/log -name "*.log" -mtime +90 -exec gzip {} \;

# Update container images
docker compose pull
docker image prune -f

# Review user access
echo "Matrix users in last 30 days:"
docker exec haos-synapse psql -U synapse -d synapse -c "
SELECT user_id, last_seen 
FROM user_stats_current 
WHERE last_seen > NOW() - INTERVAL '30 days';"

# Security configuration review
echo "Reviewing security configuration..."
nginx -t
docker compose config

# Backup security verification
echo "Verifying backup encryption..."
gpg --verify /opt/haos/backups/latest-backup.sql.gz.sig
```

### Security Update Process

#### Automated Security Updates

```bash
#!/bin/bash
# /opt/haos/scripts/auto-security-updates.sh

# Enable automatic security updates
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Mail "admin@your.domain.com";
EOF

# Enable auto updates
cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

systemctl enable unattended-upgrades
systemctl start unattended-upgrades
```

#### Security Patch Management

```bash
#!/bin/bash
# /opt/haos/scripts/patch-management.sh

PATCH_DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/opt/haos/pre-patch-backup-$PATCH_DATE"

echo "Starting patch management process..."

# Create pre-patch backup
mkdir -p "$BACKUP_DIR"
cp -r /opt/haos/matrix "$BACKUP_DIR/"
cp -r /opt/haos/app "$BACKUP_DIR/"

# Backup database
docker exec haos-postgres pg_dump -U synapse synapse > "$BACKUP_DIR/database-backup.sql"

# Check for available updates
apt list --upgradable > "$BACKUP_DIR/available-updates.txt"

# Apply security updates
apt update
apt upgrade -y

# Update container images
docker compose pull

# Test services after updates
echo "Testing services..."
curl -f https://your.domain.com/health
curl -f https://your.domain.com/_matrix/client/versions

# Verify security configurations still valid
nginx -t
docker compose config

echo "Patch management completed. Backup stored in $BACKUP_DIR"
```

---

This comprehensive security guide provides the foundation for a secure HAOS deployment. Regular review and updates of these security measures are essential to maintain protection against evolving threats. For ongoing security maintenance procedures, refer to the [MAINTENANCE.md](./MAINTENANCE.md) guide.