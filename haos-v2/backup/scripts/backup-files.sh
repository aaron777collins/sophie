#!/usr/bin/env bash

# HAOS-V2 File System Backup Script
# Backs up application files, user uploads, configurations, and logs

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$BACKUP_DIR/configs/backup-config.yaml"

# Load configuration and common functions
source "$SCRIPT_DIR/backup-common.sh"
load_config "$CONFIG_FILE"

# Logging setup
setup_logging "file-backup"

# Default values
BACKUP_TYPE="${1:-incremental}"
BACKUP_ID="${2:-$(date +%Y%m%d-%H%M%S)}"

log_info "Starting $BACKUP_TYPE file backup with ID: $BACKUP_ID"

# Backup destinations
BACKUP_BASE_DIR="$BACKUP_DIR/storage/local/files"
BACKUP_DEST="$BACKUP_BASE_DIR/$BACKUP_TYPE/$BACKUP_ID"

# File paths configuration
APP_ROOT="${APP_ROOT:-/app}"
UPLOADS_DIR="${UPLOADS_DIR:-$APP_ROOT/uploads}"
AVATARS_DIR="${AVATARS_DIR:-$APP_ROOT/public/avatars}"
ICONS_DIR="${ICONS_DIR:-$APP_ROOT/public/icons}"
LOGS_DIR="${LOGS_DIR:-/var/log/haos-v2}"
CONFIG_DIR="${CONFIG_DIR:-$APP_ROOT}"

# Ensure backup directory exists
ensure_directory "$BACKUP_DEST" "0700"

# File type definitions
declare -A BACKUP_CATEGORIES=(
    ["uploads"]="User uploaded files and attachments"
    ["media"]="Profile avatars and server icons"  
    ["logs"]="Application and system logs"
    ["config"]="Configuration files and secrets"
    ["static"]="Static web assets"
)

declare -A CATEGORY_PATHS=(
    ["uploads"]="$UPLOADS_DIR"
    ["media"]="$AVATARS_DIR:$ICONS_DIR"
    ["logs"]="$LOGS_DIR"
    ["config"]="$CONFIG_DIR/.env.production:$CONFIG_DIR/next.config.js:/etc/nginx/sites-available/haos-v2"
    ["static"]="$APP_ROOT/public:$APP_ROOT/.next/static"
)

declare -A CATEGORY_EXCLUDES=(
    ["uploads"]="*.tmp:*.temp:.DS_Store:Thumbs.db"
    ["media"]=".DS_Store:Thumbs.db"
    ["logs"]="*.gz:*.bz2"
    ["config"]=""
    ["static"]="*.map:node_modules"
)

# Create rsync exclude file
create_exclude_file() {
    local exclude_file="$BACKUP_DEST/exclude.txt"
    
    cat > "$exclude_file" <<EOF
# HAOS-V2 File Backup Exclusions
# Temporary files
*.tmp
*.temp
*.swp
*.swo
*~
.*.tmp

# OS files
.DS_Store
Thumbs.db
desktop.ini

# Version control
.git/
.gitignore
.gitattributes

# Node.js
node_modules/
npm-debug.log
yarn-error.log
.npm/
.yarn/

# Build artifacts
.next/cache/
.next/standalone/
coverage/
dist/
build/

# Logs (will be backed up separately)
*.log
logs/

# Cache files
cache/
.cache/
tmp/

# Database files (handled by database backup)
*.db
*.sqlite
*.sqlite3

# Compressed files (avoid double compression)
*.gz
*.bz2
*.xz
*.7z
*.zip
*.rar
EOF
    
    echo "$exclude_file"
}

# Get file size of directory
get_directory_size() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        du -sb "$dir" 2>/dev/null | cut -f1 || echo "0"
    else
        echo "0"
    fi
}

