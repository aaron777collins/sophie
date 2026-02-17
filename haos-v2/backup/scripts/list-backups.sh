#!/usr/bin/env bash

# HAOS-V2 Backup Listing Script
# Lists available backups with detailed information

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")"

# Load common functions
source "$SCRIPT_DIR/backup-common.sh"

# Parse command line arguments
BACKUP_TYPE="all"
SHOW_DETAILS=false
OUTPUT_FORMAT="table"
LIMIT=0

show_usage() {
    cat <<EOF
HAOS-V2 Backup Listing Tool

Usage: $0 [OPTIONS]

Options:
  --type TYPE       Backup type: all, database, files, system (default: all)
  --details         Show detailed backup information
  --format FORMAT   Output format: table, json, csv (default: table)
  --limit N         Limit number of backups to show (0 = no limit)
  --help            Show this help message

Examples:
  $0                                    # List all recent backups
  $0 --type database --details          # Show detailed database backups
  $0 --format json --limit 10           # Last 10 backups in JSON format
  $0 --type system --details            # Detailed system backups

EOF
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --type)
                BACKUP_TYPE="$2"
                shift 2
                ;;
            --details)
                SHOW_DETAILS=true
                shift
                ;;
            --format)
                OUTPUT_FORMAT="$2"
                shift 2
                ;;
            --limit)
                LIMIT="$2"
                shift 2
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                echo "Unknown option: $1" >&2
                show_usage
                exit 1
                ;;
        esac
    done
}

# Get backup information
get_backup_info() {
    local backup_path="$1"
    local backup_type="$2"
    
    local backup_id=$(basename "$backup_path")
    local backup_size="0"
    local backup_date="Unknown"
    local status="Unknown"
    local duration="N/A"
    
    # Get backup metadata
    local metadata_file=""
    if [[ -f "$backup_path/metadata_complete.json" ]]; then
        metadata_file="$backup_path/metadata_complete.json"
    elif [[ -f "$backup_path/backup-report.json" ]]; then
        metadata_file="$backup_path/backup-report.json"
    fi
    
    if [[ -n "$metadata_file" ]] && command -v jq >/dev/null 2>&1; then
        backup_date=$(jq -r '.end_time // .completed_at // "Unknown"' "$metadata_file" 2>/dev/null)
        status=$(jq -r '.status // "Unknown"' "$metadata_file" 2>/dev/null)
        duration=$(jq -r '.duration_seconds // 0' "$metadata_file" 2>/dev/null)
        
        if [[ "$duration" != "0" ]] && [[ "$duration" != "null" ]]; then
            duration=$(format_duration "$duration")
        else
            duration="N/A"
        fi
    fi
    
    # Get backup size
    if [[ -d "$backup_path" ]]; then
        backup_size=$(du -sb "$backup_path" 2>/dev/null | cut -f1 || echo "0")
    fi
    
    # Format date for better readability
    if [[ "$backup_date" != "Unknown" ]] && [[ "$backup_date" != "null" ]]; then
        backup_date=$(date -d "$backup_date" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "$backup_date")
    fi
    
    echo "$backup_id|$backup_type|$backup_date|$(format_size "$backup_size")|$status|$duration"
}

# List database backups
list_database_backups() {
    local backup_base="$BACKUP_DIR/storage/local/database"
    
    # Full backups
    if [[ -d "$backup_base/full" ]]; then
        find "$backup_base/full" -mindepth 1 -maxdepth 1 -type d | sort -r | while read -r backup_path; do
            get_backup_info "$backup_path" "database-full"
        done
    fi
    
    # Incremental backups
    if [[ -d "$backup_base/incremental" ]]; then
        find "$backup_base/incremental" -mindepth 1 -maxdepth 1 -type d | sort -r | while read -r backup_path; do
            get_backup_info "$backup_path" "database-incremental"
        done
    fi
}

# List file backups
list_file_backups() {
    local backup_base="$BACKUP_DIR/storage/local/files"
    
    # Full backups
    if [[ -d "$backup_base/full" ]]; then
        find "$backup_base/full" -mindepth 1 -maxdepth 1 -type d | sort -r | while read -r backup_path; do
            get_backup_info "$backup_path" "files-full"
        done
    fi
    
    # Incremental backups
    if [[ -d "$backup_base/incremental" ]]; then
        find "$backup_base/incremental" -mindepth 1 -maxdepth 1 -type d | sort -r | while read -r backup_path; do
            get_backup_info "$backup_path" "files-incremental"
        done
    fi
}

# List system backups
list_system_backups() {
    local backup_base="$BACKUP_DIR/storage/local/system"
    
    if [[ -d "$backup_base" ]]; then
        find "$backup_base" -mindepth 1 -maxdepth 1 -type d | sort -r | while read -r backup_path; do
            get_backup_info "$backup_path" "system"
        done
    fi
    
    # Also check for archived backups
    find "$backup_base" -name "haos-v2-backup-*.tar.*" 2>/dev/null | sort -r | while read -r archive_path; do
        local archive_id=$(basename "$archive_path" | sed 's/haos-v2-backup-\(.*\)\.tar\..*/\1/')
        local archive_size=$(stat -c%s "$archive_path" 2>/dev/null || echo "0")
        local archive_date=$(stat -c%y "$archive_path" 2>/dev/null | cut -d' ' -f1,2)
        
        echo "$archive_id|system-archive|$archive_date|$(format_size "$archive_size")|archived|N/A"
    done
}

