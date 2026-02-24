# EPIC-3: Train/Test Split Logic Fix

**Priority:** 🟠 HIGH
**Estimated Complexity:** MEDIUM
**Status:** Not Started

---

## Executive Summary

The current train/test split logic in `DaskPipelineRunner.py` has critical flaws that cause:

1. **Zero test samples** for small datasets (2km radius)
2. **n_samples=0 errors** from sklearn classifiers
3. **Invalid ML results** due to missing test evaluation

The split logic uses fixed row counts instead of percentages, causing failures when datasets are smaller than expected.

---

## Investigation Findings

### Current Split Logic (DaskPipelineRunner.py lines 360-374)

```python
# Step 2: Train/test split
train_ratio = split_config.get("train_ratio", 0.8)
num_rows_to_train = int(total_rows * train_ratio) if split_config.get("type") == "random" else split_config.get("num_train_rows", 100000)

# Compute the full dataset first, then split
data_pd = data.compute()  # Materialize to pandas for splitting
train_pd = data_pd.head(num_rows_to_train)
test_pd = data_pd.tail(total_rows - num_rows_to_train) if total_rows > num_rows_to_train else data_pd.head(0)
```

### Problems Identified

1. **Fixed `num_train_rows: 100000` default**
   - 2km pipeline produces ~4,610 rows
   - Config says `num_train_rows: 100000`
   - Result: ALL data goes to train, test set is EMPTY

2. **Sequential Split (head/tail)**
   - `head()` takes first N rows for training
   - `tail()` takes remaining for test
   - If N >= total_rows, test is empty
   - No shuffling means temporal bias

3. **Error When Test Empty**
   ```
   ValueError: n_samples=0 is not supported by train_test_split
   ```

### Dataset Sizes (Approximate)

| Radius | Expected Rows | Current train_rows config |
|--------|--------------|--------------------------|
| 2km | ~4,610 | 100,000 ❌ |
| 100km | ~500,000 | 100,000 ✓ |
| 200km | ~1,000,000 | 100,000 ✓ |

### Successful Run Reference

From the working log (`wyoming_apr2021_constoffset_20260213_031727.log`):
```
Clean dataset: 4,610 rows, 15 unique vehicles
...
Train: 3,688, Test: 922
```

This used **80/20 split** correctly (3688 + 922 = 4610).

---

## User Stories

### Story 3.1: Implement Percentage-Based Splits

**As a** ML pipeline  
**I want** train/test splits based on percentages  
**So that** splits work regardless of dataset size

#### Acceptance Criteria

##### AC-3.1.1: Config Supports test_size Ratio
**Given** Config file with `"train_test_split": {"test_size": 0.2}`  
**When** Pipeline runs  
**Then** 20% of data goes to test, 80% to train  
**Test Method:**
```python
# With 4610 rows:
# test = 4610 * 0.2 = 922
# train = 4610 * 0.8 = 3688
```
**Evidence Required:** Log showing correct split sizes

##### AC-3.1.2: Minimum Test Size Enforced
**Given** Small dataset (e.g., 100 rows)  
**When** Split calculated  
**Then** Test size is at least 10 samples (for valid ML evaluation)  
**Test Method:** Run with tiny dataset, verify test >= 10
**Evidence Required:** Log showing minimum enforced

##### AC-3.1.3: Validation Fails for Insufficient Data
**Given** Dataset too small for meaningful split (e.g., 5 rows)  
**When** Split attempted  
**Then** Pipeline raises clear error: "Insufficient data for train/test split. Need at least 20 samples, got 5"  
**Test Method:** Run with tiny dataset
**Evidence Required:** Error message in log

##### AC-3.1.4: Log Shows Split Statistics
**Given** Any pipeline run  
**When** Split completes  
**Then** Log includes:
```
Train/Test Split:
  Total rows: 4,610
  Train rows: 3,688 (80.0%)
  Test rows: 922 (20.0%)
  Split method: random_shuffle
```
**Test Method:** Check log format
**Evidence Required:** Log section screenshot

