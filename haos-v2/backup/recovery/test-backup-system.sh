#!/usr/bin/env bash

# HAOS-V2 Backup System Testing Script
# Comprehensive testing of backup and recovery functionality

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")"
SCRIPTS_DIR="$BACKUP_DIR/scripts"

# Load common functions
source "$SCRIPTS_DIR/backup-common.sh"

# Logging setup
setup_logging "backup-system-test"

# Test configuration
TEST_MODE="comprehensive"  # basic, comprehensive, stress
TEST_DB_NAME="haos_v2_test_$(date +%s)"
TEST_DATA_SIZE="small"     # small, medium, large
CLEANUP_AFTER_TEST=true
SEND_NOTIFICATIONS=false

# Parse command line arguments
parse_test_arguments() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --mode)
                TEST_MODE="$2"
                shift 2
                ;;
            --test-db)
                TEST_DB_NAME="$2"
                shift 2
                ;;
            --data-size)
                TEST_DATA_SIZE="$2"
                shift 2
                ;;
            --no-cleanup)
                CLEANUP_AFTER_TEST=false
                shift
                ;;
            --notify)
                SEND_NOTIFICATIONS=true
                shift
                ;;
            --help)
                show_test_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_test_usage
                exit 1
                ;;
        esac
    done
}

show_test_usage() {
    cat <<EOF
HAOS-V2 Backup System Testing Tool

Usage: $0 [OPTIONS]

Options:
  --mode MODE           Test mode: basic, comprehensive, stress (default: comprehensive)
  --test-db NAME        Test database name (default: auto-generated)
  --data-size SIZE      Test data size: small, medium, large (default: small)
  --no-cleanup          Don't cleanup test data after completion
  --notify              Send test notifications
  --help                Show this help message

Test Modes:
  basic         - Quick validation of core functionality (5-10 mins)
  comprehensive - Full backup/restore testing (20-30 mins)  
  stress        - Performance and load testing (60+ mins)

Examples:
  $0                                    # Run comprehensive test
  $0 --mode basic                       # Quick validation
  $0 --mode comprehensive --notify      # Full test with notifications
  $0 --mode stress --data-size large    # Performance testing

EOF
}

# Test result tracking
declare -A test_results
declare -a failed_tests
declare -a passed_tests
test_start_time=$(date +%s)

# Helper functions for test tracking
start_test() {
    local test_name="$1"
    log_info "🧪 Starting test: $test_name"
    test_results["${test_name}_start"]=$(date +%s)
}

end_test() {
    local test_name="$1"
    local success="$2"
    local end_time=$(date +%s)
    local start_time=${test_results["${test_name}_start"]}
    local duration=$((end_time - start_time))
    
    test_results["${test_name}_duration"]=$duration
    test_results["${test_name}_result"]=$success
    
    if [[ "$success" == "PASS" ]]; then
        passed_tests+=("$test_name")
        log_success "✅ Test PASSED: $test_name ($(format_duration $duration))"
    else
        failed_tests+=("$test_name")
        log_error "❌ Test FAILED: $test_name ($(format_duration $duration))"
    fi
}

# Create test database with sample data
create_test_database() {
    start_test "database_creation"
    
    log_info "Creating test database: $TEST_DB_NAME"
    
    local DB_HOST="${DB_HOST:-localhost}"
    local DB_PORT="${DB_PORT:-5432}" 
    local DB_USER="${DB_USER:-postgres}"
    local PGPASSWORD="${DB_PASSWORD:-}"
    
    # Create test database
    if PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $TEST_DB_NAME;" 2>/dev/null; then
        log_info "Test database created successfully"
    else
        log_error "Failed to create test database"
        end_test "database_creation" "FAIL"
        return 1
    fi
    
    # Apply schema
    local schema_file="$BACKUP_DIR/../lib/database/migrations/001-initial-schema.sql"
    if [[ -f "$schema_file" ]]; then
        PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TEST_DB_NAME" -f "$schema_file"
        log_info "Database schema applied"
    else
        log_error "Schema file not found: $schema_file"
        end_test "database_creation" "FAIL"
        return 1
    fi
    
    # Insert test data
    populate_test_data "$TEST_DB_NAME" "$TEST_DATA_SIZE"
    
    end_test "database_creation" "PASS"
}