# Create file manifest with metadata
create_file_manifest() {
    local category="$1"
    local backup_path="$2"
    local manifest_file="$backup_path/${category}-manifest.json"
    
    log_info "Creating manifest for $category files..."
    
    local start_time=$(date +%s)
    local file_count=0
    local total_size=0
    
    # Start JSON structure
    cat > "$manifest_file" <<EOF
{
    "category": "$category",
    "backup_id": "$BACKUP_ID",
    "backup_type": "$BACKUP_TYPE",
    "created_at": "$(date -Iseconds)",
    "files": [
EOF
    
    # Process each file in the backup
    local first_file=true
    while IFS= read -r -d '' file; do
        if [[ -f "$file" ]]; then
            local rel_path="${file#$backup_path/}"
            local file_size=$(stat -c%s "$file" 2>/dev/null || echo "0")
            local file_mtime=$(stat -c%Y "$file" 2>/dev/null || echo "0")
            local file_checksum=$(sha256sum "$file" 2>/dev/null | cut -d' ' -f1 || echo "")
            
            # Add comma for all but first file
            if [[ "$first_file" != "true" ]]; then
                echo "," >> "$manifest_file"
            fi
            first_file=false
            
            cat >> "$manifest_file" <<EOF
        {
            "path": "$rel_path",
            "size": $file_size,
            "modified": $file_mtime,
            "checksum": "$file_checksum"
        }EOF
            
            ((file_count++))
            total_size=$((total_size + file_size))
        fi
    done < <(find "$backup_path" -type f ! -name "*-manifest.json" -print0)
    
    # Close JSON structure
    cat >> "$manifest_file" <<EOF

    ],
    "summary": {
        "file_count": $file_count,
        "total_size": $total_size,
        "duration_seconds": $(($(date +%s) - start_time))
    }
}
EOF
    
    log_info "Created manifest with $file_count files ($(format_size $total_size))"
}

# Full file backup using rsync
backup_files_full() {
    log_info "Starting full file backup..."
    
    local start_time=$(date +%s)
    local exclude_file=$(create_exclude_file)
    
    # Create main metadata file
    cat > "$BACKUP_DEST/metadata.json" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "backup_type": "full",
    "start_time": "$(date -Iseconds)",
    "hostname": "$(hostname)",
    "categories": [$(printf '"%s",' "${!BACKUP_CATEGORIES[@]}" | sed 's/,$//')]
}
EOF

    local total_files=0
    local total_size=0
    
    # Backup each category
    for category in "${!BACKUP_CATEGORIES[@]}"; do
        log_info "Backing up $category: ${BACKUP_CATEGORIES[$category]}"
        
        local category_dest="$BACKUP_DEST/$category"
        ensure_directory "$category_dest" "0700"
        
        local category_paths="${CATEGORY_PATHS[$category]}"
        local category_excludes="${CATEGORY_EXCLUDES[$category]}"
        
        # Split paths by colon
        IFS=':' read -ra paths <<< "$category_paths"
        
        local category_files=0
        local category_size=0
        
        for source_path in "${paths[@]}"; do
            if [[ -d "$source_path" ]]; then
                log_info "  Copying from: $source_path"
                
                # Build rsync command with excludes
                local rsync_cmd="rsync -avH --delete"
                rsync_cmd+=" --exclude-from=$exclude_file"
                
                # Add category-specific excludes
                if [[ -n "$category_excludes" ]]; then
                    IFS=':' read -ra excludes <<< "$category_excludes"
                    for exclude in "${excludes[@]}"; do
                        rsync_cmd+=" --exclude='$exclude'"
                    done
                fi
                
                rsync_cmd+=" '$source_path/' '$category_dest/$(basename "$source_path")/'"
                
                # Execute rsync
                if eval "$rsync_cmd"; then
                    local copied_files=$(find "$category_dest/$(basename "$source_path")" -type f | wc -l)
                    local copied_size=$(get_directory_size "$category_dest/$(basename "$source_path")")
                    
                    category_files=$((category_files + copied_files))
                    category_size=$((category_size + copied_size))
                    
                    log_info "  Copied: $copied_files files ($(format_size $copied_size))"
                else
                    log_error "Failed to backup: $source_path"
                    return 1
                fi
            elif [[ -f "$source_path" ]]; then
                # Single file backup
                log_info "  Copying file: $source_path"
                local dest_file="$category_dest/$(basename "$source_path")"
                
                if safe_copy "$source_path" "$dest_file"; then
                    local file_size=$(stat -c%s "$dest_file" 2>/dev/null || echo "0")
                    category_files=$((category_files + 1))
                    category_size=$((category_size + file_size))
                fi
            else
                log_warn "  Path not found: $source_path"
            fi
        done
        
        # Create category manifest
        if [[ $category_files -gt 0 ]]; then
            create_file_manifest "$category" "$category_dest"
        fi
        
        total_files=$((total_files + category_files))
        total_size=$((total_size + category_size))
        
        log_info "  $category completed: $category_files files ($(format_size $category_size))"
    done
    
    # Create final metadata
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    cat > "$BACKUP_DEST/metadata_complete.json" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "backup_type": "full",
    "start_time": "$(date -Iseconds -d "@$start_time")",
    "end_time": "$(date -Iseconds)",
    "duration_seconds": $duration,
    "hostname": "$(hostname)",
    "summary": {
        "total_files": $total_files,
        "total_size": $total_size,
        "categories": $(printf '"%s",' "${!BACKUP_CATEGORIES[@]}" | sed 's/,$//')
    },
    "status": "completed"
}
EOF
    
    # Generate overall checksums
    log_info "Generating backup checksums..."
    (
        cd "$BACKUP_DEST"
        find . -type f -name "*.json" -exec sha256sum {} \; > checksums.sha256
    )
    
    log_info "Full file backup completed in $(format_duration $duration)"
    log_info "Total: $total_files files ($(format_size $total_size))"
}

