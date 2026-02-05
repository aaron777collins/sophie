# ConnectedDrivingPipelineV4 Project

**Repository:** https://github.com/aaron777collins/ConnectedDrivingPipelineV4  
**Primary Work Server:** Jaekel Server (always)  
**Last Updated:** [2026-02-04 20:46 EST]

---

## ⚠️ IMPORTANT: Work on Jaekel Server ONLY

As of 2026-02-04, **all pipeline work happens on the Jaekel server**. The local dev3 copies have been removed.

### Why Jaekel?
- 64GB RAM (vs dev3's limited memory)
- Dedicated for ML/pipeline work
- Dask configured for 64GB
- Results auto-copy to dev3's web server

---

## Quick Start (From dev3)

```bash
# SSH to Jaekel
ssh jaekel

# Run a pipeline
cd ~/ConnectedDrivingPipelineV4
./run-pipeline-64gb.sh                                    # default pipeline
./run-pipeline-64gb.sh MClassifierLarge...py              # specific pipeline

# Background run
nohup ./run-pipeline-64gb.sh > output.log 2>&1 &
```

---

## Runner Script: `run-pipeline-64gb.sh`

What it does:
1. Activates venv
2. Sets DASK_CONFIG for 64GB-production.yml
3. Runs specified pipeline (or default)
4. **Auto-copies results** to dev3: `/var/www/html/clawd-static/results/`

### Viewing Results

Results auto-copy to dev3's web server after completion:
```
https://clawd.dev/results/
```

---

## Server Details

See `memory/projects/jaekel-server.md` for full server documentation.

| Item | Value |
|------|-------|
| Server | Jaekel (65.108.237.46) |
| User | ubuntu |
| Path | ~/ConnectedDrivingPipelineV4 |
| Python | 3.12 (venv) |
| Key Deps | Dask 2026.1.2, TensorFlow 2.20.0, scikit-learn 1.8.0 |

---

## Pipeline Configurations

### Attack Types Tested
- Random offset attacks (10-20m, 50-100m, 100-200m)
- Constant position offset attacks
- Position swap attacks
- Random position attacks (0-2000m)

### Data Source
- Wyoming CV dataset (April 2021)
- Location: -106° lon, 41° lat area
- Days: 01-30

### ML Features
- XY position + elevation
- Timestamps
- Heading + speed variants
- 30% attacker ratio (typically)

---

## Documentation on Jaekel

Full docs at `~/ConnectedDrivingPipelineV4/JAEKEL-SERVER.md`:
- Quick start
- Background running (nohup/tmux)
- Results auto-copy behavior
- Troubleshooting

---

## History

- [2026-01-27] Initial DataSources module work (Ralph integration plan)
- [2026-01-28] WYDOT infrastructure implementation
- [2026-01-29] Wyoming CV dataset (39.3GB) downloaded to dev3
- [2026-02-02] Multi-pipeline configurations created
- [2026-02-04 19:57 EST] Transferred to Jaekel server (~24GB at 73MB/s)
- [2026-02-04 20:02 EST] Jaekel venv + dependencies configured
- [2026-02-04 20:42 EST] Runner script + docs pushed to GitHub
- [2026-02-04 20:46 EST] **dev3 local copies removed** — all work now on Jaekel
