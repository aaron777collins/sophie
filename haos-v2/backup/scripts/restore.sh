#!/usr/bin/env bash

# HAOS-V2 System Restore Script
# Comprehensive restore functionality for database, files, and configuration

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$BACKUP_DIR/configs/backup-config.yaml"

# Load configuration and common functions
source "$SCRIPT_DIR/backup-common.sh"
load_config "$CONFIG_FILE"

# Logging setup
setup_logging "system-restore"

# Parse command line arguments
BACKUP_ID=""
RESTORE_TYPE="full"
DRY_RUN=false
FORCE_RESTORE=false
TARGET_DATABASE=""
RESTORE_TO_NEW_LOCATION=false

# Display usage
show_usage() {
    cat <<EOF
HAOS-V2 System Restore Tool

Usage: $0 [OPTIONS]

Options:
  --backup-id ID          Backup ID to restore (required)
  --type TYPE             Restore type: full, database-only, files-only, config-only
  --dry-run               Show what would be restored without making changes
  --force                 Skip confirmation prompts
  --target-db NAME        Restore database to different name (default: haos_v2)
  --new-location          Restore to new location without overwriting current system
  --help                  Show this help message

Examples:
  $0 --backup-id 20240216-150000                    # Full restore with confirmation
  $0 --backup-id 20240216-150000 --dry-run          # Preview restore actions
  $0 --backup-id 20240216-150000 --type database-only --target-db haos_v2_test
  $0 --backup-id 20240216-150000 --force            # Skip confirmations

Available backups:
$(list_available_backups | head -10)

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --backup-id)
                BACKUP_ID="$2"
                shift 2
                ;;
            --type)
                RESTORE_TYPE="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE_RESTORE=true
                shift
                ;;
            --target-db)
                TARGET_DATABASE="$2"
                shift 2
                ;;
            --new-location)
                RESTORE_TO_NEW_LOCATION=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    if [[ -z "$BACKUP_ID" ]]; then
        log_error "Backup ID is required. Use --backup-id option."
        show_usage
        exit 1
    fi
}

# List available backups
list_available_backups() {
    local backup_index="$BACKUP_DIR/storage/backup-index.json"
    
    if [[ -f "$backup_index" ]]; then
        jq -r '.[] | "\(.backup_id) - \(.created_at) (\(.type)) - \(.status)"' "$backup_index" | sort -r
    else
        # Fallback: scan directories
        echo "System backups:"
        find "$BACKUP_DIR/storage/local/system" -maxdepth 1 -type d -name "20*" | sort -r | head -10
        echo ""
        echo "Database backups:"
        find "$BACKUP_DIR/storage/local/database/full" -maxdepth 1 -type d -name "20*" | sort -r | head -10
        echo ""
        echo "File backups:"
        find "$BACKUP_DIR/storage/local/files/full" -maxdepth 1 -type d -name "20*" | sort -r | head -10
    fi
}

# Locate backup by ID
find_backup_location() {
    local backup_id="$1"
    
    # Check system backups first
    local system_backup="$BACKUP_DIR/storage/local/system/$backup_id"
    if [[ -d "$system_backup" ]]; then
        echo "system:$system_backup"
        return 0
    fi
    
    # Check compressed archives
    local archive_pattern="$BACKUP_DIR/storage/local/system/haos-v2-backup-${backup_id}.tar.*"
    for archive in $archive_pattern; do
        if [[ -f "$archive" ]]; then
            echo "archive:$archive"
            return 0
        fi
    done
    
    # Check individual component backups
    local db_backup="$BACKUP_DIR/storage/local/database/full/db-$backup_id"
    if [[ -d "$db_backup" ]]; then
        echo "database:$db_backup"
        return 0
    fi
    
    local file_backup="$BACKUP_DIR/storage/local/files/full/files-$backup_id"
    if [[ -d "$file_backup" ]]; then
        echo "files:$file_backup"
        return 0
    fi
    
    return 1
}

