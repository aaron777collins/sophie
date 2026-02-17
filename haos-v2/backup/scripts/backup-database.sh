#!/usr/bin/env bash

# HAOS-V2 Database Backup Script
# Performs PostgreSQL backups with multiple strategies: full, incremental, and WAL archiving

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$BACKUP_DIR/configs/backup-config.yaml"

# Load configuration
source "$SCRIPT_DIR/backup-common.sh"
load_config "$CONFIG_FILE"

# Logging setup
setup_logging "database-backup"

# Default values
BACKUP_TYPE="${1:-full}"
BACKUP_ID="${2:-$(date +%Y%m%d-%H%M%S)}"

log_info "Starting $BACKUP_TYPE database backup with ID: $BACKUP_ID"

# Database connection parameters
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-haos_v2}"
PGPASSWORD="${DB_PASSWORD:-}"

# Backup destination
BACKUP_BASE_DIR="$BACKUP_DIR/storage/local/database"
BACKUP_DEST="$BACKUP_BASE_DIR/$BACKUP_TYPE/$BACKUP_ID"

# Ensure backup directory exists
mkdir -p "$BACKUP_DEST"

# Pre-backup checks
check_database_connection() {
    log_info "Checking database connection..."
    if ! PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1; then
        log_error "Failed to connect to database"
        exit 1
    fi
    log_info "Database connection successful"
}

# Get database size for monitoring
get_database_size() {
    PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT pg_size_pretty(pg_database_size('$DB_NAME'))" | xargs
}

# Full database backup using pg_dump
backup_full() {
    log_info "Starting full database backup..."
    
    local start_time=$(date +%s)
    local db_size=$(get_database_size)
    log_info "Database size: $db_size"
    
    # Create metadata file
    cat > "$BACKUP_DEST/metadata.json" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "backup_type": "full",
    "database": "$DB_NAME",
    "start_time": "$(date -Iseconds)",
    "database_size": "$db_size",
    "host": "$DB_HOST",
    "port": $DB_PORT,
    "version": "$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version()" | head -1 | xargs)"
}
EOF

    # Perform backup with custom format (supports parallel restore)
    local backup_file="$BACKUP_DEST/database.dump"
    
    log_info "Creating database dump..."
    PGPASSWORD="$PGPASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=custom \
        --compress=9 \
        --no-owner \
        --no-privileges \
        --verbose \
        --file="$backup_file"
    
    # Create SQL version for easier inspection
    log_info "Creating SQL dump for inspection..."
    PGPASSWORD="$PGPASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-privileges \
        --file="$BACKUP_DEST/database.sql"
    
    # Compress SQL dump
    gzip "$BACKUP_DEST/database.sql"
    
    # Generate checksums
    log_info "Generating checksums..."
    (
        cd "$BACKUP_DEST"
        sha256sum database.dump > database.dump.sha256
        sha256sum database.sql.gz > database.sql.gz.sha256
    )
    
    # Update metadata with completion info
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local backup_size=$(du -h "$backup_file" | cut -f1)
    
    cat > "$BACKUP_DEST/metadata_complete.json" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "backup_type": "full",
    "database": "$DB_NAME",
    "start_time": "$(date -Iseconds -d "@$start_time")",
    "end_time": "$(date -Iseconds)",
    "duration_seconds": $duration,
    "database_size": "$db_size",
    "backup_size": "$backup_size",
    "host": "$DB_HOST",
    "port": $DB_PORT,
    "files": [
        "database.dump",
        "database.sql.gz",
        "metadata.json"
    ],
    "checksums": {
        "database.dump": "$(cat "$BACKUP_DEST/database.dump.sha256" | cut -d' ' -f1)",
        "database.sql.gz": "$(cat "$BACKUP_DEST/database.sql.gz.sha256" | cut -d' ' -f1)"
    },
    "status": "completed"
}
EOF
    
    log_info "Full backup completed in ${duration}s, size: $backup_size"
}

