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

# Human name (required)
read -p "👤 What's your name? (required): " HUMAN_NAME
while [ -z "$HUMAN_NAME" ]; do
    echo "   Name is required!"
    read -p "👤 What's your name?: " HUMAN_NAME
done

# Preferred name
read -p "📛 What should the agent call you? [$HUMAN_NAME]: " PREFERRED_NAME
PREFERRED_NAME="${PREFERRED_NAME:-$HUMAN_NAME}"

# Agent name
read -p "🤖 What should your AI agent be called? [Sophie]: " AGENT_NAME
AGENT_NAME="${AGENT_NAME:-Sophie}"

# Agent emoji
read -p "✨ Choose an emoji for your agent [✨]: " AGENT_EMOJI
AGENT_EMOJI="${AGENT_EMOJI:-✨}"

# Timezone
echo ""
echo "🌍 Timezone examples: America/New_York, America/Los_Angeles, Europe/London, Asia/Tokyo"
read -p "   Your timezone [UTC]: " TIMEZONE
TIMEZONE="${TIMEZONE:-UTC}"

# Location (optional)
read -p "📍 Your location (city/region, optional): " LOCATION
LOCATION="${LOCATION:-Not specified}"

echo ""
echo "📝 Describe yourself briefly (one line, or press Enter to skip):"
read -p "   " DESCRIPTION
DESCRIPTION="${DESCRIPTION:-A human working with AI.}"

echo ""
echo "🎯 What do you need help with? (comma-separated, or press Enter for defaults)"
echo "   Examples: project management, research, coding, writing, automation"
read -p "   > " HELP_AREAS
HELP_AREAS="${HELP_AREAS:-project management, research, general assistance}"

echo ""
echo "💡 Working style preferences? (comma-separated, or press Enter for defaults)"
echo "   Examples: be concise, push back on bad ideas, ask clarifying questions"
read -p "   > " PREFERENCES
PREFERENCES="${PREFERENCES:-be helpful, be thorough, ask when unsure}"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Creating your personalized workspace..."
echo ""

# Current date
CURRENT_DATE=$(date +%Y-%m-%d)

# --- Update USER.md ---
cp USER.md USER.md.bak

sed -i "s/{HUMAN_NAME}/$HUMAN_NAME/g" USER.md
sed -i "s/{PREFERRED_NAME}/$PREFERRED_NAME/g" USER.md
sed -i "s/{TIMEZONE}/$TIMEZONE/g" USER.md
sed -i "s/{LOCATION}/$LOCATION/g" USER.md
sed -i "s/{DATE}/$CURRENT_DATE/g" USER.md
sed -i "s/{DESCRIBE_YOURSELF}/$DESCRIPTION/g" USER.md

# Parse help areas into individual fields
IFS=',' read -ra AREAS <<< "$HELP_AREAS"
AREA_1=$(echo "${AREAS[0]:-project management}" | xargs)
AREA_2=$(echo "${AREAS[1]:-research}" | xargs)
AREA_3=$(echo "${AREAS[2]:-general assistance}" | xargs)
sed -i "s/{AREA_1}/$AREA_1/g" USER.md
sed -i "s/{AREA_2}/$AREA_2/g" USER.md
sed -i "s/{AREA_3}/$AREA_3/g" USER.md

# Parse preferences
IFS=',' read -ra PREFS <<< "$PREFERENCES"
PREF_1=$(echo "${PREFS[0]:-be helpful}" | xargs)
PREF_2=$(echo "${PREFS[1]:-be thorough}" | xargs)
PREF_3=$(echo "${PREFS[2]:-ask when unsure}" | xargs)
sed -i "s/{PREFERENCE_1}/$PREF_1/g" USER.md
sed -i "s/{PREFERENCE_2}/$PREF_2/g" USER.md
sed -i "s/{PREFERENCE_3}/$PREF_3/g" USER.md

echo "✅ Updated USER.md"

# --- Update IDENTITY.md (agent name references) ---
# The template IDENTITY.md uses "Sophie" as the default name
if [ "$AGENT_NAME" != "Sophie" ]; then
    sed -i "s/Sophie/$AGENT_NAME/g" IDENTITY.md
    sed -i "s/✨/$AGENT_EMOJI/g" IDENTITY.md
    echo "✅ Updated IDENTITY.md with agent name: $AGENT_NAME"
else
    echo "✅ IDENTITY.md (keeping default name: Sophie)"
fi

# --- Update AGENTS.md ---
if [ "$AGENT_NAME" != "Sophie" ]; then
    sed -i "s/Sophie/$AGENT_NAME/g" AGENTS.md
fi
echo "✅ Updated AGENTS.md"

# --- Create memory structure ---
mkdir -p memory/{daily,projects,topics,people,reflections/daily,reflections/insights,reflections/improvements}

# Create initial memory index
cat > memory/INDEX.md << EOF
# Memory Index

**Last Updated:** $CURRENT_DATE

## Active Projects

*None yet — projects will be tracked here as you work on them.*

## Key Topics

*Topics accumulate as you learn and work.*

## People

- [$HUMAN_NAME](people/${HUMAN_NAME// /_}.md) — Primary human

## Quick Links

- [Today's Log](daily/$CURRENT_DATE.md)
- [Reflections](reflections/)
EOF
echo "✅ Created memory/INDEX.md"

# Create first daily log
cat > "memory/daily/$CURRENT_DATE.md" << EOF
# $CURRENT_DATE — First Day

## Setup Complete

$AGENT_NAME workspace created and configured.

| Setting | Value |
|---------|-------|
| Human | $HUMAN_NAME |
| Timezone | $TIMEZONE |
| Location | $LOCATION |

## Session Log

*Conversations and events will be logged here.*
EOF
echo "✅ Created first daily log"

# Create human's people file
HUMAN_FILENAME="${HUMAN_NAME// /_}"
cat > "memory/people/$HUMAN_FILENAME.md" << EOF
# $HUMAN_NAME

**Relationship:** Primary human
**First Met:** $CURRENT_DATE (setup day)
**Last Updated:** $CURRENT_DATE

## Context

Primary user of this $AGENT_NAME workspace.

- **Timezone:** $TIMEZONE
- **Location:** $LOCATION

## Preferences

- $PREF_1
- $PREF_2
- $PREF_3

## Help Areas

- $AREA_1
- $AREA_2
- $AREA_3

## Notes

*Notes will accumulate as you work together.*
EOF
echo "✅ Created memory/people/$HUMAN_FILENAME.md"

# Create .gitkeep files for empty directories
find memory -type d -empty -exec touch {}/.gitkeep \;

# Mark as configured
date > .configured

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎉 Setup complete!"
echo ""
echo "Your $AGENT_NAME workspace is ready at:"
echo "   $SCRIPT_DIR"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Configure Clawdbot to use this workspace:"
echo ""
echo "   clawdbot config set agents.defaults.workspace \"$SCRIPT_DIR\""
echo ""
echo "2. (Optional) Set up proactive scheduling cron jobs:"
echo ""
echo "   See docs/CRON-SETUP.md for the recommended cron configuration."
echo "   This enables Person Manager, Coordinator, and Task Manager agents."
echo ""
echo "3. Start your first conversation:"
echo ""
echo "   Ask: \"Hey, who are you?\""
echo "   Your agent will introduce itself and get to know you!"
echo ""
echo "4. Read the documentation:"
echo ""
echo "   - AGENTS.md      — How the systems work"
echo "   - docs/          — Detailed system documentation"
echo "   - SOUL.md        — Your agent's personality"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Enjoy your new AI partner! $AGENT_EMOJI"
echo ""
