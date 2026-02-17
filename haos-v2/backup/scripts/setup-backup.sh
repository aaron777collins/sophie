#!/usr/bin/env bash

# HAOS-V2 Backup System Setup Script
# Initializes the backup system with all required components

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")"

# Load common functions
source "$SCRIPT_DIR/backup-common.sh"

# Logging setup
setup_logging "backup-setup"

log_info "HAOS-V2 Backup System Setup"
log_info "============================"

# Check if running as root (needed for some operations)
if [[ $EUID -ne 0 ]]; then
    log_warn "Not running as root. Some operations may require sudo."
fi

# Install required packages
install_required_packages() {
    log_info "Installing required packages..."
    
    local packages=()
    
    # Check and install missing packages
    local required_packages=(
        "postgresql-client"   # For pg_dump, pg_restore
        "rsync"              # For file synchronization
        "zstd"               # For compression
        "jq"                 # For JSON processing
        "curl"               # For notifications
        "awscli"             # For S3 uploads (optional)
        "cron"               # For scheduling
        "logrotate"          # For log management
    )
    
    for package in "${required_packages[@]}"; do
        if ! dpkg -l | grep -q "^ii  $package "; then
            packages+=("$package")
        fi
    done
    
    if [[ ${#packages[@]} -gt 0 ]]; then
        log_info "Installing packages: ${packages[*]}"
        apt-get update
        apt-get install -y "${packages[@]}"
    else
        log_info "All required packages are already installed"
    fi
}

# Create directory structure
create_directory_structure() {
    log_info "Creating backup directory structure..."
    
    local directories=(
        "$BACKUP_DIR/storage/local/database/full"
        "$BACKUP_DIR/storage/local/database/incremental" 
        "$BACKUP_DIR/storage/local/files/full"
        "$BACKUP_DIR/storage/local/files/incremental"
        "$BACKUP_DIR/storage/local/system"
        "$BACKUP_DIR/storage/local/wal"
        "$BACKUP_DIR/storage/local/pre-restore"
        "$BACKUP_DIR/storage/s3"
        "$BACKUP_DIR/storage/remote"
        "$BACKUP_DIR/logs"
        "$BACKUP_DIR/monitoring/alerts"
        "$BACKUP_DIR/recovery/test-restores"
        "$BACKUP_DIR/keys"
        "/var/log/haos-backup"
        "/tmp/haos-backup"
    )
    
    for dir in "${directories[@]}"; do
        ensure_directory "$dir" "0700"
        log_info "Created: $dir"
    done
    
    # Set appropriate ownership for log directory
    chown -R www-data:www-data "/var/log/haos-backup" 2>/dev/null || true
    
    log_info "Directory structure created successfully"
}

# Generate encryption keys
generate_encryption_keys() {
    log_info "Generating encryption keys..."
    
    local key_file="$BACKUP_DIR/keys/backup-encryption.key"
    
    if [[ ! -f "$key_file" ]]; then
        # Generate random encryption key
        openssl rand -base64 32 > "$key_file"
        chmod 600 "$key_file"
        chown root:root "$key_file" 2>/dev/null || true
        
        log_info "Encryption key generated: $key_file"
        log_warn "IMPORTANT: Store this key securely! It's needed for backup decryption."
    else
        log_info "Encryption key already exists: $key_file"
    fi
    
    # Generate SSH key for remote backups
    local ssh_key="$BACKUP_DIR/keys/backup-ssh-key"
    if [[ ! -f "$ssh_key" ]]; then
        ssh-keygen -t ed25519 -f "$ssh_key" -N "" -C "haos-v2-backup@$(hostname)"
        chmod 600 "$ssh_key"
        chmod 644 "$ssh_key.pub"
        
        log_info "SSH key generated: $ssh_key"
        log_info "Public key: $(cat "$ssh_key.pub")"
    else
        log_info "SSH key already exists: $ssh_key"
    fi
}

# Setup PostgreSQL WAL archiving
setup_wal_archiving() {
    log_info "Setting up WAL archiving..."
    
    # Create WAL archive script if not exists
    "$SCRIPT_DIR/backup-database.sh" "wal-setup"
    
    # PostgreSQL configuration suggestions
    log_info ""
    log_info "To enable WAL archiving, add these settings to postgresql.conf:"
    log_info "  wal_level = replica"
    log_info "  archive_mode = on"
    log_info "  archive_command = '$SCRIPT_DIR/archive-wal.sh %p %f'"
    log_info "  archive_timeout = 60"
    log_info ""
    log_info "Then restart PostgreSQL: sudo systemctl restart postgresql"
    log_info ""
}

# Create systemd services for backup automation
create_systemd_services() {
    log_info "Creating systemd services..."
    
    # Database backup service
    cat > /etc/systemd/system/haos-backup-database.service <<EOF
[Unit]
Description=HAOS-V2 Database Backup Service
Wants=haos-backup-database.timer

[Service]
Type=oneshot
User=postgres
Group=postgres
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=$SCRIPT_DIR/backup-database.sh full
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    # Database backup timer (daily at 2 AM)
    cat > /etc/systemd/system/haos-backup-database.timer <<EOF
[Unit]
Description=Daily HAOS-V2 Database Backup
Requires=haos-backup-database.service

[Timer]
OnCalendar=daily
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
EOF

    # File backup service
    cat > /etc/systemd/system/haos-backup-files.service <<EOF
[Unit]
Description=HAOS-V2 File Backup Service
Wants=haos-backup-files.timer

[Service]
Type=oneshot
User=root
Group=root
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=$SCRIPT_DIR/backup-files.sh incremental
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    # File backup timer (every 6 hours)
    cat > /etc/systemd/system/haos-backup-files.timer <<EOF
[Unit]
Description=HAOS-V2 File Backup Timer
Requires=haos-backup-files.service

[Timer]
OnCalendar=*-*-* 00,06,12,18:00:00
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
EOF

    # Full system backup service
    cat > /etc/systemd/system/haos-backup-full.service <<EOF
[Unit]
Description=HAOS-V2 Full System Backup Service
Wants=haos-backup-full.timer

[Service]
Type=oneshot
User=root
Group=root
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=$SCRIPT_DIR/backup-full.sh full
TimeoutSec=7200
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    # Full system backup timer (weekly on Sunday at 1 AM)
    cat > /etc/systemd/system/haos-backup-full.timer <<EOF
[Unit]
Description=Weekly HAOS-V2 Full System Backup
Requires=haos-backup-full.service

[Timer]
OnCalendar=Sun *-*-* 01:00:00
Persistent=true
RandomizedDelaySec=600

[Install]
WantedBy=timers.target
EOF

    # Reload systemd and enable timers
    systemctl daemon-reload
    systemctl enable haos-backup-database.timer
    systemctl enable haos-backup-files.timer
    systemctl enable haos-backup-full.timer
    
    log_info "Systemd services created and enabled"
}

# Setup log rotation
setup_log_rotation() {
    log_info "Setting up log rotation..."
    
    cat > /etc/logrotate.d/haos-backup <<EOF
/var/log/haos-backup/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
    postrotate
        # Send SIGHUP to any running backup processes if needed
        /bin/true
    endscript
}
EOF

    log_info "Log rotation configured"
}

# Create monitoring scripts
create_monitoring_scripts() {
    log_info "Creating monitoring scripts..."
    
    # Backup health check script
    cat > "$BACKUP_DIR/monitoring/backup-health-check.sh" <<'EOF'
#!/usr/bin/env bash

# HAOS-V2 Backup Health Check
# Monitors backup system health and sends alerts

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")"

source "$BACKUP_DIR/scripts/backup-common.sh"
setup_logging "backup-health-check"

check_recent_backups() {
    log_info "Checking for recent backups..."
    
    local alerts=()
    local now=$(date +%s)
    local day_ago=$((now - 86400))
    local week_ago=$((now - 604800))
    
    # Check database backups (should have one in last 24 hours)
    local latest_db=$(find "$BACKUP_DIR/storage/local/database/full" -name "metadata_complete.json" -newer <(date -d "@$day_ago") | wc -l)
    if [[ $latest_db -eq 0 ]]; then
        alerts+=("No database backup in last 24 hours")
    fi
    
    # Check file backups (should have one in last 6 hours for incremental)
    local six_hours_ago=$((now - 21600))
    local latest_files=$(find "$BACKUP_DIR/storage/local/files" -name "metadata_complete.json" -newer <(date -d "@$six_hours_ago") | wc -l)
    if [[ $latest_files -eq 0 ]]; then
        alerts+=("No file backup in last 6 hours")
    fi
    
    # Check full system backups (should have one in last 7 days)
    local latest_system=$(find "$BACKUP_DIR/storage/local/system" -name "backup-report.json" -newer <(date -d "@$week_ago") | wc -l)
    if [[ $latest_system -eq 0 ]]; then
        alerts+=("No full system backup in last 7 days")
    fi
    
    if [[ ${#alerts[@]} -gt 0 ]]; then
        local alert_message=$(printf "%s\n" "${alerts[@]}")
        send_notification "warning" "Backup Health Check Failed" "$alert_message"
        log_warn "Health check alerts:"
        printf "  - %s\n" "${alerts[@]}"
        return 1
    else
        log_info "All backup health checks passed"
        return 0
    fi
}

check_storage_space() {
    log_info "Checking storage space..."
    
    local backup_usage=$(du -sb "$BACKUP_DIR/storage" | cut -f1)
    local available_space=$(df "$BACKUP_DIR/storage" | awk 'NR==2 {print $4 * 1024}')
    local usage_percent=$(( backup_usage * 100 / (backup_usage + available_space) ))
    
    if [[ $usage_percent -gt 90 ]]; then
        send_notification "error" "Backup Storage Critical" "Backup storage is ${usage_percent}% full"
        log_error "Backup storage critically low: ${usage_percent}%"
        return 1
    elif [[ $usage_percent -gt 80 ]]; then
        send_notification "warning" "Backup Storage Warning" "Backup storage is ${usage_percent}% full"
        log_warn "Backup storage getting full: ${usage_percent}%"
    else
        log_info "Storage space OK: ${usage_percent}% used"
    fi
    
    return 0
}

check_backup_integrity() {
    log_info "Checking backup integrity..."
    
    # Check last 3 backups for integrity
    local backup_dirs=$(find "$BACKUP_DIR/storage/local/database/full" "$BACKUP_DIR/storage/local/files/full" -name "metadata_complete.json" -printf "%h\n" | sort -r | head -3)
    
    local integrity_failures=0
    for backup_dir in $backup_dirs; do
        if [[ -f "$backup_dir/checksums.sha256" ]]; then
            (
                cd "$backup_dir"
                if ! sha256sum -c checksums.sha256 >/dev/null 2>&1; then
                    log_error "Integrity check failed: $(basename "$backup_dir")"
                    ((integrity_failures++))
                fi
            )
        fi
    done
    
    if [[ $integrity_failures -gt 0 ]]; then
        send_notification "error" "Backup Integrity Failure" "$integrity_failures backups failed integrity check"
        return 1
    fi
    
    return 0
}

main() {
    log_info "HAOS-V2 Backup Health Check Starting"
    
    local health_status=0
    
    check_recent_backups || ((health_status++))
    check_storage_space || ((health_status++))
    check_backup_integrity || ((health_status++))
    
    if [[ $health_status -eq 0 ]]; then
        log_info "All health checks passed"
        # Send daily success notification (only once per day)
        local last_success_file="/tmp/backup_health_last_success"
        local today=$(date +%Y%m%d)
        
        if [[ ! -f "$last_success_file" ]] || [[ "$(cat "$last_success_file")" != "$today" ]]; then
            send_notification "success" "Backup System Healthy" "All backup health checks passed"
            echo "$today" > "$last_success_file"
        fi
    else
        log_error "Health check failed with $health_status issues"
        exit 1
    fi
}

main "$@"
EOF

    chmod +x "$BACKUP_DIR/monitoring/backup-health-check.sh"
    
    # Create health check timer
    cat > /etc/systemd/system/haos-backup-health-check.service <<EOF
[Unit]
Description=HAOS-V2 Backup Health Check
Wants=haos-backup-health-check.timer

[Service]
Type=oneshot
User=root
Group=root
ExecStart=$BACKUP_DIR/monitoring/backup-health-check.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    cat > /etc/systemd/system/haos-backup-health-check.timer <<EOF
[Unit]
Description=HAOS-V2 Backup Health Check Timer
Requires=haos-backup-health-check.service

[Timer]
OnCalendar=*-*-* 08:00:00
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
EOF

    systemctl daemon-reload
    systemctl enable haos-backup-health-check.timer
    
    log_info "Monitoring scripts created"
}

# Create backup index
initialize_backup_index() {
    log_info "Initializing backup index..."
    
    local index_file="$BACKUP_DIR/storage/backup-index.json"
    
    if [[ ! -f "$index_file" ]]; then
        echo "[]" > "$index_file"
        log_info "Backup index created: $index_file"
    else
        log_info "Backup index already exists: $index_file"
    fi
}

# Setup environment variables template
create_environment_template() {
    log_info "Creating environment template..."
    
    local env_template="$BACKUP_DIR/.env.backup.example"
    
    cat > "$env_template" <<'EOF'
# HAOS-V2 Backup System Environment Variables
# Copy this to .env.backup and configure your values

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=haos_v2

# Application Paths
APP_ROOT=/app
UPLOADS_DIR=/app/uploads
AVATARS_DIR=/app/public/avatars
ICONS_DIR=/app/public/icons
LOGS_DIR=/var/log/haos-v2

# Backup Encryption
BACKUP_ENCRYPTION_KEY=your_backup_encryption_key

# AWS S3 Configuration (optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
BACKUP_S3_BUCKET=your-backup-bucket

# Notification Configuration
SLACK_BACKUP_WEBHOOK=your_slack_webhook_url

# Email Notification (optional)
SMTP_HOST=your_smtp_host
BACKUP_FROM_EMAIL=backup-system@yourhost.com
BACKUP_TO_EMAILS=admin@yourhost.com,ops@yourhost.com

# Remote SSH Backup (optional)
BACKUP_REMOTE_HOST=backup.yourhost.com
BACKUP_REMOTE_USER=backup
EOF

    log_info "Environment template created: $env_template"
    log_info "Copy and configure: cp $env_template $BACKUP_DIR/.env.backup"
}

# Make scripts executable
make_scripts_executable() {
    log_info "Making scripts executable..."
    
    local scripts=(
        "$SCRIPT_DIR/backup-database.sh"
        "$SCRIPT_DIR/backup-files.sh"
        "$SCRIPT_DIR/backup-full.sh"
        "$SCRIPT_DIR/restore.sh"
        "$SCRIPT_DIR/archive-wal.sh"
        "$BACKUP_DIR/monitoring/backup-health-check.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            chmod +x "$script"
            log_info "Made executable: $script"
        fi
    done
}

# Run initial tests
run_initial_tests() {
    log_info "Running initial tests..."
    
    # Test database connection
    if command -v psql >/dev/null; then
        log_info "Testing database connection..."
        
        # Use default connection parameters
        local DB_HOST="${DB_HOST:-localhost}"
        local DB_PORT="${DB_PORT:-5432}"
        local DB_USER="${DB_USER:-postgres}"
        local DB_NAME="${DB_NAME:-haos_v2}"
        local PGPASSWORD="${DB_PASSWORD:-}"
        
        if PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1; then
            log_info "Database connection test: PASSED"
        else
            log_warn "Database connection test: FAILED (configure credentials in .env.backup)"
        fi
    else
        log_warn "PostgreSQL client not installed, skipping database test"
    fi
    
    # Test backup directory permissions
    local test_file="$BACKUP_DIR/storage/test-write-$$"
    if echo "test" > "$test_file" 2>/dev/null; then
        rm -f "$test_file"
        log_info "Directory permissions test: PASSED"
    else
        log_error "Directory permissions test: FAILED"
        return 1
    fi
    
    # Test compression tools
    if command -v zstd >/dev/null; then
        log_info "Compression tools test: PASSED (zstd available)"
    else
        log_warn "Compression tools test: WARNING (zstd not available, using gzip)"
    fi
    
    log_info "Initial tests completed"
}

# Display setup summary
show_setup_summary() {
    log_info ""
    log_info "HAOS-V2 Backup System Setup Complete!"
    log_info "====================================="
    log_info ""
    log_info "✓ Required packages installed"
    log_info "✓ Directory structure created"
    log_info "✓ Encryption keys generated"
    log_info "✓ Systemd services created and enabled"
    log_info "✓ Log rotation configured"
    log_info "✓ Monitoring scripts deployed"
    log_info "✓ Scripts made executable"
    log_info ""
    log_info "Next Steps:"
    log_info "----------"
    log_info "1. Configure environment variables:"
    log_info "   cp $BACKUP_DIR/.env.backup.example $BACKUP_DIR/.env.backup"
    log_info "   # Edit .env.backup with your settings"
    log_info ""
    log_info "2. Configure PostgreSQL WAL archiving (see above instructions)"
    log_info ""
    log_info "3. Start backup timers:"
    log_info "   systemctl start haos-backup-database.timer"
    log_info "   systemctl start haos-backup-files.timer"
    log_info "   systemctl start haos-backup-full.timer"
    log_info "   systemctl start haos-backup-health-check.timer"
    log_info ""
    log_info "4. Run initial backups:"
    log_info "   $SCRIPT_DIR/backup-database.sh full"
    log_info "   $SCRIPT_DIR/backup-files.sh full"
    log_info "   $SCRIPT_DIR/backup-full.sh full"
    log_info ""
    log_info "5. Test restore (optional):"
    log_info "   $SCRIPT_DIR/restore.sh --help"
    log_info ""
    log_info "Key Files:"
    log_info "----------"
    log_info "Backup scripts: $SCRIPT_DIR/"
    log_info "Configuration: $BACKUP_DIR/configs/"
    log_info "Storage: $BACKUP_DIR/storage/"
    log_info "Logs: /var/log/haos-backup/"
    log_info "Keys: $BACKUP_DIR/keys/ (SECURE THESE!)"
    log_info ""
    log_warn "⚠️  IMPORTANT: Secure your encryption keys and test your restore procedures!"
    log_info ""
}

# Main setup function
main() {
    log_info "Starting HAOS-V2 backup system setup..."
    
    # Check required tools
    check_required_tools "apt-get" "systemctl" "openssl" "ssh-keygen"
    
    # Install required packages
    install_required_packages
    
    # Create directory structure
    create_directory_structure
    
    # Generate encryption keys
    generate_encryption_keys
    
    # Setup WAL archiving
    setup_wal_archiving
    
    # Create systemd services
    create_systemd_services
    
    # Setup log rotation
    setup_log_rotation
    
    # Create monitoring scripts
    create_monitoring_scripts
    
    # Initialize backup index
    initialize_backup_index
    
    # Create environment template
    create_environment_template
    
    # Make scripts executable
    make_scripts_executable
    
    # Run initial tests
    run_initial_tests
    
    # Show setup summary
    show_setup_summary
    
    log_info "HAOS-V2 backup system setup completed successfully!"
    
    # Send notification
    send_notification "success" "Backup System Setup Complete" "HAOS-V2 backup system has been successfully configured on $(hostname)"
}

# Error handler
handle_error() {
    local exit_code=$?
    log_error "Backup system setup failed with exit code: $exit_code"
    exit $exit_code
}

trap 'handle_error' ERR

# Execute main function
main "$@"