# Incremental backup using logical replication
backup_incremental() {
    log_info "Starting incremental database backup..."
    
    # Find the last full backup
    local last_full_backup=$(find "$BACKUP_BASE_DIR/full" -name "metadata_complete.json" -exec stat -c '%Y %n' {} \; | sort -nr | head -1 | cut -d' ' -f2- | xargs dirname)
    
    if [[ -z "$last_full_backup" ]]; then
        log_error "No full backup found. Please run a full backup first."
        exit 1
    fi
    
    log_info "Base backup: $last_full_backup"
    
    # Get last backup timestamp
    local last_backup_time=""
    if [[ -f "$BACKUP_BASE_DIR/incremental/last_backup_time" ]]; then
        last_backup_time=$(cat "$BACKUP_BASE_DIR/incremental/last_backup_time")
    else
        # Use full backup time as starting point
        last_backup_time=$(jq -r '.start_time' "$last_full_backup/metadata_complete.json")
    fi
    
    log_info "Incremental backup since: $last_backup_time"
    
    # Create metadata
    cat > "$BACKUP_DEST/metadata.json" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "backup_type": "incremental",
    "database": "$DB_NAME",
    "start_time": "$(date -Iseconds)",
    "base_backup": "$(basename "$last_full_backup")",
    "since_time": "$last_backup_time"
}
EOF

    local start_time=$(date +%s)
    local current_time=$(date -Iseconds)
    
    # Export only changed data using timestamps
    # This is a simplified approach - in production you might want to use logical replication slots
    
    # Get tables that have been modified since last backup
    local modified_tables=$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN (
            SELECT DISTINCT table_name
            FROM information_schema.columns
            WHERE column_name IN ('created_at', 'updated_at')
            AND table_schema = 'public'
        )
    " | xargs)
    
    log_info "Checking modified tables: $modified_tables"
    
    # Create incremental dumps for modified tables
    local has_changes=false
    for table in $modified_tables; do
        local table_file="$BACKUP_DEST/${table}.sql"
        
        # Export records modified since last backup
        local where_clause="created_at > '$last_backup_time' OR updated_at > '$last_backup_time'"
        
        PGPASSWORD="$PGPASSWORD" pg_dump \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            --table="$table" \
            --data-only \
            --where="$where_clause" \
            --file="$table_file"
        
        if [[ -s "$table_file" ]]; then
            has_changes=true
            gzip "$table_file"
            log_info "Exported changes for table: $table"
        else
            rm "$table_file"
        fi
    done
    
    if [[ "$has_changes" = false ]]; then
        log_info "No changes found since last backup"
        rmdir "$BACKUP_DEST" 2>/dev/null || true
        return 0
    fi
    
    # Update last backup time
    echo "$current_time" > "$BACKUP_BASE_DIR/incremental/last_backup_time"
    
    # Generate checksums for all files
    (
        cd "$BACKUP_DEST"
        find . -name "*.sql.gz" -exec sha256sum {} \; > checksums.sha256
    )
    
    # Complete metadata
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    cat > "$BACKUP_DEST/metadata_complete.json" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "backup_type": "incremental",
    "database": "$DB_NAME",
    "start_time": "$(date -Iseconds -d "@$start_time")",
    "end_time": "$(date -Iseconds)",
    "duration_seconds": $duration,
    "base_backup": "$(basename "$last_full_backup")",
    "since_time": "$last_backup_time",
    "modified_tables": [$(printf '"%s",' $modified_tables | sed 's/,$//')],,
    "status": "completed"
}
EOF
    
    log_info "Incremental backup completed in ${duration}s"
}