# Extract archive if needed
extract_backup_archive() {
    local archive_path="$1"
    local extract_dir="$2"
    
    log_info "Extracting backup archive: $(basename "$archive_path")"
    
    ensure_directory "$extract_dir" "0700"
    
    # Determine compression type and extract
    if [[ "$archive_path" == *.tar.zst ]]; then
        tar -I zstd -xf "$archive_path" -C "$extract_dir"
    elif [[ "$archive_path" == *.tar.gz ]]; then
        tar -xzf "$archive_path" -C "$extract_dir"  
    elif [[ "$archive_path" == *.tar.xz ]]; then
        tar -xJf "$archive_path" -C "$extract_dir"
    else
        tar -xf "$archive_path" -C "$extract_dir"
    fi
    
    # Find the extracted directory
    local extracted_dir=$(find "$extract_dir" -maxdepth 1 -type d -name "haos-v2-backup-*" | head -1)
    if [[ -n "$extracted_dir" ]]; then
        echo "$extracted_dir"
    else
        echo "$extract_dir"
    fi
}

# Pre-restore validation
validate_backup_integrity() {
    local backup_path="$1"
    
    log_info "Validating backup integrity..."
    
    # Check backup manifest exists
    if [[ ! -f "$backup_path/MANIFEST" ]]; then
        log_warn "Backup manifest not found, proceeding with basic validation"
    else
        # Verify manifest checksums
        (
            cd "$(dirname "$backup_path/MANIFEST")"
            if ! tail -n +7 "MANIFEST" | sha256sum -c --quiet; then
                log_error "Backup integrity check failed: checksum mismatch"
                return 1
            fi
        )
    fi
    
    # Check essential components exist
    local validation_errors=0
    
    if [[ "$RESTORE_TYPE" == "full" ]] || [[ "$RESTORE_TYPE" == "database-only" ]]; then
        if [[ ! -d "$backup_path/database" ]]; then
            log_error "Database backup not found in backup set"
            ((validation_errors++))
        fi
    fi
    
    if [[ "$RESTORE_TYPE" == "full" ]] || [[ "$RESTORE_TYPE" == "files-only" ]]; then
        if [[ ! -d "$backup_path/files" ]]; then
            log_warn "File backup not found in backup set (may be empty)"
        fi
    fi
    
    if [[ "$RESTORE_TYPE" == "full" ]] || [[ "$RESTORE_TYPE" == "config-only" ]]; then
        if [[ ! -d "$backup_path/config" ]]; then
            log_error "Configuration backup not found in backup set"
            ((validation_errors++))
        fi
    fi
    
    if [[ $validation_errors -gt 0 ]]; then
        log_error "Backup validation failed with $validation_errors errors"
        return 1
    fi
    
    log_info "Backup integrity validation passed"
    return 0
}

