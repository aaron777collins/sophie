#!/bin/bash
# Start SMS services (webhook server + ngrok tunnel)
# Usage: start-sms.sh [start|stop|status|restart]

set -e

SMS_DIR="$HOME/clawd/tools/sms"
PID_FILE="$HOME/clawd/data/sms/server.pid"
NGROK_PID_FILE="$HOME/clawd/data/sms/ngrok.pid"
LOG_DIR="$HOME/clawd/data/sms/logs"
PORT=8089

mkdir -p "$LOG_DIR" "$(dirname "$PID_FILE")"

start_server() {
    if [[ -f "$PID_FILE" ]] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Webhook server already running (PID $(cat "$PID_FILE"))"
    else
        echo "Starting webhook server on port $PORT..."
        nohup node "$SMS_DIR/webhook-server.js" > "$LOG_DIR/server.log" 2>&1 &
        echo $! > "$PID_FILE"
        sleep 1
        if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "✓ Webhook server started (PID $(cat "$PID_FILE"))"
        else
            echo "✗ Failed to start webhook server"
            return 1
        fi
    fi
}

start_ngrok() {
    if [[ -f "$NGROK_PID_FILE" ]] && kill -0 $(cat "$NGROK_PID_FILE") 2>/dev/null; then
        echo "ngrok already running (PID $(cat "$NGROK_PID_FILE"))"
        get_ngrok_url
    else
        if ! command -v ngrok &>/dev/null; then
            echo "✗ ngrok not installed. Install with: snap install ngrok"
            echo "  Or download from https://ngrok.com/download"
            return 1
        fi
        
        echo "Starting ngrok tunnel..."
        nohup ngrok http $PORT --log=stdout > "$LOG_DIR/ngrok.log" 2>&1 &
        echo $! > "$NGROK_PID_FILE"
        sleep 3
        
        if kill -0 $(cat "$NGROK_PID_FILE") 2>/dev/null; then
            get_ngrok_url
        else
            echo "✗ Failed to start ngrok"
            return 1
        fi
    fi
}

get_ngrok_url() {
    # Get the public URL from ngrok API
    url=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url // empty')
    if [[ -n "$url" ]]; then
        echo "✓ ngrok URL: $url"
        echo "  Webhook: $url/sms/inbound"
        echo ""
        echo "Configure in Twilio console:"
        echo "  Phone Number > Messaging > Webhook: $url/sms/inbound"
        echo "$url" > "$HOME/clawd/data/sms/ngrok-url.txt"
    else
        echo "? Could not get ngrok URL. Check $LOG_DIR/ngrok.log"
    fi
}

stop_server() {
    if [[ -f "$PID_FILE" ]]; then
        if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            kill $(cat "$PID_FILE")
            echo "✓ Stopped webhook server"
        fi
        rm -f "$PID_FILE"
    fi
}

stop_ngrok() {
    if [[ -f "$NGROK_PID_FILE" ]]; then
        if kill -0 $(cat "$NGROK_PID_FILE") 2>/dev/null; then
            kill $(cat "$NGROK_PID_FILE")
            echo "✓ Stopped ngrok"
        fi
        rm -f "$NGROK_PID_FILE"
    fi
    rm -f "$HOME/clawd/data/sms/ngrok-url.txt"
}

status() {
    echo "SMS Services Status"
    echo "==================="
    
    if [[ -f "$PID_FILE" ]] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Webhook Server: ✓ Running (PID $(cat "$PID_FILE"))"
        # Health check
        if curl -s http://localhost:$PORT/health | jq -e '.status == "ok"' >/dev/null 2>&1; then
            echo "  Health: ✓ OK"
        else
            echo "  Health: ? Not responding"
        fi
    else
        echo "Webhook Server: ✗ Not running"
    fi
    
    if [[ -f "$NGROK_PID_FILE" ]] && kill -0 $(cat "$NGROK_PID_FILE") 2>/dev/null; then
        echo "ngrok: ✓ Running (PID $(cat "$NGROK_PID_FILE"))"
        get_ngrok_url
    else
        echo "ngrok: ✗ Not running"
    fi
}

case "${1:-start}" in
    start)
        start_server
        start_ngrok
        ;;
    stop)
        stop_ngrok
        stop_server
        ;;
    restart)
        stop_ngrok
        stop_server
        sleep 1
        start_server
        start_ngrok
        ;;
    status)
        status
        ;;
    server-only)
        start_server
        ;;
    ngrok-only)
        start_ngrok
        ;;
    url)
        get_ngrok_url
        ;;
    *)
        echo "Usage: start-sms.sh [start|stop|restart|status|server-only|ngrok-only|url]"
        ;;
esac
