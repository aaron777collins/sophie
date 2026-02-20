# WYDOT April 2021 Constant Offset Attack Plan

**Created:** 2026-02-19 21:28 EST
**Priority:** HIGH
**Owner:** Coordinator → Task Managers → Workers

## Overview

Run the constant position offset attack on Wyoming CV Pilot BSM data for April 2021 using the ConnectedDrivingPipelineV4 pipeline on Jaekel server.

## Current Status

- [ ] **Phase 1: Data Download** — IN PROGRESS
- [ ] **Phase 2: Data Conversion** — PENDING
- [ ] **Phase 3: Attack Execution** — PENDING
- [ ] **Phase 4: Results Analysis** — PENDING

---

## Phase 1: Data Download

### Status: IN PROGRESS

**Download Details:**
- **Source:** `https://data.transportation.gov/resource/9k4m-a3jc.csv`
- **Query:** `metadata_generatedat between '2021-04-01T00:00:00' and '2021-04-30T23:59:59'`
- **Expected Rows:** 13,318,200
- **Expected Size:** ~11-12GB (estimated from 2020 data ratio)
- **Output File:** `/home/ubuntu/repos/ConnectedDrivingPipelineV4/April_2021_Wyoming_Data.csv`
- **Log File:** `/home/ubuntu/repos/ConnectedDrivingPipelineV4/download.log`
- **Process PID:** 460811 (curl running under nohup)
- **Started:** 2026-02-19 21:27 EST
- **Estimated Duration:** 2-3 hours

### Monitoring Commands
```bash
# Check if download is running
ssh jaekel "ps aux | grep 460811 | grep -v grep"

# Check file size progress
ssh jaekel "ls -lh /home/ubuntu/repos/ConnectedDrivingPipelineV4/April_2021_Wyoming_Data.csv"

# Check download log (last 20 lines)
ssh jaekel "tail -20 /home/ubuntu/repos/ConnectedDrivingPipelineV4/download.log"

# Count rows downloaded so far
ssh jaekel "wc -l /home/ubuntu/repos/ConnectedDrivingPipelineV4/April_2021_Wyoming_Data.csv"
```

### Completion Criteria
- [ ] File exists and is not growing (download complete)
- [ ] Row count matches expected: 13,318,200 (+1 header = 13,318,201 lines)
- [ ] No curl errors in download.log
- [ ] File integrity check (not truncated)

### Contingencies
- **Download fails/interrupts:** Re-run curl command with `--continue-at -` flag
- **Incomplete data:** Check Socrata API limits, may need pagination
- **Server timeout:** Increase curl timeout or use wget with retry

---

## Phase 2: Data Conversion

### Status: PENDING (waiting for Phase 1)

**Goal:** Convert CSV to Parquet format for efficient Dask processing

### Tasks

#### 2.1 Validate Downloaded Data
```bash
# Check file integrity
ssh jaekel "head -5 /home/ubuntu/repos/ConnectedDrivingPipelineV4/April_2021_Wyoming_Data.csv"
ssh jaekel "tail -5 /home/ubuntu/repos/ConnectedDrivingPipelineV4/April_2021_Wyoming_Data.csv"

# Verify row count
ssh jaekel "wc -l /home/ubuntu/repos/ConnectedDrivingPipelineV4/April_2021_Wyoming_Data.csv"
# Expected: 13,318,201 (13,318,200 data + 1 header)
```

#### 2.2 Convert to Parquet
```bash
ssh jaekel "cd /home/ubuntu/repos/ConnectedDrivingPipelineV4 && source .venv/bin/activate && python3 << 'EOF'
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import os

# Read CSV in chunks and write to parquet
csv_file = 'April_2021_Wyoming_Data.csv'
parquet_dir = 'April_2021_Wyoming_Data.parquet'

os.makedirs(parquet_dir, exist_ok=True)

chunk_size = 500000
for i, chunk in enumerate(pd.read_csv(csv_file, chunksize=chunk_size)):
    table = pa.Table.from_pandas(chunk)
    pq.write_table(table, f'{parquet_dir}/part.{i:04d}.parquet')
    print(f'Wrote part {i} ({len(chunk)} rows)')

print('Conversion complete!')
EOF"
```

