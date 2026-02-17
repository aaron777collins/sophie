#!/usr/bin/env bash

# HAOS-V2 Complete System Backup Script
# Orchestrates full system backup including database, files, and configuration

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$BACKUP_DIR/configs/backup-config.yaml"

# Load configuration and common functions
source "$SCRIPT_DIR/backup-common.sh"
load_config "$CONFIG_FILE"

# Logging setup
setup_logging "full-system-backup"

# Default values
BACKUP_TYPE="${1:-full}"
BACKUP_ID="${2:-$(date +%Y%m%d-%H%M%S)}"
COMPRESS_BACKUP="${3:-true}"
UPLOAD_TO_S3="${4:-true}"

log_info "Starting complete system backup with ID: $BACKUP_ID"

# Backup destinations
BACKUP_BASE_DIR="$BACKUP_DIR/storage/local/system"
BACKUP_DEST="$BACKUP_BASE_DIR/$BACKUP_ID"

# Ensure backup directory exists
ensure_directory "$BACKUP_DEST" "0700"

# System information collection
collect_system_info() {
    log_info "Collecting system information..."
    
    local sysinfo_file="$BACKUP_DEST/system-info.json"
    
    cat > "$sysinfo_file" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "created_at": "$(date -Iseconds)",
    "system": {
        "hostname": "$(hostname)",
        "kernel": "$(uname -r)",
        "os": "$(lsb_release -d -s 2>/dev/null || echo "Unknown")",
        "architecture": "$(uname -m)",
        "uptime": "$(uptime -s 2>/dev/null || uptime)"
    },
    "hardware": {
        "cpu_cores": "$(nproc)",
        "memory_total": "$(free -h | awk '/^Mem:/ {print $2}')",
        "disk_usage": $(df -h / | awk 'NR==2 {printf "{\"size\":\"%s\",\"used\":\"%s\",\"available\":\"%s\",\"usage\":\"%s\"}", $2,$3,$4,$5}')
    },
    "services": {
        "postgresql": "$(systemctl is-active postgresql 2>/dev/null || echo "unknown")",
        "nginx": "$(systemctl is-active nginx 2>/dev/null || echo "unknown")",
        "haos-v2": "$(systemctl is-active haos-v2 2>/dev/null || echo "unknown")"
    },
    "network": {
        "ip_address": "$(hostname -I | awk '{print $1}')",
        "dns_servers": [$(cat /etc/resolv.conf | grep nameserver | awk '{printf "\"%s\",", $2}' | sed 's/,$//')]
    },
    "versions": {
        "postgresql": "$(psql --version 2>/dev/null | head -1 || echo "Not installed")",
        "node": "$(node --version 2>/dev/null || echo "Not installed")",
        "npm": "$(npm --version 2>/dev/null || echo "Not installed")",
        "docker": "$(docker --version 2>/dev/null || echo "Not installed")"
    }
}
EOF
    
    log_info "System information collected"
}

