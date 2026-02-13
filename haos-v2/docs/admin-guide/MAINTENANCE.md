# HAOS Maintenance Guide

## Table of Contents

1. [Maintenance Overview](#maintenance-overview)
2. [Routine Maintenance Schedule](#routine-maintenance-schedule)
3. [Database Maintenance](#database-maintenance)
4. [System Updates & Patches](#system-updates--patches)
5. [Backup & Recovery](#backup--recovery)
6. [Performance Monitoring](#performance-monitoring)
7. [Log Management](#log-management)
8. [Storage Management](#storage-management)
9. [Security Maintenance](#security-maintenance)
10. [Matrix Homeserver Maintenance](#matrix-homeserver-maintenance)
11. [Container Management](#container-management)
12. [Monitoring & Alerting](#monitoring--alerting)
13. [Disaster Recovery](#disaster-recovery)
14. [Capacity Planning](#capacity-planning)
15. [Maintenance Automation](#maintenance-automation)

---

## Maintenance Overview

Regular maintenance is essential for ensuring HAOS performance, security, and reliability. This guide provides comprehensive procedures for maintaining HAOS deployments in production environments.

### Maintenance Principles

1. **Preventive Maintenance**: Regular tasks to prevent issues
2. **Proactive Monitoring**: Early detection of potential problems
3. **Automated Where Possible**: Reduce human error and workload
4. **Documented Procedures**: Consistent and repeatable processes
5. **Tested Recovery**: Verified backup and restore procedures
6. **Minimal Downtime**: Maintenance with service continuity

### Maintenance Categories

| Category | Frequency | Examples |
|----------|-----------|----------|
| **Real-time** | Continuous | Monitoring, alerting, automated responses |
| **Daily** | Every day | Log review, health checks, security scans |
| **Weekly** | Weekly | Updates, performance review, backup verification |
| **Monthly** | Monthly | Deep maintenance, capacity planning, security audit |
| **Quarterly** | 3 months | Major updates, disaster recovery testing |
| **Annual** | Yearly | Architecture review, compliance audit |

---

## Routine Maintenance Schedule

### Daily Maintenance Tasks

#### Automated Daily Checks

```bash
#!/bin/bash
# /opt/haos/scripts/daily-maintenance.sh

LOGFILE="/opt/haos/logs/maintenance-$(date +%Y-%m-%d).log"
EMAIL_RECIPIENTS="admin@your.domain.com"

exec 1> >(tee -a "$LOGFILE")
exec 2>&1

echo "=== HAOS Daily Maintenance - $(date) ==="

# Service health checks
echo "--- Service Health Checks ---"
services=("docker" "nginx" "haos" "fail2ban")
for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        echo "✅ $service: Running"
    else
        echo "❌ $service: Not running"
        systemctl status "$service" --no-pager
    fi
done

# Container health checks
echo "--- Container Health ---"
docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}"

# Database connectivity
echo "--- Database Connectivity ---"
if docker exec haos-postgres pg_isready -U synapse >/dev/null 2>&1; then
    echo "✅ PostgreSQL: Connected"
else
    echo "❌ PostgreSQL: Connection failed"
fi

# Matrix health check
echo "--- Matrix Health ---"
if curl -sf https://your.domain.com/_matrix/client/versions >/dev/null; then
    echo "✅ Matrix API: Responding"
else
    echo "❌ Matrix API: Not responding"
fi

# LiveKit health check
echo "--- LiveKit Health ---"
if timeout 5 bash -c "</dev/tcp/localhost/7880" >/dev/null 2>&1; then
    echo "✅ LiveKit: Responding"
else
    echo "❌ LiveKit: Not responding"
fi

# Disk space check
echo "--- Disk Space ---"
df -h | awk '$5 > 80 { print "⚠️  High usage: " $0 }'
df -h | awk '$5 <= 80 { print "✅ " $0 }'

# Memory usage
echo "--- Memory Usage ---"
free -h | grep Mem | awk '{
    used_pct = $3/$2 * 100
    if (used_pct > 85) 
        print "⚠️  Memory usage: " used_pct "%"
    else 
        print "✅ Memory usage: " used_pct "%"
}'

# Certificate expiry check
echo "--- Certificate Expiry ---"
cert_days=$(openssl x509 -in /etc/letsencrypt/live/your.domain.com/cert.pem -noout -checkend 2592000 2>/dev/null && echo "30+" || echo "< 30")
if [ "$cert_days" = "30+" ]; then
    echo "✅ SSL Certificate: Valid for 30+ days"
else
    echo "⚠️  SSL Certificate: Expires within 30 days"
fi

# Recent errors in logs
echo "--- Recent Errors ---"
error_count=$(journalctl --since "1 hour ago" --priority=err --no-pager | wc -l)
if [ "$error_count" -gt 0 ]; then
    echo "⚠️  $error_count error(s) in last hour"
    journalctl --since "1 hour ago" --priority=err --no-pager | tail -10
else
    echo "✅ No errors in last hour"
fi

# Backup verification
echo "--- Backup Status ---"
if [ -f "/opt/haos/backups/daily/backup-$(date +%Y-%m-%d).sql.gz" ]; then
    echo "✅ Daily backup completed"
else
    echo "❌ Daily backup missing"
fi

echo "=== Daily Maintenance Completed ==="

# Send email if there are issues
if grep -q "❌\|⚠️" "$LOGFILE"; then
    mail -s "HAOS Daily Maintenance - Issues Found" "$EMAIL_RECIPIENTS" < "$LOGFILE"
fi
```

#### Cron Schedule for Daily Tasks

```bash
# /etc/cron.d/haos-daily
# Daily maintenance at 2 AM
0 2 * * * haos /opt/haos/scripts/daily-maintenance.sh

# Database optimization at 3 AM
0 3 * * * haos /opt/haos/scripts/daily-db-maintenance.sh

# Log rotation at 4 AM
0 4 * * * haos /opt/haos/scripts/log-rotation.sh
```

### Weekly Maintenance Tasks

#### Weekly System Maintenance

```bash
#!/bin/bash
# /opt/haos/scripts/weekly-maintenance.sh

echo "=== HAOS Weekly Maintenance - $(date) ==="

# System updates check
echo "--- Checking for Updates ---"
apt update >/dev/null 2>&1
updates_count=$(apt list --upgradable 2>/dev/null | grep -c "upgradable")
security_updates=$(apt list --upgradable 2>/dev/null | grep -c "security")

echo "Available updates: $updates_count"
echo "Security updates: $security_updates"

if [ "$security_updates" -gt 0 ]; then
    echo "⚠️  Security updates available - schedule maintenance"
fi

# Container image updates
echo "--- Container Image Updates ---"
docker compose pull --quiet
outdated_images=$(docker images --filter "dangling=true" -q | wc -l)
echo "Outdated images: $outdated_images"

# Database statistics
echo "--- Database Statistics ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC 
LIMIT 10;
"

# Performance metrics
echo "--- Performance Metrics ---"
echo "CPU Load Average:"
uptime

echo "Top processes by memory:"
ps aux --sort=-%mem | head -10

echo "Network connections:"
netstat -tuln | grep LISTEN | wc -l

# Storage usage analysis
echo "--- Storage Analysis ---"
echo "Docker space usage:"
docker system df

echo "Log file sizes:"
du -sh /opt/haos/logs/* 2>/dev/null | sort -hr | head -10

echo "Database size:"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT pg_size_pretty(pg_total_relation_size('events')) as events_size,
       pg_size_pretty(pg_database_size('synapse')) as total_db_size;
"

# Security scan
echo "--- Security Scan ---"
if command -v lynis &> /dev/null; then
    lynis audit system --quick --quiet
else
    echo "Lynis not installed - manual security review recommended"
fi

echo "=== Weekly Maintenance Completed ==="
```

### Monthly Maintenance Tasks

#### Monthly Deep Maintenance

```bash
#!/bin/bash
# /opt/haos/scripts/monthly-maintenance.sh

MONTH=$(date +%Y-%m)
REPORT_FILE="/opt/haos/reports/monthly-report-$MONTH.md"

echo "=== HAOS Monthly Maintenance - $(date) ===" | tee "$REPORT_FILE"

# System update and cleanup
echo "--- System Maintenance ---" | tee -a "$REPORT_FILE"
apt update && apt upgrade -y | tee -a "$REPORT_FILE"
apt autoremove -y | tee -a "$REPORT_FILE"
apt autoclean | tee -a "$REPORT_FILE"

# Container maintenance
echo "--- Container Maintenance ---" | tee -a "$REPORT_FILE"
docker system prune -f | tee -a "$REPORT_FILE"
docker volume prune -f | tee -a "$REPORT_FILE"

# Database maintenance
echo "--- Database Maintenance ---" | tee -a "$REPORT_FILE"
/opt/haos/scripts/database-maintenance.sh | tee -a "$REPORT_FILE"

# Certificate renewal
echo "--- Certificate Renewal ---" | tee -a "$REPORT_FILE"
certbot renew --dry-run | tee -a "$REPORT_FILE"

# Performance analysis
echo "--- Performance Analysis ---" | tee -a "$REPORT_FILE"
/opt/haos/scripts/performance-analysis.sh | tee -a "$REPORT_FILE"

# Security audit
echo "--- Security Audit ---" | tee -a "$REPORT_FILE"
/opt/haos/scripts/security-audit.sh | tee -a "$REPORT_FILE"

# Capacity planning
echo "--- Capacity Planning ---" | tee -a "$REPORT_FILE"
/opt/haos/scripts/capacity-analysis.sh | tee -a "$REPORT_FILE"

echo "=== Monthly Maintenance Completed ===" | tee -a "$REPORT_FILE"

# Email monthly report
mail -s "HAOS Monthly Maintenance Report - $MONTH" admin@your.domain.com < "$REPORT_FILE"
```

---

## Database Maintenance

### PostgreSQL Maintenance

#### Daily Database Tasks

```bash
#!/bin/bash
# /opt/haos/scripts/daily-db-maintenance.sh

echo "=== Daily Database Maintenance - $(date) ==="

# Database health check
echo "--- Database Health ---"
docker exec haos-postgres psql -U synapse -d synapse -c "SELECT version();"
docker exec haos-postgres psql -U synapse -d synapse -c "SELECT current_database(), current_user, inet_server_addr(), inet_server_port();"

# Connection statistics
echo "--- Connection Statistics ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    state,
    count(*) 
FROM pg_stat_activity 
GROUP BY state;
"

# Database size monitoring
echo "--- Database Size ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    pg_size_pretty(pg_database_size('synapse')) as database_size;
"

# Table statistics
echo "--- Top 10 Largest Tables ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
LIMIT 10;
"

# Analyze statistics (lightweight)
echo "--- Updating Statistics ---"
docker exec haos-postgres psql -U synapse -d synapse -c "ANALYZE;"

echo "=== Daily Database Maintenance Completed ==="
```

#### Weekly Database Maintenance

```bash
#!/bin/bash
# /opt/haos/scripts/weekly-db-maintenance.sh

echo "=== Weekly Database Maintenance - $(date) ==="

# Full vacuum analyze
echo "--- Full Vacuum Analyze ---"
docker exec haos-postgres psql -U synapse -d synapse -c "VACUUM ANALYZE;"

# Index usage statistics
echo "--- Index Usage Statistics ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
"

# Dead tuple analysis
echo "--- Dead Tuple Analysis ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    schemaname,
    tablename,
    n_live_tup,
    n_dead_tup,
    ROUND(n_dead_tup::float / (n_live_tup + n_dead_tup) * 100, 2) as dead_ratio
FROM pg_stat_user_tables 
WHERE n_live_tup + n_dead_tup > 0
ORDER BY dead_ratio DESC;
"

# Database performance metrics
echo "--- Performance Metrics ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    ROUND(blks_hit::float / (blks_hit + blks_read) * 100, 2) as cache_hit_ratio
FROM pg_stat_database 
WHERE datname = 'synapse';
"

echo "=== Weekly Database Maintenance Completed ==="
```

#### Monthly Database Optimization

```bash
#!/bin/bash
# /opt/haos/scripts/monthly-db-optimization.sh

echo "=== Monthly Database Optimization - $(date) ==="

# Create backup before optimization
BACKUP_FILE="/opt/haos/backups/pre-optimization-$(date +%Y-%m-%d).sql"
echo "--- Creating Pre-Optimization Backup ---"
docker exec haos-postgres pg_dump -U synapse synapse > "$BACKUP_FILE"
gzip "$BACKUP_FILE"

# Full vacuum
echo "--- Full Vacuum ---"
docker exec haos-postgres psql -U synapse -d synapse -c "VACUUM FULL;"

# Reindex
echo "--- Reindexing ---"
docker exec haos-postgres psql -U synapse -d synapse -c "REINDEX DATABASE synapse;"

# Update table statistics
echo "--- Updating Statistics ---"
docker exec haos-postgres psql -U synapse -d synapse -c "ANALYZE;"

# Check for unused indexes
echo "--- Unused Indexes ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND pg_relation_size(indexrelid) > 1024*1024  -- Larger than 1MB
ORDER BY pg_relation_size(indexrelid) DESC;
"

echo "=== Monthly Database Optimization Completed ==="
```

### Matrix Database Cleanup

#### Message History Cleanup

```bash
#!/bin/bash
# /opt/haos/scripts/matrix-cleanup.sh

echo "=== Matrix Database Cleanup - $(date) ==="

# Note: This requires Synapse admin API access
ADMIN_TOKEN="${MATRIX_ADMIN_TOKEN}"
HOMESERVER="https://your.domain.com"

# Clean up old media (older than 90 days)
echo "--- Media Cleanup ---"
curl -X POST \
  "$HOMESERVER/_synapse/admin/v1/media/your.domain.com/delete?before_ts=$(date -d '90 days ago' +%s)000" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Clean up old messages in public rooms (if retention policy allows)
echo "--- Message Retention Cleanup ---"
docker exec haos-synapse python -m synapse.app.admin_cmd \
  -c /data/homeserver.yaml \
  purge_remote_media \
  --before $(date -d '30 days ago' +%Y-%m-%d)

# Clean up old user IPs
echo "--- User IP Cleanup ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
DELETE FROM user_ips 
WHERE last_seen < NOW() - INTERVAL '30 days';
"

# Clean up old device lists
echo "--- Device List Cleanup ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
DELETE FROM device_lists_stream 
WHERE stream_id < (
    SELECT stream_id - 10000 
    FROM device_lists_stream 
    ORDER BY stream_id DESC 
    LIMIT 1
);
"

echo "=== Matrix Database Cleanup Completed ==="
```

---

## System Updates & Patches

### Automated Update Management

#### Security Updates

```bash
#!/bin/bash
# /opt/haos/scripts/security-updates.sh

echo "=== HAOS Security Updates - $(date) ==="

# Create system snapshot before updates
echo "--- Creating System Snapshot ---"
SNAPSHOT_DIR="/opt/haos/snapshots/$(date +%Y-%m-%d-%H%M%S)"
mkdir -p "$SNAPSHOT_DIR"

# Backup critical configurations
cp -r /etc/nginx "$SNAPSHOT_DIR/"
cp -r /opt/haos/matrix "$SNAPSHOT_DIR/"
cp /opt/haos/docker-compose.yml "$SNAPSHOT_DIR/"
cp /opt/haos/app/.env.production "$SNAPSHOT_DIR/"

# Database backup
docker exec haos-postgres pg_dump -U synapse synapse | gzip > "$SNAPSHOT_DIR/database-backup.sql.gz"

# Check for security updates
echo "--- Checking Security Updates ---"
apt update >/dev/null 2>&1
security_updates=$(apt list --upgradable 2>/dev/null | grep -c "security")

if [ "$security_updates" -gt 0 ]; then
    echo "Found $security_updates security updates"
    
    # Apply security updates
    echo "--- Applying Security Updates ---"
    DEBIAN_FRONTEND=noninteractive apt-get -y upgrade -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
    
    # Update container images
    echo "--- Updating Container Images ---"
    docker compose pull
    
    # Restart services if needed
    if [ -f /var/run/reboot-required ]; then
        echo "⚠️  System reboot required - schedule maintenance window"
    else
        echo "--- Restarting Services ---"
        docker compose down && docker compose up -d
        systemctl restart nginx
    fi
    
    # Test services
    echo "--- Testing Services ---"
    sleep 30
    if curl -f https://your.domain.com/health >/dev/null 2>&1; then
        echo "✅ Services restored successfully"
    else
        echo "❌ Service restoration failed - investigate immediately"
    fi
else
    echo "No security updates available"
fi

echo "=== Security Updates Completed ==="
```

#### Planned Maintenance Updates

```bash
#!/bin/bash
# /opt/haos/scripts/planned-updates.sh

MAINTENANCE_MODE=false
NOTIFICATION_EMAIL="admin@your.domain.com"

echo "=== HAOS Planned Updates - $(date) ==="

# Pre-update checks
echo "--- Pre-Update Checks ---"
df -h | awk '$5 > 90 { print "⚠️  Critical: Disk space low: " $0; exit 1 }'
free -m | awk 'NR==2{printf "Memory Usage: %s/%s MB (%.2f%%)\n", $3,$2,$3*100/$2 }'

# Notify users about maintenance
if [ "$MAINTENANCE_MODE" = true ]; then
    echo "--- Enabling Maintenance Mode ---"
    
    # Create maintenance page
    cat > /var/www/html/maintenance.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>HAOS Maintenance</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        .container { max-width: 600px; margin: 0 auto; }
        .icon { font-size: 48px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔧</div>
        <h1>Scheduled Maintenance</h1>
        <p>HAOS is currently undergoing scheduled maintenance.</p>
        <p>Service will be restored shortly.</p>
        <p>Contact: admin@your.domain.com</p>
    </div>
</body>
</html>
EOF

    # Redirect traffic to maintenance page
    nginx_conf_backup="/tmp/nginx-default.conf.backup"
    cp /etc/nginx/sites-enabled/haos "$nginx_conf_backup"
    
    cat > /etc/nginx/sites-enabled/maintenance << 'EOF'
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    server_name _;
    
    ssl_certificate /etc/letsencrypt/live/your.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.domain.com/privkey.pem;
    
    location / {
        return 503;
    }
    
    error_page 503 @maintenance;
    location @maintenance {
        root /var/www/html;
        rewrite ^(.*)$ /maintenance.html break;
    }
}
EOF

    nginx -t && nginx -s reload
fi

# Perform updates
echo "--- System Updates ---"
apt update && apt upgrade -y

echo "--- Container Updates ---"
docker compose pull

echo "--- Application Updates ---"
cd /opt/haos/app
git pull origin main
pnpm install
pnpm build

# Restart services
echo "--- Restarting Services ---"
docker compose down
docker compose up -d
systemctl restart haos

# Restore normal operation
if [ "$MAINTENANCE_MODE" = true ]; then
    echo "--- Disabling Maintenance Mode ---"
    rm /etc/nginx/sites-enabled/maintenance
    mv "$nginx_conf_backup" /etc/nginx/sites-enabled/haos
    nginx -s reload
fi

# Post-update verification
echo "--- Post-Update Verification ---"
sleep 60

services_ok=true
for endpoint in "/health" "/_matrix/client/versions"; do
    if ! curl -f "https://your.domain.com$endpoint" >/dev/null 2>&1; then
        echo "❌ Endpoint check failed: $endpoint"
        services_ok=false
    fi
done

if [ "$services_ok" = true ]; then
    echo "✅ All services operational"
else
    echo "❌ Service issues detected - rolling back"
    # Implement rollback procedure here
fi

echo "=== Planned Updates Completed ==="
```

---

## Backup & Recovery

### Backup Strategy

#### Daily Backup Script

```bash
#!/bin/bash
# /opt/haos/scripts/daily-backup.sh

BACKUP_ROOT="/opt/haos/backups"
DAILY_DIR="$BACKUP_ROOT/daily"
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="$DAILY_DIR/haos-backup-$DATE.tar.gz"
RETENTION_DAYS=7

echo "=== HAOS Daily Backup - $(date) ==="

# Create backup directories
mkdir -p "$DAILY_DIR"

# Create temporary backup directory
TEMP_BACKUP="/tmp/haos-backup-$DATE"
mkdir -p "$TEMP_BACKUP"

# Database backup
echo "--- Database Backup ---"
docker exec haos-postgres pg_dump -U synapse synapse | gzip > "$TEMP_BACKUP/database.sql.gz"

# Configuration backup
echo "--- Configuration Backup ---"
cp -r /opt/haos/matrix "$TEMP_BACKUP/"
cp -r /opt/haos/app "$TEMP_BACKUP/"
cp /opt/haos/docker-compose.yml "$TEMP_BACKUP/"
cp -r /etc/nginx/sites-available "$TEMP_BACKUP/nginx-sites"
cp -r /etc/ssl "$TEMP_BACKUP/ssl"

# Application data backup
echo "--- Application Data Backup ---"
docker exec haos-synapse tar -czf - /data/media_store | cat > "$TEMP_BACKUP/media_store.tar.gz"
docker exec haos-synapse tar -czf - /data/uploads | cat > "$TEMP_BACKUP/uploads.tar.gz"

# System configuration backup
echo "--- System Configuration ---"
mkdir -p "$TEMP_BACKUP/system"
cp /etc/crontab "$TEMP_BACKUP/system/"
cp -r /etc/cron.d "$TEMP_BACKUP/system/"
cp /etc/hosts "$TEMP_BACKUP/system/"
cp /etc/fstab "$TEMP_BACKUP/system/"

# Create manifest
echo "--- Creating Manifest ---"
cat > "$TEMP_BACKUP/MANIFEST.txt" << EOF
HAOS Backup Manifest
Date: $(date)
Hostname: $(hostname)
HAOS Version: $(cd /opt/haos/app && git rev-parse HEAD)
System: $(uname -a)

Backup Contents:
- Database (PostgreSQL)
- Matrix configuration
- Application configuration  
- Media store
- File uploads
- System configuration
EOF

# Create compressed backup
echo "--- Creating Archive ---"
tar -czf "$BACKUP_FILE" -C /tmp "haos-backup-$DATE"

# Cleanup temporary files
rm -rf "$TEMP_BACKUP"

# Verify backup
echo "--- Verifying Backup ---"
if tar -tzf "$BACKUP_FILE" >/dev/null 2>&1; then
    backup_size=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup created: $BACKUP_FILE ($backup_size)"
else
    echo "❌ Backup verification failed"
    exit 1
fi

# Cleanup old backups
echo "--- Cleaning Old Backups ---"
find "$DAILY_DIR" -name "haos-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Remote backup (optional)
if [ -n "$BACKUP_S3_BUCKET" ]; then
    echo "--- Remote Backup ---"
    aws s3 cp "$BACKUP_FILE" "s3://$BACKUP_S3_BUCKET/daily/"
fi

echo "=== Daily Backup Completed ==="
```

#### Weekly Full Backup

```bash
#!/bin/bash
# /opt/haos/scripts/weekly-backup.sh

BACKUP_ROOT="/opt/haos/backups"
WEEKLY_DIR="$BACKUP_ROOT/weekly"
DATE=$(date +%Y-W%U)
BACKUP_FILE="$WEEKLY_DIR/haos-full-backup-$DATE.tar.gz"
RETENTION_WEEKS=4

echo "=== HAOS Weekly Full Backup - $(date) ==="

# Create backup directories
mkdir -p "$WEEKLY_DIR"

# Create temporary backup directory
TEMP_BACKUP="/tmp/haos-full-backup-$DATE"
mkdir -p "$TEMP_BACKUP"

# Full database backup with globals
echo "--- Full Database Backup ---"
docker exec haos-postgres pg_dumpall -U synapse | gzip > "$TEMP_BACKUP/database-full.sql.gz"

# Configuration backup
echo "--- Configuration Backup ---"
cp -r /opt/haos "$TEMP_BACKUP/haos"

# Full system configuration
echo "--- System Configuration ---"
mkdir -p "$TEMP_BACKUP/system"
cp -r /etc "$TEMP_BACKUP/system/"
cp -r /home/haos "$TEMP_BACKUP/system/" 2>/dev/null || true

# Docker volumes backup
echo "--- Docker Volumes ---"
for volume in $(docker volume ls -q | grep haos); do
    echo "Backing up volume: $volume"
    docker run --rm -v "$volume:/source" -v "$TEMP_BACKUP:/backup" \
        alpine tar -czf "/backup/volume-$volume.tar.gz" -C /source .
done

# Create manifest with detailed info
echo "--- Creating Detailed Manifest ---"
cat > "$TEMP_BACKUP/MANIFEST.txt" << EOF
HAOS Full Backup Manifest
Date: $(date)
Hostname: $(hostname)
Backup Type: Weekly Full Backup

System Information:
$(uname -a)

HAOS Information:
Version: $(cd /opt/haos/app && git rev-parse HEAD)
Branch: $(cd /opt/haos/app && git branch --show-current)
Last Commit: $(cd /opt/haos/app && git log -1 --pretty=format:"%h - %an, %ar : %s")

Database Information:
$(docker exec haos-postgres psql -U synapse -d synapse -c "SELECT version();" -t)
Database Size: $(docker exec haos-postgres psql -U synapse -d synapse -c "SELECT pg_size_pretty(pg_database_size('synapse'));" -t)

Docker Information:
$(docker --version)
$(docker compose version)

Container Status:
$(docker compose ps)

System Resources:
$(df -h)
$(free -h)

Backup Contents:
- Complete database dump (pg_dumpall)
- Full HAOS configuration
- System configuration (/etc)
- User home directories
- Docker volumes
- SSL certificates
EOF

# Create compressed backup
echo "--- Creating Archive ---"
tar -czf "$BACKUP_FILE" -C /tmp "haos-full-backup-$DATE"

# Cleanup temporary files
rm -rf "$TEMP_BACKUP"

# Verify backup
echo "--- Verifying Backup ---"
if tar -tzf "$BACKUP_FILE" >/dev/null 2>&1; then
    backup_size=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Full backup created: $BACKUP_FILE ($backup_size)"
else
    echo "❌ Backup verification failed"
    exit 1
fi

# Cleanup old backups
echo "--- Cleaning Old Backups ---"
find "$WEEKLY_DIR" -name "haos-full-backup-*.tar.gz" -mtime +$((RETENTION_WEEKS * 7)) -delete

# Remote backup
if [ -n "$BACKUP_S3_BUCKET" ]; then
    echo "--- Remote Backup ---"
    aws s3 cp "$BACKUP_FILE" "s3://$BACKUP_S3_BUCKET/weekly/"
fi

echo "=== Weekly Full Backup Completed ==="
```

### Recovery Procedures

#### Database Recovery

```bash
#!/bin/bash
# /opt/haos/scripts/database-recovery.sh

BACKUP_FILE="$1"
RECOVERY_TYPE="$2" # full or selective

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file> [full|selective]"
    exit 1
fi

echo "=== HAOS Database Recovery - $(date) ==="
echo "Backup file: $BACKUP_FILE"
echo "Recovery type: ${RECOVERY_TYPE:-selective}"

# Verify backup file
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Stop services
echo "--- Stopping Services ---"
docker compose stop synapse
systemctl stop haos

# Backup current database
echo "--- Creating Current Database Backup ---"
CURRENT_BACKUP="/tmp/pre-recovery-backup-$(date +%Y%m%d%H%M%S).sql.gz"
docker exec haos-postgres pg_dump -U synapse synapse | gzip > "$CURRENT_BACKUP"
echo "Current database backed up to: $CURRENT_BACKUP"

if [ "$RECOVERY_TYPE" = "full" ]; then
    echo "--- Full Database Recovery ---"
    
    # Drop and recreate database
    docker exec haos-postgres psql -U synapse -c "DROP DATABASE IF EXISTS synapse;"
    docker exec haos-postgres psql -U synapse -c "CREATE DATABASE synapse OWNER synapse;"
    
    # Restore from backup
    zcat "$BACKUP_FILE" | docker exec -i haos-postgres psql -U synapse -d synapse
    
else
    echo "--- Selective Database Recovery ---"
    echo "Tables to recover (enter table names, one per line, empty line to finish):"
    
    tables=()
    while read -r table; do
        [ -z "$table" ] && break
        tables+=("$table")
    done
    
    if [ ${#tables[@]} -gt 0 ]; then
        for table in "${tables[@]}"; do
            echo "Recovering table: $table"
            # Drop table and restore from backup (simplified)
            docker exec haos-postgres psql -U synapse -d synapse -c "DROP TABLE IF EXISTS $table CASCADE;"
            zcat "$BACKUP_FILE" | docker exec -i haos-postgres psql -U synapse -d synapse -c "\\copy $table FROM stdin"
        done
    fi
fi

# Start services
echo "--- Starting Services ---"
docker compose start synapse
sleep 30
systemctl start haos

# Verify recovery
echo "--- Verifying Recovery ---"
if docker exec haos-postgres psql -U synapse -d synapse -c "SELECT count(*) FROM users;" >/dev/null 2>&1; then
    echo "✅ Database recovery successful"
else
    echo "❌ Database recovery failed"
    
    # Offer rollback
    read -p "Rollback to previous state? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "--- Rolling Back ---"
        docker exec haos-postgres psql -U synapse -c "DROP DATABASE synapse;"
        docker exec haos-postgres psql -U synapse -c "CREATE DATABASE synapse OWNER synapse;"
        zcat "$CURRENT_BACKUP" | docker exec -i haos-postgres psql -U synapse -d synapse
        echo "Rollback completed"
    fi
fi

echo "=== Database Recovery Completed ==="
```

#### Full System Recovery

```bash
#!/bin/bash
# /opt/haos/scripts/system-recovery.sh

BACKUP_FILE="$1"
RECOVERY_DIR="/tmp/haos-recovery-$(date +%Y%m%d%H%M%S)"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <full_backup_file>"
    exit 1
fi

echo "=== HAOS Full System Recovery - $(date) ==="
echo "Backup file: $BACKUP_FILE"
echo "Recovery directory: $RECOVERY_DIR"

# Extract backup
echo "--- Extracting Backup ---"
mkdir -p "$RECOVERY_DIR"
tar -xzf "$BACKUP_FILE" -C "$RECOVERY_DIR"

# Find backup contents
BACKUP_CONTENTS=$(find "$RECOVERY_DIR" -type d -name "haos-*backup*" | head -1)
if [ -z "$BACKUP_CONTENTS" ]; then
    echo "❌ Invalid backup format"
    exit 1
fi

echo "Backup contents: $BACKUP_CONTENTS"

# Stop all services
echo "--- Stopping All Services ---"
systemctl stop haos
docker compose down
systemctl stop nginx

# Recovery confirmation
echo "⚠️  This will overwrite current system configuration and data!"
read -p "Continue with recovery? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Recovery cancelled"
    exit 0
fi

# Backup current state
echo "--- Backing Up Current State ---"
CURRENT_BACKUP="/opt/haos/backups/pre-recovery-$(date +%Y%m%d%H%M%S)"
mkdir -p "$CURRENT_BACKUP"
cp -r /opt/haos "$CURRENT_BACKUP/" 2>/dev/null || true
cp -r /etc/nginx "$CURRENT_BACKUP/" 2>/dev/null || true

# Restore configuration
echo "--- Restoring Configuration ---"
if [ -d "$BACKUP_CONTENTS/haos" ]; then
    rm -rf /opt/haos
    cp -r "$BACKUP_CONTENTS/haos" /opt/haos
fi

# Restore nginx configuration
if [ -d "$BACKUP_CONTENTS/nginx-sites" ]; then
    rm -rf /etc/nginx/sites-available/*
    cp -r "$BACKUP_CONTENTS/nginx-sites"/* /etc/nginx/sites-available/
fi

# Restore database
echo "--- Restoring Database ---"
if [ -f "$BACKUP_CONTENTS/database-full.sql.gz" ]; then
    docker compose up -d postgres
    sleep 30
    
    # Drop and recreate database
    docker exec haos-postgres psql -U synapse -c "DROP DATABASE IF EXISTS synapse;"
    docker exec haos-postgres psql -U synapse -c "CREATE DATABASE synapse OWNER synapse;"
    
    # Restore database
    zcat "$BACKUP_CONTENTS/database-full.sql.gz" | docker exec -i haos-postgres psql -U synapse
fi

# Restore Docker volumes
echo "--- Restoring Docker Volumes ---"
for volume_backup in "$BACKUP_CONTENTS"/volume-*.tar.gz; do
    if [ -f "$volume_backup" ]; then
        volume_name=$(basename "$volume_backup" .tar.gz | sed 's/volume-//')
        echo "Restoring volume: $volume_name"
        
        # Recreate volume
        docker volume rm "$volume_name" 2>/dev/null || true
        docker volume create "$volume_name"
        
        # Restore data
        docker run --rm -v "$volume_name:/target" -v "$BACKUP_CONTENTS:/backup" \
            alpine tar -xzf "/backup/$(basename "$volume_backup")" -C /target
    fi
done

# Start services
echo "--- Starting Services ---"
docker compose up -d
sleep 30
systemctl start nginx
systemctl start haos

# Verify recovery
echo "--- Verifying Recovery ---"
sleep 60

recovery_ok=true
for endpoint in "/health" "/_matrix/client/versions"; do
    if ! curl -f "https://your.domain.com$endpoint" >/dev/null 2>&1; then
        echo "❌ Endpoint check failed: $endpoint"
        recovery_ok=false
    fi
done

if [ "$recovery_ok" = true ]; then
    echo "✅ System recovery successful"
    
    # Cleanup
    read -p "Remove recovery files? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$RECOVERY_DIR"
    fi
else
    echo "❌ System recovery failed"
    echo "Current state backup available at: $CURRENT_BACKUP"
fi

echo "=== Full System Recovery Completed ==="
```

---

## Performance Monitoring

### System Performance Monitoring

#### Performance Data Collection

```bash
#!/bin/bash
# /opt/haos/scripts/performance-monitoring.sh

METRICS_DIR="/opt/haos/metrics"
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

mkdir -p "$METRICS_DIR/$DATE"

echo "=== HAOS Performance Monitoring - $(date) ==="

# System metrics
echo "--- System Metrics ---"
cat > "$METRICS_DIR/$DATE/system-$TIMESTAMP.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "uptime": "$(uptime -p)",
  "load_average": $(uptime | awk -F'load average:' '{print $2}' | sed 's/,//g'),
  "cpu_usage": $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//'),
  "memory": {
    "total": $(free -b | awk 'NR==2{print $2}'),
    "used": $(free -b | awk 'NR==2{print $3}'),
    "free": $(free -b | awk 'NR==2{print $4}'),
    "available": $(free -b | awk 'NR==2{print $7}')
  },
  "disk_usage": {
$(df -B1 | awk 'NR>1 && $6 ~ /^\// {printf "    \"%s\": {\"size\": %s, \"used\": %s, \"available\": %s},\n", $6, $2, $3, $4}' | sed '$ s/,$//')
  },
  "network": {
$(cat /proc/net/dev | awk 'NR>2 {gsub(/:/, "", $1); printf "    \"%s\": {\"rx_bytes\": %s, \"tx_bytes\": %s},\n", $1, $2, $10}' | sed '$ s/,$//')
  }
}
EOF

# Container metrics
echo "--- Container Metrics ---"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" > "$METRICS_DIR/$DATE/docker-stats-$TIMESTAMP.txt"

# Database metrics
echo "--- Database Metrics ---"
docker exec haos-postgres psql -U synapse -d synapse -t -c "
SELECT json_build_object(
  'timestamp', NOW(),
  'database_size', pg_size_pretty(pg_database_size('synapse')),
  'database_size_bytes', pg_database_size('synapse'),
  'connections', (SELECT count(*) FROM pg_stat_activity),
  'transactions_committed', (SELECT xact_commit FROM pg_stat_database WHERE datname='synapse'),
  'transactions_rolled_back', (SELECT xact_rollback FROM pg_stat_database WHERE datname='synapse'),
  'cache_hit_ratio', ROUND((SELECT blks_hit::float / (blks_hit + blks_read) * 100 FROM pg_stat_database WHERE datname='synapse'), 2)
);
" > "$METRICS_DIR/$DATE/database-$TIMESTAMP.json"

# Matrix metrics
echo "--- Matrix Metrics ---"
if command -v curl >/dev/null 2>&1; then
    # Get Matrix server stats (if metrics are enabled)
    curl -s "https://your.domain.com:9092/metrics" > "$METRICS_DIR/$DATE/matrix-metrics-$TIMESTAMP.txt" 2>/dev/null || echo "Matrix metrics not available" > "$METRICS_DIR/$DATE/matrix-metrics-$TIMESTAMP.txt"
fi

# Application metrics
echo "--- Application Metrics ---"
if systemctl is-active --quiet haos; then
    app_pid=$(systemctl show haos --property=MainPID --value)
    if [ "$app_pid" != "0" ]; then
        cat > "$METRICS_DIR/$DATE/application-$TIMESTAMP.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "status": "running",
  "pid": $app_pid,
  "memory_usage": $(ps -p $app_pid -o rss= 2>/dev/null || echo 0),
  "cpu_usage": $(ps -p $app_pid -o %cpu= 2>/dev/null || echo 0),
  "open_files": $(lsof -p $app_pid 2>/dev/null | wc -l)
}
EOF
    fi
fi

# Network connectivity
echo "--- Network Connectivity ---"
cat > "$METRICS_DIR/$DATE/network-$TIMESTAMP.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "matrix_api_response_time": $(curl -o /dev/null -s -w '%{time_total}' https://your.domain.com/_matrix/client/versions),
  "livekit_connectivity": $(timeout 5 bash -c "</dev/tcp/localhost/7880" && echo true || echo false),
  "external_connectivity": $(ping -c 1 8.8.8.8 >/dev/null 2>&1 && echo true || echo false)
}
EOF

echo "=== Performance Monitoring Completed ==="
```

#### Performance Analysis

```bash
#!/bin/bash
# /opt/haos/scripts/performance-analysis.sh

METRICS_DIR="/opt/haos/metrics"
REPORTS_DIR="/opt/haos/reports"
DATE=$(date +%Y-%m-%d)

mkdir -p "$REPORTS_DIR"

echo "=== HAOS Performance Analysis - $(date) ==="

# Analyze trends over the last 7 days
REPORT_FILE="$REPORTS_DIR/performance-report-$DATE.md"

cat > "$REPORT_FILE" << EOF
# HAOS Performance Report
**Generated:** $(date)
**Period:** Last 7 days

## System Performance Summary

EOF

# CPU and Memory trends
echo "--- Analyzing CPU and Memory Trends ---"
echo "### CPU and Memory Trends" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

for i in {6..0}; do
    check_date=$(date -d "$i days ago" +%Y-%m-%d)
    if [ -d "$METRICS_DIR/$check_date" ]; then
        avg_cpu=$(find "$METRICS_DIR/$check_date" -name "system-*.json" -exec jq -r '.cpu_usage' {} \; | awk '{sum+=$1} END {print sum/NR}' 2>/dev/null || echo "N/A")
        avg_mem=$(find "$METRICS_DIR/$check_date" -name "system-*.json" -exec jq -r '.memory.used/.memory.total*100' {} \; | awk '{sum+=$1} END {print sum/NR}' 2>/dev/null || echo "N/A")
        
        echo "- **$check_date:** CPU: ${avg_cpu}%, Memory: ${avg_mem}%" >> "$REPORT_FILE"
    fi
done

# Database performance
echo "--- Analyzing Database Performance ---"
echo "" >> "$REPORT_FILE"
echo "### Database Performance" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Current database size
current_db_size=$(docker exec haos-postgres psql -U synapse -d synapse -t -c "SELECT pg_size_pretty(pg_database_size('synapse'));" | xargs)
echo "- **Current Database Size:** $current_db_size" >> "$REPORT_FILE"

# Database growth rate
db_sizes=()
for i in {6..0}; do
    check_date=$(date -d "$i days ago" +%Y-%m-%d)
    if [ -d "$METRICS_DIR/$check_date" ]; then
        size=$(find "$METRICS_DIR/$check_date" -name "database-*.json" -exec jq -r '.database_size_bytes' {} \; 2>/dev/null | tail -1)
        if [ "$size" != "null" ] && [ -n "$size" ]; then
            db_sizes+=("$size")
        fi
    fi
done

if [ ${#db_sizes[@]} -gt 1 ]; then
    first_size=${db_sizes[0]}
    last_size=${db_sizes[-1]}
    growth=$((last_size - first_size))
    growth_mb=$((growth / 1024 / 1024))
    echo "- **Database Growth (7 days):** ${growth_mb} MB" >> "$REPORT_FILE"
fi

# Container performance
echo "--- Analyzing Container Performance ---"
echo "" >> "$REPORT_FILE"
echo "### Container Performance" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | tail -n +2 | while read line; do
    echo "- $line" >> "$REPORT_FILE"
done

# Performance recommendations
echo "" >> "$REPORT_FILE"
echo "### Performance Recommendations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for performance issues
high_cpu=$(docker stats --no-stream --format "{{.CPUPerc}}" | sed 's/%//' | awk '$1 > 80 {print $1}' | wc -l)
high_memory=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}' | awk '{if ($1 > 85) print $1}')

if [ "$high_cpu" -gt 0 ]; then
    echo "⚠️ **High CPU Usage Detected:** $high_cpu containers using >80% CPU" >> "$REPORT_FILE"
fi

if [ -n "$high_memory" ]; then
    echo "⚠️ **High Memory Usage:** ${high_memory}% memory utilization" >> "$REPORT_FILE"
fi

# Disk space warnings
df -h | awk '$5 > 85 {print "⚠️ **High Disk Usage:** " $5 " on " $6}' >> "$REPORT_FILE"

echo "Performance analysis completed: $REPORT_FILE"
```

---

## Log Management

### Log Rotation and Cleanup

#### Centralized Log Rotation

```bash
#!/bin/bash
# /opt/haos/scripts/log-rotation.sh

echo "=== HAOS Log Rotation - $(date) ==="

# Application logs
echo "--- Rotating Application Logs ---"
logrotate_config="/tmp/haos-logrotate.conf"

cat > "$logrotate_config" << 'EOF'
/opt/haos/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 haos haos
    postrotate
        systemctl reload haos 2>/dev/null || true
    endscript
}

/var/log/nginx/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data adm
    postrotate
        nginx -s reload 2>/dev/null || true
    endscript
}

/opt/haos/matrix/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 991 991
    postrotate
        docker compose exec synapse kill -HUP 1 2>/dev/null || true
    endscript
}
EOF

# Run logrotate
logrotate -f "$logrotate_config"

# Container logs cleanup
echo "--- Container Logs Cleanup ---"
docker system prune --volumes -f >/dev/null 2>&1

# Clean old container logs
find /var/lib/docker/containers/ -name "*.log" -mtime +30 -exec rm {} \; 2>/dev/null || true

# System logs cleanup
echo "--- System Logs Cleanup ---"
journalctl --vacuum-time=30d --quiet

# Custom logs cleanup
echo "--- Custom Logs Cleanup ---"
find /opt/haos/logs -name "*.log.*" -mtime +30 -delete
find /opt/haos/metrics -type f -mtime +7 -delete

echo "=== Log Rotation Completed ==="
```

### Log Analysis and Monitoring

#### Automated Log Analysis

```bash
#!/bin/bash
# /opt/haos/scripts/log-analysis.sh

ANALYSIS_DIR="/opt/haos/analysis"
DATE=$(date +%Y-%m-%d)
REPORT_FILE="$ANALYSIS_DIR/log-analysis-$DATE.md"

mkdir -p "$ANALYSIS_DIR"

echo "=== HAOS Log Analysis - $(date) ==="

cat > "$REPORT_FILE" << EOF
# HAOS Log Analysis Report
**Generated:** $(date)
**Period:** Last 24 hours

## Summary

EOF

# Error analysis
echo "--- Analyzing Errors ---"
echo "### Error Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# System errors
system_errors=$(journalctl --since "24 hours ago" --priority=err --no-pager | wc -l)
echo "- **System Errors:** $system_errors" >> "$REPORT_FILE"

if [ "$system_errors" -gt 0 ]; then
    echo "" >> "$REPORT_FILE"
    echo "#### Recent System Errors:" >> "$REPORT_FILE"
    journalctl --since "24 hours ago" --priority=err --no-pager | tail -10 | while read line; do
        echo "    $line" >> "$REPORT_FILE"
    done
fi

# Application errors
if [ -f "/opt/haos/logs/haos.log" ]; then
    app_errors=$(grep -c "ERROR" /opt/haos/logs/haos.log 2>/dev/null || echo 0)
    echo "- **Application Errors:** $app_errors" >> "$REPORT_FILE"
fi

# Nginx errors
if [ -f "/var/log/nginx/error.log" ]; then
    nginx_errors=$(grep -c "$(date +%Y/%m/%d)" /var/log/nginx/error.log 2>/dev/null || echo 0)
    echo "- **Nginx Errors:** $nginx_errors" >> "$REPORT_FILE"
fi

# Security events
echo "" >> "$REPORT_FILE"
echo "### Security Events" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Failed login attempts
failed_logins=$(grep "Failed password" /var/log/auth.log 2>/dev/null | grep "$(date +%b\ %d)" | wc -l)
echo "- **Failed Login Attempts:** $failed_logins" >> "$REPORT_FILE"

# Fail2ban actions
if systemctl is-active --quiet fail2ban; then
    banned_ips=$(fail2ban-client status | grep "Banned IP list:" | wc -w)
    echo "- **Currently Banned IPs:** $banned_ips" >> "$REPORT_FILE"
fi

# Performance issues
echo "" >> "$REPORT_FILE"
echo "### Performance Issues" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# High CPU events
high_cpu_events=$(journalctl --since "24 hours ago" --grep "high load" --no-pager | wc -l)
echo "- **High CPU Events:** $high_cpu_events" >> "$REPORT_FILE"

# Memory warnings
memory_warnings=$(journalctl --since "24 hours ago" --grep "memory" --no-pager | wc -l)
echo "- **Memory Warnings:** $memory_warnings" >> "$REPORT_FILE"

# Database issues
echo "" >> "$REPORT_FILE"
echo "### Database Issues" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ -d "/opt/haos/matrix/logs" ]; then
    db_errors=$(find /opt/haos/matrix/logs -name "*.log" -exec grep -c "ERROR" {} \; 2>/dev/null | paste -sd+ | bc 2>/dev/null || echo 0)
    echo "- **Database Errors:** $db_errors" >> "$REPORT_FILE"
fi

# Matrix federation issues
matrix_federation_errors=$(docker exec haos-synapse grep -c "Federation" /data/logs/homeserver.log 2>/dev/null || echo 0)
echo "- **Matrix Federation Issues:** $matrix_federation_errors" >> "$REPORT_FILE"

# Generate alerts if needed
if [ "$system_errors" -gt 10 ] || [ "$failed_logins" -gt 50 ] || [ "$app_errors" -gt 5 ]; then
    echo "" >> "$REPORT_FILE"
    echo "## ⚠️ ATTENTION REQUIRED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "High error rates detected. Immediate investigation recommended." >> "$REPORT_FILE"
    
    # Send alert email
    mail -s "HAOS Log Analysis Alert - $DATE" admin@your.domain.com < "$REPORT_FILE"
fi

echo "Log analysis completed: $REPORT_FILE"
```

---

## Storage Management

### Disk Space Management

#### Storage Monitoring

```bash
#!/bin/bash
# /opt/haos/scripts/storage-monitoring.sh

echo "=== HAOS Storage Monitoring - $(date) ==="

# Overall disk usage
echo "--- Disk Usage Overview ---"
df -h | awk 'NR==1{print $0} NR>1{
    usage = int($5);
    if (usage >= 90) status = "🔴 CRITICAL";
    else if (usage >= 80) status = "🟡 WARNING";
    else status = "🟢 OK";
    print status, $0
}'

# Directory size analysis
echo "--- Directory Size Analysis ---"
echo "Top 10 largest directories in /opt/haos:"
du -sh /opt/haos/* 2>/dev/null | sort -hr | head -10

echo "Docker space usage:"
docker system df

echo "Container volumes:"
docker volume ls --format "table {{.Name}}\t{{.Driver}}" | while read name driver; do
    if [ "$name" != "VOLUME" ]; then
        size=$(docker run --rm -v "$name:/data" alpine du -sh /data 2>/dev/null | cut -f1)
        echo "$name: $size"
    fi
done

# Database size analysis
echo "--- Database Size Analysis ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
LIMIT 10;
"

# Log file sizes
echo "--- Log File Sizes ---"
echo "Application logs:"
find /opt/haos/logs -type f -exec ls -lh {} \; | awk '{print $5 "\t" $9}' | sort -hr

echo "System logs:"
ls -lh /var/log/*.log 2>/dev/null | awk '{print $5 "\t" $9}' | sort -hr | head -10

# Media storage analysis
echo "--- Media Storage ---"
if docker exec haos-synapse ls /data/media_store >/dev/null 2>&1; then
    media_size=$(docker exec haos-synapse du -sh /data/media_store | cut -f1)
    echo "Matrix media store: $media_size"
    
    # Media by type
    echo "Media files by type:"
    docker exec haos-synapse find /data/media_store -type f -name "*.*" | sed 's/.*\.//' | sort | uniq -c | sort -nr | head -10
fi

echo "=== Storage Monitoring Completed ==="
```

#### Automated Cleanup

```bash
#!/bin/bash
# /opt/haos/scripts/storage-cleanup.sh

CLEANUP_LOG="/opt/haos/logs/storage-cleanup-$(date +%Y-%m-%d).log"

echo "=== HAOS Storage Cleanup - $(date) ===" | tee "$CLEANUP_LOG"

# Check available space before cleanup
available_space_before=$(df /opt/haos --output=avail | tail -1)
echo "Available space before cleanup: $(($available_space_before / 1024)) MB" | tee -a "$CLEANUP_LOG"

# Cleanup temporary files
echo "--- Cleaning Temporary Files ---" | tee -a "$CLEANUP_LOG"
temp_cleaned=$(find /tmp -type f -mtime +1 -delete -print | wc -l)
echo "Cleaned $temp_cleaned temporary files" | tee -a "$CLEANUP_LOG"

# Cleanup old logs
echo "--- Cleaning Old Logs ---" | tee -a "$CLEANUP_LOG"
old_logs=$(find /opt/haos/logs -name "*.log.*" -mtime +7 -delete -print | wc -l)
echo "Cleaned $old_logs old log files" | tee -a "$CLEANUP_LOG"

# Docker cleanup
echo "--- Docker Cleanup ---" | tee -a "$CLEANUP_LOG"
docker system prune -f --volumes | tee -a "$CLEANUP_LOG"

# Old container logs
echo "--- Container Log Cleanup ---" | tee -a "$CLEANUP_LOG"
container_logs=$(find /var/lib/docker/containers/ -name "*.log" -mtime +7 -delete -print 2>/dev/null | wc -l)
echo "Cleaned $container_logs container log files" | tee -a "$CLEANUP_LOG"

# Old Matrix media (if enabled)
if [ "$ENABLE_MEDIA_CLEANUP" = "true" ]; then
    echo "--- Matrix Media Cleanup ---" | tee -a "$CLEANUP_LOG"
    # Clean media older than 90 days (be careful with this!)
    old_media=$(docker exec haos-synapse find /data/media_store -type f -mtime +90 -delete -print 2>/dev/null | wc -l)
    echo "Cleaned $old_media old media files" | tee -a "$CLEANUP_LOG"
fi

# Old database backups
echo "--- Old Backup Cleanup ---" | tee -a "$CLEANUP_LOG"
old_backups=$(find /opt/haos/backups -name "*.tar.gz" -mtime +30 -delete -print | wc -l)
echo "Cleaned $old_backups old backup files" | tee -a "$CLEANUP_LOG"

# Package cache cleanup
echo "--- Package Cache Cleanup ---" | tee -a "$CLEANUP_LOG"
apt autoremove -y >/dev/null 2>&1
apt autoclean >/dev/null 2>&1
echo "Package cache cleaned" | tee -a "$CLEANUP_LOG"

# Check available space after cleanup
available_space_after=$(df /opt/haos --output=avail | tail -1)
space_freed=$(($available_space_after - $available_space_before))
echo "Available space after cleanup: $(($available_space_after / 1024)) MB" | tee -a "$CLEANUP_LOG"
echo "Space freed: $(($space_freed / 1024)) MB" | tee -a "$CLEANUP_LOG"

# Alert if still low on space
if [ $available_space_after -lt 2097152 ]; then  # Less than 2GB
    echo "⚠️ WARNING: Still low on disk space!" | tee -a "$CLEANUP_LOG"
    mail -s "HAOS Storage Warning" admin@your.domain.com < "$CLEANUP_LOG"
fi

echo "=== Storage Cleanup Completed ===" | tee -a "$CLEANUP_LOG"
```

---

## Security Maintenance

### Regular Security Tasks

#### Security Updates Check

```bash
#!/bin/bash
# /opt/haos/scripts/security-check.sh

echo "=== HAOS Security Check - $(date) ==="

# System security updates
echo "--- System Security Updates ---"
apt update >/dev/null 2>&1
security_updates=$(apt list --upgradable 2>/dev/null | grep -c "security")
total_updates=$(apt list --upgradable 2>/dev/null | grep -c "upgradable")

echo "Security updates available: $security_updates"
echo "Total updates available: $total_updates"

if [ "$security_updates" -gt 0 ]; then
    echo "⚠️ Security updates available:"
    apt list --upgradable 2>/dev/null | grep "security"
fi

# Container security
echo "--- Container Security ---"
echo "Container image updates:"
docker compose pull --quiet 2>/dev/null
outdated_images=$(docker images --filter "dangling=true" -q | wc -l)
echo "Outdated images: $outdated_images"

# Certificate status
echo "--- Certificate Status ---"
cert_expiry=$(openssl x509 -in /etc/letsencrypt/live/your.domain.com/cert.pem -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$cert_expiry" ]; then
    cert_days_left=$(( ($(date -d "$cert_expiry" +%s) - $(date +%s)) / 86400 ))
    echo "SSL certificate expires in $cert_days_left days"
    
    if [ $cert_days_left -lt 30 ]; then
        echo "⚠️ SSL certificate expires soon!"
    fi
else
    echo "❌ Cannot check SSL certificate"
fi

# Security scan with lynis
echo "--- Security Scan ---"
if command -v lynis &> /dev/null; then
    lynis audit system --quick --quiet --log-file /opt/haos/security/lynis-$(date +%Y-%m-%d).log
    echo "Security scan completed - check log for details"
else
    echo "Lynis not installed - manual security review needed"
fi

# Fail2ban status
echo "--- Fail2ban Status ---"
if systemctl is-active --quiet fail2ban; then
    echo "Fail2ban is active"
    fail2ban-client status | grep "Jail list:"
    
    # Show recent bans
    recent_bans=$(fail2ban-client status sshd 2>/dev/null | grep "Currently banned:" | awk '{print $3}')
    echo "Currently banned IPs: $recent_bans"
else
    echo "❌ Fail2ban is not running"
fi

# Check for suspicious activity
echo "--- Suspicious Activity Check ---"
failed_logins=$(grep "Failed password" /var/log/auth.log 2>/dev/null | grep "$(date +%b\ %d)" | wc -l)
echo "Failed login attempts today: $failed_logins"

if [ $failed_logins -gt 10 ]; then
    echo "⚠️ High number of failed login attempts"
fi

# File integrity check (if AIDE is installed)
echo "--- File Integrity ---"
if command -v aide &> /dev/null; then
    echo "Running AIDE check..."
    aide --check --quiet 2>/dev/null | grep -E "(found|changed|removed)"
else
    echo "AIDE not configured"
fi

echo "=== Security Check Completed ==="
```

---

## Matrix Homeserver Maintenance

### Matrix-Specific Maintenance Tasks

#### Matrix Database Optimization

```bash
#!/bin/bash
# /opt/haos/scripts/matrix-maintenance.sh

echo "=== Matrix Homeserver Maintenance - $(date) ==="

# Room statistics
echo "--- Room Statistics ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    'Total rooms' as metric,
    count(*) as value
FROM rooms
UNION ALL
SELECT 
    'Public rooms' as metric,
    count(*) as value
FROM rooms 
WHERE is_public = true
UNION ALL
SELECT 
    'Encrypted rooms' as metric,
    count(*) as value
FROM room_stats_current 
WHERE end_to_end_key_algorithm IS NOT NULL;
"

# User statistics
echo "--- User Statistics ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    'Total users' as metric,
    count(*) as value
FROM users
UNION ALL
SELECT 
    'Active users (7 days)' as metric,
    count(*) as value
FROM user_stats_current 
WHERE last_seen > NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'Guest users' as metric,
    count(*) as value
FROM users 
WHERE is_guest = true;
"

# Message statistics
echo "--- Message Statistics ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    'Total events' as metric,
    count(*) as value
FROM events
UNION ALL
SELECT 
    'Messages today' as metric,
    count(*) as value
FROM events 
WHERE type = 'm.room.message' 
AND origin_server_ts > EXTRACT(epoch FROM (NOW() - INTERVAL '1 day')) * 1000;
"

# Federation health
echo "--- Federation Health ---"
if curl -sf "https://your.domain.com:8448/_matrix/federation/v1/version" >/dev/null; then
    echo "✅ Federation endpoint responding"
else
    echo "❌ Federation endpoint not responding"
fi

# Media store size
echo "--- Media Store ---"
if docker exec haos-synapse ls /data/media_store >/dev/null 2>&1; then
    media_size=$(docker exec haos-synapse du -sh /data/media_store | cut -f1)
    media_files=$(docker exec haos-synapse find /data/media_store -type f | wc -l)
    echo "Media store size: $media_size"
    echo "Media files: $media_files"
    
    # Old media files
    old_media=$(docker exec haos-synapse find /data/media_store -type f -mtime +90 | wc -l)
    echo "Media files older than 90 days: $old_media"
fi

# Database maintenance
echo "--- Database Maintenance ---"
echo "Running ANALYZE..."
docker exec haos-postgres psql -U synapse -d synapse -c "ANALYZE;" >/dev/null

# Check for database bloat
echo "Table sizes:"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
LIMIT 5;
"

# Check Matrix configuration
echo "--- Configuration Validation ---"
if docker exec haos-synapse python -m synapse.config.homeserver --generate-config-file /tmp/test-config.yaml >/dev/null 2>&1; then
    echo "✅ Configuration valid"
else
    echo "❌ Configuration validation failed"
fi

echo "=== Matrix Homeserver Maintenance Completed ==="
```

#### Matrix User Management

```bash
#!/bin/bash
# /opt/haos/scripts/matrix-user-management.sh

ADMIN_TOKEN="${MATRIX_ADMIN_TOKEN}"
HOMESERVER="https://your.domain.com"

echo "=== Matrix User Management - $(date) ==="

# Deactivate inactive users (optional)
echo "--- Inactive User Review ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
SELECT 
    name as user_id,
    EXTRACT(days FROM (NOW() - to_timestamp(last_seen/1000))) as days_inactive
FROM user_stats_current 
WHERE last_seen < EXTRACT(epoch FROM (NOW() - INTERVAL '90 days')) * 1000
AND deactivated = false
ORDER BY last_seen ASC;
"

# Clean up device lists
echo "--- Device Cleanup ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
DELETE FROM devices 
WHERE last_seen < EXTRACT(epoch FROM (NOW() - INTERVAL '365 days')) * 1000;
"

# Remove old access tokens
echo "--- Access Token Cleanup ---"
docker exec haos-postgres psql -U synapse -d synapse -c "
DELETE FROM access_tokens 
WHERE last_used < EXTRACT(epoch FROM (NOW() - INTERVAL '90 days')) * 1000;
"

# Guest user cleanup
echo "--- Guest User Cleanup ---"
guest_count=$(docker exec haos-postgres psql -U synapse -d synapse -t -c "
SELECT count(*) FROM users WHERE is_guest = true;
" | xargs)

if [ "$guest_count" -gt 0 ]; then
    echo "Found $guest_count guest users"
    # Optionally deactivate old guest users
    # docker exec haos-postgres psql -U synapse -d synapse -c "
    # UPDATE users SET deactivated = true 
    # WHERE is_guest = true 
    # AND creation_ts < EXTRACT(epoch FROM (NOW() - INTERVAL '30 days')) * 1000;
    # "
fi

echo "=== Matrix User Management Completed ==="
```

---

## Container Management

### Docker Container Maintenance

#### Container Health Monitoring

```bash
#!/bin/bash
# /opt/haos/scripts/container-health.sh

echo "=== Container Health Check - $(date) ==="

# Container status overview
echo "--- Container Status ---"
docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}\t{{.Ports}}"

# Individual container health checks
echo "--- Individual Health Checks ---"
containers=("haos-postgres" "haos-redis" "haos-synapse" "haos-livekit")

for container in "${containers[@]}"; do
    echo "Checking $container..."
    
    if docker ps --filter "name=$container" --filter "status=running" --quiet | grep -q .; then
        # Container is running, check health
        health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")
        
        if [ "$health_status" = "healthy" ]; then
            echo "✅ $container: Healthy"
        elif [ "$health_status" = "no-healthcheck" ]; then
            echo "ℹ️ $container: Running (no health check configured)"
        else
            echo "❌ $container: $health_status"
        fi
        
        # Check resource usage
        stats=$(docker stats "$container" --no-stream --format "CPU: {{.CPUPerc}}, Memory: {{.MemUsage}}")
        echo "   Resources: $stats"
    else
        echo "❌ $container: Not running"
    fi
done

# Check for container restarts
echo "--- Container Restart History ---"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.CreatedAt}}" | grep -E "(Exited|Restarting)"

# Check container logs for errors
echo "--- Recent Container Errors ---"
for container in "${containers[@]}"; do
    error_count=$(docker logs "$container" --since "1h" 2>&1 | grep -i error | wc -l)
    if [ "$error_count" -gt 0 ]; then
        echo "⚠️ $container: $error_count errors in last hour"
        docker logs "$container" --since "1h" --tail 5 2>&1 | grep -i error | tail -3
    fi
done

echo "=== Container Health Check Completed ==="
```

#### Container Update Management

```bash
#!/bin/bash
# /opt/haos/scripts/container-updates.sh

BACKUP_DIR="/opt/haos/backups/container-update-$(date +%Y-%m-%d-%H%M%S)"

echo "=== Container Update Management - $(date) ==="

# Create backup before updates
echo "--- Pre-Update Backup ---"
mkdir -p "$BACKUP_DIR"

# Backup configurations
cp /opt/haos/docker-compose.yml "$BACKUP_DIR/"
cp -r /opt/haos/matrix "$BACKUP_DIR/" 2>/dev/null || true

# Backup database
docker exec haos-postgres pg_dump -U synapse synapse | gzip > "$BACKUP_DIR/database-backup.sql.gz"

echo "Backup created: $BACKUP_DIR"

# Check for image updates
echo "--- Checking for Image Updates ---"
cd /opt/haos

# Pull new images
docker compose pull --quiet

# Check which images were updated
updated_images=$(docker images --filter "dangling=true" -q | wc -l)
echo "Outdated images found: $updated_images"

if [ "$updated_images" -gt 0 ]; then
    echo "--- Updating Containers ---"
    
    # Stop services gracefully
    docker compose down --timeout 30
    
    # Start with new images
    docker compose up -d
    
    # Wait for services to stabilize
    echo "Waiting for services to start..."
    sleep 60
    
    # Verify services
    echo "--- Verifying Services ---"
    services_ok=true
    
    # Check each service
    if ! docker compose ps --services --filter "status=running" | grep -q postgres; then
        echo "❌ PostgreSQL failed to start"
        services_ok=false
    fi
    
    if ! docker compose ps --services --filter "status=running" | grep -q synapse; then
        echo "❌ Synapse failed to start"
        services_ok=false
    fi
    
    if ! curl -sf "https://your.domain.com/_matrix/client/versions" >/dev/null 2>&1; then
        echo "❌ Matrix API not responding"
        services_ok=false
    fi
    
    if [ "$services_ok" = true ]; then
        echo "✅ All services updated successfully"
        
        # Cleanup old images
        docker image prune -f
    else
        echo "❌ Service verification failed - rolling back"
        
        # Rollback procedure
        docker compose down
        
        # Restore from backup if needed
        # (Implementation depends on specific needs)
        
        echo "Rollback completed"
    fi
else
    echo "No image updates available"
fi

echo "=== Container Update Management Completed ==="
```

---

## Monitoring & Alerting

### Comprehensive Monitoring Setup

#### Monitoring Stack Setup

```yaml
# /opt/haos/monitoring/docker-compose.yml

version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: haos-prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "127.0.0.1:9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: haos-grafana
    restart: unless-stopped
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false

  node-exporter:
    image: prom/node-exporter:latest
    container_name: haos-node-exporter
    restart: unless-stopped
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    ports:
      - "127.0.0.1:9100:9100"
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: haos-cadvisor
    restart: unless-stopped
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    ports:
      - "127.0.0.1:8080:8080"
    privileged: true
    devices:
      - /dev/kmsg

volumes:
  prometheus_data:
  grafana_data:

networks:
  default:
    name: haos_monitoring
```

#### Prometheus Configuration

```yaml
# /opt/haos/monitoring/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'haos-app'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['host.docker.internal:3000']

  - job_name: 'matrix-synapse'
    metrics_path: '/_synapse/metrics'
    static_configs:
      - targets: ['host.docker.internal:9092']
```

#### Alert Rules

```yaml
# /opt/haos/monitoring/alerts.yml

groups:
  - name: haos-alerts
    rules:
      # System alerts
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for more than 5 minutes"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 85% for more than 5 minutes"

      - alert: LowDiskSpace
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 20
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Less than 20% disk space remaining on {{ $labels.mountpoint }}"

      # Service alerts
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.job }} service is down"

      - alert: HighErrorRate
        expr: rate(nginx_http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "High rate of 5xx responses in nginx"

      # Database alerts
      - alert: PostgreSQLDown
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "PostgreSQL database is not responding"

      - alert: HighDatabaseConnections
        expr: pg_stat_database_numbackends / pg_settings_max_connections * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "PostgreSQL connection usage is above 80%"

      # Matrix-specific alerts
      - alert: MatrixFederationDown
        expr: synapse_federation_client_sent_transactions_total == 0
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Matrix federation issues"
          description: "No federation transactions in the last 10 minutes"

      - alert: HighMatrixEventBacklog
        expr: synapse_event_persisted_position - synapse_event_processing_positions > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High Matrix event backlog"
          description: "Matrix event processing is falling behind"
```

### Alerting Configuration

#### AlertManager Setup

```yaml
# /opt/haos/monitoring/alertmanager.yml

global:
  smtp_smarthost: 'smtp.your.domain.com:587'
  smtp_from: 'alerts@your.domain.com'
  smtp_auth_username: 'alerts@your.domain.com'
  smtp_auth_password: '${SMTP_PASSWORD}'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    email_configs:
      - to: 'admin@your.domain.com'
        subject: 'HAOS Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Labels: {{ .Labels }}
          {{ end }}

    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts'
        title: 'HAOS Alert: {{ .GroupLabels.alertname }}'
        text: |
          {{ range .Alerts }}
          *Alert:* {{ .Annotations.summary }}
          *Description:* {{ .Annotations.description }}
          *Severity:* {{ .Labels.severity }}
          {{ end }}

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

---

## Disaster Recovery

### Disaster Recovery Plan

#### Recovery Procedures

```bash
#!/bin/bash
# /opt/haos/scripts/disaster-recovery.sh

RECOVERY_TYPE="$1"  # full, database, configuration
BACKUP_LOCATION="$2"

if [ -z "$RECOVERY_TYPE" ] || [ -z "$BACKUP_LOCATION" ]; then
    echo "Usage: $0 <full|database|configuration> <backup_location>"
    exit 1
fi

echo "=== HAOS Disaster Recovery - $(date) ==="
echo "Recovery type: $RECOVERY_TYPE"
echo "Backup location: $BACKUP_LOCATION"

# Verification
read -p "⚠️  This will overwrite current data. Continue? (yes/no): " -r
if [ "$REPLY" != "yes" ]; then
    echo "Recovery cancelled"
    exit 0
fi

case "$RECOVERY_TYPE" in
    "full")
        echo "--- Full System Recovery ---"
        
        # Stop all services
        systemctl stop haos
        docker compose down
        systemctl stop nginx
        
        # Extract backup
        recovery_dir="/tmp/disaster-recovery-$(date +%Y%m%d%H%M%S)"
        mkdir -p "$recovery_dir"
        
        if [[ "$BACKUP_LOCATION" == s3://* ]]; then
            # Download from S3
            aws s3 cp "$BACKUP_LOCATION" "$recovery_dir/backup.tar.gz"
            backup_file="$recovery_dir/backup.tar.gz"
        else
            backup_file="$BACKUP_LOCATION"
        fi
        
        tar -xzf "$backup_file" -C "$recovery_dir"
        backup_contents=$(find "$recovery_dir" -type d -name "*backup*" | head -1)
        
        # Restore configurations
        if [ -d "$backup_contents/haos" ]; then
            rm -rf /opt/haos
            cp -r "$backup_contents/haos" /opt/haos
        fi
        
        # Restore database
        if [ -f "$backup_contents/database-full.sql.gz" ]; then
            docker compose up -d postgres
            sleep 30
            zcat "$backup_contents/database-full.sql.gz" | docker exec -i haos-postgres psql -U synapse
        fi
        
        # Start services
        docker compose up -d
        systemctl start nginx
        systemctl start haos
        ;;
        
    "database")
        echo "--- Database Recovery ---"
        /opt/haos/scripts/database-recovery.sh "$BACKUP_LOCATION" full
        ;;
        
    "configuration")
        echo "--- Configuration Recovery ---"
        
        # Backup current config
        current_backup="/tmp/pre-recovery-config-$(date +%Y%m%d%H%M%S)"
        mkdir -p "$current_backup"
        cp -r /opt/haos "$current_backup/" 2>/dev/null || true
        
        # Extract and restore config
        recovery_dir="/tmp/config-recovery-$(date +%Y%m%d%H%M%S)"
        mkdir -p "$recovery_dir"
        tar -xzf "$BACKUP_LOCATION" -C "$recovery_dir"
        
        backup_contents=$(find "$recovery_dir" -type d -name "*backup*" | head -1)
        
        if [ -d "$backup_contents/haos" ]; then
            cp -r "$backup_contents/haos"/* /opt/haos/
        fi
        
        # Restart services
        docker compose down && docker compose up -d
        systemctl restart haos nginx
        ;;
        
    *)
        echo "Invalid recovery type. Use: full, database, or configuration"
        exit 1
        ;;
esac

# Verification
echo "--- Recovery Verification ---"
sleep 30

if curl -f "https://your.domain.com/health" >/dev/null 2>&1; then
    echo "✅ Web interface responding"
else
    echo "❌ Web interface not responding"
fi

if curl -f "https://your.domain.com/_matrix/client/versions" >/dev/null 2>&1; then
    echo "✅ Matrix API responding"
else
    echo "❌ Matrix API not responding"
fi

echo "=== Disaster Recovery Completed ==="
```

---

## Capacity Planning

### Capacity Analysis

#### Resource Usage Analysis

```bash
#!/bin/bash
# /opt/haos/scripts/capacity-analysis.sh

ANALYSIS_DIR="/opt/haos/analysis"
DATE=$(date +%Y-%m-%d)
REPORT_FILE="$ANALYSIS_DIR/capacity-report-$DATE.md"

mkdir -p "$ANALYSIS_DIR"

echo "=== HAOS Capacity Analysis - $(date) ==="

cat > "$REPORT_FILE" << EOF
# HAOS Capacity Analysis Report
**Generated:** $(date)

## Current Resource Utilization

EOF

# CPU utilization
echo "--- CPU Analysis ---"
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
echo "### CPU Utilization: $cpu_usage%" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Memory analysis
echo "--- Memory Analysis ---"
memory_info=$(free -h | awk 'NR==2{printf "Used: %s/%s (%.2f%%)", $3,$2,$3*100/$2}')
echo "### Memory: $memory_info" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Disk analysis
echo "--- Disk Analysis ---"
echo "### Disk Usage:" >> "$REPORT_FILE"
df -h | awk 'NR>1 {printf "- %s: %s/%s (%s)\n", $6, $3, $2, $5}' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Database growth analysis
echo "--- Database Growth ---"
current_db_size=$(docker exec haos-postgres psql -U synapse -d synapse -t -c "SELECT pg_database_size('synapse');" | xargs)
echo "### Database Size: $(echo $current_db_size | numfmt --to=iec)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# User growth
echo "--- User Growth ---"
total_users=$(docker exec haos-postgres psql -U synapse -d synapse -t -c "SELECT count(*) FROM users WHERE deactivated = false;" | xargs)
active_users=$(docker exec haos-postgres psql -U synapse -d synapse -t -c "SELECT count(*) FROM user_stats_current WHERE last_seen > EXTRACT(epoch FROM (NOW() - INTERVAL '30 days')) * 1000;" | xargs)

echo "### Users:" >> "$REPORT_FILE"
echo "- Total: $total_users" >> "$REPORT_FILE"
echo "- Active (30 days): $active_users" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Room statistics
echo "--- Room Statistics ---"
total_rooms=$(docker exec haos-postgres psql -U synapse -d synapse -t -c "SELECT count(*) FROM rooms;" | xargs)
public_rooms=$(docker exec haos-postgres psql -U synapse -d synapse -t -c "SELECT count(*) FROM rooms WHERE is_public = true;" | xargs)

echo "### Rooms:" >> "$REPORT_FILE"
echo "- Total: $total_rooms" >> "$REPORT_FILE"
echo "- Public: $public_rooms" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Capacity recommendations
echo "--- Capacity Recommendations ---"
echo "## Capacity Recommendations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# CPU recommendations
cpu_num=$(echo "$cpu_usage" | sed 's/%//')
if (( $(echo "$cpu_num > 70" | bc -l) )); then
    echo "⚠️ **CPU:** Consider upgrading CPU or optimizing workload" >> "$REPORT_FILE"
else
    echo "✅ **CPU:** Adequate capacity" >> "$REPORT_FILE"
fi

# Memory recommendations
memory_pct=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$memory_pct" -gt 80 ]; then
    echo "⚠️ **Memory:** Consider adding more RAM" >> "$REPORT_FILE"
else
    echo "✅ **Memory:** Adequate capacity" >> "$REPORT_FILE"
fi

# Disk recommendations
critical_disk=$(df | awk 'NR>1 && $5+0 > 90 {print $6}')
if [ -n "$critical_disk" ]; then
    echo "⚠️ **Disk:** Critical space on $critical_disk - immediate expansion needed" >> "$REPORT_FILE"
else
    warning_disk=$(df | awk 'NR>1 && $5+0 > 80 {print $6}')
    if [ -n "$warning_disk" ]; then
        echo "⚠️ **Disk:** Plan expansion for $warning_disk" >> "$REPORT_FILE"
    else
        echo "✅ **Disk:** Adequate space" >> "$REPORT_FILE"
    fi
fi

# Growth projections
echo "" >> "$REPORT_FILE"
echo "## Growth Projections" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Simple linear projection based on recent growth
echo "Based on current growth patterns:" >> "$REPORT_FILE"
echo "- Database growth: ~$(($current_db_size / 1024 / 1024 / 30)) MB/day estimated" >> "$REPORT_FILE"
echo "- User growth: Review registration patterns" >> "$REPORT_FILE"
echo "- Consider scaling at 80% capacity utilization" >> "$REPORT_FILE"

echo "Capacity analysis completed: $REPORT_FILE"
```

---

## Maintenance Automation

### Automated Maintenance Schedule

#### Comprehensive Maintenance Crontab

```bash
# /etc/cron.d/haos-maintenance
# HAOS Automated Maintenance Schedule

# Daily tasks (run at night)
0 2 * * * haos /opt/haos/scripts/daily-maintenance.sh
0 3 * * * haos /opt/haos/scripts/daily-db-maintenance.sh  
0 4 * * * haos /opt/haos/scripts/log-rotation.sh
0 5 * * * haos /opt/haos/scripts/daily-backup.sh

# Security checks
0 6 * * * haos /opt/haos/scripts/security-check.sh

# Performance monitoring  
*/15 * * * * haos /opt/haos/scripts/performance-monitoring.sh
0 */4 * * * haos /opt/haos/scripts/storage-monitoring.sh

# Weekly tasks (Sunday night)
0 1 * * 0 haos /opt/haos/scripts/weekly-maintenance.sh
0 2 * * 0 haos /opt/haos/scripts/weekly-db-maintenance.sh
0 3 * * 0 haos /opt/haos/scripts/weekly-backup.sh

# Monthly tasks (1st of month)
0 1 1 * * haos /opt/haos/scripts/monthly-maintenance.sh
0 2 1 * * haos /opt/haos/scripts/monthly-db-optimization.sh
0 3 1 * * haos /opt/haos/scripts/capacity-analysis.sh

# Security updates (check daily, apply on approval)
0 7 * * * haos /opt/haos/scripts/security-updates.sh

# Certificate renewal (daily check)
0 23 * * * haos /usr/bin/certbot renew --quiet

# Storage cleanup (weekly)
0 4 * * 6 haos /opt/haos/scripts/storage-cleanup.sh

# Log analysis (daily)
0 8 * * * haos /opt/haos/scripts/log-analysis.sh
```

#### Maintenance Orchestration

```bash
#!/bin/bash
# /opt/haos/scripts/maintenance-orchestrator.sh

MAINTENANCE_LOCK="/tmp/haos-maintenance.lock"
MAINTENANCE_LOG="/opt/haos/logs/maintenance-orchestrator.log"

# Check if maintenance is already running
if [ -f "$MAINTENANCE_LOCK" ]; then
    echo "Maintenance already in progress. Exiting." | tee -a "$MAINTENANCE_LOG"
    exit 1
fi

# Create lock file
echo $$ > "$MAINTENANCE_LOCK"
trap 'rm -f "$MAINTENANCE_LOCK"' EXIT

echo "=== HAOS Maintenance Orchestrator - $(date) ===" | tee -a "$MAINTENANCE_LOG"

# Define maintenance tasks with dependencies
declare -A maintenance_tasks
maintenance_tasks[health_check]="basic"
maintenance_tasks[security_check]="basic"
maintenance_tasks[performance_monitoring]="basic"
maintenance_tasks[log_analysis]="basic"
maintenance_tasks[backup_verification]="important" 
maintenance_tasks[database_maintenance]="important"
maintenance_tasks[storage_cleanup]="important"
maintenance_tasks[security_updates]="critical"
maintenance_tasks[system_updates]="critical"

# Priority order
priorities=("critical" "important" "basic")

for priority in "${priorities[@]}"; do
    echo "--- Running $priority priority tasks ---" | tee -a "$MAINTENANCE_LOG"
    
    for task in "${!maintenance_tasks[@]}"; do
        if [ "${maintenance_tasks[$task]}" = "$priority" ]; then
            echo "Executing: $task" | tee -a "$MAINTENANCE_LOG"
            
            case "$task" in
                "health_check")
                    /opt/haos/scripts/daily-maintenance.sh >> "$MAINTENANCE_LOG" 2>&1
                    ;;
                "security_check")
                    /opt/haos/scripts/security-check.sh >> "$MAINTENANCE_LOG" 2>&1
                    ;;
                "performance_monitoring")
                    /opt/haos/scripts/performance-monitoring.sh >> "$MAINTENANCE_LOG" 2>&1
                    ;;
                "log_analysis")
                    /opt/haos/scripts/log-analysis.sh >> "$MAINTENANCE_LOG" 2>&1
                    ;;
                "backup_verification")
                    /opt/haos/scripts/backup-verification.sh >> "$MAINTENANCE_LOG" 2>&1
                    ;;
                "database_maintenance")
                    /opt/haos/scripts/daily-db-maintenance.sh >> "$MAINTENANCE_LOG" 2>&1
                    ;;
                "storage_cleanup")
                    /opt/haos/scripts/storage-cleanup.sh >> "$MAINTENANCE_LOG" 2>&1
                    ;;
                "security_updates")
                    /opt/haos/scripts/security-updates.sh >> "$MAINTENANCE_LOG" 2>&1
                    ;;
                "system_updates")
                    /opt/haos/scripts/planned-updates.sh >> "$MAINTENANCE_LOG" 2>&1
                    ;;
            esac
            
            exit_code=$?
            if [ $exit_code -eq 0 ]; then
                echo "✅ $task completed successfully" | tee -a "$MAINTENANCE_LOG"
            else
                echo "❌ $task failed with exit code $exit_code" | tee -a "$MAINTENANCE_LOG"
                
                # Critical task failure - alert and potentially stop
                if [ "$priority" = "critical" ]; then
                    echo "🚨 CRITICAL TASK FAILURE: $task" | tee -a "$MAINTENANCE_LOG"
                    mail -s "HAOS Critical Maintenance Failure" admin@your.domain.com < "$MAINTENANCE_LOG"
                    
                    # Decide whether to continue or stop
                    # For now, continue with other tasks
                fi
            fi
        fi
    done
done

echo "=== Maintenance Orchestrator Completed ===" | tee -a "$MAINTENANCE_LOG"

# Send maintenance summary if there were any issues
if grep -q "❌\|🚨" "$MAINTENANCE_LOG"; then
    mail -s "HAOS Maintenance Summary - Issues Found" admin@your.domain.com < "$MAINTENANCE_LOG"
fi
```

---

This comprehensive maintenance guide provides the foundation for keeping HAOS deployments running smoothly in production environments. Regular execution of these maintenance procedures will ensure optimal performance, security, and reliability.

For specific issues or troubleshooting, refer to the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide.