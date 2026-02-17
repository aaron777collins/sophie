# HAOS-V2 Disaster Recovery Procedures

This document outlines comprehensive disaster recovery procedures for HAOS-V2 production systems.

## 🚨 Emergency Response

### Immediate Actions (First 30 minutes)

1. **Assessment**
   - Identify scope of disaster (hardware, software, data corruption, security breach)
   - Determine if system is completely down or partially functional
   - Document what happened and when

2. **Communication**
   - Notify stakeholders via emergency contact list
   - Activate incident response team
   - Begin incident log

3. **Safety First**
   - If security breach suspected, isolate affected systems
   - Preserve evidence if needed for forensics
   - Take system snapshots if partially functional

## 🔄 Recovery Scenarios

### Scenario 1: Complete Hardware Failure

**Symptoms:** Server completely inaccessible, hardware confirmed failed

**Recovery Steps:**
```bash
# 1. Provision new hardware/server
# 2. Install base operating system
# 3. Install backup system dependencies
sudo apt update && sudo apt install -y postgresql-client rsync zstd jq curl

# 4. Restore from latest full backup
./restore.sh --backup-id LATEST --type full --force

# 5. Update DNS/load balancer to point to new server
# 6. Verify application functionality
```

**Estimated RTO:** 2-4 hours  
**Estimated RPO:** Up to 24 hours (last full backup)

---

### Scenario 2: Database Corruption/Loss

**Symptoms:** Application errors, database connection failures, corrupted data

**Recovery Steps:**
```bash
# 1. Stop application to prevent further damage
sudo systemctl stop haos-v2

# 2. Create backup of corrupted database (if accessible)
pg_dump -h localhost -U postgres haos_v2 > corrupted_backup_$(date +%Y%m%d).sql

# 3. Restore from latest clean backup
./restore.sh --backup-id LATEST --type database-only --force

# 4. If recent backup not available, restore to point-in-time
# (Using WAL files for point-in-time recovery)
./restore.sh --backup-id LATEST --type database-only --target-db haos_v2_temp
# Then use pg_restore with specific timestamp

# 5. Verify data integrity
psql -h localhost -U postgres -d haos_v2 -c "SELECT COUNT(*) FROM users;"

# 6. Restart application
sudo systemctl start haos-v2
```

**Estimated RTO:** 30 minutes - 2 hours  
**Estimated RPO:** Up to 1 hour (WAL archiving)

---

### Scenario 3: File System Corruption

**Symptoms:** Missing files, permission errors, corrupt uploads

**Recovery Steps:**
```bash
# 1. Identify affected file systems
df -h
sudo fsck /dev/sda1  # Check filesystem integrity

# 2. Mount filesystem in read-only mode if possible
sudo mount -o remount,ro /affected/filesystem

# 3. Restore files from backup
./restore.sh --backup-id LATEST --type files-only --force

# 4. Verify file integrity
find /app/uploads -name "*.jpg" -exec file {} \; | grep -v "JPEG image"

# 5. Update file permissions
sudo chown -R www-data:www-data /app/uploads
sudo find /app/uploads -type f -exec chmod 644 {} \;
```

**Estimated RTO:** 1-3 hours  
**Estimated RPO:** Up to 6 hours (incremental file backups)

---

### Scenario 4: Security Breach/Ransomware

**Symptoms:** Encrypted files, unauthorized access, suspicious activity

**Recovery Steps:**
```bash
# 1. IMMEDIATE ISOLATION
# Disconnect from network
sudo ip link set eth0 down

# Take system offline from load balancer
# Notify security team

# 2. Evidence preservation (if required)
sudo dd if=/dev/sda of=/forensics/disk_image.dd bs=4M

# 3. Assess damage and infection scope
sudo rkhunter --check
sudo clamscan -r /

# 4. If system compromised, rebuild from clean backup
# Provision new clean server
# Restore from backup created BEFORE breach

# 5. Security hardening
# Update all passwords
# Rotate SSL certificates
# Apply security patches
# Review access logs
```

**Estimated RTO:** 4-8 hours  
**Estimated RPO:** Variable (depends on when breach occurred)

---

### Scenario 5: Application Configuration Loss

**Symptoms:** Application won't start, configuration errors

**Recovery Steps:**
```bash
# 1. Restore configuration files
./restore.sh --backup-id LATEST --type config-only

# 2. Verify environment variables
cat /app/.env.production

# 3. Rebuild application if needed
cd /app
npm install
npm run build

# 4. Restart services
sudo systemctl restart haos-v2
sudo systemctl restart nginx
```

**Estimated RTO:** 15-30 minutes  
**Estimated RPO:** Up to 24 hours

## 🔍 Recovery Validation

### Post-Recovery Checklist

- [ ] **Database Connectivity**
  ```bash
  psql -h localhost -U postgres -d haos_v2 -c "SELECT version();"
  ```