---

### Story 3.2: Use sklearn's train_test_split

**As a** data scientist  
**I want** proper random shuffling in splits  
**So that** there's no temporal or positional bias in train/test sets

#### Acceptance Criteria

##### AC-3.2.1: Use sklearn train_test_split
**Given** Dataset ready for splitting  
**When** Split occurs  
**Then** Uses `sklearn.model_selection.train_test_split()` with shuffle=True  
**Test Method:** 
```python
from sklearn.model_selection import train_test_split
train, test = train_test_split(data, test_size=0.2, random_state=42, shuffle=True)
```
**Evidence Required:** Code diff showing implementation

##### AC-3.2.2: Random State for Reproducibility
**Given** Config includes `"random_state": 42`  
**When** Pipeline runs twice  
**Then** Same split produced both times  
**Test Method:** Run twice, compare row indices
**Evidence Required:** Hash of train indices matches between runs

##### AC-3.2.3: Stratified Split for Imbalanced Data
**Given** Dataset has 70% benign, 30% attacker  
**When** Stratified split enabled  
**Then** Both train and test maintain 70/30 ratio  
**Test Method:**
```python
train_ratio = train['isAttacker'].sum() / len(train)
test_ratio = test['isAttacker'].sum() / len(test)
assert abs(train_ratio - test_ratio) < 0.05
```
**Evidence Required:** Ratio comparison output

---

### Story 3.3: Update All Config Files with Correct Split Config

**As a** pipeline operator  
**I want** all config files to have correct split settings  
**So that** every pipeline variant produces valid splits

#### Acceptance Criteria

##### AC-3.3.1: All Configs Use Percentage Split
**Given** 18 config files in production_configs/  
**When** Updated  
**Then** All have:
```json
"train_test_split": {
  "test_size": 0.2,
  "random_state": 42,
  "shuffle": true,
  "stratify": true
}
```
**Test Method:** grep all configs for test_size
**Evidence Required:** grep output showing all have test_size: 0.2

##### AC-3.3.2: Remove num_train_rows from Configs
**Given** Old configs with `num_train_rows`  
**When** Updated  
**Then** No config contains `num_train_rows` key
**Test Method:** 
```bash
grep -r "num_train_rows" production_configs/ | wc -l
# Expected: 0
```
**Evidence Required:** grep returns 0

##### AC-3.3.3: Configs Pass Schema Validation
**Given** Updated config files  
**When** Schema validator runs  
**Then** All pass with valid split configuration
**Test Method:** `python scripts/validate_configs.py`
**Evidence Required:** Script output "18/18 valid"

---

### Story 3.4: Add Split Validation Guards

**As a** pipeline runner  
**I want** validation before ML training starts  
**So that** invalid splits are caught early with clear errors

#### Acceptance Criteria

##### AC-3.4.1: Pre-Training Validation Check
**Given** Train and test sets prepared  
**When** Before classifier training starts  
**Then** Validation checks:
- `len(train) >= 50` (minimum training samples)
- `len(test) >= 10` (minimum test samples)
- `len(train) + len(test) == total_rows` (no data loss)
**Test Method:** Intentionally violate, see error
**Evidence Required:** Validation error message

##### AC-3.4.2: Class Balance Validation
**Given** Attack labels added  
**When** Before training  
**Then** Validation checks:
- Train has both class 0 and class 1
- Test has both class 0 and class 1
- Neither class is < 5% of set
**Test Method:** Check for class imbalance warnings
**Evidence Required:** Warning or pass message in log

##### AC-3.4.3: n_samples=0 Impossible
**Given** All validation passes  
**When** sklearn train_test_split called  
**Then** n_samples=0 error CANNOT occur
**Test Method:** Run all 18 pipelines
**Evidence Required:** Zero ValueError in any log

---

### Story 3.5: Fix Attack Application After Split

**As a** ML researcher  
**I want** attacks applied correctly to both train and test sets  
**So that** test set evaluation reflects real attack detection capability