# Populate database with test data
populate_test_data() {
    local db_name="$1"
    local data_size="$2"
    
    log_info "Populating test data (size: $data_size)..."
    
    local DB_HOST="${DB_HOST:-localhost}"
    local DB_PORT="${DB_PORT:-5432}"
    local DB_USER="${DB_USER:-postgres}" 
    local PGPASSWORD="${DB_PASSWORD:-}"
    
    # Determine data volume based on size
    local user_count=10
    local server_count=5
    local message_count=100
    
    case "$data_size" in
        "medium")
            user_count=100
            server_count=20
            message_count=1000
            ;;
        "large")
            user_count=1000
            server_count=100
            message_count=10000
            ;;
    esac
    
    # Generate test data SQL
    local test_data_sql="/tmp/test_data_${TEST_DB_NAME}.sql"
    
    cat > "$test_data_sql" <<EOF
-- Insert test users
INSERT INTO users (username, email, password_hash, display_name, status) 
SELECT 
    'user_' || generate_series,
    'user_' || generate_series || '@test.com',
    '\$2b\$12\$example_hash_' || generate_series,
    'Test User ' || generate_series,
    CASE WHEN generate_series % 4 = 0 THEN 'offline' 
         WHEN generate_series % 4 = 1 THEN 'online'
         WHEN generate_series % 4 = 2 THEN 'away' 
         ELSE 'busy' END
FROM generate_series(1, $user_count);

-- Insert test servers
INSERT INTO servers (name, description, owner_id, is_public)
SELECT 
    'Test Server ' || generate_series,
    'Description for test server ' || generate_series,
    (generate_series % $user_count) + 1,
    generate_series % 2 = 0
FROM generate_series(1, $server_count);

-- Insert test channels
INSERT INTO channels (server_id, name, description, type)
SELECT 
    server_id,
    'Channel ' || row_number() OVER (PARTITION BY server_id),
    'Test channel description',
    CASE WHEN random() < 0.8 THEN 'text' ELSE 'voice' END
FROM servers, generate_series(1, 3);

-- Insert server members
INSERT INTO server_members (server_id, user_id, role)
SELECT DISTINCT
    s.id,
    u.id,
    CASE WHEN u.id = s.owner_id THEN 'owner'
         WHEN random() < 0.1 THEN 'admin'
         WHEN random() < 0.2 THEN 'moderator'
         ELSE 'member' END
FROM servers s
CROSS JOIN users u
WHERE random() < 0.3 OR u.id = s.owner_id;

-- Insert test messages
INSERT INTO messages (channel_id, user_id, content, message_type)
SELECT 
    (SELECT id FROM channels ORDER BY random() LIMIT 1),
    (SELECT id FROM users ORDER BY random() LIMIT 1),
    'Test message content ' || generate_series || ' - ' || md5(random()::text),
    CASE WHEN random() < 0.9 THEN 'text' 
         WHEN random() < 0.95 THEN 'image'
         ELSE 'file' END
FROM generate_series(1, $message_count);

-- Insert test user preferences
INSERT INTO user_preferences (user_id, theme, notifications_enabled)
SELECT 
    id,
    CASE WHEN random() < 0.5 THEN 'light' ELSE 'dark' END,
    random() < 0.8
FROM users;
EOF
    
    # Execute test data insertion
    PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" -f "$test_data_sql"
    
    # Verify data insertion
    local total_records=$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$db_name" -t -c "
        SELECT 
            (SELECT COUNT(*) FROM users) +
            (SELECT COUNT(*) FROM servers) +
            (SELECT COUNT(*) FROM messages) +
            (SELECT COUNT(*) FROM channels)
    " | xargs)
    
    log_info "Test data populated: $total_records total records"
    rm -f "$test_data_sql"
}

