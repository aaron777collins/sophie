# WYDOT April 2021 Constant Offset Attack Plan

**Created:** 2026-02-19 21:28 EST
**Completed:** 2026-02-19 22:26 EST
**Priority:** HIGH
**Owner:** Sophie (direct execution)

## Overview

Run the constant position offset attack on Wyoming CV Pilot BSM data for April 2021 using the ConnectedDrivingPipelineV4 pipeline on Jaekel server.

## Final Status: ✅ COMPLETE

- [x] **Phase 1: Data Download** — ✅ COMPLETE
- [x] **Phase 2: Data Conversion** — ✅ COMPLETE  
- [x] **Phase 3: Attack Execution** — ✅ COMPLETE
- [x] **Phase 4: Results Analysis** — ✅ COMPLETE

---

## Phase 1: Data Download ✅ COMPLETE

**Completed:** 2026-02-19 22:12 EST

| Item | Value |
|------|-------|
| Rows Downloaded | 13,318,200 |
| File Size | 13.3 GB |
| Output File | `April_2021_Wyoming_Data.csv` |
| Web Download | http://65.108.237.46/wyoming-cv-bsm-2021-04.csv |

---

## Phase 2: Data Conversion ✅ COMPLETE

**Completed:** 2026-02-19 22:19 EST

| Item | Value |
|------|-------|
| Parquet Directory | `April_2021_Wyoming_Data.parquet/` |
| Total Files | 27 |
| Total Size | 1.6 GB |
| Total Rows | 13,318,200 |

---

## Phase 3: Attack Execution ✅ COMPLETE

**Completed:** 2026-02-19 22:26 EST
**Duration:** ~5 minutes

### Data Processing
- **Input Rows:** 45,500,000 (across 46 partitions)
- **After Filtering (2000m radius):** 4,642 rows
- **Attack Type:** Constant Offset Per Vehicle ID
- **Offset Range:** 100-200 meters
- **Malicious Ratio:** 30%

---

## Phase 4: Results ✅ COMPLETE

### Classification Results

| Classifier | Train Acc | Test Acc | Test Precision | Test Recall | Test F1 | Test Specificity |
|------------|-----------|----------|----------------|-------------|---------|------------------|
| **RandomForest** | 100% | 49.9% | 75.8% | 28.7% | 41.7% | 84.9% |
| **DecisionTree** | 100% | 50.7% | 77.5% | 29.2% | 42.5% | 86.0% |
| **KNeighbors** | 80.2% | 34.0% | 28.4% | 4.0% | 7.0% | 83.5% |

### Key Findings

1. **Overfitting Observed:** All classifiers show perfect or near-perfect train accuracy but poor test performance
2. **Detection Difficulty:** Test accuracy ~50% (random chance) suggests constant offset attacks are hard to detect with position/speed features alone
3. **High Specificity:** Models correctly identify legitimate vehicles (low false positive rate)
4. **Low Recall:** Models struggle to identify attackers (high false negative rate)

### Research Implications
The 100-200m constant offset attack appears challenging to detect using basic BSM features (position, speed, heading, elevation). This could indicate:
- Attack is subtle enough to evade simple ML detection
- Need for additional features (trajectory analysis, neighbor correlation)
- Potential need for ensemble or temporal models

### Confusion Matrix Images
- http://65.108.237.46/pipeline-results/apr2021-constoffset/RandomForestClassifier.png
- http://65.108.237.46/pipeline-results/apr2021-constoffset/DecisionTreeClassifier.png
- http://65.108.237.46/pipeline-results/apr2021-constoffset/KNeighborsClassifier.png

---

## Timeline

| Time | Event |
|------|-------|
| 2026-02-19 21:27 EST | Download started |
| 2026-02-19 22:12 EST | Download complete (13.3M rows) |
| 2026-02-19 22:19 EST | Parquet conversion complete |
| 2026-02-19 22:21 EST | Attack pipeline started |
| 2026-02-19 22:26 EST | Pipeline complete, results posted |

**Total Duration:** ~1 hour