# Pre-restore safety checks
perform_safety_checks() {
    log_info "Performing pre-restore safety checks..."
    
    # Check if services are running
    local running_services=()
    
    if systemctl is-active --quiet haos-v2 2>/dev/null; then
        running_services+=("haos-v2")
    fi
    
    if systemctl is-active --quiet postgresql 2>/dev/null; then
        running_services+=("postgresql")
    fi
    
    if systemctl is-active --quiet nginx 2>/dev/null; then
        running_services+=("nginx")
    fi
    
    if [[ ${#running_services[@]} -gt 0 ]] && [[ "$FORCE_RESTORE" != "true" ]]; then
        log_warn "The following services are currently running:"
        printf ' - %s\n' "${running_services[@]}"
        log_warn ""
        log_warn "Restoring while services are running may cause data corruption or service disruption."
        log_warn ""
        
        if [[ "$DRY_RUN" != "true" ]]; then
            read -p "Do you want to stop services before proceeding? [y/N]: " -r
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                stop_services
            else
                log_warn "Proceeding with services running (not recommended)"
            fi
        fi
    fi
    
    # Check disk space
    local restore_space_needed=$(estimate_restore_space_needed "$1")
    check_disk_space "/" $((restore_space_needed / 1024 / 1024 / 1024 + 1))  # Convert to GB
}

# Estimate space needed for restore
estimate_restore_space_needed() {
    local backup_path="$1"
    local total_space=0
    
    if [[ -d "$backup_path/database" ]]; then
        local db_space=$(du -sb "$backup_path/database" | cut -f1)
        total_space=$((total_space + db_space * 2))  # Double for decompression
    fi
    
    if [[ -d "$backup_path/files" ]]; then
        local file_space=$(du -sb "$backup_path/files" | cut -f1)
        total_space=$((total_space + file_space))
    fi
    
    echo $total_space
}

# Stop services before restore
stop_services() {
    log_info "Stopping services for safe restore..."
    
    # Stop in reverse dependency order
    if systemctl is-active --quiet haos-v2 2>/dev/null; then
        log_info "Stopping HAOS-V2 application..."
        systemctl stop haos-v2
    fi
    
    if systemctl is-active --quiet nginx 2>/dev/null; then
        log_info "Stopping Nginx..."
        systemctl stop nginx
    fi
    
    log_info "Services stopped successfully"
}

# Start services after restore
start_services() {
    log_info "Starting services after restore..."
    
    # Start in dependency order
    if systemctl is-enabled --quiet nginx 2>/dev/null; then
        log_info "Starting Nginx..."
        systemctl start nginx
    fi
    
    if systemctl is-enabled --quiet haos-v2 2>/dev/null; then
        log_info "Starting HAOS-V2 application..."
        systemctl start haos-v2
    fi
    
    log_info "Services started successfully"
}

# Create pre-restore backup of current system
create_pre_restore_backup() {
    local pre_backup_id="pre-restore-$(date +%Y%m%d-%H%M%S)"
    log_info "Creating pre-restore backup: $pre_backup_id"
    
    # Quick database backup
    local db_backup_script="$SCRIPT_DIR/backup-database.sh"
    if [[ -x "$db_backup_script" ]]; then
        "$db_backup_script" "full" "$pre_backup_id" || log_warn "Pre-restore database backup failed"
    fi
    
    # Quick config backup
    local config_backup_dir="$BACKUP_DIR/storage/local/pre-restore/$pre_backup_id"
    ensure_directory "$config_backup_dir" "0700"
    
    if [[ -f "$APP_ROOT/.env.production" ]]; then
        cp "$APP_ROOT/.env.production" "$config_backup_dir/env.production.bak"
    fi
    
    log_info "Pre-restore backup created: $pre_backup_id"
}

# Database restore
restore_database() {
    local backup_path="$1"
    local target_db="${TARGET_DATABASE:-${DB_NAME:-haos_v2}}"
    
    log_info "Restoring database to: $target_db"
    
    local db_backup_dir="$backup_path/database"
    if [[ ! -d "$db_backup_dir" ]]; then
        log_error "Database backup not found: $db_backup_dir"
        return 1
    fi
    
    # Find database dump file
    local dump_file=""
    if [[ -f "$db_backup_dir/backup/database.dump" ]]; then
        dump_file="$db_backup_dir/backup/database.dump"
    elif [[ -f "$db_backup_dir/database.dump" ]]; then
        dump_file="$db_backup_dir/database.dump"
    else
        log_error "Database dump file not found"
        return 1
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would restore database from: $dump_file"
        return 0
    fi
    
    # Database connection parameters
    local DB_HOST="${DB_HOST:-localhost}"
    local DB_PORT="${DB_PORT:-5432}"
    local DB_USER="${DB_USER:-postgres}"
    local PGPASSWORD="${DB_PASSWORD:-}"
    
    # Check if target database exists
    local db_exists=$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d'|' -f1 | grep -w "$target_db" | wc -l)
    
    if [[ $db_exists -gt 0 ]]; then
        if [[ "$FORCE_RESTORE" != "true" ]]; then
            log_warn "Database '$target_db' already exists"
            read -p "Do you want to drop and recreate it? [y/N]: " -r
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "Restore cancelled by user"
                return 1
            fi
        fi
        
        log_info "Dropping existing database: $target_db"
        PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $target_db;"
    fi
    
    # Create new database
    log_info "Creating database: $target_db"
    PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $target_db;"
    
    # Restore database
    log_info "Restoring database from dump..."
    local start_time=$(date +%s)
    
    PGPASSWORD="$PGPASSWORD" pg_restore \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$target_db" \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        --verbose \
        "$dump_file"
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Verify restore
    local table_count=$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$target_db" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    
    log_info "Database restore completed in $(format_duration $duration)"
    log_info "Tables restored: $table_count"
    
    # Update database connection if restoring to original database
    if [[ "$target_db" == "${DB_NAME:-haos_v2}" ]]; then
        log_info "Database restored to original location"
    else
        log_info "Database restored to: $target_db"
        log_info "Update application configuration to use new database name"
    fi
}

# File system restore
restore_files() {
    local backup_path="$1"
    
    log_info "Restoring file system..."
    
    local files_backup_dir="$backup_path/files"
    if [[ ! -d "$files_backup_dir" ]]; then
        log_warn "File backup not found, skipping file restore"
        return 0
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would restore files from: $files_backup_dir"
        find "$files_backup_dir" -name "*-manifest.json" -exec echo "Would restore category: $(basename {} -manifest.json)" \;
        return 0
    fi
    
    # Restore each file category
    local categories=("uploads" "media" "logs" "static")
    
    for category in "${categories[@]}"; do
        local category_backup="$files_backup_dir/backup/$category"
        if [[ ! -d "$category_backup" ]]; then
            category_backup="$files_backup_dir/$category"
        fi
        
        if [[ -d "$category_backup" ]]; then
            log_info "Restoring $category files..."
            
            case "$category" in
                "uploads")
                    restore_file_category "$category_backup" "${UPLOADS_DIR:-/app/uploads}"
                    ;;
                "media")
                    # Restore avatars and icons
                    if [[ -d "$category_backup/avatars" ]]; then
                        restore_file_category "$category_backup/avatars" "${AVATARS_DIR:-/app/public/avatars}"
                    fi
                    if [[ -d "$category_backup/icons" ]]; then
                        restore_file_category "$category_backup/icons" "${ICONS_DIR:-/app/public/icons}"
                    fi
                    ;;
                "logs")
                    restore_file_category "$category_backup" "${LOGS_DIR:-/var/log/haos-v2}"
                    ;;
                "static")
                    # Restore static assets if needed
                    if [[ "$RESTORE_TO_NEW_LOCATION" == "true" ]]; then
                        restore_file_category "$category_backup" "${APP_ROOT:-/app}/public"
                    fi
                    ;;
            esac
        else
            log_info "No $category files to restore"
        fi
    done
    
    log_info "File system restore completed"
}

