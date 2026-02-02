# Synthetic Data Testing

Testing infrastructure for ConnectedDrivingPipelineV4 that enables full test suite execution without real AWS S3 access.

## Overview

- [2026-01-29 10:30 EST] Created complete synthetic data testing infrastructure
- Enables development and CI testing without AWS credentials
- Generates realistic WYDOT BSM (Basic Safety Message) data
- Matches real S3 bucket structure and data format

## Components

### SyntheticDataGenerator

**Location:** `DataSources/SyntheticDataGenerator.py`

- [2026-01-29 10:30 EST] Initial implementation
- Generates realistic WYDOT BSM records
- Wyoming I-80 corridor coordinates (longitude -108 to -104)
- Vehicle trajectory simulation (50 vehicles)
- NDJSON file output matching S3 structure
- Performance: ~15,600 records/sec
- [2026-01-29 11:30 EST] Fixed coordinate clamping bug (vehicles drifted outside valid longitude range)
- Added boundary bounce-back behavior

### MockS3DataFetcher

**Location:** `DataSources/MockS3DataFetcher.py`

- [2026-01-29 10:30 EST] Initial implementation
- Local file-based mock for S3DataFetcher
- Same interface as real S3DataFetcher
- Works without AWS credentials
- Supports date ranges, statistics, object listing
- Drop-in replacement for testing

## Test Data

**Location:** `test_data/synthetic_wydot/`

| Property | Value |
|----------|-------|
| Records | 7,200 synthetic BSM records |
| Structure | 3 days × 24 hours × 100 records/hour |
| Format | Matches real WYDOT S3 bucket structure |
| Status | Ready for pipeline testing |

### Performance Test Dataset

- [2026-01-29 ~11:00 EST] Large dataset testing validated
- 1000+ records for performance benchmarks
- 10K record stress tests passing
- Validation speed: ~87,400 records/sec

## Usage

The synthetic testing approach enables:
1. **Unit tests** - Individual component validation
2. **Integration tests** - Full ML pipeline testing
3. **Performance tests** - Benchmarking without S3 egress costs
4. **CI/CD** - Automated testing without AWS credentials

## Related

- S3 authentication fix: commit `2e9b42a`
- Testing infrastructure: commit `a0993aa`
- ML pipeline config: `configs/dask/wydot-synthetic-ml.yml`
- Daily notes: [[daily/2026-01-29]]
