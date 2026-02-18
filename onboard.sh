#!/bin/bash
# SOPHIE Onboarding Script
# Sets up a personalized AI workspace

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           SOPHIE - AI Workspace Setup Wizard                   ║"
echo "║  Sophisticated Omnichannel Personal Help & Info Engine         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check if already configured
if [ -f ".configured" ]; then
    echo "⚠️  This workspace appears to be already configured."
    read -p "Do you want to reconfigure? (y/N): " RECONFIG
    if [[ ! "$RECONFIG" =~ ^[Yy]$ ]]; then
        echo "Exiting. Your existing configuration is preserved."
        exit 0
    fi
fi

echo "Let's set up your AI workspace!"
echo ""

# Agent name
read -p "🤖 What should your AI agent be called? [Sophie]: " AGENT_NAME
AGENT_NAME="${AGENT_NAME:-Sophie}"

# Agent emoji
read -p "✨ Choose an emoji for your agent [✨]: " AGENT_EMOJI
AGENT_EMOJI="${AGENT_EMOJI:-✨}"

# Human name
read -p "👤 What's your name?: " HUMAN_NAME
if [ -z "$HUMAN_NAME" ]; then
    echo "Name is required!"
    exit 1
fi

# Preferred name
read -p "📛 What should the agent call you? [$HUMAN_NAME]: " PREFERRED_NAME
PREFERRED_NAME="${PREFERRED_NAME:-$HUMAN_NAME}"

# Timezone
read -p "🌍 Your timezone (e.g., America/New_York, Europe/London): " TIMEZONE
TIMEZONE="${TIMEZONE:-UTC}"

# Location (optional)
read -p "📍 Your location (optional, for weather/local context): " LOCATION

echo ""
echo "📝 Tell me about yourself (for USER.md):"
echo "   Press Enter twice when done."
echo ""
DESCRIPTION=""
while IFS= read -r line; do
    [[ -z "$line" ]] && break
    DESCRIPTION+="$line"$'\n'
done

echo ""
echo "🎯 What do you need help with? (comma-separated)"
read -p "   e.g., project management, research, coding: " HELP_AREAS

echo ""
echo "💡 Any working style preferences? (comma-separated)"
read -p "   e.g., be concise, push back on bad ideas: " PREFERENCES

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Creating your personalized workspace..."
echo ""

# Current date
CURRENT_DATE=$(date +%Y-%m-%d)

# Update IDENTITY.md
sed -i "s/{YOUR_AGENT_NAME}/$AGENT_NAME/g" IDENTITY.md
sed -i "s/{DATE}/$CURRENT_DATE/g" IDENTITY.md
sed -i "s/{HUMAN_NAME}/$HUMAN_NAME/g" IDENTITY.md
sed -i "s/✨/$AGENT_EMOJI/g" IDENTITY.md
echo "✅ Updated IDENTITY.md"

# Update USER.md
sed -i "s/{YOUR_NAME}/$HUMAN_NAME/g" USER.md
sed -i "s/{PREFERRED_NAME}/$PREFERRED_NAME/g" USER.md
sed -i "s/{TIMEZONE}/$TIMEZONE/g" USER.md
sed -i "s/{LOCATION}/$LOCATION/g" USER.md
sed -i "s/{DATE}/$CURRENT_DATE/g" USER.md

# Handle multi-line description
if [ -n "$DESCRIPTION" ]; then
    # Escape for sed
    ESCAPED_DESC=$(echo "$DESCRIPTION" | sed ':a;N;$!ba;s/\n/\\n/g')
    sed -i "s/{DESCRIBE_YOURSELF}/$ESCAPED_DESC/g" USER.md
fi

# Parse help areas
IFS=',' read -ra AREAS <<< "$HELP_AREAS"
for i in "${!AREAS[@]}"; do
    AREA=$(echo "${AREAS[$i]}" | xargs)  # trim whitespace
    sed -i "s/{AREA_$((i+1))}/$AREA/g" USER.md
done

# Parse preferences
IFS=',' read -ra PREFS <<< "$PREFERENCES"
for i in "${!PREFS[@]}"; do
    PREF=$(echo "${PREFS[$i]}" | xargs)
    sed -i "s/{PREFERENCE_$((i+1))}/$PREF/g" USER.md
done

echo "✅ Updated USER.md"

# Update AGENTS.md
sed -i "s/{AGENT_NAME}/$AGENT_NAME/g" AGENTS.md
sed -i "s/{HUMAN_NAME}/$HUMAN_NAME/g" AGENTS.md
echo "✅ Updated AGENTS.md"

# Create initial memory index
cat > memory/INDEX.md << EOF
# Memory Index

**Last Updated:** $CURRENT_DATE

## Active Projects

*None yet*

## Key Topics

*Topics will accumulate as you work*

## People

- [$HUMAN_NAME](people/$HUMAN_NAME.md) - Primary user

## Recent Daily Logs

- [$CURRENT_DATE](daily/$CURRENT_DATE.md) - First day
EOF
echo "✅ Created memory/INDEX.md"

# Create first daily log
cat > "memory/daily/$CURRENT_DATE.md" << EOF
# $CURRENT_DATE Daily Log

## First Day

$AGENT_NAME workspace created and configured.

- **Human:** $HUMAN_NAME
- **Timezone:** $TIMEZONE
- **Location:** $LOCATION

## Session Log

*Conversations will be logged here*
EOF
echo "✅ Created first daily log"

# Create human's people file
mkdir -p memory/people
cat > "memory/people/$HUMAN_NAME.md" << EOF
# $HUMAN_NAME

**First Met:** $CURRENT_DATE (setup day)
**Last Updated:** $CURRENT_DATE

## Context

Primary user of this $AGENT_NAME workspace.

**Timezone:** $TIMEZONE
**Location:** $LOCATION

## Preferences

$(IFS=$'\n'; echo "${PREFS[*]}" | sed 's/^/- /')

## Notes

*Notes will accumulate as you work together*
EOF
echo "✅ Created memory/people/$HUMAN_NAME.md"

# Mark as configured
touch .configured

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎉 Setup complete!"
echo ""
echo "Your $AGENT_NAME workspace is ready at: $SCRIPT_DIR"
echo ""
echo "Next steps:"
echo "  1. Point your Clawdbot at this workspace:"
echo "     clawdbot config set agents.defaults.workspace $SCRIPT_DIR"
echo ""
echo "  2. Start a conversation:"
echo "     Ask your agent: 'Hey, who are you?'"
echo ""
echo "  3. Read the docs:"
echo "     - AGENTS.md - How the systems work"
echo "     - docs/ - Detailed system documentation"
echo ""
echo "Enjoy your new AI partner! $AGENT_EMOJI"
