#!/usr/bin/env bash

# HAOS-V2 Backup Common Functions
# Shared utilities and functions for backup scripts

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Global variables
SCRIPT_NAME=""
LOG_FILE=""
LOG_LEVEL="INFO"

# Logging functions
setup_logging() {
    local script_name="$1"
    SCRIPT_NAME="$script_name"
    LOG_FILE="/var/log/haos-backup/${script_name}-$(date +%Y%m%d).log"
    
    # Ensure log directory exists
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Start logging
    log_info "=== Starting $script_name at $(date) ==="
}

log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_entry="[$timestamp] [$level] $message"
    
    # Write to log file
    echo "$log_entry" >> "$LOG_FILE"
    
    # Write to stdout with colors
    case "$level" in
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message" >&2
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        *)
            echo "$message"
            ;;
    esac
}

log_error() {
    log_message "ERROR" "$1"
}

log_warn() {
    log_message "WARN" "$1"
}

log_info() {
    log_message "INFO" "$1"
}

log_success() {
    log_message "SUCCESS" "$1"
}

# Configuration loading
load_config() {
    local config_file="$1"
    
    if [[ ! -f "$config_file" ]]; then
        log_error "Configuration file not found: $config_file"
        exit 1
    fi
    
    # Check if yq is available for YAML parsing
    if command -v yq >/dev/null 2>&1; then
        log_info "Loading configuration from $config_file"
        # In a real implementation, you'd parse the YAML file here
        # For now, we'll assume environment variables are used
    else
        log_warn "yq not found, assuming configuration via environment variables"
    fi
}

# Check required tools
check_required_tools() {
    local missing_tools=()
    
    for tool in "$@"; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            missing_tools+=("$tool")
        fi
    done
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_error "Please install the missing tools and try again"
        exit 1
    fi
}

# File operations
ensure_directory() {
    local dir="$1"
    local permissions="${2:-0755}"
    
    if [[ ! -d "$dir" ]]; then
        mkdir -p "$dir"
        chmod "$permissions" "$dir"
        log_info "Created directory: $dir"
    fi
}

safe_copy() {
    local source="$1"
    local destination="$2"
    local verify="${3:-true}"
    
    if [[ ! -e "$source" ]]; then
        log_error "Source file does not exist: $source"
        return 1
    fi
    
    # Create destination directory if needed
    ensure_directory "$(dirname "$destination")"
    
    # Copy file
    cp "$source" "$destination"
    
    # Verify copy if requested
    if [[ "$verify" == "true" ]]; then
        if ! cmp "$source" "$destination" >/dev/null 2>&1; then
            log_error "File copy verification failed: $source -> $destination"
            return 1
        fi
    fi
    
    log_info "Copied: $source -> $destination"
    return 0
}

# Compression functions
compress_file() {
    local file="$1"
    local algorithm="${2:-gzip}"
    local level="${3:-6}"
    
    case "$algorithm" in
        "gzip")
            gzip -"$level" "$file"
            ;;
        "zstd")
            zstd -"$level" --rm "$file"
            ;;
        "xz")
            xz -"$level" "$file"
            ;;
        *)
            log_error "Unsupported compression algorithm: $algorithm"
            return 1
            ;;
    esac
}

# Encryption functions
encrypt_file() {
    local input_file="$1"
    local output_file="$2"
    local encryption_key="${BACKUP_ENCRYPTION_KEY:-}"
    
    if [[ -z "$encryption_key" ]]; then
        log_error "Encryption key not provided"
        return 1
    fi
    
    # Use OpenSSL for AES-256 encryption
    openssl enc -aes-256-cbc -salt -pbkdf2 -in "$input_file" -out "$output_file" -k "$encryption_key"
    
    if [[ $? -eq 0 ]]; then
        log_info "File encrypted: $input_file -> $output_file"
        return 0
    else
        log_error "Encryption failed: $input_file"
        return 1
    fi
}

decrypt_file() {
    local input_file="$1"
    local output_file="$2"
    local encryption_key="${BACKUP_ENCRYPTION_KEY:-}"
    
    if [[ -z "$encryption_key" ]]; then
        log_error "Encryption key not provided"
        return 1
    fi
    
    # Use OpenSSL for AES-256 decryption
    openssl enc -aes-256-cbc -d -pbkdf2 -in "$input_file" -out "$output_file" -k "$encryption_key"
    
    if [[ $? -eq 0 ]]; then
        log_info "File decrypted: $input_file -> $output_file"
        return 0
    else
        log_error "Decryption failed: $input_file"
        return 1
    fi
}