# Get all backups
get_all_backups() {
    {
        list_database_backups
        list_file_backups  
        list_system_backups
    } | sort -t'|' -k3,3r  # Sort by date descending
}

# Apply limit if specified
apply_limit() {
    if [[ $LIMIT -gt 0 ]]; then
        head -n "$LIMIT"
    else
        cat
    fi
}

# Format output as table
format_table() {
    local header="BACKUP_ID|TYPE|DATE|SIZE|STATUS|DURATION"
    
    {
        echo "$header"
        cat
    } | column -t -s'|' -N "Backup ID,Type,Date,Size,Status,Duration" 2>/dev/null || {
        # Fallback if column doesn't support -N flag
        {
            echo "$header"
            cat
        } | column -t -s'|'
    }
}

# Format output as JSON
format_json() {
    local first=true
    echo "["
    
    while IFS='|' read -r backup_id backup_type backup_date backup_size status duration; do
        if [[ "$first" != "true" ]]; then
            echo ","
        fi
        first=false
        
        cat <<EOF
  {
    "backup_id": "$backup_id",
    "type": "$backup_type", 
    "date": "$backup_date",
    "size": "$backup_size",
    "status": "$status",
    "duration": "$duration"
  }EOF
    done
    
    echo ""
    echo "]"
}

# Format output as CSV
format_csv() {
    echo "backup_id,type,date,size,status,duration"
    while IFS='|' read -r backup_id backup_type backup_date backup_size status duration; do
        echo "$backup_id,$backup_type,$backup_date,$backup_size,$status,$duration"
    done
}

# Show detailed backup information
show_backup_details() {
    local backup_id="$1"
    local backup_type="$2"
    
    echo ""
    echo "=== Backup Details: $backup_id ==="
    echo "Type: $backup_type"
    
    # Find backup path
    local backup_path=""
    case "$backup_type" in
        "database-full"|"database-incremental")
            local db_type=$(echo "$backup_type" | cut -d'-' -f2)
            backup_path="$BACKUP_DIR/storage/local/database/$db_type/$backup_id"
            ;;
        "files-full"|"files-incremental")
            local file_type=$(echo "$backup_type" | cut -d'-' -f2)
            backup_path="$BACKUP_DIR/storage/local/files/$file_type/$backup_id"
            ;;
        "system")
            backup_path="$BACKUP_DIR/storage/local/system/$backup_id"
            ;;
        "system-archive")
            backup_path=$(find "$BACKUP_DIR/storage/local/system" -name "haos-v2-backup-${backup_id}.tar.*" | head -1)
            ;;
    esac
    
    if [[ -n "$backup_path" ]] && [[ -e "$backup_path" ]]; then
        echo "Path: $backup_path"
        
        # Show metadata if available
        local metadata_files=("metadata_complete.json" "backup-report.json" "metadata.json")
        for metadata_file in "${metadata_files[@]}"; do
            if [[ -f "$backup_path/$metadata_file" ]] && command -v jq >/dev/null 2>&1; then
                echo ""
                echo "Metadata ($metadata_file):"
                jq . "$backup_path/$metadata_file" 2>/dev/null || cat "$backup_path/$metadata_file"
                break
            fi
        done
        
        # Show file structure for directories
        if [[ -d "$backup_path" ]]; then
            echo ""
            echo "Contents:"
            find "$backup_path" -type f | head -20 | while read -r file; do
                local rel_path="${file#$backup_path/}"
                local file_size=$(stat -c%s "$file" 2>/dev/null || echo "0")
                echo "  $rel_path ($(format_size "$file_size"))"
            done
            
            local total_files=$(find "$backup_path" -type f | wc -l)
            if [[ $total_files -gt 20 ]]; then
                echo "  ... and $((total_files - 20)) more files"
            fi
        fi
    else
        echo "Backup path not found: $backup_path"
    fi
    
    echo ""
}

# Main function
main() {
    parse_arguments "$@"
    
    echo "HAOS-V2 Backup Listing"
    echo "======================"
    echo ""
    
    # Get backup list based on type
    local backup_data
    case "$BACKUP_TYPE" in
        "database")
            backup_data=$(list_database_backups)
            ;;
        "files")
            backup_data=$(list_file_backups)
            ;;
        "system")
            backup_data=$(list_system_backups)
            ;;
        "all")
            backup_data=$(get_all_backups)
            ;;
        *)
            echo "Invalid backup type: $BACKUP_TYPE" >&2
            show_usage
            exit 1
            ;;
    esac
    
    # Check if any backups found
    if [[ -z "$backup_data" ]]; then
        echo "No backups found for type: $BACKUP_TYPE"
        exit 0
    fi
    
    # Apply limit and format output
    case "$OUTPUT_FORMAT" in
        "table")
            echo "$backup_data" | apply_limit | format_table
            ;;
        "json")
            echo "$backup_data" | apply_limit | format_json
            ;;
        "csv")
            echo "$backup_data" | apply_limit | format_csv
            ;;
        *)
            echo "Invalid output format: $OUTPUT_FORMAT" >&2
            show_usage
            exit 1
            ;;
    esac
    
    # Show details if requested
    if [[ "$SHOW_DETAILS" == "true" ]] && [[ "$OUTPUT_FORMAT" == "table" ]]; then
        echo ""
        echo "Detailed Information:"
        echo "===================="
        
        echo "$backup_data" | apply_limit | while IFS='|' read -r backup_id backup_type backup_date backup_size status duration; do
            show_backup_details "$backup_id" "$backup_type"
        done
    fi
}

# Execute main function
main "$@"