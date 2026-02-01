# WYDOT Connected Driving Pipeline

## Overview
ConnectedDrivingPipelineV4 - ML pipeline for processing WYDOT (Wyoming DOT) connected vehicle data, specifically BSM (Basic Safety Messages) from the I-80 corridor.

## Status
🟡 **In Progress** - Infrastructure complete, awaiting AWS credentials for real data

## Location
`/home/ubuntu/ConnectedDrivingPipelineV4/`

---

## Timeline

| Date | Event |
|------|-------|
| 2026-01-28 | Implemented full DataSources module (2,952 lines) |
| 2026-01-28 | Created 3,014 lines of tests |
| 2026-01-29 | Discovered S3 access now requires authentication |
| 2026-01-29 | Fixed S3 authentication, added credential support |
| 2026-01-29 | Created synthetic data generator for testing |
| 2026-01-29 | Full ML pipeline validated with synthetic data |

---

## Architecture

### Data Source
- **S3 Bucket:** `usdot-its-cvpilot-publicdata`
- **Message Types:** BSM (Basic Safety Messages), TIM (Traveler Information Messages)
- **Region:** Wyoming I-80 corridor
- **Authentication:** AWS credentials required (changed from anonymous)

### Module Structure (`DataSources/`)

| File | Lines | Purpose |
|------|-------|---------|
| `config.py` | 249 | Pydantic validation, cache keys, source/type validation |
| `CacheManager.py` | 1007 | File locking, manifest.json, atomic writes, LRU eviction |
| `S3DataFetcher.py` | 712 | Rate limiting, parallel downloads, resume support |
| `SchemaValidator.py` | 842 | BSM/TIM validation with schema versioning |
| `SyntheticDataGenerator.py` | - | Test data generation (Wyoming I-80 coords) |
| `MockS3DataFetcher.py` | - | Local mock for testing without AWS |

### Cache System
- **Key Format:** `{source}/{message_type}/{year}/{month:02d}/{day:02d}`
- **Source FIRST** in path for isolation
- **Performance:** 19.7x speedup on cache hits
- **Purpose:** Critical for S3 egress cost control

### Schema Versions
| Version | Years |
|---------|-------|
| v2 | 2017-2018 |
| v3 | 2018-2020 |
| v6 | 2020+ |

---

## Test Data

### Synthetic Dataset
- **Location:** `test_data/synthetic_wydot/`
- **Records:** 7,200 BSM records
- **Structure:** 3 days × 24 hours × 100 records/hour
- **Generation Speed:** ~15,600 records/sec
- **Validation Speed:** ~87,400 records/sec

---

## ML Pipeline Config

**File:** `configs/dask/wydot-synthetic-ml.yml`

**Features:**
- Data source settings (WYDOT BSM)
- Dask cluster config (4 workers, 6GB each)
- Feature extraction (position, motion, derived) - 17 features total
- ML model (RandomForest for anomaly detection)
- Cache settings for cost control

---

## Commits

| Date | Commit | Description |
|------|--------|-------------|
| 2026-01-28 | `d76db44` | feat(DataSources): Implement WYDOT data infrastructure |
| 2026-01-28 | `809170b` | test: Add end-to-end pipeline tests |
| 2026-01-28 | `0adf1fc` | test: Add performance test dataset (1000 records) |
| 2026-01-28 | `c8b466f` | feat: Enhance CacheManager + concurrency tests |
| 2026-01-28 | `22a1e78` | test: Add comprehensive edge case tests |
| 2026-01-29 | `2e9b42a` | fix(DataSources): S3 authentication |
| 2026-01-29 | `a0993aa` | feat(DataSources): Testing infrastructure + bug fixes |
| 2026-01-29 | `7e16bf8` | feat: ML pipeline config + integration tests |

---

## Bugs Fixed

| Component | Bug | Fix | Date |
|-----------|-----|-----|------|
| `SchemaValidator.py` | Wrong elevation path | Fixed to `payload.data.coreData.position.elevation` | 2026-01-29 |
| `conftest.py` | PySpark import fails tests | Made Spark/Dask imports conditional | 2026-01-29 |
| `SyntheticDataGenerator` | Vehicles drift outside longitude range | Added coordinate clamping to Wyoming bounds | 2026-01-29 |

---

## Current Blockers

- [ ] **AWS credentials needed** - Must configure credentials to test with real S3 data
  - See [AWS S3 Authentication](../topics/aws-s3-authentication.md) for setup guide

---

## Related Resources
- USDOT Sandbox: https://github.com/usdot-its-jpo-data-portal/sandbox
- Sandbox Exporter: https://github.com/usdot-its-jpo-data-portal/sandbox_exporter
- [AWS S3 Authentication Topic](../topics/aws-s3-authentication.md)