- [ ] **Data Integrity**
  ```bash
  psql -h localhost -U postgres -d haos_v2 -c "
    SELECT 
      'users' as table_name, COUNT(*) as count FROM users
    UNION ALL
    SELECT 'messages', COUNT(*) FROM messages
    UNION ALL 
    SELECT 'servers', COUNT(*) FROM servers;"
  ```

- [ ] **File System**
  ```bash
  ls -la /app/uploads/
  df -h
  sudo find /app -type f -name "*.env*" -exec ls -la {} \;
  ```

- [ ] **Application Health**
  ```bash
  curl -I http://localhost:3000/health
  systemctl status haos-v2
  systemctl status nginx
  systemctl status postgresql
  ```

- [ ] **SSL Certificates**
  ```bash
  openssl x509 -in /etc/ssl/certs/haos-v2.crt -text -noout | grep "Not After"
  ```

- [ ] **Network Connectivity**
  ```bash
  nslookup haos.yourdomain.com
  curl -I https://haos.yourdomain.com
  ```

- [ ] **Backup System**
  ```bash
  ./backup/scripts/backup-database.sh full test-recovery-$(date +%Y%m%d)
  systemctl status haos-backup-*.timer
  ```

- [ ] **Monitoring & Alerts**
  ```bash
  ./backup/monitoring/backup-health-check.sh
  ```

### Functional Testing

1. **User Authentication**
   - Login with test account
   - Password reset functionality
   - Two-factor authentication

2. **Core Features**
   - Create/join servers
   - Send/receive messages
   - File upload/download
   - Voice/video calls (if applicable)

3. **Data Consistency**
   - Verify message history
   - Check user profiles
   - Confirm server memberships

## 📊 Recovery Time Objectives (RTO) & Recovery Point Objectives (RPO)

| Disaster Type | RTO Target | RPO Target | Priority |
|---------------|------------|------------|----------|
| Complete Hardware Failure | 4 hours | 24 hours | High |
| Database Corruption | 2 hours | 1 hour | Critical |
| File System Issues | 3 hours | 6 hours | Medium |
| Security Breach | 8 hours | Variable | Critical |
| Configuration Loss | 30 minutes | 24 hours | Low |

## 🛠️ Tools and Resources

### Required Tools
- PostgreSQL client tools (`psql`, `pg_dump`, `pg_restore`)
- System utilities (`rsync`, `tar`, `zstd`)
- Network tools (`curl`, `dig`, `netcat`)
- Monitoring tools (`systemctl`, `journalctl`)

### Key File Locations
- Backups: `/backup/storage/local/`
- Logs: `/var/log/haos-backup/`
- Configuration: `/app/.env.production`
- SSL Certs: `/etc/letsencrypt/live/`
- Application: `/app/`

### Emergency Contacts

| Role | Primary | Secondary | Escalation |
|------|---------|-----------|------------|
| **System Administrator** | +1-xxx-xxx-xxxx | admin@company.com | 15 mins |
| **Database Administrator** | +1-xxx-xxx-xxxx | dba@company.com | 30 mins |
| **Security Team** | +1-xxx-xxx-xxxx | security@company.com | Immediate |
| **Management** | +1-xxx-xxx-xxxx | cto@company.com | 1 hour |

## 📋 Pre-Disaster Preparation

### Monthly Tasks
- [ ] Test restore procedures with recent backups
- [ ] Verify backup integrity and completeness
- [ ] Update disaster recovery documentation
- [ ] Review and test emergency communication procedures
- [ ] Validate monitoring and alerting systems

### Quarterly Tasks
- [ ] Conduct full disaster recovery simulation
- [ ] Review and update RTO/RPO targets
- [ ] Test backup encryption/decryption keys
- [ ] Verify off-site backup accessibility
- [ ] Update emergency contact information

### Annual Tasks
- [ ] Comprehensive security audit
- [ ] Review and update disaster recovery plan
- [ ] Train new team members on procedures
- [ ] Test disaster recovery with different failure scenarios
- [ ] Evaluate and update backup retention policies

## 🔐 Security Considerations

### During Recovery
- Change all passwords after security incidents
- Rotate SSL certificates if compromised
- Review access logs for unauthorized activity
- Scan restored systems for malware
- Verify integrity of restored data

### Access Control
- Limit disaster recovery access to authorized personnel
- Use multi-factor authentication for critical operations
- Log all recovery actions for audit trail
- Segregate recovery environment from production

## 📚 Additional Resources

- [HAOS-V2 Backup System Documentation](../README.md)
- [PostgreSQL Point-in-Time Recovery Guide](https://www.postgresql.org/docs/current/continuous-archiving.html)
- [Linux System Recovery Procedures](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/managing_storage_devices/index)
- [Incident Response Playbook](https://github.com/PagerDuty/incident-response-docs)

---

**Remember:** Practice makes perfect. Regular disaster recovery drills ensure procedures work when you need them most.

**Last Updated:** $(date +"%Y-%m-%d")  
**Review Schedule:** Quarterly  
**Next Review:** $(date -d "+3 months" +"%Y-%m-%d")