# Restore specific file category
restore_file_category() {
    local source_dir="$1"
    local target_dir="$2"
    
    log_info "  Restoring to: $target_dir"
    
    # Create target directory
    ensure_directory "$target_dir" "0755"
    
    # Use rsync for efficient restore
    rsync -avH --delete "$source_dir/" "$target_dir/"
    
    # Set appropriate permissions
    chown -R www-data:www-data "$target_dir" 2>/dev/null || true
    find "$target_dir" -type f -exec chmod 644 {} \;
    find "$target_dir" -type d -exec chmod 755 {} \;
    
    local file_count=$(find "$target_dir" -type f | wc -l)
    log_info "  Restored $file_count files"
}

# Configuration restore
restore_configuration() {
    local backup_path="$1"
    
    log_info "Restoring configuration..."
    
    local config_backup_dir="$backup_path/config"
    if [[ ! -d "$config_backup_dir" ]]; then
        log_warn "Configuration backup not found, skipping config restore"
        return 0
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would restore configuration files from: $config_backup_dir"
        find "$config_backup_dir" -type f -printf "Would restore: %f\n"
        return 0
    fi
    
    # Restore environment file (encrypted)
    if [[ -f "$config_backup_dir/.env.production.enc" ]]; then
        log_info "Restoring environment configuration..."
        if decrypt_file "$config_backup_dir/.env.production.enc" "$APP_ROOT/.env.production"; then
            chmod 600 "$APP_ROOT/.env.production"
            log_info "Environment configuration restored"
        else
            log_error "Failed to decrypt environment file"
            return 1
        fi
    elif [[ -f "$config_backup_dir/.env.production" ]]; then
        safe_copy "$config_backup_dir/.env.production" "$APP_ROOT/.env.production"
        chmod 600 "$APP_ROOT/.env.production"
    fi
    
    # Restore Next.js configuration
    if [[ -f "$config_backup_dir/next.config.js" ]]; then
        safe_copy "$config_backup_dir/next.config.js" "$APP_ROOT/next.config.js"
        log_info "Next.js configuration restored"
    fi
    
    # Restore package files
    if [[ -f "$config_backup_dir/package.json" ]]; then
        safe_copy "$config_backup_dir/package.json" "$APP_ROOT/package.json"
    fi
    
    if [[ -f "$config_backup_dir/package-lock.json" ]]; then
        safe_copy "$config_backup_dir/package-lock.json" "$APP_ROOT/package-lock.json"
    fi
    
    # Restore Nginx configuration
    if [[ -f "$config_backup_dir/nginx-haos-v2.conf" ]]; then
        local nginx_config="/etc/nginx/sites-available/haos-v2"
        ensure_directory "$(dirname "$nginx_config")" "0755"
        safe_copy "$config_backup_dir/nginx-haos-v2.conf" "$nginx_config"
        
        # Enable site if not already enabled
        local nginx_enabled="/etc/nginx/sites-enabled/haos-v2"
        if [[ ! -L "$nginx_enabled" ]]; then
            ln -sf "$nginx_config" "$nginx_enabled"
        fi
        
        log_info "Nginx configuration restored"
    fi
    
    # Restore SSL certificates
    if [[ -d "$config_backup_dir/ssl" ]]; then
        log_info "Restoring SSL certificates..."
        local ssl_dir="/etc/letsencrypt/live/$(hostname -f 2>/dev/null || hostname)"
        ensure_directory "$ssl_dir" "0700"
        
        if [[ -f "$config_backup_dir/ssl/fullchain.pem" ]]; then
            safe_copy "$config_backup_dir/ssl/fullchain.pem" "$ssl_dir/fullchain.pem"
            chmod 644 "$ssl_dir/fullchain.pem"
        fi
        
        if [[ -f "$config_backup_dir/ssl/privkey.pem" ]]; then
            safe_copy "$config_backup_dir/ssl/privkey.pem" "$ssl_dir/privkey.pem"
            chmod 600 "$ssl_dir/privkey.pem"
        fi
        
        log_info "SSL certificates restored"
    fi
    
    log_info "Configuration restore completed"
}

