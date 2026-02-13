# HAOS Troubleshooting Guide

## Table of Contents

1. [Troubleshooting Overview](#troubleshooting-overview)
2. [Common Issues & Quick Fixes](#common-issues--quick-fixes)
3. [Diagnostic Tools & Commands](#diagnostic-tools--commands)
4. [Service-Specific Troubleshooting](#service-specific-troubleshooting)
5. [Network & Connectivity Issues](#network--connectivity-issues)
6. [Database Issues](#database-issues)
7. [Performance Problems](#performance-problems)
8. [Security Issues](#security-issues)
9. [Matrix Protocol Issues](#matrix-protocol-issues)
10. [Voice/Video (LiveKit) Issues](#voicevideo-livekit-issues)
11. [Container & Docker Issues](#container--docker-issues)
12. [SSL/Certificate Issues](#sslcertificate-issues)
13. [User Management Issues](#user-management-issues)
14. [Advanced Debugging](#advanced-debugging)
15. [Recovery Procedures](#recovery-procedures)

---

## Troubleshooting Overview

This guide provides systematic approaches to diagnosing and resolving common HAOS deployment issues. Follow the structured troubleshooting methodology to efficiently identify and fix problems.

### Troubleshooting Methodology

1. **Identify Symptoms**: What exactly is not working?
2. **Check Service Status**: Are all services running?
3. **Review Logs**: Look for error messages and patterns
4. **Test Components**: Isolate the problematic component
5. **Apply Fix**: Implement appropriate solution
6. **Verify Resolution**: Confirm the issue is resolved
7. **Document**: Record the solution for future reference

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| **Critical** | Service down, security breach | Immediate |
| **High** | Degraded performance, user impact | 1 hour |
| **Medium** | Minor functionality issues | 4 hours |
| **Low** | Cosmetic issues, optimization | 24 hours |

---

## Common Issues & Quick Fixes

### Service Won't Start

#### HAOS Application Won't Start

**Symptoms:**
- Application shows as failed in systemctl
- Can't access web interface
- Error in application logs

**Quick Diagnosis:**
```bash
# Check service status
sudo systemctl status haos

# Check application logs
sudo journalctl -u haos --since "10 minutes ago"

# Check if port is available
sudo netstat -tulpn | grep :3000
```

**Common Causes & Fixes:**

1. **Port already in use**
   ```bash
   # Find process using port
   sudo lsof -i :3000
   
   # Kill conflicting process or change port in config
   sudo kill <PID>
   ```

2. **Configuration errors**
   ```bash
   # Validate configuration
   cd /opt/haos/app
   node -c haos.config.js
   
   # Check environment variables
   cat .env.production
   ```

3. **Missing dependencies**
   ```bash
   # Reinstall dependencies
   cd /opt/haos/app
   pnpm install
   pnpm build
   ```

4. **Database connection issues**
   ```bash
   # Test database connection
   docker exec haos-postgres psql -U synapse -d synapse -c "SELECT version();"
   ```

#### Docker Services Won't Start

**Quick Diagnosis:**
```bash
# Check container status
docker compose ps

# Check container logs
docker compose logs synapse
docker compose logs postgres

# Check Docker daemon
sudo systemctl status docker
```

**Common Fixes:**

1. **Container conflicts**
   ```bash
   # Stop and remove containers
   docker compose down
   docker container prune -f
   
   # Restart services
   docker compose up -d
   ```

2. **Volume mount issues**
   ```bash
   # Check volume permissions
   ls -la /opt/haos/matrix
   sudo chown -R 991:991 /opt/haos/matrix
   ```

3. **Network conflicts**
   ```bash
   # Remove conflicting networks
   docker network prune -f
   
   # Recreate networks
   docker compose down && docker compose up -d
   ```

### Can't Access Web Interface

**Symptoms:**
- Browser shows "connection refused" or timeout
- Nginx returns errors
- SSL certificate errors

**Quick Diagnosis:**
```bash
# Test local access
curl -I http://localhost:3000

# Test nginx
curl -I https://your.domain.com
nginx -t

# Check certificates
openssl x509 -in /etc/letsencrypt/live/your.domain.com/cert.pem -noout -dates
```

**Common Fixes:**

1. **Nginx configuration issues**
   ```bash
   # Test nginx config
   nginx -t
   
   # Reload nginx
   sudo systemctl reload nginx
   
   # Check nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Firewall blocking access**
   ```bash
   # Check firewall rules
   sudo ufw status
   
   # Allow HTTP/HTTPS
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **DNS issues**
   ```bash
   # Test DNS resolution
   nslookup your.domain.com
   
   # Test from external location
   dig @8.8.8.8 your.domain.com
   ```

### Matrix Federation Not Working

**Symptoms:**
- Can't join external rooms
- External users can't join rooms
- Federation errors in logs

**Quick Diagnosis:**
```bash
# Test federation endpoint
curl -k https://your.domain.com:8448/_matrix/federation/v1/version

# Check well-known
curl -k https://your.domain.com/.well-known/matrix/server

# Test from external federation tester
# Visit: https://federationtester.matrix.org/
```

**Common Fixes:**

1. **Port 8448 not accessible**
   ```bash
   # Check firewall
   sudo ufw allow 8448/tcp
   
   # Test port externally
   telnet your.domain.com 8448
   ```

2. **DNS configuration issues**
   ```bash
   # Add SRV record (optional but recommended)
   # _matrix._tcp.your.domain.com. 3600 IN SRV 10 5 443 your.domain.com.
   
   # Verify well-known files
   curl https://your.domain.com/.well-known/matrix/server
   ```

### Database Connection Issues

**Symptoms:**
- Matrix homeserver can't connect to database
- Database connection timeouts
- Authentication failures

**Quick Diagnosis:**
```bash
# Test database connectivity
docker exec haos-postgres pg_isready -U synapse

# Check database logs
docker compose logs postgres

# Test authentication
docker exec haos-postgres psql -U synapse -d synapse -c "SELECT version();"
```

**Common Fixes:**

1. **PostgreSQL not running**
   ```bash
   # Start PostgreSQL
   docker compose up -d postgres
   
   # Check container status
   docker ps | grep postgres
   ```

2. **Authentication issues**
   ```bash
   # Reset password
   docker exec haos-postgres psql -U postgres -c "ALTER USER synapse PASSWORD 'newpassword';"
   
   # Update configuration
   vim /opt/haos/matrix/homeserver.yaml
   ```

3. **Network connectivity**
   ```bash
   # Test network connection between containers
   docker exec haos-synapse ping postgres
   
   # Check Docker networks
   docker network ls
   ```

---

## Diagnostic Tools & Commands

### System Health Check

```bash
#!/bin/bash
# /opt/haos/scripts/health-check.sh

echo "=== HAOS System Health Check ==="

# System overview
echo "--- System Overview ---"
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime -p)"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Date: $(date)"

# Service status
echo "--- Service Status ---"
services=("docker" "nginx" "haos" "fail2ban")
for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        echo "✅ $service: Running"
    else
        echo "❌ $service: Not running"
    fi
done

# Container status
echo "--- Container Status ---"
if command -v docker &> /dev/null; then
    docker compose ps 2>/dev/null || echo "Docker compose not available in current directory"
else
    echo "Docker not available"
fi

# Network connectivity
echo "--- Network Connectivity ---"
endpoints=(
    "https://your.domain.com/health"
    "https://your.domain.com/_matrix/client/versions"
    "https://your.domain.com:8448/_matrix/federation/v1/version"
)

for endpoint in "${endpoints[@]}"; do
    if curl -sf "$endpoint" >/dev/null 2>&1; then
        echo "✅ $endpoint: OK"
    else
        echo "❌ $endpoint: Failed"
    fi
done

# Resource usage
echo "--- Resource Usage ---"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')%"
echo "Memory: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Disk: $(df -h / | awk 'NR==2{print $5}')"

# Recent errors
echo "--- Recent Errors (last hour) ---"
error_count=$(journalctl --since "1 hour ago" --priority=err --no-pager | wc -l)
echo "System errors: $error_count"

if [ $error_count -gt 0 ]; then
    echo "Recent errors:"
    journalctl --since "1 hour ago" --priority=err --no-pager | tail -5
fi

echo "=== Health Check Complete ==="
```

### Log Analysis Tools

```bash
#!/bin/bash
# /opt/haos/scripts/log-analyzer.sh

LOG_FILE="$1"
ANALYSIS_TYPE="${2:-error}"

if [ -z "$LOG_FILE" ]; then
    echo "Usage: $0 <log_file> [error|performance|access]"
    echo "Available logs:"
    echo "  /opt/haos/logs/haos.log"
    echo "  /var/log/nginx/error.log"
    echo "  /var/log/nginx/access.log"
    echo "  journalctl output"
    exit 1
fi

echo "=== Log Analysis: $LOG_FILE ==="

case "$ANALYSIS_TYPE" in
    "error")
        echo "--- Error Analysis ---"
        grep -i "error\|fail\|exception" "$LOG_FILE" | tail -20
        ;;
    "performance")
        echo "--- Performance Analysis ---"
        grep -i "slow\|timeout\|high\|load" "$LOG_FILE" | tail -20
        ;;
    "access")
        echo "--- Access Analysis ---"
        if [[ "$LOG_FILE" == *"access.log"* ]]; then
            echo "Top IP addresses:"
            awk '{print $1}' "$LOG_FILE" | sort | uniq -c | sort -nr | head -10
            
            echo "Top requested URLs:"
            awk '{print $7}' "$LOG_FILE" | sort | uniq -c | sort -nr | head -10
            
            echo "Response codes:"
            awk '{print $9}' "$LOG_FILE" | sort | uniq -c | sort -nr
        else
            echo "Access analysis requires nginx access log"
        fi
        ;;
esac
```

### Network Diagnostics

```bash
#!/bin/bash
# /opt/haos/scripts/network-diagnostics.sh

echo "=== Network Diagnostics ==="

# Basic connectivity
echo "--- Basic Connectivity ---"
echo "External connectivity:"
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo "✅ Internet connection: OK"
else
    echo "❌ Internet connection: Failed"
fi

# DNS resolution
echo "--- DNS Resolution ---"
if nslookup your.domain.com >/dev/null 2>&1; then
    echo "✅ DNS resolution: OK"
else
    echo "❌ DNS resolution: Failed"
fi

# Port accessibility
echo "--- Port Accessibility ---"
ports=(80 443 8448 7880)
for port in "${ports[@]}"; do
    if timeout 3 bash -c "</dev/tcp/localhost/$port" 2>/dev/null; then
        echo "✅ Port $port: Open"
    else
        echo "❌ Port $port: Closed"
    fi
done

# External port check
echo "--- External Port Check ---"
for port in 80 443 8448; do
    if timeout 5 bash -c "</dev/tcp/your.domain.com/$port" 2>/dev/null; then
        echo "✅ External port $port: Accessible"
    else
        echo "❌ External port $port: Not accessible"
    fi
done

# SSL certificate check
echo "--- SSL Certificate Check ---"
if openssl x509 -in /etc/letsencrypt/live/your.domain.com/cert.pem -noout -checkend 2592000 >/dev/null 2>&1; then
    echo "✅ SSL certificate: Valid (>30 days)"
else
    echo "⚠️ SSL certificate: Expires within 30 days"
fi

echo "=== Network Diagnostics Complete ==="
```

---

## Service-Specific Troubleshooting

### HAOS Application Issues

#### Application Crashes

**Symptoms:**
- Application exits unexpectedly
- Memory errors in logs
- Segmentation faults

**Diagnostic Steps:**

1. **Check memory usage:**
   ```bash
   # Monitor memory consumption
   ps aux --sort=-%mem | head -10
   
   # Check for memory leaks
   valgrind --tool=memcheck --leak-check=yes node /opt/haos/app/server.js
   ```

2. **Check for unhandled exceptions:**
   ```bash
   # Review application logs
   grep -i "uncaught\|unhandled\|exception" /opt/haos/logs/haos.log
   
   # Enable debug logging
   export HAOS_LOG_LEVEL=debug
   systemctl restart haos
   ```

3. **Check Node.js version compatibility:**
   ```bash
   # Verify Node.js version
   node --version
   
   # Check for deprecation warnings
   node --trace-warnings /opt/haos/app/server.js
   ```

#### Slow Response Times

**Diagnostic Steps:**

1. **Profile application performance:**
   ```bash
   # Enable performance monitoring
   export NODE_ENV=development
   export HAOS_ENABLE_PROFILING=true
   
   # Use Node.js profiler
   node --prof /opt/haos/app/server.js
   ```

2. **Check database queries:**
   ```bash
   # Enable slow query logging
   docker exec haos-postgres psql -U synapse -d synapse -c "
   ALTER SYSTEM SET log_min_duration_statement = 1000;
   SELECT pg_reload_conf();
   "
   ```

3. **Monitor resource usage:**
   ```bash
   # Real-time monitoring
   top -p $(pgrep -f haos)
   
   # Network connections
   netstat -tuln | grep :3000
   ```

### Nginx Issues

#### 502 Bad Gateway

**Common Causes:**
- Backend application down
- Upstream timeout
- Connection pool exhaustion

**Diagnostic Steps:**

1. **Check backend availability:**
   ```bash
   # Test backend directly
   curl -I http://localhost:3000/health
   
   # Check upstream configuration
   nginx -T | grep upstream -A 10
   ```

2. **Check nginx error logs:**
   ```bash
   tail -f /var/log/nginx/error.log
   ```

3. **Test configuration:**
   ```bash
   nginx -t
   ```

**Solutions:**

1. **Increase timeout values:**
   ```nginx
   location / {
       proxy_connect_timeout 60s;
       proxy_send_timeout 60s;
       proxy_read_timeout 60s;
   }
   ```

2. **Add more upstream servers:**
   ```nginx
   upstream haos_app {
       server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
       server 127.0.0.1:3001 max_fails=3 fail_timeout=30s backup;
   }
   ```

#### SSL/TLS Issues

**Symptoms:**
- SSL certificate errors
- Mixed content warnings
- HTTPS redirects failing

**Diagnostic Commands:**
```bash
# Test SSL configuration
openssl s_client -connect your.domain.com:443 -servername your.domain.com

# Check certificate chain
openssl x509 -in /etc/letsencrypt/live/your.domain.com/fullchain.pem -noout -text

# Test SSL labs
curl "https://api.ssllabs.com/api/v3/analyze?host=your.domain.com"
```

### PostgreSQL Issues

#### Connection Pool Exhaustion

**Symptoms:**
- "too many connections" errors
- Application timeouts
- Database becomes unresponsive

**Diagnostic Steps:**

1. **Check current connections:**
   ```sql
   SELECT 
       count(*),
       state,
       usename,
       application_name
   FROM pg_stat_activity 
   GROUP BY state, usename, application_name
   ORDER BY count DESC;
   ```

2. **Check max connections:**
   ```sql
   SHOW max_connections;
   SELECT count(*) FROM pg_stat_activity;
   ```

**Solutions:**

1. **Increase connection limit:**
   ```bash
   # Edit postgresql.conf
   docker exec haos-postgres psql -U synapse -c "ALTER SYSTEM SET max_connections = 200;"
   docker compose restart postgres
   ```

2. **Configure connection pooling:**
   ```yaml
   # In homeserver.yaml
   database:
     args:
       cp_min: 5
       cp_max: 20
   ```

#### Database Performance Issues

**Diagnostic Queries:**

1. **Slow queries:**
   ```sql
   SELECT 
       query,
       calls,
       total_time,
       mean_time
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

2. **Table bloat:**
   ```sql
   SELECT 
       schemaname,
       tablename,
       n_dead_tup,
       n_live_tup,
       ROUND(n_dead_tup::float / (n_live_tup + n_dead_tup) * 100, 2) as bloat_ratio
   FROM pg_stat_user_tables 
   WHERE n_live_tup > 0
   ORDER BY bloat_ratio DESC;
   ```

**Solutions:**

1. **Vacuum and analyze:**
   ```bash
   docker exec haos-postgres psql -U synapse -d synapse -c "VACUUM ANALYZE;"
   ```

2. **Reindex:**
   ```bash
   docker exec haos-postgres psql -U synapse -d synapse -c "REINDEX DATABASE synapse;"
   ```

---

## Network & Connectivity Issues

### Federation Connectivity Problems

#### Cannot Reach Other Homeservers

**Diagnostic Steps:**

1. **Test federation directly:**
   ```bash
   # Test federation endpoint
   curl -v https://your.domain.com:8448/_matrix/federation/v1/version
   
   # Test from external server
   curl -v https://matrix.org:8448/_matrix/federation/v1/version
   ```

2. **Check DNS configuration:**
   ```bash
   # Check SRV records
   dig _matrix._tcp.your.domain.com SRV
   
   # Check well-known
   curl https://your.domain.com/.well-known/matrix/server
   ```

3. **Review federation logs:**
   ```bash
   docker exec haos-synapse grep -i federation /data/logs/homeserver.log | tail -20
   ```

**Common Solutions:**

1. **Configure SRV records:**
   ```dns
   _matrix._tcp.your.domain.com. 3600 IN SRV 10 5 443 your.domain.com.
   ```

2. **Update well-known files:**
   ```json
   // /.well-known/matrix/server
   {"m.server": "your.domain.com:443"}
   ```

#### Federation Rate Limiting

**Symptoms:**
- Slow message delivery to other servers
- Federation timeouts
- Rate limiting errors in logs

**Diagnostic Steps:**
```bash
# Check federation metrics
curl -s https://your.domain.com:9092/metrics | grep federation

# Review rate limiting configuration
grep -A 10 "federation_rc" /opt/haos/matrix/homeserver.yaml
```

**Solutions:**
```yaml
# Increase federation rate limits
federation_rc_window_size: 10000
federation_rc_sleep_limit: 100
federation_rc_sleep_delay: 500
federation_rc_reject_limit: 500
federation_rc_concurrent: 10
```

### Load Balancer Issues

#### Session Persistence Problems

**Symptoms:**
- Users get logged out randomly
- Inconsistent behavior across requests
- CSRF token errors

**Solutions:**

1. **Configure sticky sessions:**
   ```nginx
   upstream haos_backend {
       ip_hash;
       server 127.0.0.1:3000;
       server 127.0.0.1:3001;
   }
   ```

2. **Use shared session storage:**
   ```javascript
   // Use Redis for session storage
   session({
       store: new RedisStore({ client: redisClient }),
       secret: process.env.SESSION_SECRET,
   })
   ```

---

## Database Issues

### Data Corruption

#### Detecting Corruption

**Diagnostic Commands:**
```bash
# Check database integrity
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT datname, pg_database_size(datname) 
FROM pg_database 
WHERE datname = 'synapse';
"

# Check for corruption
docker exec haos-postgres pg_dump -U synapse synapse > /dev/null
```

**Recovery Steps:**

1. **Stop all services:**
   ```bash
   docker compose stop synapse
   systemctl stop haos
   ```

2. **Create backup:**
   ```bash
   docker exec haos-postgres pg_dump -U synapse synapse > corruption-backup.sql
   ```

3. **Run consistency checks:**
   ```bash
   docker exec haos-postgres psql -U synapse -d synapse -c "
   SELECT pg_relation_filepath(oid), relname 
   FROM pg_class 
   WHERE relkind = 'r';
   "
   ```

### Migration Issues

#### Schema Version Conflicts

**Symptoms:**
- Matrix homeserver won't start
- Schema version errors in logs
- Database migration failures

**Diagnostic Steps:**

1. **Check schema version:**
   ```bash
   docker exec haos-postgres psql -U synapse -d synapse -c "
   SELECT version FROM schema_version ORDER BY version DESC LIMIT 1;
   "
   ```

2. **Check for failed migrations:**
   ```bash
   docker exec haos-synapse grep -i "migration\|schema" /data/logs/homeserver.log
   ```

**Recovery:**

1. **Manual schema fix:**
   ```bash
   # Download schema files from Matrix repository
   # Apply missing migrations manually
   ```

2. **Fresh database setup:**
   ```bash
   # Backup user data
   docker exec haos-postgres pg_dump -U synapse -t users -t user_stats synapse > users-backup.sql
   
   # Recreate database
   docker exec haos-postgres psql -U synapse -c "DROP DATABASE synapse;"
   docker exec haos-postgres psql -U synapse -c "CREATE DATABASE synapse;"
   
   # Restore homeserver (will recreate schema)
   docker compose up -d synapse
   
   # Restore user data
   cat users-backup.sql | docker exec -i haos-postgres psql -U synapse -d synapse
   ```

---

## Performance Problems

### High CPU Usage

#### Matrix Event Processing

**Symptoms:**
- High CPU usage by Synapse process
- Slow message processing
- Event backlog building up

**Diagnostic Steps:**

1. **Check event processing:**
   ```bash
   # Monitor event stream
   curl -s https://your.domain.com:9092/metrics | grep synapse_event
   
   # Check processing position
   docker exec haos-postgres psql -U synapse -d synapse -c "
   SELECT stream_name, instance_name, stream_id 
   FROM stream_positions 
   ORDER BY stream_id DESC;
   "
   ```

2. **Profile CPU usage:**
   ```bash
   # Get process details
   ps aux | grep synapse
   
   # Use htop for detailed view
   htop -p $(pgrep -f synapse)
   ```

**Solutions:**

1. **Enable workers:**
   ```yaml
   # Add to homeserver.yaml
   worker_app: synapse.app.generic_worker
   worker_listeners:
     - type: http
       port: 8009
       resources:
         - names: [client]
   ```

2. **Optimize database:**
   ```bash
   # Run VACUUM ANALYZE
   docker exec haos-postgres psql -U synapse -d synapse -c "VACUUM ANALYZE;"
   
   # Update statistics
   docker exec haos-postgres psql -U synapse -d synapse -c "
   ANALYZE events;
   ANALYZE room_memberships;
   "
   ```

### Memory Leaks

#### Application Memory Issues

**Diagnostic Steps:**

1. **Monitor memory usage:**
   ```bash
   # Track memory over time
   while true; do
     ps -p $(pgrep -f haos) -o pid,ppid,cmd,%mem,%cpu --no-headers
     sleep 30
   done
   ```

2. **Use Node.js heap profiler:**
   ```bash
   # Enable heap profiler
   kill -USR2 $(pgrep -f haos)
   
   # Analyze heap dump
   node --inspect-brk /opt/haos/app/server.js
   ```

**Solutions:**

1. **Restart services periodically:**
   ```bash
   # Add to cron for daily restart
   echo "0 4 * * * root systemctl restart haos" >> /etc/crontab
   ```

2. **Optimize code:**
   ```javascript
   // Implement proper cleanup
   process.on('SIGTERM', () => {
       // Clean up resources
       matrixClient.stopSync();
       server.close();
   });
   ```

---

## Security Issues

### Brute Force Attacks

#### Failed Login Attempts

**Symptoms:**
- High number of failed login attempts
- Logs showing authentication failures
- Performance degradation

**Diagnostic Steps:**

1. **Check fail2ban status:**
   ```bash
   fail2ban-client status
   fail2ban-client status sshd
   fail2ban-client status nginx-http-auth
   ```

2. **Review authentication logs:**
   ```bash
   grep "Failed password" /var/log/auth.log | tail -20
   grep "authentication failure" /opt/haos/logs/haos.log
   ```

**Solutions:**

1. **Strengthen fail2ban rules:**
   ```ini
   # /etc/fail2ban/jail.d/haos.conf
   [haos-auth]
   enabled = true
   port = http,https
   filter = haos-auth
   logpath = /opt/haos/logs/haos.log
   maxretry = 3
   bantime = 3600
   ```

2. **Implement rate limiting:**
   ```nginx
   # Add to nginx config
   limit_req_zone $binary_remote_addr zone=login:10m rate=1r/m;
   
   location /api/auth {
       limit_req zone=login burst=2 nodelay;
       proxy_pass http://haos_app;
   }
   ```

### Certificate Issues

#### Certificate Expiration

**Symptoms:**
- Browser certificate warnings
- SSL handshake failures
- Certificate validation errors

**Diagnostic Steps:**

1. **Check certificate expiry:**
   ```bash
   openssl x509 -in /etc/letsencrypt/live/your.domain.com/cert.pem -noout -dates
   
   # Check from browser perspective
   openssl s_client -connect your.domain.com:443 -servername your.domain.com
   ```

2. **Test certificate renewal:**
   ```bash
   certbot renew --dry-run
   ```

**Solutions:**

1. **Force certificate renewal:**
   ```bash
   certbot renew --force-renewal
   systemctl reload nginx
   ```

2. **Debug renewal issues:**
   ```bash
   # Check certbot logs
   tail -f /var/log/letsencrypt/letsencrypt.log
   
   # Manual renewal with verbose output
   certbot renew --verbose --dry-run
   ```

---

## Matrix Protocol Issues

### Encryption Problems

#### Device Verification Issues

**Symptoms:**
- Unable to verify devices
- Encryption keys not syncing
- "Unable to decrypt" messages

**Diagnostic Steps:**

1. **Check device list:**
   ```bash
   # Via Matrix admin API
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
        "https://your.domain.com/_synapse/admin/v2/users/@user:your.domain.com/devices"
   ```

2. **Review encryption logs:**
   ```bash
   docker exec haos-synapse grep -i "encrypt\|olm\|megolm" /data/logs/homeserver.log
   ```

**Solutions:**

1. **Reset encryption state:**
   ```bash
   # Clear device keys (use with caution)
   docker exec haos-postgres psql -U synapse -d synapse -c "
   DELETE FROM device_lists_outbound_pokes WHERE user_id = '@user:your.domain.com';
   "
   ```

2. **Re-verify devices:**
   - Log out and back in on all clients
   - Verify devices through Matrix client
   - Reset encryption keys if necessary

### Room State Issues

#### Room State Corruption

**Symptoms:**
- Unable to join rooms
- Missing room events
- Room timeline inconsistencies

**Diagnostic Steps:**

1. **Check room state:**
   ```bash
   # Get room state
   curl -H "Authorization: Bearer $ACCESS_TOKEN" \
        "https://your.domain.com/_matrix/client/r0/rooms/!roomid:your.domain.com/state"
   ```

2. **Review room database:**
   ```bash
   docker exec haos-postgres psql -U synapse -d synapse -c "
   SELECT event_id, type, state_key 
   FROM current_state_events 
   WHERE room_id = '!roomid:your.domain.com'
   ORDER BY type;
   "
   ```

**Recovery:**

1. **Rebuild room state:**
   ```bash
   # Use Synapse admin API
   curl -X POST \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        "https://your.domain.com/_synapse/admin/v1/rooms/!roomid:your.domain.com/state"
   ```

---

## Voice/Video (LiveKit) Issues

### Connection Problems

#### Cannot Join Voice Channels

**Symptoms:**
- Voice connection timeouts
- WebRTC connection failures
- Audio/video not working

**Diagnostic Steps:**

1. **Check LiveKit status:**
   ```bash
   # Test LiveKit API
   curl -H "Authorization: Bearer $LIVEKIT_TOKEN" \
        "https://your.domain.com:7880/livekit/rooms"
   
   # Check LiveKit logs
   docker compose logs livekit
   ```

2. **Test WebRTC connectivity:**
   ```bash
   # Check UDP ports
   sudo netstat -ulpn | grep :5[0-9][0-9][0-9][0-9]
   
   # Test STUN server
   stun your.domain.com 3478
   ```

**Solutions:**

1. **Configure TURN server:**
   ```yaml
   # In livekit.yaml
   rtc:
     ice_servers:
       - urls: ["stun:stun.l.google.com:19302"]
       - urls: ["turn:turn.your.domain.com:3478"]
         username: "username"
         credential: "password"
   ```

2. **Open firewall ports:**
   ```bash
   # Allow LiveKit RTC ports
   sudo ufw allow 50000:60000/udp
   sudo ufw allow 7880/tcp
   ```

### Audio Quality Issues

#### Poor Audio Quality

**Diagnostic Steps:**

1. **Check audio settings:**
   ```javascript
   // Client-side audio configuration
   const audioConfig = {
     autoGainControl: true,
     echoCancellation: true,
     noiseSuppression: true,
     sampleRate: 48000,
   };
   ```

2. **Monitor network quality:**
   ```bash
   # Check bandwidth usage
   iftop -i eth0
   
   # Monitor packet loss
   ping -c 100 your.domain.com | grep -E "packet loss|rtt"
   ```

---

## Container & Docker Issues

### Container Resource Limits

#### Out of Memory Kills

**Symptoms:**
- Containers restarting unexpectedly
- OOMKilled status in container logs
- Memory usage at container limits

**Diagnostic Steps:**

1. **Check container memory usage:**
   ```bash
   docker stats --no-stream
   docker inspect haos-synapse | grep -i memory
   ```

2. **Review system memory:**
   ```bash
   free -h
   cat /proc/meminfo
   ```

**Solutions:**

1. **Increase memory limits:**
   ```yaml
   # In docker-compose.yml
   services:
     synapse:
       deploy:
         resources:
           limits:
             memory: 4G
           reservations:
             memory: 2G
   ```

2. **Optimize memory usage:**
   ```yaml
   # In homeserver.yaml
   caches:
     global_factor: 0.5
     per_cache_factors:
       get_users_in_room: 0.5
   ```

### Volume Mount Issues

#### Permission Denied Errors

**Symptoms:**
- Containers can't write to mounted volumes
- Permission denied errors in logs
- Database initialization failures

**Diagnostic Steps:**

1. **Check volume permissions:**
   ```bash
   ls -la /opt/haos/matrix
   ls -la /opt/haos/postgres-data
   ```

2. **Check container user:**
   ```bash
   docker exec haos-synapse id
   docker exec haos-postgres id
   ```

**Solutions:**

1. **Fix permissions:**
   ```bash
   # For Synapse (runs as user 991)
   sudo chown -R 991:991 /opt/haos/matrix
   
   # For PostgreSQL (runs as user 999)
   sudo chown -R 999:999 /opt/haos/postgres-data
   ```

2. **Use proper user mapping:**
   ```yaml
   # In docker-compose.yml
   services:
     synapse:
       user: "991:991"
       volumes:
         - ./matrix:/data:Z
   ```

---

## SSL/Certificate Issues

### Let's Encrypt Issues

#### Certificate Renewal Failures

**Symptoms:**
- Certbot renewal errors
- Web server certificate warnings
- HTTPS connections failing

**Diagnostic Steps:**

1. **Check certbot logs:**
   ```bash
   tail -f /var/log/letsencrypt/letsencrypt.log
   ```

2. **Test renewal process:**
   ```bash
   certbot renew --dry-run --verbose
   ```

3. **Check certificate status:**
   ```bash
   certbot certificates
   ```

**Common Solutions:**

1. **Domain validation issues:**
   ```bash
   # Ensure .well-known is accessible
   curl http://your.domain.com/.well-known/acme-challenge/test
   
   # Check nginx configuration
   location /.well-known/acme-challenge/ {
       root /var/www/html;
   }
   ```

2. **Rate limit issues:**
   ```bash
   # Check rate limits
   # Wait before retrying
   # Use staging environment for testing
   ```

3. **Plugin issues:**
   ```bash
   # Use webroot plugin
   certbot renew --webroot --webroot-path /var/www/html
   
   # Or use nginx plugin
   certbot renew --nginx
   ```

### Certificate Chain Issues

#### Incomplete Certificate Chain

**Symptoms:**
- Some browsers show certificate errors
- Certificate validation failures
- Mixed intermediate certificate errors

**Diagnostic Steps:**

1. **Check certificate chain:**
   ```bash
   openssl x509 -in /etc/letsencrypt/live/your.domain.com/fullchain.pem -noout -text
   
   # Test from external SSL checker
   openssl s_client -connect your.domain.com:443 -servername your.domain.com
   ```

**Solutions:**

1. **Use fullchain certificate:**
   ```nginx
   ssl_certificate /etc/letsencrypt/live/your.domain.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/your.domain.com/privkey.pem;
   ```

2. **Verify chain order:**
   ```bash
   # Check certificate order in fullchain
   openssl crl2pkcs7 -nocrl -certfile /etc/letsencrypt/live/your.domain.com/fullchain.pem | 
   openssl pkcs7 -print_certs -text -noout
   ```

---

## User Management Issues

### Account Problems

#### User Cannot Login

**Symptoms:**
- Authentication failures
- "Invalid credentials" errors
- Account locked messages

**Diagnostic Steps:**

1. **Check user status:**
   ```bash
   # Check if user exists
   docker exec haos-postgres psql -U synapse -d synapse -c "
   SELECT name, deactivated, admin FROM users WHERE name LIKE '%username%';
   "
   ```

2. **Check authentication logs:**
   ```bash
   grep -i "auth\|login" /opt/haos/logs/haos.log | grep username
   ```

**Solutions:**

1. **Reset user password:**
   ```bash
   # Using Synapse admin tools
   docker exec haos-synapse register_new_matrix_user \
     -c /data/homeserver.yaml \
     -u username \
     -p newpassword \
     http://localhost:8008
   ```

2. **Reactivate deactivated user:**
   ```bash
   # Via admin API
   curl -X PUT \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"deactivated": false}' \
        "https://your.domain.com/_synapse/admin/v2/users/@username:your.domain.com"
   ```

### Permission Issues

#### User Cannot Access Rooms

**Symptoms:**
- "Forbidden" errors when joining rooms
- Missing rooms from room list
- Cannot send messages to rooms

**Diagnostic Steps:**

1. **Check room membership:**
   ```bash
   docker exec haos-postgres psql -U synapse -d synapse -c "
   SELECT room_id, membership 
   FROM room_memberships 
   WHERE user_id = '@username:your.domain.com';
   "
   ```

2. **Check power levels:**
   ```bash
   # Get room power levels
   curl -H "Authorization: Bearer $ACCESS_TOKEN" \
        "https://your.domain.com/_matrix/client/r0/rooms/!roomid:your.domain.com/state/m.room.power_levels"
   ```

**Solutions:**

1. **Invite user to room:**
   ```bash
   curl -X POST \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"user_id": "@username:your.domain.com"}' \
        "https://your.domain.com/_matrix/client/r0/rooms/!roomid:your.domain.com/invite"
   ```

2. **Adjust power levels:**
   ```bash
   # Update power levels via admin API
   curl -X PUT \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{"users": {"@username:your.domain.com": 50}}' \
        "https://your.domain.com/_synapse/admin/v1/rooms/!roomid:your.domain.com/power_levels"
   ```

---

## Advanced Debugging

### Matrix SDK Debugging

#### Client Connection Issues

**Enable Debug Logging:**

```javascript
// In HAOS application
const matrixClient = sdk.createClient({
    baseUrl: process.env.MATRIX_HOMESERVER,
    userId: process.env.MATRIX_USER_ID,
    accessToken: process.env.MATRIX_ACCESS_TOKEN,
    
    // Enable debug logging
    logger: console,
    logLevel: 'debug',
});

// Monitor events
matrixClient.on('sync', (state, prevState, data) => {
    console.log('Sync state:', state);
});

matrixClient.on('event', (event) => {
    console.log('Received event:', event.getType());
});
```

### Database Debugging

#### SQL Query Analysis

```bash
#!/bin/bash
# /opt/haos/scripts/sql-debug.sh

# Enable query logging
docker exec haos-postgres psql -U synapse -d synapse -c "
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 100;
SELECT pg_reload_conf();
"

# Monitor slow queries
docker exec haos-postgres tail -f /var/lib/postgresql/data/log/postgresql-$(date +%Y-%m-%d).log | grep "duration:"

# Check locks
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    l.mode,
    l.locktype,
    l.database,
    l.relation,
    l.page,
    l.tuple,
    l.classid,
    l.granted,
    l.objid,
    l.objsubid,
    l.pid,
    l.virtualtransaction,
    l.virtualxid,
    l.transactionid,
    l.fastpath,
    l.waitstart
FROM pg_locks l
LEFT OUTER JOIN pg_class t ON l.relation = t.oid
LEFT OUTER JOIN pg_database d ON l.database = d.oid;
"
```

### Network Packet Analysis

#### Traffic Monitoring

```bash
#!/bin/bash
# /opt/haos/scripts/network-debug.sh

# Monitor HTTP traffic
sudo tcpdump -i any -w haos-traffic.pcap port 80 or port 443 or port 8448

# Analyze with tshark
tshark -r haos-traffic.pcap -Y "http or ssl" -T fields -e frame.time -e ip.src -e ip.dst -e http.request.method -e http.request.uri

# Monitor Matrix federation
sudo tcpdump -i any port 8448 -A | grep -E "(GET|POST|PUT|DELETE)"

# Check connection states
ss -tuln | grep -E "(80|443|8448|3000)"
```

---

## Recovery Procedures

### Emergency Recovery

#### Service Recovery Checklist

```bash
#!/bin/bash
# /opt/haos/scripts/emergency-recovery.sh

echo "=== HAOS Emergency Recovery ==="

# Step 1: Stop all services
echo "1. Stopping all services..."
systemctl stop haos
docker compose down
systemctl stop nginx

# Step 2: Check system resources
echo "2. Checking system resources..."
df -h
free -h
uptime

# Step 3: Check for corruption
echo "3. Checking for corruption..."
# Filesystem check
fsck -n /dev/sda1

# Database check
docker run --rm -v haos_postgres_data:/data postgres:15-alpine \
  postgres --single -D /data template1 -c exit_on_error=true

# Step 4: Start essential services
echo "4. Starting essential services..."
systemctl start docker
docker compose up -d postgres redis

# Step 5: Wait and test database
echo "5. Testing database connectivity..."
sleep 30
docker exec haos-postgres pg_isready -U synapse

# Step 6: Start remaining services
echo "6. Starting remaining services..."
docker compose up -d synapse livekit
systemctl start nginx

# Step 7: Start application
echo "7. Starting HAOS application..."
systemctl start haos

# Step 8: Verification
echo "8. Verifying services..."
sleep 60
curl -f https://your.domain.com/health
curl -f https://your.domain.com/_matrix/client/versions

echo "=== Emergency Recovery Complete ==="
```

### Data Recovery

#### Database Recovery from Corruption

```bash
#!/bin/bash
# /opt/haos/scripts/database-recovery-advanced.sh

BACKUP_DIR="/opt/haos/backups/emergency-$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "=== Advanced Database Recovery ==="

# Step 1: Create backup of current state
echo "1. Backing up current state..."
docker exec haos-postgres pg_dump -U synapse synapse > "$BACKUP_DIR/corrupted-backup.sql" 2>/dev/null || true

# Step 2: Try to start in single-user mode
echo "2. Attempting single-user mode recovery..."
docker run --rm -v haos_postgres_data:/data postgres:15-alpine \
  postgres --single -D /data synapse << EOF
REINDEX DATABASE synapse;
VACUUM FULL;
EOF

# Step 3: Check for specific table corruption
echo "3. Checking for table corruption..."
tables=("events" "room_memberships" "users" "rooms")

for table in "${tables[@]}"; do
    if docker exec haos-postgres psql -U synapse -d synapse -c "SELECT COUNT(*) FROM $table;" >/dev/null 2>&1; then
        echo "✅ Table $table: OK"
    else
        echo "❌ Table $table: Corrupted"
        
        # Try to repair table
        docker exec haos-postgres psql -U synapse -d synapse -c "REINDEX TABLE $table;" || true
    fi
done

# Step 4: Restore from latest good backup if needed
latest_backup=$(find /opt/haos/backups -name "*.sql.gz" -mtime -7 | sort -r | head -1)

if [ -n "$latest_backup" ] && [ -f "$latest_backup" ]; then
    read -p "Restore from backup $latest_backup? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "4. Restoring from backup..."
        
        # Drop and recreate database
        docker exec haos-postgres psql -U synapse -c "DROP DATABASE IF EXISTS synapse;"
        docker exec haos-postgres psql -U synapse -c "CREATE DATABASE synapse OWNER synapse;"
        
        # Restore backup
        zcat "$latest_backup" | docker exec -i haos-postgres psql -U synapse -d synapse
        
        echo "Database restored from backup"
    fi
fi

echo "=== Database Recovery Complete ==="
```

---

This comprehensive troubleshooting guide covers the most common issues encountered in HAOS deployments. For additional support or issues not covered here, refer to:

- Matrix homeserver documentation
- LiveKit documentation  
- PostgreSQL troubleshooting guides
- HAOS community support channels

Remember to always create backups before making significant changes and test solutions in a staging environment when possible.