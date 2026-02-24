# Current Task: Phase 1 - Investigation & Schema Mapping

**Started:** 2026-02-23 22:20 EST
**Phase:** 1 of 6
**Blocking:** All subsequent phases

## Objective

Before fixing anything, we need to know EXACTLY what we're dealing with.

## Task 1.1: Document Actual Data Schema

### Commands to Run

```bash
# Get column names from Parquet file
ssh jaekel "cd /home/ubuntu/repos/ConnectedDrivingPipelineV4 && python3 -c \"
import pyarrow.parquet as pq
table = pq.read_table('April_2021_Wyoming_Data_Fixed.parquet')
print('=== ACTUAL COLUMNS IN DATA ===')
for col in sorted(table.column_names):
    print(f'  {col}')
print(f'Total: {len(table.column_names)} columns')
\""
```

```bash
# Get what Basic cleaner expects
ssh jaekel "grep -r 'columns' /home/ubuntu/repos/ConnectedDrivingPipelineV4/Generator/Cleaners/*.py | head -50"
```

```bash
# Get what configs specify
ssh jaekel "cat /home/ubuntu/repos/ConnectedDrivingPipelineV4/production_configs/basic_2km_pipeline_config.json"
```

### Expected Output
- List of actual column names in data
- List of expected column names in code
- Mapping document

### Acceptance Criteria
- [ ] Actual columns documented
- [ ] Expected columns documented  
- [ ] Mismatch identified and documented

---

## Task 1.2: Document Cache Key Generation

### Commands to Run

```bash
# Find cache key generation code
ssh jaekel "grep -n 'cache_key\|cache_variables\|def.*cache' /home/ubuntu/repos/ConnectedDrivingPipelineV4/Decorators/*.py"
```

```bash
# Read the cache decorator
ssh jaekel "cat /home/ubuntu/repos/ConnectedDrivingPipelineV4/Decorators/DaskParquetCache.py"
```

```bash
# Read FileCache
ssh jaekel "cat /home/ubuntu/repos/ConnectedDrivingPipelineV4/Decorators/FileCache.py"
```

### Expected Output
- Understanding of how cache keys are generated
- List of variables included in key
- List of variables MISSING from key

### Acceptance Criteria
- [ ] Cache key generation logic documented
- [ ] Missing variables identified
- [ ] Plan for unique keys drafted

---

## Status Updates

| Time | Update |
|------|--------|
| 22:20 | Task created |
| | |

## Next Phase Trigger

When ALL acceptance criteria above are checked, proceed to Phase 2: Cache Key Uniqueness Fix
