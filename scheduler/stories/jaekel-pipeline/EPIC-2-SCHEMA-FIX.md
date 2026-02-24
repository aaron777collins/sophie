# EPIC-2: Column Name Schema Fix

**Priority:** 🟠 HIGH
**Estimated Complexity:** MEDIUM
**Status:** Not Started

---

## Executive Summary

The ConnectedDrivingPipelineV4 has a **column name mismatch** between what the code expects and what exists in the actual data files. This causes `KeyError` exceptions and data processing failures.

**The Problem:**
- CSV/Parquet files use **mixed case**: `coreData_position_lat`, `coreData_elevation`
- Some configs reference **lowercase**: `coredata_position_lat`, `coredata_elevation`
- Result: `KeyError: 'coredata_position_lat'` crashes

---

## Investigation Findings

### Actual Column Names in Data

From `April_2021_Wyoming_Data_Fixed.csv` header:

```
datatype, metadata_generatedAt, metadata_generatedby, metadata_logfilename,
metadata_schemaversion, metadata_securityresultcode, metadata_sanitized,
metadata_payloadtype, metadata_recordtype, metadata_serialid_streamid,
metadata_serialid_bundlesize, metadata_serialid_bundleid, 
metadata_serialid_recordid, metadata_serialid_serialnumber,
metadata_receivedAt, metadata_rmd_elevation, metadata_rmd_heading,
metadata_rmd_latitude, metadata_rmd_longitude, metadata_rmd_speed,
metadata_rmd_rxsource, metadata_bsmsource, coreData_msgCnt, coreData_id,
coreData_secMark, coreData_position_lat, coreData_position_long,
coreData_elevation, coreData_accelset_accelYaw, coreData_accuracy_semiMajor,
coreData_accuracy_semiMinor, coredata_transmission, coreData_speed,
coreData_heading, coredata_brakes_wheelbrakes_leftfront, ...
coreData_position
```

### Key Observations

1. **Mixed case convention**: `coreData_*` (camelCase) is dominant
2. **Some lowercase exceptions**: `coredata_transmission`, `coredata_brakes_*`
3. **Important columns for ML:**
   - `coreData_position_lat` (NOT `coredata_position_lat`)
   - `coreData_position_long` (NOT `coredata_position_long`)
   - `coreData_elevation` (NOT `coredata_elevation`)
   - `coreData_speed` (NOT `coredata_speed`)
   - `coreData_heading` (NOT `coredata_heading`)
   - `coreData_accelset_accelYaw` (NOT `coredata_accelset_accelyaw`)

### Config File Examples

**basic_2km_pipeline_config.json:**
```json
{
  "columns_to_extract": [
    "metadata_receivedat",       // WRONG - should be metadata_receivedAt
    "coredata_position_lat",     // WRONG - should be coreData_position_lat
    "coredata_position_long",    // WRONG - should be coreData_position_long
    "coredata_elevation"         // WRONG - should be coreData_elevation
  ]
}
```

**extended_2km_pipeline_config.json:**
```json
{
  "columns_to_extract": [
    "coredata_speed",            // WRONG - should be coreData_speed
    "coredata_accelset_accelyaw", // WRONG - should be coreData_accelset_accelYaw
    "coredata_heading"           // WRONG - should be coreData_heading
  ]
}
```

### Files Affected

| File | Issue |
|------|-------|
| `production_configs/*.json` | Lowercase column references |
| `DaskPipelineRunner.py` | `_get_default_columns()` returns correct names |
| `DaskCleanWithTimestamps.py` | May reference wrong column names |
| `Gatherer/DaskDataGatherer.py` | Column selection logic |

---

## User Stories

### Story 2.1: Document Complete Column Mapping

**As a** pipeline developer  
**I want** a definitive mapping of all column names  
**So that** there's a single source of truth for column references

#### Acceptance Criteria

##### AC-2.1.1: Column Mapping Document Created
**Given** The Wyoming data files exist  
**When** Documentation is created  
**Then** A file `docs/COLUMN_MAPPING.md` exists with:
- All column names from actual data
- Expected vs actual mapping
- Which feature sets use which columns
**Test Method:** File exists and is complete
**Evidence Required:** File contents screenshot

##### AC-2.1.2: Feature Set Column Lists Defined
**Given** Three feature sets: BASIC, MOVEMENT, EXTENDED  
**When** Documentation complete  
**Then** Each set has explicit column list:
- BASIC: `[metadata_generatedAt, coreData_position_lat, coreData_position_long, coreData_elevation, coreData_position]`
- MOVEMENT: BASIC + `[coreData_speed, coreData_heading]`
- EXTENDED: MOVEMENT + `[coreData_accelset_accelYaw, coreData_accuracy_semiMajor, coreData_accuracy_semiMinor]`
**Test Method:** Lists match actual data columns
**Evidence Required:** Column verification script output

---

### Story 2.2: Fix All Config Files

**As a** pipeline operator  
**I want** all config files to use correct column names  
**So that** pipelines don't crash with KeyError