#### 2.3 Verify Parquet Files
```bash
ssh jaekel "ls -lh /home/ubuntu/repos/ConnectedDrivingPipelineV4/April_2021_Wyoming_Data.parquet/"
ssh jaekel "cd /home/ubuntu/repos/ConnectedDrivingPipelineV4 && source .venv/bin/activate && python3 -c \"
import pyarrow.parquet as pq
import os

parquet_dir = 'April_2021_Wyoming_Data.parquet'
total_rows = 0
for f in os.listdir(parquet_dir):
    if f.endswith('.parquet'):
        table = pq.read_table(os.path.join(parquet_dir, f))
        total_rows += len(table)
print(f'Total rows in parquet: {total_rows}')
\""
```

### Completion Criteria
- [ ] Parquet directory created with multiple part files
- [ ] Total parquet rows = 13,318,200
- [ ] Parquet files readable without errors

### Contingencies
- **Memory issues:** Reduce chunk_size to 100000
- **Disk space:** Check `df -h /home/ubuntu/` before starting

---

## Phase 3: Attack Execution

### Status: PENDING (waiting for Phase 2)

**Attack Type:** Constant Position Offset Per Vehicle ID
- Each malicious vehicle gets a fixed random offset (direction + distance)
- Offset persists across all messages from that vehicle
- Distance range: 100-200 meters
- Direction range: 0-360 degrees
- Malicious ratio: 30%

### Existing Code Reference
- **Main Script:** `DaskMClassifierConstOffsetPerID100To200.py`
- **Config:** `configs/wyoming_apr2021_constoffset_v1.json`

### Tasks

#### 3.1 Update Config for April 2021 Data
```json
{
  "data": {
    "source_file": "April_2021_Wyoming_Data.parquet/",
    "source_type": "parquet",
    "date_range": {
      "start": "2021-04-01",
      "end": "2021-04-30"
    }
  }
}
```

#### 3.2 Run Attack Pipeline
```bash
ssh jaekel "cd /home/ubuntu/repos/ConnectedDrivingPipelineV4 && source .venv/bin/activate && \
  nohup python3 DaskMClassifierConstOffsetPerID100To200.py \
    --config configs/wyoming_apr2021_constoffset_v1.json \
    > attack_run.log 2>&1 &"
```

#### 3.3 Monitor Progress
```bash
# Check if running
ssh jaekel "ps aux | grep DaskMClassifier | grep -v grep"

# Check logs
ssh jaekel "tail -50 /home/ubuntu/repos/ConnectedDrivingPipelineV4/attack_run.log"

# Check Dask dashboard (if available)
# Usually at http://jaekel:8787
```

### Completion Criteria
- [ ] Attack script completes without errors
- [ ] Output files generated in cache/results directories
- [ ] ML model training completed
- [ ] Evaluation metrics logged

### Contingencies
- **Memory issues:** Reduce Dask workers or increase memory limit
- **Slow processing:** Check Dask dashboard for bottlenecks
- **Script errors:** Check existing test data runs work first

---

## Phase 4: Results Analysis

### Status: PENDING (waiting for Phase 3)

### Tasks

#### 4.1 Collect Results
- Classification accuracy
- Precision/Recall/F1 for attack detection
- Confusion matrix
- Feature importance

#### 4.2 Generate Report
- Summary statistics
- Visualizations
- Comparison with previous runs (if applicable)

#### 4.3 Notify Aaron
- Post results to Slack #aibot-chat
- Include key metrics and any issues encountered

---

## Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| Python 3.12 | Jaekel .venv | ✅ Available |
| pandas | .venv | ✅ Installed |
| pyarrow | .venv | ✅ Installed |
| dask | .venv | ✅ Installed |
| scikit-learn | .venv | ✅ Installed |
| boto3 | .venv | ✅ Installed |

## Server Resources (Jaekel)

| Resource | Available | Required |
|----------|-----------|----------|
| Disk Space | 232GB free | ~25GB (data + cache) |
| RAM | ? | 12-24GB for Dask |
| CPU | ? | Multi-core for parallel |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Download fails | Low | High | Retry with resume |
| Disk full | Low | High | Check space before each phase |
| Memory OOM | Medium | Medium | Tune Dask workers |
| API rate limit | Low | Medium | Use pagination |
| Server crash | Low | High | Use nohup, checkpoint progress |

---

## Contact

- **Aaron Collins:** Primary stakeholder
- **Sophie:** Session owner, can spawn workers
- **Coordinator:** Manages phases
- **Task Managers:** Execute individual tasks

---

## Changelog

- [2026-02-19 21:28 EST] Plan created by Sophie
- [2026-02-19 21:28 EST] Phase 1 started (download running)