# Incremental file backup
backup_files_incremental() {
    log_info "Starting incremental file backup..."
    
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
    
    local start_time=$(date +%s)
    local current_time=$(date -Iseconds)
    local last_backup_epoch=$(date -d "$last_backup_time" +%s)
    
    # Create metadata
    cat > "$BACKUP_DEST/metadata.json" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "backup_type": "incremental",
    "start_time": "$current_time",
    "hostname": "$(hostname)",
    "base_backup": "$(basename "$last_full_backup")",
    "since_time": "$last_backup_time"
}
EOF

    local exclude_file=$(create_exclude_file)
    local total_files=0
    local total_size=0
    local has_changes=false
    
    # Process each category
    for category in "${!BACKUP_CATEGORIES[@]}"; do
        log_info "Checking $category for changes..."
        
        local category_dest="$BACKUP_DEST/$category"
        local category_paths="${CATEGORY_PATHS[$category]}"
        
        # Split paths by colon
        IFS=':' read -ra paths <<< "$category_paths"
        
        local category_files=0
        local category_size=0
        
        for source_path in "${paths[@]}"; do
            if [[ -d "$source_path" ]]; then
                # Find files modified since last backup
                local changed_files=$(find "$source_path" -type f -newer "$BACKUP_BASE_DIR/incremental/last_backup_time" 2>/dev/null || echo "")
                
                if [[ -n "$changed_files" ]]; then
                    has_changes=true
                    ensure_directory "$category_dest" "0700"
                    
                    log_info "  Found changes in: $source_path"
                    
                    # Copy only changed files, preserving directory structure
                    while IFS= read -r -d '' changed_file; do
                        local rel_path="${changed_file#$source_path/}"
                        local dest_file="$category_dest/$(basename "$source_path")/$rel_path"
                        
                        ensure_directory "$(dirname "$dest_file")" "0700"
                        
                        if safe_copy "$changed_file" "$dest_file"; then
                            local file_size=$(stat -c%s "$dest_file" 2>/dev/null || echo "0")
                            category_files=$((category_files + 1))
                            category_size=$((category_size + file_size))
                        fi
                    done < <(echo "$changed_files" | tr '\n' '\0')
                fi
            elif [[ -f "$source_path" ]]; then
                # Single file - check if modified
                local file_mtime=$(stat -c%Y "$source_path" 2>/dev/null || echo "0")
                
                if [[ $file_mtime -gt $last_backup_epoch ]]; then
                    has_changes=true
                    ensure_directory "$category_dest" "0700"
                    
                    local dest_file="$category_dest/$(basename "$source_path")"
                    if safe_copy "$source_path" "$dest_file"; then
                        local file_size=$(stat -c%s "$dest_file" 2>/dev/null || echo "0")
                        category_files=$((category_files + 1))
                        category_size=$((category_size + file_size))
                    fi
                fi
            fi
        done
        
        # Create category manifest if files were backed up
        if [[ $category_files -gt 0 ]]; then
            create_file_manifest "$category" "$category_dest"
            log_info "  $category: $category_files changed files ($(format_size $category_size))"
        else
            log_info "  $category: no changes"
        fi
        
        total_files=$((total_files + category_files))
        total_size=$((total_size + category_size))
    done
    
    if [[ "$has_changes" = false ]]; then
        log_info "No file changes found since last backup"
        rmdir "$BACKUP_DEST" 2>/dev/null || true
        return 0
    fi
    
    # Update last backup time
    echo "$current_time" > "$BACKUP_BASE_DIR/incremental/last_backup_time"
    
    # Complete metadata
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    cat > "$BACKUP_DEST/metadata_complete.json" <<EOF
{
    "backup_id": "$BACKUP_ID",
    "backup_type": "incremental",
    "start_time": "$(date -Iseconds -d "@$start_time")",
    "end_time": "$(date -Iseconds)",
    "duration_seconds": $duration,
    "hostname": "$(hostname)",
    "base_backup": "$(basename "$last_full_backup")",
    "since_time": "$last_backup_time",
    "summary": {
        "total_files": $total_files,
        "total_size": $total_size,
        "has_changes": true
    },
    "status": "completed"
}
EOF
    
    # Generate checksums
    (
        cd "$BACKUP_DEST"
        find . -type f -name "*.json" -exec sha256sum {} \; > checksums.sha256
    )
    
    log_info "Incremental file backup completed in $(format_duration $duration)"
    log_info "Changed files: $total_files ($(format_size $total_size))"
}