#### Acceptance Criteria

##### AC-2.2.1: Basic Config Files Fixed
**Given** `production_configs/basic_*.json` files exist  
**When** Column names are updated  
**Then** All column references match actual data schema:
- `coredata_position_lat` → `coreData_position_lat`
- `coredata_position_long` → `coreData_position_long`
- `coredata_elevation` → `coreData_elevation`
- `metadata_receivedat` → `metadata_receivedAt`
**Test Method:**
```bash
grep -r "coredata_position" production_configs/ | wc -l
# Expected: 0 (all should be coreData_position)
```
**Evidence Required:** grep output showing 0 matches for wrong case

##### AC-2.2.2: Movement Config Files Fixed
**Given** `production_configs/movement_*.json` files exist  
**When** Column names updated  
**Then** Additional movement columns correct:
- `coredata_speed` → `coreData_speed`
- `coredata_heading` → `coreData_heading`
**Test Method:** Same grep pattern
**Evidence Required:** grep output

##### AC-2.2.3: Extended Config Files Fixed
**Given** `production_configs/extended_*.json` files exist  
**When** Column names updated  
**Then** Extended columns correct:
- `coredata_accelset_accelyaw` → `coreData_accelset_accelYaw`
**Test Method:** grep verification
**Evidence Required:** grep output

##### AC-2.2.4: All 18 Config Files Pass Validation
**Given** All config files updated  
**When** Validation script runs  
**Then** All 18 configs pass column name validation
**Test Method:**
```bash
python scripts/validate_configs.py production_configs/
```
**Evidence Required:** Script output "18/18 configs valid"

---

### Story 2.3: Create Column Name Validation in Code

**As a** developer loading config files  
**I want** column names validated at load time  
**So that** typos are caught immediately, not during processing

#### Acceptance Criteria

##### AC-2.3.1: Config Loader Validates Columns
**Given** A config file is loaded by `DaskPipelineRunner.from_config()`  
**When** Column names are read  
**Then** Each column is validated against known-good list  
**Test Method:**
```python
# This should raise ConfigError
bad_config = {"columns": ["coredata_elevation"]}  # wrong case
runner = DaskPipelineRunner(bad_config)  # Should fail
```
**Evidence Required:** Test showing error raised

##### AC-2.3.2: Helpful Error Message
**Given** Invalid column name in config  
**When** Validation fails  
**Then** Error message includes:
- Invalid column name
- Did-you-mean suggestion
- List of valid columns
**Test Method:** Trigger error, check message
**Evidence Required:** Error message screenshot

##### AC-2.3.3: Case-Insensitive Matching with Warning
**Given** Column `coredata_elevation` (wrong case)  
**When** Validation runs  
**Then** System logs warning: "Column 'coredata_elevation' matched as 'coreData_elevation' - consider fixing config"  
**Test Method:** Check log for warning
**Evidence Required:** Log warning output

---

### Story 2.4: Update DaskCleanWithTimestamps Column References

**As a** data processing pipeline  
**I want** cleaner code to use correct column names  
**So that** data extraction doesn't fail

#### Acceptance Criteria

##### AC-2.4.1: Timestamp Column Reference Fixed
**Given** `DaskCleanWithTimestamps.py` references timestamp column  
**When** Code runs  
**Then** Uses `metadata_generatedAt` (correct case)
**Test Method:** 
```bash
grep -n "metadata_generatedAt\|metadata_generatedat" Generator/Cleaners/DaskCleanWithTimestamps.py
```
**Evidence Required:** Only correct case appears

##### AC-2.4.2: Position Column References Fixed
**Given** Cleaner extracts position columns  
**When** Code runs  
**Then** Uses `coreData_position` (correct case)
**Test Method:** grep verification
**Evidence Required:** grep output

##### AC-2.4.3: Cleaner Runs Without KeyError
**Given** Updated cleaner code  
**When** Basic 2km pipeline runs  
**Then** No KeyError exceptions in log
**Test Method:** 
```bash
grep -i "keyerror" logs/latest_run.log | wc -l
# Expected: 0
```
**Evidence Required:** Log showing 0 KeyErrors

---

### Story 2.5: Create Column Constants Module

**As a** developer writing pipeline code  
**I want** column names defined in a single constants module  
**So that** there's one source of truth, not copy-pasted strings

#### Acceptance Criteria

##### AC-2.5.1: Constants Module Created
**Given** Column names need standardization  
**When** Module created  
**Then** `Constants/ColumnNames.py` exists with:
```python
class BSMColumns:
    GENERATED_AT = "metadata_generatedAt"
    RECEIVED_AT = "metadata_receivedAt"
    POSITION_LAT = "coreData_position_lat"
    POSITION_LONG = "coreData_position_long"
    POSITION = "coreData_position"
    ELEVATION = "coreData_elevation"
    SPEED = "coreData_speed"
    HEADING = "coreData_heading"
    ACCEL_YAW = "coreData_accelset_accelYaw"
    # ... etc
```
**Test Method:** File exists with all columns
**Evidence Required:** File contents