# WAL archiving setup
setup_wal_archiving() {
    log_info "Setting up WAL archiving..."
    
    local wal_dir="$BACKUP_DIR/storage/local/wal"
    mkdir -p "$wal_dir"
    
    # Create WAL archive script
    cat > "$SCRIPT_DIR/archive-wal.sh" <<'WALEOF'
#!/bin/bash
# WAL archive script - called by PostgreSQL
# Arguments: %p (file path) %f (file name)

set -euo pipefail

WAL_SOURCE="$1"
WAL_NAME="$2"
WAL_DEST="/backup/storage/local/wal/$WAL_NAME"

# Copy WAL file with verification
if cp "$WAL_SOURCE" "$WAL_DEST" && test -f "$WAL_DEST"; then
    # Generate checksum
    sha256sum "$WAL_DEST" > "$WAL_DEST.sha256"
    
    # Compress old WAL files (older than 1 hour)
    find "$(dirname "$WAL_DEST")" -name "*.wal" -mmin +60 -exec gzip {} \;
    
    echo "WAL archived: $WAL_NAME"
else
    echo "WAL archive failed: $WAL_NAME" >&2
    exit 1
fi
WALEOF
    
    chmod +x "$SCRIPT_DIR/archive-wal.sh"
    
    log_info "WAL archiving setup completed"
    log_info "To enable WAL archiving, add to postgresql.conf:"
    log_info "  wal_level = replica"
    log_info "  archive_mode = on"
    log_info "  archive_command = '$SCRIPT_DIR/archive-wal.sh %p %f'"
}

# Validate backup
validate_backup() {
    local backup_path="$1"
    
    log_info "Validating backup: $backup_path"
    
    # Check metadata exists
    if [[ ! -f "$backup_path/metadata_complete.json" ]]; then
        log_error "Backup validation failed: missing metadata"
        return 1
    fi
    
    # Verify checksums
    if [[ -f "$backup_path/database.dump.sha256" ]]; then
        (
            cd "$backup_path"
            if ! sha256sum -c database.dump.sha256 >/dev/null 2>&1; then
                log_error "Backup validation failed: checksum mismatch for database.dump"
                return 1
            fi
        )
    fi
    
    # Test pg_restore on dump file (dry run)
    if [[ -f "$backup_path/database.dump" ]]; then
        if ! PGPASSWORD="$PGPASSWORD" pg_restore --list "$backup_path/database.dump" >/dev/null 2>&1; then
            log_error "Backup validation failed: corrupt dump file"
            return 1
        fi
    fi
    
    log_info "Backup validation passed"
    return 0
}

# Cleanup old backups according to retention policy
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Cleanup full backups (keep last 90 days)
    find "$BACKUP_BASE_DIR/full" -type d -mtime +90 -exec rm -rf {} \; 2>/dev/null || true
    
    # Cleanup incremental backups (keep last 30 days)
    find "$BACKUP_BASE_DIR/incremental" -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null || true
    
    # Cleanup WAL files (keep last 7 days)
    find "$BACKUP_DIR/storage/local/wal" -name "*.wal*" -mtime +7 -delete 2>/dev/null || true
    
    log_info "Cleanup completed"
}

# Main execution
main() {
    log_info "HAOS-V2 Database Backup System"
    log_info "=============================="
    
    # Pre-flight checks
    check_database_connection
    check_required_tools "pg_dump" "pg_restore" "psql" "gzip" "sha256sum"
    
    case "$BACKUP_TYPE" in
        "full")
            backup_full
            validate_backup "$BACKUP_DEST"
            ;;
        "incremental")
            backup_incremental
            if [[ -d "$BACKUP_DEST" ]]; then
                validate_backup "$BACKUP_DEST"
            fi
            ;;
        "wal-setup")
            setup_wal_archiving
            exit 0
            ;;
        *)
            log_error "Invalid backup type: $BACKUP_TYPE"
            log_info "Valid types: full, incremental, wal-setup"
            exit 1
            ;;
    esac
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Send notification
    send_notification "success" "Database backup completed successfully" "Backup ID: $BACKUP_ID, Type: $BACKUP_TYPE"
    
    log_info "Database backup completed successfully"
}

# Error handler
handle_error() {
    local exit_code=$?
    log_error "Backup failed with exit code: $exit_code"
    send_notification "error" "Database backup failed" "Backup ID: $BACKUP_ID, Type: $BACKUP_TYPE, Error: Exit code $exit_code"
    exit $exit_code
}

trap 'handle_error' ERR

# Execute main function
main "$@"