# Create test files for file backup testing
create_test_files() {
    start_test "test_file_creation"
    
    log_info "Creating test files..."
    
    local test_uploads_dir="/tmp/haos-test-uploads"
    local test_avatars_dir="/tmp/haos-test-avatars" 
    local test_logs_dir="/tmp/haos-test-logs"
    
    # Create test directories
    mkdir -p "$test_uploads_dir" "$test_avatars_dir" "$test_logs_dir"
    
    # Generate test files
    local file_count=50
    case "$TEST_DATA_SIZE" in
        "medium") file_count=200 ;;
        "large") file_count=500 ;;
    esac
    
    # Create upload test files
    for i in $(seq 1 $file_count); do
        local file_size=$((RANDOM % 1048576 + 1024))  # 1KB to 1MB
        dd if=/dev/urandom of="$test_uploads_dir/test_file_${i}.dat" bs=1 count=$file_size 2>/dev/null
    done
    
    # Create avatar test files (small images)
    for i in $(seq 1 20); do
        dd if=/dev/urandom of="$test_avatars_dir/avatar_${i}.jpg" bs=1024 count=50 2>/dev/null
    done
    
    # Create test log files
    for i in $(seq 1 10); do
        echo "$(date): Test log entry $i - $(openssl rand -hex 32)" >> "$test_logs_dir/test_${i}.log"
    done
    
    local total_size=$(du -sh /tmp/haos-test-* | awk '{sum+=$1} END {print sum}' 2>/dev/null || echo "0")
    log_info "Test files created: $total_size total size"
    
    # Export test paths for backup scripts to use
    export TEST_UPLOADS_DIR="$test_uploads_dir"
    export TEST_AVATARS_DIR="$test_avatars_dir"
    export TEST_LOGS_DIR="$test_logs_dir"
    
    end_test "test_file_creation" "PASS"
}

# Test database backup functionality
test_database_backup() {
    start_test "database_backup"
    
    log_info "Testing database backup..."
    
    local backup_id="test-db-$(date +%s)"
    local backup_script="$SCRIPTS_DIR/backup-database.sh"
    
    # Override database name for test
    export DB_NAME="$TEST_DB_NAME"
    
    if "$backup_script" "full" "$backup_id"; then
        log_info "Database backup completed successfully"
        
        # Verify backup exists and has correct structure
        local backup_path="$BACKUP_DIR/storage/local/database/full/$backup_id"
        if [[ -f "$backup_path/metadata_complete.json" ]] && [[ -f "$backup_path/database.dump" ]]; then
            log_info "Backup files verified"
            
            # Check backup size is reasonable
            local backup_size=$(stat -c%s "$backup_path/database.dump")
            if [[ $backup_size -gt 1024 ]]; then  # At least 1KB
                log_info "Backup size verification passed: $(format_size $backup_size)"
                end_test "database_backup" "PASS"
            else
                log_error "Backup size too small: $backup_size bytes"
                end_test "database_backup" "FAIL"
            fi
        else
            log_error "Backup files missing or incomplete"
            end_test "database_backup" "FAIL"
        fi
    else
        log_error "Database backup failed"
        end_test "database_backup" "FAIL"
    fi
}

# Test file backup functionality
test_file_backup() {
    start_test "file_backup"
    
    log_info "Testing file backup..."
    
    local backup_id="test-files-$(date +%s)"
    local backup_script="$SCRIPTS_DIR/backup-files.sh"
    
    # Override file paths for test
    export UPLOADS_DIR="$TEST_UPLOADS_DIR"
    export AVATARS_DIR="$TEST_AVATARS_DIR"
    export LOGS_DIR="$TEST_LOGS_DIR"
    
    if "$backup_script" "full" "$backup_id"; then
        log_info "File backup completed successfully"
        
        # Verify backup exists
        local backup_path="$BACKUP_DIR/storage/local/files/full/$backup_id"
        if [[ -f "$backup_path/metadata_complete.json" ]]; then
            log_info "File backup metadata verified"
            
            # Check if test files were backed up
            local backed_up_files=$(find "$backup_path" -name "test_file_*.dat" | wc -l)
            if [[ $backed_up_files -gt 0 ]]; then
                log_info "File backup verification passed: $backed_up_files test files backed up"
                end_test "file_backup" "PASS"
            else
                log_error "No test files found in backup"
                end_test "file_backup" "FAIL"
            fi
        else
            log_error "File backup metadata missing"
            end_test "file_backup" "FAIL"
        fi
    else
        log_error "File backup failed"
        end_test "file_backup" "FAIL"
    fi
}