#### Acceptance Criteria

##### AC-3.5.1: Attacks Applied Post-Split
**Given** Clean data split into train/test  
**When** Attacks applied  
**Then** Attacks applied AFTER split, independently to each set
**Test Method:** Verify attack count in train and test match ratio
**Evidence Required:** Log showing attack counts per set

##### AC-3.5.2: Same Attack Parameters for Both Sets
**Given** Attack config `offset_min: 100, offset_max: 200`  
**When** Attacks applied  
**Then** Both train and test use identical attack parameters
**Test Method:** Verify log shows same params for both
**Evidence Required:** Log comparison

##### AC-3.5.3: Independent Random Seeds per Set
**Given** Attack randomization needed  
**When** Attacks applied  
**Then** Train uses seed=42, Test uses seed=43 (deterministic but different)
**Test Method:** Run twice, verify same attacks
**Evidence Required:** Identical attack positions between runs

---

## Testing Requirements

### Testing Framework
- **pytest** for unit tests
- **sklearn** for split validation
- **Manual runs** for integration

### Test Strategy
1. **Unit Tests:** Split logic with various dataset sizes
2. **Edge Case Tests:** Very small datasets
3. **Integration Tests:** Full pipeline with 2km data

### Coverage Requirements
- Split logic 100% covered
- All dataset sizes (2km, 100km, 200km) tested

### Test Cases

```python
def test_split_small_dataset():
    """2km dataset (~4610 rows) should split correctly"""
    data = pd.DataFrame(range(4610))
    train, test = split_data(data, test_size=0.2)
    assert len(train) == 3688
    assert len(test) == 922

def test_split_minimum_test_size():
    """Very small dataset should have at least 10 test samples"""
    data = pd.DataFrame(range(20))
    train, test = split_data(data, test_size=0.2)
    assert len(test) >= 10  # Minimum enforced

def test_split_insufficient_data():
    """Tiny dataset should raise error"""
    data = pd.DataFrame(range(5))
    with pytest.raises(ValueError, match="Insufficient data"):
        split_data(data, test_size=0.2)

def test_split_stratified():
    """Stratified split maintains class ratio"""
    data = pd.DataFrame({'isAttacker': [0]*70 + [1]*30})
    train, test = split_data(data, test_size=0.2, stratify='isAttacker')
    train_ratio = train['isAttacker'].mean()
    test_ratio = test['isAttacker'].mean()
    assert abs(train_ratio - test_ratio) < 0.05
```

---

## Contingency Plans

### What Could Go Wrong

| Issue | Response | Fallback |
|-------|----------|----------|
| Stratified split fails (too few of one class) | Fall back to simple random split | Log warning |
| sklearn not available | Install sklearn | Use pandas sample() |
| Memory issues with large datasets | Use Dask's random sampling | Process in chunks |
| Reproducibility breaks | Verify random_state usage | Lock numpy seed |

### If n_samples=0 Still Occurs

1. **Debug:** Print exact sizes before sklearn call
2. **Guard:** Add explicit size check before split
3. **Fallback:** Use custom split that guarantees minimum sizes

---

## Dependencies

### Depends On
- **EPIC-1:** Cache keys must be unique (different split params → different cache)
- **EPIC-2:** Column names must be correct (data must load)

### Blocks
- **EPIC-5:** Validation runs need correct splits to produce valid results

---

## Files to Modify

| File | Changes |
|------|---------|
| `Runners/DaskPipelineRunner.py` | Replace split logic with sklearn |
| `production_configs/*.json` (18 files) | Update split config |
| `tests/test_split.py` | NEW - split unit tests |
| `Utils/DataSplitter.py` | NEW - centralized split logic |

---

## Implementation Plan

### New Split Logic (Proposed)