# Validate file backup
validate_file_backup() {
    local backup_path="$1"
    
    log_info "Validating file backup: $backup_path"
    
    # Check metadata exists
    if [[ ! -f "$backup_path/metadata_complete.json" ]]; then
        log_error "Backup validation failed: missing metadata"
        return 1
    fi
    
    # Verify checksums if they exist
    if [[ -f "$backup_path/checksums.sha256" ]]; then
        (
            cd "$backup_path"
            if ! sha256sum -c checksums.sha256 >/dev/null 2>&1; then
                log_error "Backup validation failed: checksum mismatch"
                return 1
            fi
        )
    fi
    
    # Check manifest files and verify random sampling of files
    local manifests=$(find "$backup_path" -name "*-manifest.json")
    for manifest in $manifests; do
        if [[ -f "$manifest" ]]; then
            # Verify manifest is valid JSON
            if ! jq . "$manifest" >/dev/null 2>&1; then
                log_error "Backup validation failed: invalid manifest JSON: $manifest"
                return 1
            fi
            
            # Randomly sample 10% of files for checksum verification
            local sample_count=$(jq '.files | length' "$manifest" | awk '{print int($1 * 0.1) + 1}')
            local total_count=$(jq '.files | length' "$manifest")
            
            log_info "Sampling $sample_count of $total_count files from $(basename "$manifest")"
            
            for ((i=0; i<sample_count; i++)); do
                local random_index=$((RANDOM % total_count))
                local file_info=$(jq ".files[$random_index]" "$manifest")
                local file_path=$(echo "$file_info" | jq -r '.path')
                local expected_checksum=$(echo "$file_info" | jq -r '.checksum')
                
                local full_path="$backup_path/$(dirname "$manifest")/$file_path"
                if [[ -f "$full_path" ]]; then
                    local actual_checksum=$(sha256sum "$full_path" | cut -d' ' -f1)
                    if [[ "$actual_checksum" != "$expected_checksum" ]]; then
                        log_error "Checksum mismatch for file: $file_path"
                        return 1
                    fi
                fi
            done
        fi
    done
    
    log_info "File backup validation passed"
    return 0
}

# Cleanup old file backups
cleanup_old_file_backups() {
    log_info "Cleaning up old file backups..."
    
    # Apply retention policy based on configuration
    apply_retention_policy "$BACKUP_BASE_DIR" "full" 90      # 90 days for full backups
    apply_retention_policy "$BACKUP_BASE_DIR" "incremental" 30  # 30 days for incremental
    
    log_info "File backup cleanup completed"
}

# Main execution
main() {
    log_info "HAOS-V2 File Backup System"
    log_info "=========================="
    
    # Acquire lock to prevent concurrent file backups
    if ! acquire_lock "file-backup" 3600; then
        log_error "Could not acquire backup lock"
        exit 1
    fi
    
    # Pre-flight checks
    check_required_tools "rsync" "find" "sha256sum" "jq" "stat"
    check_disk_space "$BACKUP_BASE_DIR" 20  # Require at least 20GB free
    
    # Start performance monitoring
    start_performance_monitor
    
    case "$BACKUP_TYPE" in
        "full")
            backup_files_full
            validate_file_backup "$BACKUP_DEST"
            ;;
        "incremental")
            backup_files_incremental
            if [[ -d "$BACKUP_DEST" ]]; then
                validate_file_backup "$BACKUP_DEST"
            fi
            ;;
        *)
            log_error "Invalid backup type: $BACKUP_TYPE"
            log_info "Valid types: full, incremental"
            exit 1
            ;;
    esac
    
    # Cleanup old backups
    cleanup_old_file_backups
    
    # Stop performance monitoring
    stop_performance_monitor
    
    # Release lock
    release_lock "file-backup"
    
    # Send success notification
    send_notification "success" "File backup completed successfully" "Backup ID: $BACKUP_ID, Type: $BACKUP_TYPE"
    
    log_info "File backup completed successfully"
}

# Error handler
handle_error() {
    local exit_code=$?
    stop_performance_monitor
    release_lock "file-backup"
    cleanup_temp_files
    handle_backup_error $exit_code "File backup failed"
}

trap 'handle_error' ERR

# Execute main function
main "$@"