# Post-restore validation
validate_restore() {
    log_info "Validating restore..."
    
    local validation_errors=0
    
    # Database validation
    if [[ "$RESTORE_TYPE" == "full" ]] || [[ "$RESTORE_TYPE" == "database-only" ]]; then
        local target_db="${TARGET_DATABASE:-${DB_NAME:-haos_v2}}"
        local DB_HOST="${DB_HOST:-localhost}"
        local DB_PORT="${DB_PORT:-5432}"
        local DB_USER="${DB_USER:-postgres}"
        local PGPASSWORD="${DB_PASSWORD:-}"
        
        if PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$target_db" -c "SELECT 1" >/dev/null 2>&1; then
            local table_count=$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$target_db" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
            log_info "Database validation passed: $table_count tables"
        else
            log_error "Database validation failed: cannot connect"
            ((validation_errors++))
        fi
    fi
    
    # File validation
    if [[ "$RESTORE_TYPE" == "full" ]] || [[ "$RESTORE_TYPE" == "files-only" ]]; then
        local uploads_dir="${UPLOADS_DIR:-/app/uploads}"
        if [[ -d "$uploads_dir" ]]; then
            local file_count=$(find "$uploads_dir" -type f 2>/dev/null | wc -l)
            log_info "Files validation passed: $file_count files in uploads"
        fi
    fi
    
    # Configuration validation
    if [[ "$RESTORE_TYPE" == "full" ]] || [[ "$RESTORE_TYPE" == "config-only" ]]; then
        if [[ -f "$APP_ROOT/.env.production" ]]; then
            log_info "Configuration validation passed: environment file exists"
        else
            log_warn "Configuration validation: environment file missing"
        fi
    fi
    
    if [[ $validation_errors -eq 0 ]]; then
        log_info "Restore validation passed"
        return 0
    else
        log_error "Restore validation failed with $validation_errors errors"
        return 1
    fi
}

# Generate restore report
generate_restore_report() {
    local backup_id="$1"
    local restore_duration="$2"
    local backup_path="$3"
    
    local report_file="/var/log/haos-backup/restore-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" <<EOF
{
    "restore_id": "restore-$(date +%Y%m%d-%H%M%S)",
    "backup_id": "$backup_id",
    "restore_type": "$RESTORE_TYPE",
    "completed_at": "$(date -Iseconds)",
    "duration_seconds": $restore_duration,
    "hostname": "$(hostname)",
    "target_database": "${TARGET_DATABASE:-${DB_NAME:-haos_v2}}",
    "dry_run": $DRY_RUN,
    "forced": $FORCE_RESTORE,
    "backup_source": "$backup_path",
    "components_restored": {
        "database": $([ "$RESTORE_TYPE" == "full" ] || [ "$RESTORE_TYPE" == "database-only" ] && echo "true" || echo "false"),
        "files": $([ "$RESTORE_TYPE" == "full" ] || [ "$RESTORE_TYPE" == "files-only" ] && echo "true" || echo "false"),
        "configuration": $([ "$RESTORE_TYPE" == "full" ] || [ "$RESTORE_TYPE" == "config-only" ] && echo "true" || echo "false")
    },
    "status": "completed"
}
EOF
    
    log_info "Restore report generated: $report_file"
}