# Checksum functions
generate_checksum() {
    local file="$1"
    local algorithm="${2:-sha256}"
    
    case "$algorithm" in
        "md5")
            md5sum "$file" | cut -d' ' -f1
            ;;
        "sha256")
            sha256sum "$file" | cut -d' ' -f1
            ;;
        "sha512")
            sha512sum "$file" | cut -d' ' -f1
            ;;
        *)
            log_error "Unsupported checksum algorithm: $algorithm"
            return 1
            ;;
    esac
}

verify_checksum() {
    local file="$1"
    local expected_checksum="$2"
    local algorithm="${3:-sha256}"
    
    local actual_checksum=$(generate_checksum "$file" "$algorithm")
    
    if [[ "$actual_checksum" == "$expected_checksum" ]]; then
        log_info "Checksum verification passed: $file"
        return 0
    else
        log_error "Checksum verification failed: $file"
        log_error "Expected: $expected_checksum"
        log_error "Actual: $actual_checksum"
        return 1
    fi
}

# Storage operations
upload_to_s3() {
    local local_file="$1"
    local s3_path="$2"
    local storage_class="${3:-STANDARD_IA}"
    
    if [[ -z "${AWS_ACCESS_KEY_ID:-}" ]] || [[ -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
        log_error "AWS credentials not configured"
        return 1
    fi
    
    # Check if AWS CLI is available
    if ! command -v aws >/dev/null 2>&1; then
        log_error "AWS CLI not found"
        return 1
    fi
    
    aws s3 cp "$local_file" "$s3_path" --storage-class "$storage_class"
    
    if [[ $? -eq 0 ]]; then
        log_info "Uploaded to S3: $local_file -> $s3_path"
        return 0
    else
        log_error "S3 upload failed: $local_file"
        return 1
    fi
}

# Notification functions
send_notification() {
    local type="$1"    # success, error, warning, info
    local title="$2"
    local message="$3"
    
    # Slack notification
    send_slack_notification "$type" "$title" "$message"
    
    # Email notification
    send_email_notification "$type" "$title" "$message"
}

send_slack_notification() {
    local type="$1"
    local title="$2"
    local message="$3"
    local webhook_url="${SLACK_BACKUP_WEBHOOK:-}"
    
    if [[ -z "$webhook_url" ]]; then
        log_warn "Slack webhook URL not configured"
        return 0
    fi
    
    # Color based on type
    local color="#36a64f"  # green
    case "$type" in
        "error")
            color="#ff0000"  # red
            ;;
        "warning")
            color="#ff9500"  # orange
            ;;
        "info")
            color="#0099cc"  # blue
            ;;
    esac
    
    local payload=$(cat <<EOF
{
    "attachments": [
        {
            "color": "$color",
            "title": "$title",
            "text": "$message",
            "fields": [
                {
                    "title": "Host",
                    "value": "$(hostname)",
                    "short": true
                },
                {
                    "title": "Time",
                    "value": "$(date)",
                    "short": true
                }
            ]
        }
    ]
}
EOF
    )
    
    curl -X POST -H 'Content-type: application/json' --data "$payload" "$webhook_url" >/dev/null 2>&1
}

send_email_notification() {
    local type="$1"
    local title="$2"
    local message="$3"
    local smtp_host="${SMTP_HOST:-}"
    local from_email="${BACKUP_FROM_EMAIL:-backup-system@haos.com}"
    local to_emails="${BACKUP_TO_EMAILS:-}"
    
    if [[ -z "$smtp_host" ]] || [[ -z "$to_emails" ]]; then
        log_warn "Email configuration incomplete, skipping email notification"
        return 0
    fi
    
    # Create email body
    local email_body="Subject: HAOS-V2 Backup: $title

$message

Host: $(hostname)
Time: $(date)
Log: $LOG_FILE
"
    
    # Send email (requires mail command or sendmail)
    if command -v mail >/dev/null 2>&1; then
        echo "$email_body" | mail -s "HAOS-V2 Backup: $title" "$to_emails"
    else
        log_warn "mail command not found, cannot send email notification"
    fi
}

# System resource monitoring
check_disk_space() {
    local path="$1"
    local min_space_gb="${2:-10}"  # Minimum 10GB by default
    
    local available_space=$(df "$path" | awk 'NR==2 {print $4}')
    local available_gb=$((available_space / 1024 / 1024))
    
    if [[ $available_gb -lt $min_space_gb ]]; then
        log_error "Insufficient disk space: ${available_gb}GB available, ${min_space_gb}GB required"
        return 1
    fi
    
    log_info "Disk space check passed: ${available_gb}GB available"
    return 0
}

check_system_load() {
    local max_load="${1:-2.0}"
    
    local current_load=$(uptime | awk -F'load average:' '{ print $2 }' | awk '{ print $1 }' | sed 's/,//')
    
    # Compare load averages (basic check)
    if (( $(echo "$current_load > $max_load" | bc -l) )); then
        log_warn "High system load: $current_load (max: $max_load)"
        return 1
    fi
    
    log_info "System load check passed: $current_load"
    return 0
}

