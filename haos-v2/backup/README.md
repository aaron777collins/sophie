# HAOS-V2 Backup and Recovery System

This directory contains the comprehensive backup and recovery system for HAOS-V2 production data.

## 📋 System Overview

The backup system protects the following critical data:

### 🗃️ Database (PostgreSQL)
- User accounts and authentication data
- Server/channel configurations
- Messages and message history
- File attachments metadata
- User preferences and settings
- Session data

### 📁 File Storage
- User-uploaded attachments
- Profile avatars
- Server/channel icons
- Application logs
- Configuration files

### ⚙️ Configuration
- Environment variables
- Application secrets
- SSL certificates
- Nginx configurations

## 🏗️ Architecture

```
backup/
├── scripts/              # Backup execution scripts
│   ├── backup-database.sh
│   ├── backup-files.sh
│   ├── backup-full.sh
│   └── restore.sh
├── configs/              # Backup configurations
│   ├── backup-config.yaml
│   └── retention-policy.yaml  
├── monitoring/           # Health checks and monitoring
│   ├── backup-monitor.sh
│   └── alerts/
├── recovery/            # Recovery procedures and tests
│   ├── recovery-procedures.md
│   ├── test-restore.sh
│   └── disaster-recovery.md
└── storage/             # Backup storage destinations
    ├── local/
    ├── s3/
    └── remote/
```

## 🚀 Quick Start

### Setup
```bash
# Initialize backup system
./scripts/setup-backup.sh

# Test backup configuration  
./scripts/test-backup.sh

# Run manual backup
./scripts/backup-full.sh
```

### Restore
```bash
# List available backups
./scripts/list-backups.sh

# Restore from specific backup
./scripts/restore.sh --backup-id 20240216-150000

# Disaster recovery (full system restore)
./recovery/disaster-recovery.sh --backup-id 20240216-150000
```

## 📊 Backup Types

| Type | Frequency | Retention | Size | Recovery Time |
|------|-----------|-----------|------|---------------|
| **Continuous WAL** | Real-time | 7 days | Small | < 1 minute |
| **Incremental** | Every 6 hours | 30 days | Medium | < 15 minutes |
| **Full Database** | Daily | 90 days | Large | < 30 minutes |
| **Complete System** | Weekly | 1 year | Very Large | < 2 hours |

## 🔐 Security

- All backups are encrypted at rest using AES-256
- Database dumps exclude sensitive authentication tokens
- File-level encryption for off-site storage
- Access control with role-based permissions
- Backup integrity verification with checksums

## 📈 Monitoring

- Backup success/failure notifications via Slack
- Grafana dashboard for backup metrics
- Automated backup validation tests
- Recovery time objective (RTO): 4 hours
- Recovery point objective (RPO): 1 hour

## 🆘 Emergency Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| Primary | DevOps Team | Immediate |
| Secondary | System Admin | 30 minutes |
| Emergency | CTO/Aaron | 1 hour |

---

For detailed procedures, see individual documentation in each subdirectory.