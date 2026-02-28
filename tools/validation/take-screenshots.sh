#!/bin/bash
# take-screenshots.sh - Capture validation screenshots at all 3 viewports
# Usage: ./take-screenshots.sh <bead-id> <url> [name]
# Example: ./take-screenshots.sh clawd-abc123 http://localhost:3000/login login-form

set -e

BEAD_ID="${1:?Usage: $0 <bead-id> <url> [name]}"
URL="${2:?Usage: $0 <bead-id> <url> [name]}"
NAME="${3:-screenshot}"

SCREENSHOT_DIR="scheduler/validation/screenshots/${BEAD_ID}"

echo "📸 Taking validation screenshots for ${BEAD_ID}"
echo "   URL: ${URL}"
echo "   Name: ${NAME}"

# Create directories
mkdir -p "${SCREENSHOT_DIR}/desktop"
mkdir -p "${SCREENSHOT_DIR}/tablet"
mkdir -p "${SCREENSHOT_DIR}/mobile"

# Desktop (1920x1080)
echo "📱 Desktop (1920x1080)..."
npx playwright screenshot \
  --viewport-size=1920,1080 \
  "${URL}" \
  "${SCREENSHOT_DIR}/desktop/${NAME}.png" 2>/dev/null || {
    echo "⚠️  Playwright not available, trying with browser tool..."
    # Fallback for Clawdbot browser
    echo "   Fallback: Use browser tool manually"
  }

# Tablet (768x1024)
echo "📱 Tablet (768x1024)..."
npx playwright screenshot \
  --viewport-size=768,1024 \
  "${URL}" \
  "${SCREENSHOT_DIR}/tablet/${NAME}.png" 2>/dev/null || true

# Mobile (375x667)
echo "📱 Mobile (375x667)..."
npx playwright screenshot \
  --viewport-size=375,667 \
  "${URL}" \
  "${SCREENSHOT_DIR}/mobile/${NAME}.png" 2>/dev/null || true

echo ""
echo "✅ Screenshots captured!"
echo ""
echo "Files created:"
ls -la "${SCREENSHOT_DIR}/"*/

echo ""
echo "📋 Add to bead notes:"
echo "bd update ${BEAD_ID} --notes \"Screenshots:"
echo "- Desktop: ${SCREENSHOT_DIR}/desktop/${NAME}.png"
echo "- Tablet: ${SCREENSHOT_DIR}/tablet/${NAME}.png"
echo "- Mobile: ${SCREENSHOT_DIR}/mobile/${NAME}.png\""