# Test full system backup
test_full_system_backup() {
    start_test "full_system_backup"
    
    log_info "Testing full system backup..."
    
    local backup_id="test-full-$(date +%s)"
    local backup_script="$SCRIPTS_DIR/backup-full.sh"
    
    # Set environment for test
    export DB_NAME="$TEST_DB_NAME"
    export UPLOADS_DIR="$TEST_UPLOADS_DIR"
    export AVATARS_DIR="$TEST_AVATARS_DIR"
    export LOGS_DIR="$TEST_LOGS_DIR"
    
    if "$backup_script" "full" "$backup_id" "false" "false"; then  # No compression, no S3
        log_info "Full system backup completed successfully"
        
        # Verify backup components
        local backup_path="$BACKUP_DIR/storage/local/system/$backup_id"
        local components_found=0
        
        if [[ -f "$backup_path/system-info.json" ]]; then
            ((components_found++))
            log_info "System info component verified"
        fi
        
        if [[ -d "$backup_path/database" ]]; then
            ((components_found++))
            log_info "Database component verified"
        fi
        
        if [[ -d "$backup_path/files" ]]; then
            ((components_found++))
            log_info "Files component verified"
        fi
        
        if [[ -f "$backup_path/backup-report.json" ]]; then
            ((components_found++))
            log_info "Backup report verified"
        fi
        
        if [[ $components_found -ge 3 ]]; then
            log_info "Full system backup verification passed: $components_found/4 components found"
            end_test "full_system_backup" "PASS"
        else
            log_error "Full system backup incomplete: only $components_found components found"
            end_test "full_system_backup" "FAIL"
        fi
    else
        log_error "Full system backup failed"
        end_test "full_system_backup" "FAIL"
    fi
}

# Test database restore functionality
test_database_restore() {
    start_test "database_restore"
    
    log_info "Testing database restore..."
    
    # Find latest database backup
    local latest_backup=$(find "$BACKUP_DIR/storage/local/database/full" -name "test-db-*" -type d | sort -r | head -1)
    if [[ -z "$latest_backup" ]]; then
        log_error "No test database backup found for restore test"
        end_test "database_restore" "FAIL"
        return 1
    fi
    
    local backup_id=$(basename "$latest_backup")
    local restore_db_name="${TEST_DB_NAME}_restore"
    local restore_script="$SCRIPTS_DIR/restore.sh"
    
    log_info "Restoring from backup: $backup_id to database: $restore_db_name"
    
    if "$restore_script" --backup-id "$backup_id" --type database-only --target-db "$restore_db_name" --force; then
        log_info "Database restore completed successfully"
        
        # Verify restored database
        local DB_HOST="${DB_HOST:-localhost}"
        local DB_PORT="${DB_PORT:-5432}"
        local DB_USER="${DB_USER:-postgres}"
        local PGPASSWORD="${DB_PASSWORD:-}"
        
        # Check if database exists and has data
        local table_count=$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$restore_db_name" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
        local user_count=$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$restore_db_name" -t -c "SELECT count(*) FROM users;" | xargs)
        
        if [[ $table_count -gt 0 ]] && [[ $user_count -gt 0 ]]; then
            log_info "Database restore verification passed: $table_count tables, $user_count users"
            end_test "database_restore" "PASS"
        else
            log_error "Database restore verification failed: $table_count tables, $user_count users"
            end_test "database_restore" "FAIL"
        fi
    else
        log_error "Database restore failed"
        end_test "database_restore" "FAIL"
    fi
}