```python
# Utils/DataSplitter.py

from sklearn.model_selection import train_test_split
from typing import Tuple
import pandas as pd
from Logger.Logger import Logger

logger = Logger("DataSplitter")

def split_train_test(
    data: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42,
    shuffle: bool = True,
    stratify_column: str = None,
    min_train_samples: int = 50,
    min_test_samples: int = 10
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split data into train and test sets with validation.
    
    Args:
        data: DataFrame to split
        test_size: Fraction for test set (0.0 to 1.0)
        random_state: Random seed for reproducibility
        shuffle: Whether to shuffle before split
        stratify_column: Column to stratify by (maintains class ratios)
        min_train_samples: Minimum required training samples
        min_test_samples: Minimum required test samples
    
    Returns:
        (train, test) DataFrames
    
    Raises:
        ValueError: If insufficient data for split
    """
    total_rows = len(data)
    logger.log(f"Splitting {total_rows:,} rows with test_size={test_size}")
    
    # Calculate expected sizes
    expected_test = int(total_rows * test_size)
    expected_train = total_rows - expected_test
    
    # Enforce minimums
    if expected_test < min_test_samples:
        expected_test = min(min_test_samples, total_rows // 2)
        expected_train = total_rows - expected_test
        logger.log(f"Adjusted test size to minimum {expected_test}")
    
    if expected_train < min_train_samples:
        raise ValueError(
            f"Insufficient data for train/test split. "
            f"Need at least {min_train_samples} train samples, "
            f"got {expected_train} from {total_rows} total rows."
        )
    
    # Prepare stratify parameter
    stratify = None
    if stratify_column and stratify_column in data.columns:
        # Check if stratification is possible
        class_counts = data[stratify_column].value_counts()
        if class_counts.min() >= 2:
            stratify = data[stratify_column]
        else:
            logger.log(f"Cannot stratify: class has < 2 samples. Using simple split.")
    
    # Perform split
    train, test = train_test_split(
        data,
        test_size=expected_test,
        random_state=random_state,
        shuffle=shuffle,
        stratify=stratify
    )
    
    # Log statistics
    logger.log(f"Train/Test Split Complete:")
    logger.log(f"  Total rows: {total_rows:,}")
    logger.log(f"  Train rows: {len(train):,} ({len(train)/total_rows*100:.1f}%)")
    logger.log(f"  Test rows: {len(test):,} ({len(test)/total_rows*100:.1f}%)")
    
    if stratify_column and stratify_column in data.columns:
        train_ratio = train[stratify_column].mean()
        test_ratio = test[stratify_column].mean()
        logger.log(f"  Train attack ratio: {train_ratio:.3f}")
        logger.log(f"  Test attack ratio: {test_ratio:.3f}")
    
    return train, test
```

### Updated DaskPipelineRunner

```python
# In DaskPipelineRunner.run():

from Utils.DataSplitter import split_train_test

# Step 2: Train/test split
self.logger.log("Step 2: Splitting into train and test sets...")

split_config = self.config.get("ml", {}).get("train_test_split", {})
test_size = split_config.get("test_size", 0.2)
random_state = split_config.get("random_state", 42)
shuffle = split_config.get("shuffle", True)
stratify = split_config.get("stratify", False)

# Convert to pandas for splitting
data_pd = data.compute() if hasattr(data, 'compute') else data

train_pd, test_pd = split_train_test(
    data_pd,
    test_size=test_size,
    random_state=random_state,
    shuffle=shuffle,
    stratify_column="isAttacker" if stratify else None
)
```

---

## Estimated Effort

| Task | Hours |
|------|-------|
| Create DataSplitter utility | 2 |
| Update DaskPipelineRunner | 2 |
| Update 18 config files | 1 |
| Write unit tests | 2 |
| Integration testing | 2 |
| Documentation | 1 |
| **Total** | **10 hours** |

---

## Success Metrics

1. ✅ Zero `n_samples=0` errors in any pipeline
2. ✅ All 18 pipelines produce valid train/test splits
3. ✅ 2km pipeline correctly splits ~4610 rows (80/20)
4. ✅ Split statistics logged for every run
5. ✅ Unit tests pass for edge cases
6. ✅ Stratified splits maintain class ratios
