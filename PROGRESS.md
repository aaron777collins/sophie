# ConnectedDrivingPipelineV4 Setup Progress

**Started:** 2026-01-28 18:10 EST
**Status:** 🔄 In Progress

## Tasks

- [x] Analyze repo structure
- [x] Create 32GB RAM config (Spark + Dask)
- [x] Create tests (24 tests, 23 passed, 1 skipped)
- [x] Merge and push changes
- [ ] Install 32GB config (ready to use)
- [ ] Download BSM dataset

## Completed

### 32GB Configuration Created
- `configs/spark/32gb-single-node.yml` - Spark config
  - 4GB driver, 18GB executor, 4 cores
  - Conservative for memory-constrained systems
- `configs/dask/32gb-production.yml` - Dask config
  - 4 workers × 6GB each
  - Aggressive spill settings for 32GB

### Tests Created
- `Test/Tests/test_32gb_config.py`
- 24 tests: 23 passed, 1 skipped (Dask cluster integration)

### Download Script
- `scripts/download_bsm_data.sh` - Robust download with resume/retry

### Git Push
- Commit: 05a7d63
- Pushed to origin/main

## Notes

⚠️ The original download URL (V3 API) requires Socrata authentication
   - Using public V1 API endpoint instead
   - Wyoming CV Pilot One Day Sample: ~123K rows, ~100MB
   - For 100M+ rows, would need API token

✅ **BETTER SOLUTION FOUND**: USDOT ITS Data Sandbox
   - AWS S3 bucket with NO authentication required
   - Full WYDOT BSM data available
   - Flexible date-range fetching
   - Created comprehensive infrastructure plan

## Log

### 2026-01-28 18:10
- Started analysis
- Posted initial Slack update
- Cloned repo from GitHub

### 2026-01-28 18:14
- Created 32GB configs
- Fixed download URL (403 → public endpoint)
- Created tests

### 2026-01-28 18:17
- All tests passed
- Pushed to GitHub
- Download in progress

### 2026-01-28 18:30
- Aaron provided USDOT ITS Data Sandbox links
- Analyzed S3 bucket structure and access patterns
- Created comprehensive infrastructure plan (24KB document)
- Plan includes:
  - S3DataFetcher with parallel downloads
  - CacheManager for incremental fetching
  - YAML-based configuration system
  - 4-phase implementation roadmap
- Pushed plan to GitHub (commit 8749d46)