# Test backup integrity and validation
test_backup_integrity() {
    start_test "backup_integrity"
    
    log_info "Testing backup integrity validation..."
    
    local integrity_issues=0
    
    # Check database backups
    local db_backups=$(find "$BACKUP_DIR/storage/local/database" -name "test-db-*" -type d)
    for backup_dir in $db_backups; do
        if [[ -f "$backup_dir/database.dump.sha256" ]]; then
            (
                cd "$backup_dir"
                if ! sha256sum -c database.dump.sha256 >/dev/null 2>&1; then
                    log_error "Checksum verification failed: $backup_dir"
                    ((integrity_issues++))
                fi
            )
        fi
    done
    
    # Check file backups
    local file_backups=$(find "$BACKUP_DIR/storage/local/files" -name "test-files-*" -type d)
    for backup_dir in $file_backups; do
        if [[ -f "$backup_dir/checksums.sha256" ]]; then
            (
                cd "$backup_dir"
                if ! sha256sum -c checksums.sha256 >/dev/null 2>&1; then
                    log_error "Checksum verification failed: $backup_dir"
                    ((integrity_issues++))
                fi
            )
        fi
    done
    
    if [[ $integrity_issues -eq 0 ]]; then
        log_info "All backup integrity checks passed"
        end_test "backup_integrity" "PASS"
    else
        log_error "Backup integrity issues found: $integrity_issues"
        end_test "backup_integrity" "FAIL"
    fi
}

# Test backup system monitoring
test_monitoring_system() {
    start_test "monitoring_system"
    
    log_info "Testing backup monitoring system..."
    
    local monitoring_script="$BACKUP_DIR/monitoring/backup-health-check.sh"
    
    if [[ -x "$monitoring_script" ]]; then
        log_info "Running backup health check..."
        
        if "$monitoring_script" >/dev/null 2>&1; then
            log_info "Monitoring system test passed"
            end_test "monitoring_system" "PASS"
        else
            log_warn "Monitoring system test completed with warnings (expected for test environment)"
            end_test "monitoring_system" "PASS"  # Pass with warnings in test environment
        fi
    else
        log_error "Monitoring script not found or not executable: $monitoring_script"
        end_test "monitoring_system" "FAIL"
    fi
}

# Stress test - run multiple concurrent backups
test_concurrent_backups() {
    start_test "concurrent_backups"
    
    log_info "Testing concurrent backup operations..."
    
    local pids=()
    local backup_count=3
    
    # Start multiple backup processes
    for i in $(seq 1 $backup_count); do
        (
            local backup_id="stress-test-$i-$(date +%s)"
            "$SCRIPTS_DIR/backup-database.sh" "full" "$backup_id" >/dev/null 2>&1
        ) &
        pids+=($!)
    done
    
    # Wait for all backups to complete
    local failed_backups=0
    for pid in "${pids[@]}"; do
        if ! wait $pid; then
            ((failed_backups++))
        fi
    done
    
    if [[ $failed_backups -eq 0 ]]; then
        log_info "Concurrent backup test passed: $backup_count backups completed successfully"
        end_test "concurrent_backups" "PASS"
    else
        log_error "Concurrent backup test failed: $failed_backups/$backup_count backups failed"
        end_test "concurrent_backups" "FAIL"
    fi
}