# Backup metadata management
create_backup_manifest() {
    local backup_dir="$1"
    local backup_id="$2"
    local backup_type="$3"
    
    local manifest_file="$backup_dir/MANIFEST"
    
    cat > "$manifest_file" <<EOF
# HAOS-V2 Backup Manifest
# Generated: $(date -Iseconds)

BACKUP_ID="$backup_id"
BACKUP_TYPE="$backup_type"
HOSTNAME="$(hostname)"
CREATED_AT="$(date -Iseconds)"
BACKUP_DIR="$backup_dir"

# Files included in this backup:
EOF
    
    # List all files in backup with checksums
    find "$backup_dir" -type f ! -name "MANIFEST" -exec sha256sum {} \; >> "$manifest_file"
    
    log_info "Backup manifest created: $manifest_file"
}

# Retention policy management
apply_retention_policy() {
    local backup_base_dir="$1"
    local backup_type="$2"
    local retention_days="$3"
    
    log_info "Applying retention policy: $backup_type backups older than $retention_days days"
    
    local deleted_count=0
    while IFS= read -r -d '' backup_dir; do
        rm -rf "$backup_dir"
        ((deleted_count++))
        log_info "Deleted old backup: $(basename "$backup_dir")"
    done < <(find "$backup_base_dir/$backup_type" -maxdepth 1 -type d -mtime +$retention_days -print0)
    
    log_info "Retention policy applied: $deleted_count old backups deleted"
}

# Performance monitoring
start_performance_monitor() {
    local pid_file="/tmp/backup_perf_monitor.pid"
    local log_file="/var/log/haos-backup/performance.log"
    
    # Start background monitoring
    (
        while true; do
            echo "$(date -Iseconds),$(uptime | awk -F'load average:' '{print $2}'),$(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2 }')" >> "$log_file"
            sleep 30
        done
    ) &
    
    echo $! > "$pid_file"
    log_info "Performance monitoring started (PID: $!)"
}

stop_performance_monitor() {
    local pid_file="/tmp/backup_perf_monitor.pid"
    
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if kill "$pid" 2>/dev/null; then
            log_info "Performance monitoring stopped (PID: $pid)"
        fi
        rm -f "$pid_file"
    fi
}

# Cleanup functions
cleanup_temp_files() {
    local temp_dir="${BACKUP_TEMP_DIR:-/tmp/haos-backup}"
    
    if [[ -d "$temp_dir" ]]; then
        rm -rf "$temp_dir"
        log_info "Cleaned up temporary directory: $temp_dir"
    fi
}

# Error handling
handle_backup_error() {
    local exit_code="$1"
    local error_message="${2:-Unknown error}"
    
    log_error "Backup failed: $error_message (exit code: $exit_code)"
    
    # Send error notification
    send_notification "error" "Backup Failed" "$error_message"
    
    # Cleanup
    cleanup_temp_files
    stop_performance_monitor
    
    exit "$exit_code"
}

# Lock management to prevent concurrent backups
acquire_lock() {
    local lock_name="$1"
    local lock_file="/tmp/haos-backup-${lock_name}.lock"
    local timeout="${2:-3600}"  # 1 hour default timeout
    
    local start_time=$(date +%s)
    
    while true; do
        if (set -C; echo $$ > "$lock_file") 2>/dev/null; then
            log_info "Lock acquired: $lock_name"
            return 0
        fi
        
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [[ $elapsed -gt $timeout ]]; then
            log_error "Failed to acquire lock within timeout: $lock_name"
            return 1
        fi
        
        sleep 5
    done
}

release_lock() {
    local lock_name="$1"
    local lock_file="/tmp/haos-backup-${lock_name}.lock"
    
    if [[ -f "$lock_file" ]]; then
        rm -f "$lock_file"
        log_info "Lock released: $lock_name"
    fi
}

# Utility functions
format_size() {
    local size_bytes="$1"
    
    if [[ $size_bytes -gt 1073741824 ]]; then
        echo "$(( size_bytes / 1073741824 ))GB"
    elif [[ $size_bytes -gt 1048576 ]]; then
        echo "$(( size_bytes / 1048576 ))MB"
    elif [[ $size_bytes -gt 1024 ]]; then
        echo "$(( size_bytes / 1024 ))KB"
    else
        echo "${size_bytes}B"
    fi
}

format_duration() {
    local seconds="$1"
    
    local hours=$((seconds / 3600))
    local minutes=$(((seconds % 3600) / 60))
    local secs=$((seconds % 60))
    
    if [[ $hours -gt 0 ]]; then
        printf "%dh %dm %ds" $hours $minutes $secs
    elif [[ $minutes -gt 0 ]]; then
        printf "%dm %ds" $minutes $secs
    else
        printf "%ds" $secs
    fi
}