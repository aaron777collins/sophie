# WYDOT April 2021 Constant Offset Attack Plan

**Created:** 2026-02-19 21:28 EST
**Updated:** 2026-02-19 22:21 EST
**Priority:** HIGH
**Owner:** Sophie (direct execution)

## Overview

Run the constant position offset attack on Wyoming CV Pilot BSM data for April 2021 using the ConnectedDrivingPipelineV4 pipeline on Jaekel server.

## Current Status

- [x] **Phase 1: Data Download** — ✅ COMPLETE
- [x] **Phase 2: Data Conversion** — ✅ COMPLETE  
- [ ] **Phase 3: Attack Execution** — 🔄 IN PROGRESS
- [ ] **Phase 4: Results Analysis** — PENDING

---

## Phase 1: Data Download ✅ COMPLETE

**Completed:** 2026-02-19 22:12 EST

| Item | Value |
|------|-------|
| Rows Downloaded | 13,318,200 |
| File Size | 13.3 GB |
| Output File | `April_2021_Wyoming_Data.csv` |
| Web Symlink | http://65.108.237.46/wyoming-cv-bsm-2021-04.csv |

---

## Phase 2: Data Conversion ✅ COMPLETE

**Completed:** 2026-02-19 22:19 EST

| Item | Value |
|------|-------|
| Parquet Directory | `April_2021_Wyoming_Data.parquet/` |
| Total Files | 27 |
| Total Size | 1.6 GB |
| Total Rows | 13,318,200 |
| Chunk Size | 500,000 rows/file |

---

## Phase 3: Attack Execution 🔄 IN PROGRESS

**Started:** 2026-02-19 22:21 EST
**PID:** 466915
**Log:** `attack_apr2021.log`

### Config
- **File:** `configs/wyoming_apr2021_socrata_constoffset.json`
- **Attack Type:** Constant offset per vehicle
- **Offset Range:** 100-200 meters
- **Malicious Ratio:** 30%
- **Classifiers:** RandomForest, DecisionTree, KNeighbors

### Monitoring Commands
```bash
# Check if running
ssh jaekel "ps aux | grep 466915 | grep -v grep"

# Check logs
ssh jaekel "tail -50 /home/ubuntu/repos/ConnectedDrivingPipelineV4/attack_apr2021.log"
```

### Expected Steps
1. ✅ Dask cluster initialized
2. 🔄 Data gathering and cleaning
3. ⏸️ Attack injection
4. ⏸️ ML model training
5. ⏸️ Evaluation and metrics

---

## Phase 4: Results Analysis (PENDING)

### Tasks
1. Collect classification metrics (accuracy, precision, recall, F1)
2. Generate confusion matrices
3. Feature importance analysis
4. Post results to Slack #aibot-chat

---

## Changelog

- [2026-02-19 21:28 EST] Plan created by Sophie
- [2026-02-19 21:28 EST] Phase 1 started (download)
- [2026-02-19 22:12 EST] Phase 1 complete (13.3M rows)
- [2026-02-19 22:19 EST] Phase 2 complete (parquet conversion)
- [2026-02-19 22:21 EST] Phase 3 started (attack execution)
