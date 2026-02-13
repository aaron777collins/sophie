# Connected Driving Pipeline V4

**Project:** CV (Connected Vehicle) Security Research - ML-based Attack Detection
**Location:** Jaekel Server (`ssh jaekel` → `~/repos/ConnectedDrivingPipelineV4`)
**Supervisor:** Aaron Collins
**Status:** Active Research

---

## Latest Run: 2026-02-12

### Wyoming April 2021 Constant Offset Attack

**Attack Plan:** `attack_plans/WYOMING-APR2021-CONSTOFFSET-V1.md`

**Configuration:**
- Data: `Full_Wyoming_Data.parquet/` (converted from 40GB CSV)
- Location: Center (-106.0831353, 41.5430216), 2000m radius
- Date: April 2021
- Attack: 30% of vehicles malicious, constant offset 100-200m per vehicle
- Each malicious vehicle has ONE attack vector applied to ALL its BSMs

**Results (2026-02-13 03:17):**

| Metric | Value |
|--------|-------|
| Total BSMs | 4,610 |
| Unique Vehicles | 15 |
| Malicious Vehicles | 4 (30%) |
| Attacked BSMs | 676 (14.7%) |

| Classifier | Accuracy | Precision | Recall | F1 |
|------------|----------|-----------|--------|-----|
| **DecisionTree** | 99.89% | 100% | 99.26% | 99.63% |
| RandomForest | 99.78% | 100% | 98.52% | 99.25% |
| KNeighbors | 99.78% | 100% | 98.52% | 99.25% |

**Key Insight:** All classifiers achieve ~99% accuracy detecting constant offset attacks. DecisionTree slightly outperformed with F1=99.63%.

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
Results CSV
```

---

## Key Files

| File | Purpose |
|------|---------|
| `run_wyoming_apr2021_constoffset_v1.py` | Main pipeline script |
| `configs/wyoming_apr2021_constoffset_v1.json` | Pipeline configuration |
| `attack_plans/WYOMING-APR2021-CONSTOFFSET-V1.md` | Attack plan documentation |
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

1. ✅ Can ML detect constant offset attacks? **Yes, ~99% accuracy**
2. ⬜ How does detection vary with offset magnitude?
3. ⬜ Does vehicle-disjoint train/test split affect results?
4. ⬜ Can trajectory-based features improve detection?
5. ⬜ How do other attack types compare?

---

## Change Log

| Date | Change |
|------|--------|
| 2026-02-12 | Created attack plan and pipeline for constant offset per vehicle |
| 2026-02-13 | Fixed date filtering (MM/DD/YYYY format), successful run |