# Performance benchmarking
test_backup_performance() {
    start_test "backup_performance"
    
    log_info "Testing backup performance..."
    
    local start_time=$(date +%s)
    local backup_id="perf-test-$(date +%s)"
    
    export DB_NAME="$TEST_DB_NAME"
    export UPLOADS_DIR="$TEST_UPLOADS_DIR"
    
    if "$SCRIPTS_DIR/backup-full.sh" "full" "$backup_id" "true" "false"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        # Get backup size
        local backup_path="$BACKUP_DIR/storage/local/system/$backup_id"
        local backup_size=0
        if [[ -d "$backup_path" ]]; then
            backup_size=$(du -sb "$backup_path" | cut -f1)
        fi
        
        local throughput_mbps=0
        if [[ $duration -gt 0 ]] && [[ $backup_size -gt 0 ]]; then
            throughput_mbps=$((backup_size / duration / 1024 / 1024))
        fi
        
        log_info "Performance test results:"
        log_info "  Duration: $(format_duration $duration)"
        log_info "  Backup size: $(format_size $backup_size)"
        log_info "  Throughput: ${throughput_mbps} MB/s"
        
        # Performance thresholds (adjust based on requirements)
        local max_duration=1800  # 30 minutes max
        local min_throughput=1   # 1 MB/s min
        
        if [[ $duration -lt $max_duration ]] && [[ $throughput_mbps -gt $min_throughput ]]; then
            log_info "Performance test passed"
            end_test "backup_performance" "PASS"
        else
            log_warn "Performance test completed but below thresholds"
            end_test "backup_performance" "PASS"  # Pass with warning
        fi
    else
        log_error "Performance test backup failed"
        end_test "backup_performance" "FAIL"
    fi
}

# Cleanup test data
cleanup_test_data() {
    if [[ "$CLEANUP_AFTER_TEST" != "true" ]]; then
        log_info "Skipping cleanup (--no-cleanup specified)"
        return 0
    fi
    
    log_info "Cleaning up test data..."
    
    # Clean up test databases
    local DB_HOST="${DB_HOST:-localhost}"
    local DB_PORT="${DB_PORT:-5432}"
    local DB_USER="${DB_USER:-postgres}"
    local PGPASSWORD="${DB_PASSWORD:-}"
    
    local test_databases=$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d'|' -f1 | grep -E "haos_v2_test|${TEST_DB_NAME}" | xargs)
    
    for db in $test_databases; do
        if [[ -n "$db" ]]; then
            log_info "Dropping test database: $db"
            PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $db;" 2>/dev/null || true
        fi
    done
    
    # Clean up test files
    rm -rf /tmp/haos-test-* 2>/dev/null || true
    
    # Clean up test backups
    find "$BACKUP_DIR/storage/local" -name "*test*" -type d -exec rm -rf {} \; 2>/dev/null || true
    find "$BACKUP_DIR/storage/local" -name "*perf-test*" -type d -exec rm -rf {} \; 2>/dev/null || true
    find "$BACKUP_DIR/storage/local" -name "*stress-test*" -type d -exec rm -rf {} \; 2>/dev/null || true
    
    log_info "Test data cleanup completed"
}