##### AC-2.5.2: Feature Set Lists in Constants
**Given** Constants module exists  
**When** Feature sets defined  
**Then** Module includes:
```python
BASIC_FEATURES = [BSMColumns.POSITION_LAT, BSMColumns.POSITION_LONG, BSMColumns.ELEVATION]
MOVEMENT_FEATURES = BASIC_FEATURES + [BSMColumns.SPEED, BSMColumns.HEADING]
EXTENDED_FEATURES = MOVEMENT_FEATURES + [BSMColumns.ACCEL_YAW, ...]
```
**Test Method:** Constants are correct
**Evidence Required:** Module code

##### AC-2.5.3: Code Updated to Use Constants
**Given** Constants module exists  
**When** Key files updated  
**Then** These files import from Constants instead of hardcoding:
- `DaskPipelineRunner.py`
- `DaskCleanWithTimestamps.py`
- Config generators
**Test Method:** grep for hardcoded column names should return fewer results
**Evidence Required:** Before/after grep counts

---

## Testing Requirements

### Testing Framework
- **grep** for string verification
- **pytest** for unit tests
- **Manual validation** scripts

### Test Strategy
1. **Static Analysis:** grep for wrong column names
2. **Unit Tests:** Column validation logic
3. **Integration Tests:** Full pipeline runs

### Coverage Requirements
- All 18 config files validated
- All cleaner files using correct names

---

## Contingency Plans

### What Could Go Wrong

| Issue | Response | Fallback |
|-------|----------|----------|
| Data file has different schema than expected | Re-examine actual data | Document actual schema |
| Case sensitivity varies by OS | Use case-insensitive matching | Normalize all to lowercase internally |
| Old cached data has wrong columns | Clear cache (EPIC-1) | Force re-processing |
| Configs in multiple locations | Find all with `find` command | Centralize configs |

### If KeyError Still Occurs

1. **Debug:** Print actual columns vs expected columns
2. **Log:** Add column listing at pipeline start
3. **Validate:** Add explicit column check before processing

---

## Dependencies

### Depends On
- **EPIC-1:** Cache must be fixed first (wrong cache could mask column issues)

### Blocks
- **EPIC-3:** Split fix needs data to load correctly
- **EPIC-5:** Validation runs need correct schemas

---

## Files to Modify

| File | Changes |
|------|---------|
| `production_configs/*.json` (18 files) | Fix column names |
| `Generator/Cleaners/DaskCleanWithTimestamps.py` | Update column refs |
| `Generator/Cleaners/DaskConnectedDrivingCleaner.py` | Update column refs |
| `Runners/DaskPipelineRunner.py` | Update `_get_default_columns()` |
| `Constants/ColumnNames.py` | NEW - column constants |
| `scripts/validate_configs.py` | NEW - validation script |
| `docs/COLUMN_MAPPING.md` | NEW - documentation |

---

## Complete Column Mapping Reference

Based on investigation of `April_2021_Wyoming_Data_Fixed.csv`:

### Metadata Columns
| Actual Name | Previously Used (Wrong) |
|-------------|------------------------|
| `metadata_generatedAt` | `metadata_generatedat` |
| `metadata_receivedAt` | `metadata_receivedat` |
| `metadata_recordtype` | `metadata_recordtype` ✓ |
| `metadata_serialid_streamid` | `metadata_serialid_streamid` ✓ |

### Core Data Columns
| Actual Name | Previously Used (Wrong) |
|-------------|------------------------|
| `coreData_position_lat` | `coredata_position_lat` |
| `coreData_position_long` | `coredata_position_long` |
| `coreData_elevation` | `coredata_elevation` |
| `coreData_speed` | `coredata_speed` |
| `coreData_heading` | `coredata_heading` |
| `coreData_accelset_accelYaw` | `coredata_accelset_accelyaw` |
| `coreData_accuracy_semiMajor` | `coredata_accuracy_semimajor` |
| `coreData_accuracy_semiMinor` | `coredata_accuracy_semiminor` |
| `coreData_position` | `coredata_position` |
| `coreData_id` | `coredata_id` |
| `coreData_secMark` | `coredata_secmark` |
| `coreData_msgCnt` | `coredata_msgcnt` |

### Already Lowercase (Correct as-is)
| Column Name | Notes |
|-------------|-------|
| `coredata_transmission` | Already lowercase in data |
| `coredata_brakes_*` | Already lowercase in data |

---

## Estimated Effort

| Task | Hours |
|------|-------|
| Document column mapping | 1 |
| Fix 18 config files | 2 |
| Create Constants module | 1 |
| Update cleaner code | 2 |
| Create validation script | 2 |
| Testing | 2 |
| Documentation | 1 |
| **Total** | **11 hours** |

---

## Success Metrics

1. ✅ Zero `KeyError` exceptions in any pipeline run
2. ✅ All 18 config files pass validation
3. ✅ Column constants module created and used
4. ✅ grep for wrong case returns 0 matches
5. ✅ Documentation complete