# Application configuration backup
backup_application_config() {
    log_info "Backing up application configuration..."
    
    local config_dest="$BACKUP_DEST/config"
    ensure_directory "$config_dest" "0700"
    
    # Environment files
    if [[ -f "$APP_ROOT/.env.production" ]]; then
        # Encrypt sensitive env file
        encrypt_file "$APP_ROOT/.env.production" "$config_dest/.env.production.enc"
    fi
    
    # Next.js configuration
    if [[ -f "$APP_ROOT/next.config.js" ]]; then
        safe_copy "$APP_ROOT/next.config.js" "$config_dest/next.config.js"
    fi
    
    # Package files
    if [[ -f "$APP_ROOT/package.json" ]]; then
        safe_copy "$APP_ROOT/package.json" "$config_dest/package.json"
    fi
    
    if [[ -f "$APP_ROOT/package-lock.json" ]]; then
        safe_copy "$APP_ROOT/package-lock.json" "$config_dest/package-lock.json"
    fi
    
    # Nginx configuration
    local nginx_config="/etc/nginx/sites-available/haos-v2"
    if [[ -f "$nginx_config" ]]; then
        safe_copy "$nginx_config" "$config_dest/nginx-haos-v2.conf"
    fi
    
    # SSL certificates (if any)
    local ssl_dir="/etc/letsencrypt/live/$(hostname -f 2>/dev/null || hostname)"
    if [[ -d "$ssl_dir" ]]; then
        mkdir -p "$config_dest/ssl"
        safe_copy "$ssl_dir/fullchain.pem" "$config_dest/ssl/fullchain.pem" 2>/dev/null || true
        safe_copy "$ssl_dir/privkey.pem" "$config_dest/ssl/privkey.pem" 2>/dev/null || true
    fi
    
    # Create configuration manifest
    cat > "$config_dest/config-manifest.json" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "created_at": "$(date -Iseconds)",
    "files": [
        $(find "$config_dest" -type f -printf '{"name":"%f","path":"%p","size":%s,"mtime":%T@},\n' | sed '$s/,$//')
    ]
}
EOF
    
    log_info "Application configuration backed up"
}

# Database backup with verification
perform_database_backup() {
    log_info "Performing database backup..."
    
    local db_backup_script="$SCRIPT_DIR/backup-database.sh"
    local db_backup_id="db-${BACKUP_ID}"
    
    if [[ ! -x "$db_backup_script" ]]; then
        log_error "Database backup script not found or not executable: $db_backup_script"
        return 1
    fi
    
    # Run database backup
    if "$db_backup_script" "$BACKUP_TYPE" "$db_backup_id"; then
        # Link/copy database backup into system backup
        local db_backup_path="$BACKUP_DIR/storage/local/database/$BACKUP_TYPE/$db_backup_id"
        if [[ -d "$db_backup_path" ]]; then
            ensure_directory "$BACKUP_DEST/database" "0700"
            
            # Create symlink to avoid duplicating large files
            ln -sf "$(realpath "$db_backup_path")" "$BACKUP_DEST/database/backup"
            
            # Copy metadata for standalone system backup
            if [[ -f "$db_backup_path/metadata_complete.json" ]]; then
                cp "$db_backup_path/metadata_complete.json" "$BACKUP_DEST/database/metadata.json"
            fi
            
            log_info "Database backup integrated into system backup"
        else
            log_error "Database backup directory not found: $db_backup_path"
            return 1
        fi
    else
        log_error "Database backup failed"
        return 1
    fi
}

# File system backup with verification  
perform_file_backup() {
    log_info "Performing file system backup..."
    
    local file_backup_script="$SCRIPT_DIR/backup-files.sh"
    local file_backup_id="files-${BACKUP_ID}"
    
    if [[ ! -x "$file_backup_script" ]]; then
        log_error "File backup script not found or not executable: $file_backup_script"
        return 1
    fi
    
    # Run file backup
    if "$file_backup_script" "$BACKUP_TYPE" "$file_backup_id"; then
        # Link/copy file backup into system backup
        local file_backup_path="$BACKUP_DIR/storage/local/files/$BACKUP_TYPE/$file_backup_id"
        if [[ -d "$file_backup_path" ]]; then
            ensure_directory "$BACKUP_DEST/files" "0700"
            
            # Create symlink to avoid duplicating large files
            ln -sf "$(realpath "$file_backup_path")" "$BACKUP_DEST/files/backup"
            
            # Copy metadata for standalone system backup
            if [[ -f "$file_backup_path/metadata_complete.json" ]]; then
                cp "$file_backup_path/metadata_complete.json" "$BACKUP_DEST/files/metadata.json"
            fi
            
            log_info "File backup integrated into system backup"
        else
            log_warn "File backup directory not found (may be empty): $file_backup_path"
        fi
    else
        log_error "File backup failed"
        return 1
    fi
}