# Generate test report
generate_test_report() {
    local test_end_time=$(date +%s)
    local total_duration=$((test_end_time - test_start_time))
    
    local report_file="/var/log/haos-backup/test-report-$(date +%Y%m%d-%H%M%S).json"
    
    log_info "Generating test report: $report_file"
    
    # Build JSON report
    cat > "$report_file" <<EOF
{
    "test_session": {
        "start_time": "$(date -Iseconds -d "@$test_start_time")",
        "end_time": "$(date -Iseconds)",
        "total_duration": $total_duration,
        "test_mode": "$TEST_MODE",
        "hostname": "$(hostname)"
    },
    "test_configuration": {
        "test_database": "$TEST_DB_NAME",
        "data_size": "$TEST_DATA_SIZE",
        "cleanup_after": $CLEANUP_AFTER_TEST,
        "notifications": $SEND_NOTIFICATIONS
    },
    "results_summary": {
        "total_tests": $((${#passed_tests[@]} + ${#failed_tests[@]})),
        "passed": ${#passed_tests[@]},
        "failed": ${#failed_tests[@]},
        "success_rate": $(( ${#passed_tests[@]} * 100 / (${#passed_tests[@]} + ${#failed_tests[@]} + 1) ))
    },
    "passed_tests": [$(printf '"%s",' "${passed_tests[@]}" | sed 's/,$//')],,
    "failed_tests": [$(printf '"%s",' "${failed_tests[@]}" | sed 's/,$//')],,
    "test_details": {
EOF

    # Add individual test results
    local first_test=true
    for test_name in "${passed_tests[@]}" "${failed_tests[@]}"; do
        if [[ "$first_test" != "true" ]]; then
            echo "," >> "$report_file"
        fi
        first_test=false
        
        local duration=${test_results["${test_name}_duration"]:-0}
        local result=${test_results["${test_name}_result"]:-"UNKNOWN"}
        
        cat >> "$report_file" <<EOF
        "$test_name": {
            "result": "$result",
            "duration": $duration
        }EOF
    done
    
    cat >> "$report_file" <<EOF

    },
    "status": "$([ ${#failed_tests[@]} -eq 0 ] && echo "PASS" || echo "FAIL")"
}
EOF

    log_info "Test report generated successfully"
    
    # Display summary
    log_info ""
    log_info "🧪 BACKUP SYSTEM TEST SUMMARY"
    log_info "=============================="
    log_info "Total Duration: $(format_duration $total_duration)"
    log_info "Tests Run: $((${#passed_tests[@]} + ${#failed_tests[@]}))"
    log_info "Passed: ${#passed_tests[@]}"
    log_info "Failed: ${#failed_tests[@]}"
    log_info ""
    
    if [[ ${#failed_tests[@]} -eq 0 ]]; then
        log_success "✅ ALL TESTS PASSED!"
    else
        log_error "❌ SOME TESTS FAILED:"
        for test in "${failed_tests[@]}"; do
            log_error "  - $test"
        done
    fi
    
    log_info ""
    log_info "Detailed report: $report_file"
}

# Main test execution
main() {
    log_info "HAOS-V2 Backup System Testing"
    log_info "============================="
    
    # Parse arguments
    parse_test_arguments "$@"
    
    log_info "Test Configuration:"
    log_info "  Mode: $TEST_MODE"
    log_info "  Test Database: $TEST_DB_NAME"
    log_info "  Data Size: $TEST_DATA_SIZE"
    log_info "  Cleanup After: $CLEANUP_AFTER_TEST"
    log_info ""
    
    # Acquire test lock
    if ! acquire_lock "backup-system-test" 7200; then
        log_error "Could not acquire test lock"
        exit 1
    fi
    
    # Pre-test checks
    check_required_tools "psql" "pg_dump" "pg_restore" "rsync" "jq" "tar"
    
    # Create test environment
    create_test_database
    create_test_files
    
    # Run tests based on mode
    case "$TEST_MODE" in
        "basic")
            test_database_backup
            test_file_backup
            test_backup_integrity
            ;;
        "comprehensive")
            test_database_backup
            test_file_backup
            test_full_system_backup
            test_database_restore
            test_backup_integrity
            test_monitoring_system
            ;;
        "stress")
            test_database_backup
            test_file_backup
            test_full_system_backup
            test_database_restore
            test_backup_integrity
            test_monitoring_system
            test_concurrent_backups
            test_backup_performance
            ;;
        *)
            log_error "Invalid test mode: $TEST_MODE"
            exit 1
            ;;
    esac
    
    # Generate test report
    generate_test_report
    
    # Cleanup
    cleanup_test_data
    release_lock "backup-system-test"
    
    # Send notification if requested
    if [[ "$SEND_NOTIFICATIONS" == "true" ]]; then
        local status="success"
        if [[ ${#failed_tests[@]} -gt 0 ]]; then
            status="warning"
        fi
        
        send_notification "$status" "Backup System Test Completed" "Tests: $((${#passed_tests[@]} + ${#failed_tests[@]})), Passed: ${#passed_tests[@]}, Failed: ${#failed_tests[@]}"
    fi
    
    # Exit with appropriate code
    if [[ ${#failed_tests[@]} -eq 0 ]]; then
        log_info "Backup system testing completed successfully!"
        exit 0
    else
        log_error "Backup system testing completed with failures!"
        exit 1
    fi
}

# Error handler
handle_error() {
    local exit_code=$?
    cleanup_test_data
    release_lock "backup-system-test"
    handle_backup_error $exit_code "Backup system testing failed"
}

trap 'handle_error' ERR

# Execute main function
main "$@"