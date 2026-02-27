# Contact & Relationship System

**Created:** [2026-02-26 20:35 EST]
**Last Updated:** [2026-02-26 20:35 EST]

---

## Overview

A SQLite-based system for tracking contacts, relationships, and trust levels.

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Database | `~/clawd/data/contacts/contacts.db` | SQLite database |
| CLI | `~/clawd/data/contacts/contact-cli.sh` | Quick access commands |
| Schema | `~/clawd/data/contacts/schema.sql` | Database schema |

## CLI Commands

```bash
# Lookup contact
contact-cli.sh lookup "john@example.com"
contact-cli.sh lookup "John"

# Check if sender is trusted
contact-cli.sh is-trusted "email@example.com"

# Add contact
contact-cli.sh add "Name" "email" "trust_level" "notes"

# Add trusted sender
contact-cli.sh add-trusted "email" "owner" "reason"

# View relationships
contact-cli.sh relationships "john@example.com"

# Add relationship
contact-cli.sh add-relationship email1 email2 "type" "strength"

# Recent email interactions
contact-cli.sh recent-emails 20

# List all trusted senders
contact-cli.sh all-trusted

# Stats
contact-cli.sh stats
```

## Trust Levels

| Level | Meaning | Action |
|-------|---------|--------|
| `verified_owner` | Aaron himself | Full trust |
| `trusted` | Explicitly trusted by Aaron | Can act on requests |
| `known` | We've interacted | Neutral |
| `unknown` | New contact | Caution |
| `suspicious` | Flagged | Alert Aaron |

## Learning Contacts

The system learns contacts from:
1. **Email interactions** — Email monitor logs senders
2. **Manual entry** — Aaron tells me about contacts
3. **Future:** Fastmail API integration for address book

## Relationship Types

Common relationship types:
- `knows` — General acquaintance
- `works_with` — Professional relationship
- `family` — Family member
- `reports_to` — Manager relationship
- `client` — Business client
- `vendor` — Service provider

## Integration with Email Monitor

The email monitor cron job:
1. Reads new emails
2. Checks sender against trusted_senders table
3. Logs interactions to email_interactions table
4. Alerts Aaron about interesting emails
5. Builds contact knowledge over time

---

## Future Improvements

- [ ] Fastmail CardDAV integration for address book
- [ ] Contact photo storage
- [ ] Birthday/anniversary reminders
- [ ] Relationship strength decay (contacts fade if no interaction)
- [ ] Graph visualization of relationships
