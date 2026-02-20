# Connected Driving Pipeline V4

**Project:** CV (Connected Vehicle) Security Research - ML-based Attack Detection
**Location:** Jaekel Server (`ssh jaekel` → `~/repos/ConnectedDrivingPipelineV4`)
**Supervisor:** Aaron Collins
**Status:** Active Research
**Dashboard:** `http://65.108.237.46/dashboard/` (Password: JaekelFiles2026!)

---

## ⚠️ IMPORTANT: Pipeline Execution Process

**ALWAYS use the Dashboard to run pipelines!**

1. Go to `http://65.108.237.46/dashboard/`
2. Log in with password: `JaekelFiles2026!`
3. Click "Available Pipelines" to see all 67 pipelines
4. Click "+ Queue" next to the pipeline you want to run
5. Monitor progress via the dashboard

**DO NOT run pipelines directly via SSH commands!**

---

## Dataset: April 2021 Wyoming BSM Data (100km Filter)

**Downloaded:** 2026-02-20
**Size:** 13GB CSV / 1.6GB Parquet
**Records:** ~45M rows filtered by April 2021 + 100km radius from center point

| File | Size | Purpose |
|------|------|---------|
| `April_2021_Wyoming_Data.csv` | 13GB | Raw filtered CSV |
| `April_2021_Wyoming_Data_CamelCase.parquet/` | 1.6GB | Parquet (27 partitions) - **USE THIS** |

**Symlinks (how pipelines find the data):**
- `data/data.csv` → `../April_2021_Wyoming_Data.csv`
- `data/data.parquet` → `../April_2021_Wyoming_Data_CamelCase.parquet`

**Filter Config:**
- Center point: (-106.0831353, 41.5430216) 
- **Source data:** Filtered to 100km radius during download
- **⚠️ Dask pipeline config:** `max_dist: 2000` (only 2km!) — NOT 100km!
- **Aaron wants:** `max_dist: 200000` (200km radius)
- Date range: April 1-30, 2021

> **NOTE [2026-02-20]:** The "100-200" in pipeline names like `DaskMClassifierRandOffset100To200.py` refers to **attack offset distance** (100-200 meters), NOT the spatial filter radius!

---

## Pipeline Architecture

```
Source Data (read-only)
     │
     ▼
Phase 1: Clean Feature Extraction
     │  - Filter by date + location (100km radius)
     │  - Convert lat/lon to X/Y meters
     │  - Cache to parquet
     ▼
Phase 2: Attack Injection
     │  - Copy clean data (never modify source)
     │  - Select 30% vehicle IDs as malicious
     │  - Apply attack type (random offset, constant offset, etc.)
     │  - Add isAttacker label
     │  - Cache to parquet
     ▼
Phase 3: ML Training/Evaluation
     │  - Random 80/20 train/test split
     │  - Train RF, DT, KNN classifiers
     │  - Evaluate metrics
     ▼
Results CSV + Confusion Matrix PNGs
```

---

## Available Dask Pipelines (Key Ones)

| Pipeline | Attack Type | Offset | Description |
|----------|-------------|--------|-------------|
| `DaskMClassifierRandOffset100To200.py` | Random Offset | 100-200m | Each attacker gets random direction + distance |
| `DaskMClassifierConstOffsetPerID100To200.py` | Constant/ID | 100-200m | Each vehicle gets consistent random offset |
| `DaskMClassifierConstOffsetPerIDWithRandDir50To100.py` | Const/ID + Random Dir | 50-100m | Consistent offset, random direction |
| `DaskMClassifierPositionSwap.py` | Position Swap | N/A | Attackers swap positions |

**All 67 pipelines visible in dashboard → "Available Pipelines" tab**

---

## Latest Run: 2026-02-13

### Wyoming April 2021 Constant Offset Attack with Extended Features

**Pipeline:** `DaskMClassifierConstOffsetPerIDExtFeatures100To200.py`

**Results:**
| Classifier | Test Accuracy | Test Precision | Test Recall | Test F1 |
|------------|--------------|----------------|-------------|---------|
| KNeighbors | 50.27% | 100% | 20.07% | 33.43% |
| RandomForest | 18.95% | 0.56% | 0.17% | 0.26% |
| DecisionTree | 17.55% | 3.0% | 1.04% | 1.54% |

**Key Insight:** Extended features pipeline performed poorly. Basic features (~99% accuracy in earlier runs) work much better.

---

## Dashboard Features

- **Queue and run pipelines** via web interface
- **View real-time logs** while jobs run
- **Results summary table** with all completed runs
- **Confusion matrix viewer** with downloadable PNGs
- **CSV export** of all results

---

## Change Log

| Date | Change |
|------|--------|
| 2026-02-20 | Documented proper pipeline execution process (use Dashboard!) |
| 2026-02-20 | April 2021 data downloaded + filtered by 100km, converted to parquet |
| 2026-02-13 | Extended features pipeline - poor results (50% max accuracy) |
| 2026-02-12 | Basic features pipeline - excellent results (~99% accuracy) |
