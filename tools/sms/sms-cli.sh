#!/bin/bash
# SMS CLI - Send SMS via Twilio
# Usage: sms-cli.sh send <to_number> <message>
#        sms-cli.sh status
#        sms-cli.sh lookup <number>

set -e

# Load credentials
CREDS_FILE="$HOME/clawd/data/twilio-credentials.secret"
if [[ -f "$CREDS_FILE" ]]; then
    source "$CREDS_FILE"
else
    echo "Error: Credentials file not found at $CREDS_FILE"
    exit 1
fi

DB_FILE="$HOME/clawd/data/contacts/contacts.db"
LOG_DIR="$HOME/clawd/data/sms/logs"

# Normalize phone number (ensure +1 prefix for US)
normalize_phone() {
    local num="$1"
    # Remove all non-digit characters
    num=$(echo "$num" | tr -cd '0-9')
    # Add +1 if it's 10 digits (US number without country code)
    if [[ ${#num} -eq 10 ]]; then
        num="+1$num"
    elif [[ ${#num} -eq 11 && ${num:0:1} == "1" ]]; then
        num="+$num"
    else
        # Assume it already has country code
        num="+$num"
    fi
    echo "$num"
}

# Log message to DB
log_message() {
    local direction="$1"
    local from="$2"
    local to="$3"
    local body="$4"
    local sid="${5:-}"
    local status="${6:-sent}"
    
    sqlite3 "$DB_FILE" "INSERT INTO sms_messages (direction, from_number, to_number, body, twilio_sid, status) VALUES ('$direction', '$from', '$to', '$(echo "$body" | sed "s/'/''/g")', '$sid', '$status');" 2>/dev/null || true
}

# Send SMS
send_sms() {
    local to_raw="$1"
    local message="$2"
    
    if [[ -z "$to_raw" || -z "$message" ]]; then
        echo "Usage: sms-cli.sh send <to_number> <message>"
        exit 1
    fi
    
    local to=$(normalize_phone "$to_raw")
    
    # Send via Twilio API
    response=$(curl -s -X POST "https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json" \
        --data-urlencode "To=$to" \
        --data-urlencode "From=${TWILIO_PHONE_NUMBER}" \
        --data-urlencode "Body=$message" \
        -u "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}")
    
    # Parse response
    sid=$(echo "$response" | jq -r '.sid // empty')
    status=$(echo "$response" | jq -r '.status // empty')
    error=$(echo "$response" | jq -r '.message // empty')
    
    if [[ -n "$sid" && "$sid" != "null" ]]; then
        log_message "outbound" "$TWILIO_PHONE_NUMBER" "$to" "$message" "$sid" "$status"
        echo "✓ Sent to $to (SID: $sid)"
        echo "$response" >> "$LOG_DIR/outbound.log"
    else
        echo "✗ Failed to send: $error"
        echo "$(date -Iseconds) ERROR: $response" >> "$LOG_DIR/errors.log"
        exit 1
    fi
}

# Check account status
check_status() {
    response=$(curl -s "https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}.json" \
        -u "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}")
    
    status=$(echo "$response" | jq -r '.status')
    name=$(echo "$response" | jq -r '.friendly_name')
    
    echo "Account: $name"
    echo "Status: $status"
    echo "Phone: $TWILIO_PHONE_NUMBER"
    
    # Check recent messages
    recent=$(curl -s "https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json?PageSize=5" \
        -u "${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}" | jq -r '.messages | length')
    echo "Recent messages: $recent"
}

# Lookup phone trust level
lookup_phone() {
    local phone_raw="$1"
    local phone=$(normalize_phone "$phone_raw")
    
    # Check trusted_phones table
    trust=$(sqlite3 "$DB_FILE" "SELECT trust_level, owner FROM trusted_phones WHERE phone = '$phone' OR phone = '${phone:1}' OR phone = '${phone:2}';" 2>/dev/null)
    
    if [[ -n "$trust" ]]; then
        level=$(echo "$trust" | cut -d'|' -f1)
        owner=$(echo "$trust" | cut -d'|' -f2)
        echo "Phone: $phone"
        echo "Owner: $owner"
        echo "Trust: $level"
    else
        # Check contact_identifiers
        contact=$(sqlite3 "$DB_FILE" "SELECT c.name, c.trust_level FROM contacts c JOIN contact_identifiers ci ON c.id = ci.contact_id WHERE ci.platform = 'phone' AND ci.identifier = '$phone';" 2>/dev/null)
        
        if [[ -n "$contact" ]]; then
            name=$(echo "$contact" | cut -d'|' -f1)
            level=$(echo "$contact" | cut -d'|' -f2)
            echo "Phone: $phone"
            echo "Contact: $name"
            echo "Trust: $level"
        else
            echo "Phone: $phone"
            echo "Trust: none (unknown number)"
        fi
    fi
}

# Main
case "${1:-}" in
    send)
        send_sms "$2" "${*:3}"
        ;;
    status)
        check_status
        ;;
    lookup)
        lookup_phone "$2"
        ;;
    *)
        echo "SMS CLI for Sophie"
        echo ""
        echo "Usage:"
        echo "  sms-cli.sh send <to_number> <message>  - Send SMS"
        echo "  sms-cli.sh status                      - Check Twilio account"
        echo "  sms-cli.sh lookup <number>             - Check trust level"
        echo ""
        echo "Examples:"
        echo "  sms-cli.sh send +15175150233 'Hello Aaron!'"
        echo "  sms-cli.sh lookup 5175150233"
        ;;
esac