# Create comprehensive backup archive
create_backup_archive() {
    log_info "Creating backup archive..."
    
    local archive_name="haos-v2-backup-${BACKUP_ID}.tar.zst"
    local archive_path="$BACKUP_BASE_DIR/$archive_name"
    local temp_dir="/tmp/haos-backup-$BACKUP_ID"
    
    # Create temporary directory for archive preparation
    ensure_directory "$temp_dir" "0700"
    
    # Copy/link backup components to temp directory
    local backup_staging="$temp_dir/haos-v2-backup-$BACKUP_ID"
    ensure_directory "$backup_staging" "0700"
    
    # Copy system backup
    cp -r "$BACKUP_DEST"/* "$backup_staging/"
    
    # Create archive using zstd compression (fast and efficient)
    log_info "Compressing backup archive..."
    local start_time=$(date +%s)
    
    (
        cd "$temp_dir"
        tar -I 'zstd -3 -T0' -cf "$archive_path" "haos-v2-backup-$BACKUP_ID"
    )
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local archive_size=$(stat -c%s "$archive_path")
    
    # Generate archive checksum
    local archive_checksum=$(sha256sum "$archive_path" | cut -d' ' -f1)
    
    # Create archive manifest
    cat > "${archive_path}.manifest" <<EOF
{
    "archive_name": "$archive_name",
    "backup_id": "$BACKUP_ID",
    "created_at": "$(date -Iseconds)",
    "compression": "zstd",
    "size": $archive_size,
    "checksum": "$archive_checksum",
    "compression_time": $duration,
    "contents": "Complete HAOS-V2 system backup including database, files, and configuration"
}
EOF
    
    # Cleanup temp directory
    rm -rf "$temp_dir"
    
    log_info "Archive created: $archive_name ($(format_size $archive_size), $(format_duration $duration))"
    log_info "Archive checksum: $archive_checksum"
    
    echo "$archive_path"
}

# Upload backup to remote storage
upload_backup() {
    local archive_path="$1"
    
    if [[ "$UPLOAD_TO_S3" != "true" ]]; then
        log_info "S3 upload disabled, skipping remote storage"
        return 0
    fi
    
    log_info "Uploading backup to remote storage..."
    
    local s3_bucket="${BACKUP_S3_BUCKET:-}"
    local s3_prefix="haos-v2-backups/$(date +%Y/%m/%d)"
    
    if [[ -z "$s3_bucket" ]]; then
        log_warn "S3 bucket not configured, skipping upload"
        return 0
    fi
    
    # Upload main archive
    local s3_path="s3://$s3_bucket/$s3_prefix/$(basename "$archive_path")"
    if upload_to_s3 "$archive_path" "$s3_path" "STANDARD_IA"; then
        log_info "Backup uploaded to: $s3_path"
        
        # Upload manifest
        local manifest_path="${archive_path}.manifest"
        local manifest_s3_path="s3://$s3_bucket/$s3_prefix/$(basename "$manifest_path")"
        upload_to_s3 "$manifest_path" "$manifest_s3_path" "STANDARD"
        
        # Create backup index entry
        update_backup_index "$BACKUP_ID" "$s3_path" "$(stat -c%s "$archive_path")"
        
        return 0
    else
        log_error "Failed to upload backup to S3"
        return 1
    fi
}

# Update backup index for easy discovery
update_backup_index() {
    local backup_id="$1"
    local s3_path="$2"
    local size="$3"
    
    local index_file="$BACKUP_DIR/storage/backup-index.json"
    local temp_index="/tmp/backup-index-$$.json"
    
    # Create new index entry
    local new_entry=$(cat <<EOF
{
    "backup_id": "$backup_id",
    "type": "system",
    "created_at": "$(date -Iseconds)",
    "size": $size,
    "local_path": "$(realpath "$BACKUP_DEST")",
    "remote_path": "$s3_path",
    "hostname": "$(hostname)",
    "status": "completed"
}
EOF
    )
    
    # Update index file
    if [[ -f "$index_file" ]]; then
        # Add to existing index
        jq ". + [$new_entry]" "$index_file" > "$temp_index"
    else
        # Create new index
        echo "[$new_entry]" > "$temp_index"
    fi
    
    # Sort by date and keep last 1000 entries
    jq 'sort_by(.created_at) | .[-1000:]' "$temp_index" > "$index_file"
    rm -f "$temp_index"
    
    log_info "Backup index updated"
}

# Comprehensive backup validation
validate_complete_backup() {
    local backup_path="$1"
    
    log_info "Performing comprehensive backup validation..."
    
    local validation_errors=0
    
    # Check system info exists
    if [[ ! -f "$backup_path/system-info.json" ]]; then
        log_error "Missing system information file"
        ((validation_errors++))
    fi
    
    # Validate database backup
    if [[ -d "$backup_path/database" ]]; then
        if [[ -f "$backup_path/database/metadata.json" ]]; then
            local db_status=$(jq -r '.status' "$backup_path/database/metadata.json" 2>/dev/null)
            if [[ "$db_status" != "completed" ]]; then
                log_error "Database backup incomplete: $db_status"
                ((validation_errors++))
            fi
        else
            log_error "Database backup metadata missing"
            ((validation_errors++))
        fi
    else
        log_error "Database backup missing"
        ((validation_errors++))
    fi
    
    # Validate file backup
    if [[ -d "$backup_path/files" ]]; then
        if [[ -f "$backup_path/files/metadata.json" ]]; then
            local files_status=$(jq -r '.status' "$backup_path/files/metadata.json" 2>/dev/null)
            if [[ "$files_status" != "completed" ]]; then
                log_error "File backup incomplete: $files_status"
                ((validation_errors++))
            fi
        else
            log_error "File backup metadata missing"
            ((validation_errors++))
        fi
    else
        log_warn "File backup missing (may be empty)"
    fi
    
    # Validate configuration backup
    if [[ ! -d "$backup_path/config" ]]; then
        log_error "Configuration backup missing"
        ((validation_errors++))
    fi
    
    if [[ $validation_errors -eq 0 ]]; then
        log_info "Backup validation passed"
        return 0
    else
        log_error "Backup validation failed with $validation_errors errors"
        return 1
    fi
}

# Generate backup report
generate_backup_report() {
    local backup_path="$1"
    local archive_path="$2"
    local total_duration="$3"
    
    local report_file="$backup_path/backup-report.json"
    local archive_size=$(stat -c%s "$archive_path" 2>/dev/null || echo "0")
    
    # Collect component statistics
    local db_size=0
    local files_size=0
    local config_size=0
    
    if [[ -f "$backup_path/database/metadata.json" ]]; then
        db_size=$(jq -r '.backup_size // "0"' "$backup_path/database/metadata.json" | sed 's/[^0-9]//g')
    fi
    
    if [[ -f "$backup_path/files/metadata.json" ]]; then
        files_size=$(jq -r '.summary.total_size // 0' "$backup_path/files/metadata.json")
    fi
    
    if [[ -d "$backup_path/config" ]]; then
        config_size=$(du -sb "$backup_path/config" | cut -f1)
    fi
    
    cat > "$report_file" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "backup_type": "$BACKUP_TYPE",
    "completed_at": "$(date -Iseconds)",
    "duration_seconds": $total_duration,
    "hostname": "$(hostname)",
    "components": {
        "database": {
            "included": $([ -d "$backup_path/database" ] && echo "true" || echo "false"),
            "size": $db_size
        },
        "files": {
            "included": $([ -d "$backup_path/files" ] && echo "true" || echo "false"),
            "size": $files_size
        },
        "configuration": {
            "included": $([ -d "$backup_path/config" ] && echo "true" || echo "false"),
            "size": $config_size
        }
    },
    "archive": {
        "created": $([ -f "$archive_path" ] && echo "true" || echo "false"),
        "size": $archive_size,
        "compression": "zstd",
        "path": "$archive_path"
    },
    "storage": {
        "local": "$(realpath "$backup_path")",
        "remote": "${BACKUP_S3_BUCKET:+s3://$BACKUP_S3_BUCKET/haos-v2-backups/$(date +%Y/%m/%d)/$(basename "$archive_path")}"
    },
    "validation": "passed",
    "status": "completed"
}
EOF
    
    log_info "Backup report generated: $report_file"
}

# Cleanup old system backups
cleanup_old_system_backups() {
    log_info "Cleaning up old system backups..."
    
    # Keep last 4 weekly system backups (1 month)
    local system_backups=$(find "$BACKUP_BASE_DIR" -maxdepth 1 -type d -name "20*" | sort -r)
    local count=0
    
    for backup_dir in $system_backups; do
        ((count++))
        if [[ $count -gt 4 ]]; then
            log_info "Removing old system backup: $(basename "$backup_dir")"
            rm -rf "$backup_dir"
        fi
    done
    
    # Cleanup old archives (keep last 52 weeks = 1 year)
    find "$BACKUP_BASE_DIR" -name "haos-v2-backup-*.tar.*" -mtime +365 -delete 2>/dev/null || true
    
    log_info "System backup cleanup completed"
}

# Main execution
main() {
    log_info "HAOS-V2 Complete System Backup"
    log_info "==============================="
    
    local overall_start_time=$(date +%s)
    
    # Acquire global backup lock
    if ! acquire_lock "system-backup" 7200; then  # 2 hour timeout
        log_error "Could not acquire system backup lock"
        exit 1
    fi
    
    # Pre-flight checks
    check_required_tools "tar" "zstd" "jq" "sha256sum" "ln"
    check_disk_space "$BACKUP_BASE_DIR" 50  # Require at least 50GB free
    check_system_load 3.0  # Warn if load is high
    
    # Start performance monitoring
    start_performance_monitor
    
    # Create backup manifest
    create_backup_manifest "$BACKUP_DEST" "$BACKUP_ID" "system"
    
    # Phase 1: System information
    collect_system_info
    
    # Phase 2: Application configuration
    backup_application_config
    
    # Phase 3: Database backup
    perform_database_backup
    
    # Phase 4: File system backup
    perform_file_backup
    
    # Phase 5: Validation
    validate_complete_backup "$BACKUP_DEST"
    
    # Phase 6: Archive creation (if requested)
    local archive_path=""
    if [[ "$COMPRESS_BACKUP" == "true" ]]; then
        archive_path=$(create_backup_archive)
    fi
    
    # Phase 7: Remote upload (if configured)
    if [[ -n "$archive_path" ]]; then
        upload_backup "$archive_path"
    fi
    
    # Calculate total duration
    local overall_end_time=$(date +%s)
    local total_duration=$((overall_end_time - overall_start_time))
    
    # Generate final report
    generate_backup_report "$BACKUP_DEST" "$archive_path" "$total_duration"
    
    # Cleanup old backups
    cleanup_old_system_backups
    
    # Stop performance monitoring
    stop_performance_monitor
    
    # Release lock
    release_lock "system-backup"
    
    # Final summary
    local backup_size=$(du -sh "$BACKUP_DEST" | cut -f1)
    log_success "Complete system backup finished successfully!"
    log_info "Backup ID: $BACKUP_ID"
    log_info "Duration: $(format_duration $total_duration)"
    log_info "Size: $backup_size"
    log_info "Location: $BACKUP_DEST"
    
    if [[ -n "$archive_path" ]]; then
        local archive_size=$(stat -c%s "$archive_path" | xargs -I {} numfmt --to=iec {})
        log_info "Archive: $(basename "$archive_path") ($archive_size)"
    fi
    
    # Send success notification
    send_notification "success" "Complete system backup completed" "Backup ID: $BACKUP_ID, Duration: $(format_duration $total_duration), Size: $backup_size"
    
    log_info "Backup completed successfully!"
}

# Error handler
handle_error() {
    local exit_code=$?
    stop_performance_monitor
    release_lock "system-backup"
    cleanup_temp_files
    handle_backup_error $exit_code "Complete system backup failed"
}

trap 'handle_error' ERR

# Execute main function
main "$@"