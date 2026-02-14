#!/bin/bash
# HAOS v2 Deployment Script for dev2
# Deploys the latest version with voice/video capabilities

set -e

REMOTE_HOST="dev2"
REMOTE_DIR="~/haos-v2"
LOCAL_DIR="$(dirname "$0")/.."

echo "🚀 HAOS v2 Deployment to dev2"
echo "=============================="

# Step 1: Sync code to remote
echo ""
echo "📦 Step 1: Syncing code to dev2..."
rsync -avz --exclude 'node_modules' \
           --exclude '.next' \
           --exclude '.git' \
           --exclude '*.log' \
           --delete \
           "$LOCAL_DIR/" "$REMOTE_HOST:$REMOTE_DIR/"

echo "✅ Code synced"

# Step 2: Build and deploy on remote
echo ""
echo "🔨 Step 2: Building and deploying Docker container..."
ssh "$REMOTE_HOST" << 'REMOTE_SCRIPT'
cd ~/haos-v2

echo "  Stopping existing container..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true

echo "  Pruning old images..."
docker image prune -f

echo "  Building new image..."
docker compose build --no-cache || docker-compose build --no-cache

echo "  Starting container..."
docker compose up -d || docker-compose up -d

echo "  Waiting for health check..."
sleep 10

# Check container health
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' haos-v2 2>/dev/null || echo "unknown")
echo "  Container health: $HEALTH"

# Show container logs
echo ""
echo "  Recent logs:"
docker logs haos-v2 --tail 20

REMOTE_SCRIPT

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Access HAOS v2 at: https://dev2.aaroncollins.info:3001"
echo "   Or via Caddy proxy if configured"