# Main restore function
main() {
    log_info "HAOS-V2 System Restore Tool"
    log_info "============================"
    
    # Parse arguments
    parse_arguments "$@"
    
    local overall_start_time=$(date +%s)
    
    log_info "Restore parameters:"
    log_info "  Backup ID: $BACKUP_ID"
    log_info "  Restore Type: $RESTORE_TYPE"
    log_info "  Dry Run: $DRY_RUN"
    log_info "  Force: $FORCE_RESTORE"
    if [[ -n "$TARGET_DATABASE" ]]; then
        log_info "  Target Database: $TARGET_DATABASE"
    fi
    
    # Find backup location
    local backup_location
    if ! backup_location=$(find_backup_location "$BACKUP_ID"); then
        log_error "Backup not found: $BACKUP_ID"
        log_info "Available backups:"
        list_available_backups
        exit 1
    fi
    
    local backup_type="${backup_location%%:*}"
    local backup_path="${backup_location#*:}"
    
    log_info "Found backup: $backup_type at $backup_path"
    
    # Handle archive extraction if needed
    local working_backup_path="$backup_path"
    local temp_extract_dir=""
    
    if [[ "$backup_type" == "archive" ]]; then
        temp_extract_dir="/tmp/haos-restore-$BACKUP_ID"
        working_backup_path=$(extract_backup_archive "$backup_path" "$temp_extract_dir")
    fi
    
    # Validate backup integrity
    validate_backup_integrity "$working_backup_path"
    
    # Acquire restore lock
    if ! acquire_lock "system-restore" 7200; then
        log_error "Could not acquire system restore lock"
        exit 1
    fi
    
    # Safety checks
    perform_safety_checks "$working_backup_path"
    
    # Create pre-restore backup (if not dry run)
    if [[ "$DRY_RUN" != "true" ]] && [[ "$RESTORE_TO_NEW_LOCATION" != "true" ]]; then
        create_pre_restore_backup
    fi
    
    # Perform restore based on type
    case "$RESTORE_TYPE" in
        "full")
            restore_database "$working_backup_path"
            restore_files "$working_backup_path"
            restore_configuration "$working_backup_path"
            ;;
        "database-only")
            restore_database "$working_backup_path"
            ;;
        "files-only")
            restore_files "$working_backup_path"
            ;;
        "config-only")
            restore_configuration "$working_backup_path"
            ;;
        *)
            log_error "Invalid restore type: $RESTORE_TYPE"
            exit 1
            ;;
    esac
    
    # Post-restore validation
    if [[ "$DRY_RUN" != "true" ]]; then
        validate_restore
    fi
    
    # Restart services if they were stopped
    if [[ "$DRY_RUN" != "true" ]] && [[ "$RESTORE_TO_NEW_LOCATION" != "true" ]]; then
        start_services
    fi
    
    # Cleanup temporary files
    if [[ -n "$temp_extract_dir" ]] && [[ -d "$temp_extract_dir" ]]; then
        rm -rf "$temp_extract_dir"
    fi
    
    # Calculate total duration
    local overall_end_time=$(date +%s)
    local total_duration=$((overall_end_time - overall_start_time))
    
    # Generate restore report
    generate_restore_report "$BACKUP_ID" "$total_duration" "$working_backup_path"
    
    # Release lock
    release_lock "system-restore"
    
    # Final summary
    if [[ "$DRY_RUN" == "true" ]]; then
        log_success "Dry run completed successfully!"
        log_info "Review the actions above and run without --dry-run to perform actual restore"
    else
        log_success "Restore completed successfully!"
        log_info "Backup ID: $BACKUP_ID"
        log_info "Restore Type: $RESTORE_TYPE"
        log_info "Duration: $(format_duration $total_duration)"
        
        if [[ -n "$TARGET_DATABASE" ]]; then
            log_info "Database restored to: $TARGET_DATABASE"
        fi
        
        # Send success notification
        send_notification "success" "System restore completed" "Backup ID: $BACKUP_ID, Type: $RESTORE_TYPE, Duration: $(format_duration $total_duration)"
    fi
    
    log_info "Restore operation completed!"
}

# Error handler
handle_error() {
    local exit_code=$?
    release_lock "system-restore"
    cleanup_temp_files
    handle_backup_error $exit_code "System restore failed"
}

trap 'handle_error' ERR

# Execute main function
main "$@"