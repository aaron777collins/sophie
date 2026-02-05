# Jaekel Server

**Nickname:** Jaekel Server  
**IP:** 65.108.237.46  
**Provider:** Hetzner  

## Credentials

- **ubuntu** — JaekelResearch135$ (passwordless sudo)
- **root** — (Hetzner rescue system password)

## Hardware

- CPU: AMD Ryzen 5 3600 6-Core (12 threads)
- RAM: 64GB (Non-ECC)
- Storage: 2x 512GB NVMe (RAID0)

## Disk Layout

| LV | Mount | Size |
|----|-------|------|
| root | / | 60G |
| swap | swap | 64G |
| var | /var | 400G |
| home | /home | 427.62G |

- /boot: 1G ext3 on md0 (RAID1)
- LVM on md1 (RAID0)

## SSH Access

**From dev3 (Sophie):**
```bash
ssh jaekel              # interactive
ssh jaekel "command"    # run command
```
- Key: `~/.ssh/id_jaekel`
- Config alias in `~/.ssh/config`

**From Aaron's local PC:**
```bash
ssh jaekel              # same alias if configured
ssh ubuntu@65.108.237.46
```
- Key: `~/.ssh/id_jaekel` (local->jaekel)

**Fallback (password):**
```bash
sshpass -p 'JaekelResearch135$' ssh ubuntu@65.108.237.46 "command"
```

## ConnectedDrivingPipelineV4 (Primary Workload)

⚠️ **This is THE server for all pipeline work.** dev3 copies have been removed.

**Location:** `~/repos/ConnectedDrivingPipelineV4`  
**Docs:** `~/repos/ConnectedDrivingPipelineV4/JAEKEL-SERVER.md`  
**Python:** 3.12 (venv)  
**Size:** ~24GB (including cache + classifier data)

### Key Files

- `run-pipeline-64gb.sh` — Run script with 64GB Dask config + auto-copy results
- `JAEKEL-SERVER.md` — Full documentation
- `configs/dask/64gb-production.yml` — Dask settings for 64GB RAM
- `venv/` — Python virtual environment

### Dependencies Installed

- Dask 2026.1.2
- TensorFlow 2.20.0 (CPU mode - no GPU)
- scikit-learn 1.8.0
- PySpark 4.1.1
- NumPy, Pandas, PyArrow, etc.

### Quick Usage

```bash
cd ~/ConnectedDrivingPipelineV4
./run-pipeline-64gb.sh                        # default pipeline
./run-pipeline-64gb.sh MClassifier...py       # specific pipeline
nohup ./run-pipeline-64gb.sh > out.log 2>&1 & # background
```

### Results Auto-Copy

After pipeline completion, results auto-copy to dev3:
- **Location:** `/var/www/html/clawd-static/results/`
- **View:** https://clawd.dev/results/

---

## GitHub Access (Deploy Key)

- **Key:** `~/.ssh/github_deploy` (ED25519)
- **SSH config:** `~/.ssh/config` routes `github.com` through deploy key
- **Scope:** `aaron777collins/ConnectedDrivingPipelineV4` (read+write)
- **GitHub key ID:** 142148791
- **Set up:** [2026-02-04 22:55 EST]

```bash
cd ~/repos/ConnectedDrivingPipelineV4
git push   # just works now
```

## Setup Log

- [2026-02-04] Fresh Ubuntu 24.04 install via installimage
- [2026-02-04] Created ubuntu user with passwordless sudo
- [2026-02-04] Verified remote access from dev3 via sshpass
- [2026-02-04 20:02 EST] Transferred ConnectedDrivingPipelineV4 (~24GB) from dev3
- [2026-02-04 20:02 EST] Created Python 3.12 venv with all dependencies
- [2026-02-04 20:02 EST] Created 64GB Dask config and run script
- [2026-02-04 20:42 EST] Added run-pipeline-64gb.sh and JAEKEL-SERVER.md to repo
- [2026-02-04 20:46 EST] dev3 local copies removed — Jaekel is now the only location
- [2026-02-04 22:55 EST] Set up GitHub deploy key for push access
