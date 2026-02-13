# Connected Driving Pipeline V4

**Project:** CV (Connected Vehicle) Security Research - ML-based Attack Detection
**Location:** Jaekel Server (`ssh jaekel` → `~/repos/ConnectedDrivingPipelineV4`)
**Supervisor:** Aaron Collins
**Status:** Active Research
**Dashboard:** `https://jaekel.aaroncollins.ca/dashboard/`

---

## Latest Run: 2026-02-13

### Wyoming April 2021 Constant Offset Attack with Extended Features

**Pipeline:** `DaskMClassifierConstOffsetPerIDExtFeatures100To200.py`

**Configuration:**
- Data: `Full_Wyoming_Data.parquet/` (converted from 40GB CSV)
- Location: Center (-106.0831353, 41.5430216), 2000m radius
- Date: April 1, 2021
- Attack: 30% of vehicles malicious, constant offset 100-200m per vehicle
- Features: Extended feature set (beyond basic xy)
- Train/Test: 80/20 split

**Results (2026-02-13 03:44 EST):**

| Metric | Train | Test |
|--------|-------|------|
| Total Samples | 3,713 | 929 |
| Unique Rows | 4,642 total |

| Classifier | Test Accuracy | Test Precision | Test Recall | Test F1 | Test Specificity |
|------------|--------------|----------------|-------------|---------|------------------|
| **KNeighbors** | **50.27%** | **100%** | 20.07% | 33.43% | 100% |
| RandomForest | 18.95% | 0.56% | 0.17% | 0.26% | 49.86% |
| DecisionTree | 17.55% | 3.0% | 1.04% | 1.54% | 44.73% |

**Key Insight:** Surprisingly poor results compared to previous run. KNeighbors had perfect precision but low recall (conservative classifier). RandomForest and DecisionTree basically failed. Needs investigation - possibly feature engineering issue or data split problem.

---

## Previous Run: 2026-02-12

### Wyoming April 2021 Constant Offset Attack (Basic Features)

| Classifier | Accuracy | Precision | Recall | F1 |
|------------|----------|-----------|--------|-----|
| **DecisionTree** | 99.89% | 100% | 99.26% | 99.63% |
| RandomForest | 99.78% | 100% | 98.52% | 99.25% |
| KNeighbors | 99.78% | 100% | 98.52% | 99.25% |

**Stark contrast** between these results suggests the extended features pipeline may have bugs.

---

## Pipeline Architecture

```
Source Data (read-only)
     │
     ▼
Phase 1: Clean Feature Extraction
     │  - Filter by date + location
     │  - Convert lat/lon to X/Y meters
     │  - Cache to parquet
     ▼
Phase 2: Attack Injection
     │  - Copy clean data (never modify source)
     │  - Select 30% vehicle IDs as malicious
     │  - Apply constant offset per vehicle
     │  - Add isAttacker label
     │  - Cache to parquet
     ▼
Phase 3: ML Training/Evaluation
     │  - Random 80/20 train/test split
     │  - Train RF, DT, KNN
     │  - Evaluate metrics
     ▼
Results CSV + Confusion Matrix PNGs
```

---

## Dashboard

**URL:** `https://jaekel.aaroncollins.ca/dashboard/`
**Location:** `~/pipeline-dashboard/` on jaekel
**Service:** `pipeline-dashboard.service` (gunicorn)

### Dashboard Features
- Queue and run pipelines
- View real-time logs
- Results summary table with all completed runs
- Confusion matrix viewer
- CSV export

### Recent Dashboard Fixes (2026-02-13)

1. **Results table showing duplicate/garbage rows**
   - **Cause:** CSV files contain model results followed by confusion matrix data (base64 images) in same file
   - **Fix:** Updated `get_result_rows()` to filter out rows without valid Model name or numeric train size
   - **File:** `~/pipeline-dashboard/app.py` lines 642-678

2. **Confusion matrix images not displaying**
   - **Cause:** API endpoint required authentication, images weren't loading
   - **Fix:** Changed to serve confusion matrix PNGs directly from nginx static files
   - **URL pattern:** `/pipeline-results/{job_id}/{pipeline_folder}/{classifier}.png`
   - **File:** `~/pipeline-dashboard/templates/index.html` showConfusionMatrix function

---

## Key Files

| File | Purpose |
|------|---------|
| `run_wyoming_apr2021_constoffset_v1.py` | Main pipeline script (basic) |
| `DaskMClassifierConstOffsetPerIDExtFeatures100To200.py` | Extended features pipeline |
| `configs/*.json` | Pipeline configurations |
| `attack_plans/` | Attack plan documentation |
| `cache/clean/` | Cached clean datasets |
| `cache/attacks/` | Cached attack datasets |
| `results/` | ML results CSVs |

---

## Design Principles

1. **Never contaminate source** — Original data is read-only
2. **Cache at each phase** — Reuse expensive computations
3. **Unique naming** — Each config/attack gets unique cache name
4. **Consistent per-vehicle attacks** — Simulates compromised OBU behavior
5. **Ground truth labels** — `isAttacker` column for training

---

## Research Questions (In Progress)

1. ✅ Can ML detect constant offset attacks? **Yes, ~99% accuracy (basic features)**
2. ⚠️ Extended features pipeline showing poor results - needs investigation
3. ⬜ How does detection vary with offset magnitude?
4. ⬜ Does vehicle-disjoint train/test split affect results?
5. ⬜ Can trajectory-based features improve detection?
6. ⬜ How do other attack types compare?

---

## Change Log

| Date | Change |
|------|--------|
| 2026-02-12 | Created attack plan and pipeline for constant offset per vehicle |
| 2026-02-12 | Fixed date filtering (MM/DD/YYYY format), successful run with ~99% accuracy |
| 2026-02-13 | Ran extended features pipeline - poor results (50% max accuracy) |
| 2026-02-13 | Fixed dashboard: results table duplicate rows, confusion matrix display |
