# EPIC-1: Cache Key Uniqueness (CRITICAL)

**Priority:** 🔴 CRITICAL - Must be fixed FIRST
**Estimated Complexity:** HIGH
**Status:** Not Started

---

## Executive Summary

The cache key generation system in ConnectedDrivingPipelineV4 has a critical flaw: **different pipeline configurations can produce the same cache key**, causing incorrect cached data to be used. This leads to:

1. Pipeline A runs, caches result with key `abc123`
2. Pipeline B runs (different attack config), generates SAME key `abc123`
3. Pipeline B uses Pipeline A's cached data → **WRONG RESULTS**

This is the **single most important fix** because all other work is meaningless if cache collisions corrupt results.

---

## Investigation Findings

### Current Cache Key Generation (FileCache.py)

```python
def create_deterministic_cache_key(function_name: str, cache_variables: list, context_data=None) -> str:
    """
    Create a deterministic cache key from function name, variables, and full context.
    """
    key_parts = [function_name]
    # ... processes cache_variables ...
    
    # CRITICAL FIX: Include ALL configuration parameters from context
    if context_data is not None:
        # Uses context_snapshot from GeneratorContextProvider
        all_contexts = context_data.getAll()
        key_parts.append(f"CONTEXT_{str(sorted_contexts)}")
    
    return hashlib.md5(key_string.encode('utf-8')).hexdigest()
```

### Current Problems Identified

1. **Context Snapshot May Be Incomplete**
   - Context is captured at decoration time, but some configs may not be in context yet
   - Subclass-specific configs may not propagate to context

2. **Attack Parameters Not Explicitly Included**
   - `offset_distance_min`, `offset_distance_max` may not be in context
   - `attack_type` (rand_offset vs const_offset) differentiation unclear

3. **Spatial Filter Radius**
   - `max_dist` (2000, 100000, 200000) must be in key
   - Different radii MUST produce different keys

4. **Feature Set Not Distinguished**
   - BASIC vs MOVEMENT vs EXTENDED feature sets
   - Column list hash should be part of key

5. **Date Range**
   - Start/end dates must be included
   - Different date filters → different data → different keys

### Files Involved

| File | Role |
|------|------|
| `Decorators/FileCache.py` | Core cache key generation |
| `Decorators/DaskParquetCache.py` | Dask-specific wrapper |
| `Decorators/CacheManager.py` | Cache statistics/monitoring |
| `ServiceProviders/GeneratorContextProvider.py` | Context storage |

### Cache Locations

```
cache/
├── {model_name}/           # Per-pipeline cache
│   ├── {function_hash}.parquet
│   └── ...
```

---

## User Stories

### Story 1.1: Cache Key Contains All Distinguishing Parameters

**As a** ML researcher running multiple pipeline configurations  
**I want** cache keys to include ALL configuration parameters that affect output  
**So that** different configurations NEVER use each other's cached data

#### Acceptance Criteria

##### AC-1.1.1: Attack Type Differentiation
**Given** Pipeline A configured with `attack_type: rand_offset`  
**When** Pipeline B runs with `attack_type: const_offset` (all else same)  
**Then** Pipeline A and B must have DIFFERENT cache keys  
**Test Method:**
1. Create two config JSON files differing ONLY in attack_type
2. Run both pipelines with cache logging enabled
3. Extract cache keys from logs
4. Assert keys are different
**Evidence Required:** Screenshot/log showing two distinct cache keys

##### AC-1.1.2: Attack Parameter Differentiation  
**Given** Pipeline A with `offset_distance_min: 25, offset_distance_max: 100`  
**When** Pipeline B runs with `offset_distance_min: 100, offset_distance_max: 200`  
**Then** Different cache keys are generated  
**Test Method:**
1. Create two configs with different offset ranges
2. Run both with `LOG_LEVEL=DEBUG`
3. Compare cache keys
**Evidence Required:** Log diff showing different keys

##### AC-1.1.3: Spatial Radius Differentiation
**Given** Pipeline A with `radius_meters: 2000` (2km)  
**When** Pipeline B runs with `radius_meters: 100000` (100km)  
**Then** Different cache keys are generated  
**Test Method:**
1. Run 2km and 100km basic pipelines
2. Check cache key in logs matches pattern including radius
**Evidence Required:** Cache keys contain radius value

##### AC-1.1.4: Feature Set Differentiation
**Given** Pipeline A with BASIC features `[x_pos, y_pos, elevation]`  
**When** Pipeline B runs with EXTENDED features `[x_pos, y_pos, elevation, speed, heading]`  
**Then** Different cache keys are generated  
**Test Method:**
1. Hash column lists independently
2. Verify hash is part of cache key
**Evidence Required:** Column hash visible in cache key

##### AC-1.1.5: Date Range Differentiation
**Given** Pipeline A with date range `2021-04-01 to 2021-04-15`  
**When** Pipeline B runs with `2021-04-15 to 2021-04-30`  
**Then** Different cache keys are generated  
**Test Method:** Compare keys for different date ranges
**Evidence Required:** Keys differ based on date

##### AC-1.1.6: Malicious Ratio Differentiation
**Given** Pipeline A with `malicious_ratio: 0.1`  
**When** Pipeline B runs with `malicious_ratio: 0.3`  
**Then** Different cache keys are generated  
**Test Method:** Run with different ratios, compare keys
**Evidence Required:** Keys contain ratio component

---

### Story 1.2: Cache Key Format Is Human-Readable in Logs

**As a** developer debugging cache issues  
**I want** cache keys to be logged in a readable format  
**So that** I can understand which parameters contributed to the key

#### Acceptance Criteria

##### AC-1.2.1: Verbose Cache Key Logging
**Given** Any pipeline run with caching enabled  
**When** A cache operation (hit or miss) occurs  
**Then** The log shows: function name, key hash, and parameter summary  
**Test Method:**
1. Run pipeline with `LOG_LEVEL=DEBUG`
2. Grep for "CACHE" in log
3. Verify output format matches spec
**Evidence Required:** Log line example

##### AC-1.2.2: Cache Key Components Listed
**Given** A cache miss occurs  
**When** The cache key is generated  
**Then** Log shows each component: `function=X, columns_hash=Y, attack=Z, radius=W, ...`  
**Test Method:** Check log output format
**Evidence Required:** Structured log line

---

### Story 1.3: Cache Key Unit Tests

**As a** developer modifying cache logic  
**I want** automated tests to verify cache key uniqueness  
**So that** regressions are caught before deployment

#### Acceptance Criteria

##### AC-1.3.1: Test Different Attacks Same Hash Failure
**Given** Unit test with two configs differing only in attack type  
**When** Test generates cache keys for both  
**Then** Assert keys are different → test PASSES  
**Test Method:** 
```python
def test_different_attack_types_different_keys():
    config_a = {..., "attack_type": "rand_offset"}
    config_b = {..., "attack_type": "const_offset"}
    key_a = create_deterministic_cache_key("func", [], config_a)
    key_b = create_deterministic_cache_key("func", [], config_b)
    assert key_a != key_b, "Attack types must produce different keys"
```
**Evidence Required:** pytest output showing test pass

##### AC-1.3.2: Test Same Config Same Hash
**Given** Same config run twice  
**When** Cache keys generated  
**Then** Keys are IDENTICAL (deterministic)  
**Test Method:**
```python
def test_same_config_same_key():
    config = {...}
    key_1 = create_deterministic_cache_key("func", [], config)
    key_2 = create_deterministic_cache_key("func", [], config)
    assert key_1 == key_2, "Same config must produce same key"
```
**Evidence Required:** pytest output

##### AC-1.3.3: Test Radius Differentiation
**Given** Configs with different radius values  
**When** Keys generated  
**Then** Keys differ  
**Test Method:** Similar pattern
**Evidence Required:** pytest output

##### AC-1.3.4: Test Column List Hash
**Given** Configs with different column lists  
**When** Keys generated  
**Then** Keys differ  
**Test Method:** Hash column lists, verify in key
**Evidence Required:** pytest output

---

### Story 1.4: Clear Old Caches Before Validation Runs

**As a** pipeline operator preparing for validation  
**I want** a reliable way to clear all cached data  
**So that** validation runs use freshly computed data

#### Acceptance Criteria

##### AC-1.4.1: Backup Before Clear
**Given** Cache directory contains data  
**When** Clear command is issued  
**Then** Cache is backed up to `cache_backup_{timestamp}/` first  
**Test Method:**
1. Run `python scripts/clear_cache.py`
2. Verify backup exists
**Evidence Required:** Screenshot showing backup directory

##### AC-1.4.2: All Cache Directories Cleared
**Given** Multiple cache directories exist  
**When** Clear command runs  
**Then** ALL cache directories are empty:
- `cache/`
- `data/classifierdata/splitfiles/cleaned/`
- `data/classifierdata/splitfiles/combinedcleaned/`
- `data/mclassifierdata/cleaned/`
**Test Method:** Run `find cache -type f | wc -l` → should be 0
**Evidence Required:** Command output showing 0 files

##### AC-1.4.3: Clear Script Logging
**Given** Clear script runs  
**When** Completion  
**Then** Log shows: directories cleared, files deleted, backup location  
**Test Method:** Check script output
**Evidence Required:** Script log

---

### Story 1.5: Cache Key Includes Explicit Version Tag

**As a** researcher tracking pipeline versions  
**I want** cache keys to include a version tag  
**So that** algorithm changes automatically invalidate old caches

#### Acceptance Criteria

##### AC-1.5.1: Version Tag in Key
**Given** `CACHE_VERSION = "v2"` in FileCache.py  
**When** Cache key generated  
**Then** Key includes version: `v2_{hash}`  
**Test Method:** Inspect generated key format
**Evidence Required:** Key format in log

##### AC-1.5.2: Version Bump Invalidates Cache
**Given** Old cache with `v1` keys exists  
**When** Code updated to `v2`  
**Then** Old caches are NOT used (cache miss)  
**Test Method:**
1. Run with v1, create cache
2. Bump version to v2
3. Run again, verify cache miss
**Evidence Required:** Log showing cache miss after version bump

---

## Testing Requirements

### Testing Framework
- **pytest** for unit tests
- **Manual validation** for integration tests
- **Log analysis** for cache behavior verification

### Test Strategy
1. **Unit Tests:** Pure function testing of `create_deterministic_cache_key()`
2. **Integration Tests:** Full pipeline runs comparing cache keys
3. **Regression Tests:** Ensure fixes don't break existing functionality

### Coverage Requirements
- 100% coverage of `create_deterministic_cache_key()` function
- All parameter differentiation paths tested

---

## Contingency Plans

### What Could Go Wrong

| Issue | Response | Fallback |
|-------|----------|----------|
| Cache key too long | Use MD5 hash of verbose key | Truncate with collision detection |
| Context not available at cache time | Explicitly pass required params as cache_variables | Force cache bypass |
| Performance degradation from verbose keys | Profile and optimize | Use shorter hashes |
| Old caches cause confusion | Add migration script | Force clear all caches |

### If Cache Still Collides

1. **Immediate:** Add UUID to cache key temporarily
2. **Debug:** Enable verbose logging to trace key generation
3. **Fix:** Identify missing parameter and add to key

---

## Dependencies

### Depends On
- None (this is the first epic)

### Blocks
- **EPIC-2:** Schema fixes need working cache to test
- **EPIC-3:** Split fixes need cache to work correctly
- **EPIC-5:** Validation runs CANNOT proceed until cache is reliable

---

## Files to Modify

| File | Changes |
|------|---------|
| `Decorators/FileCache.py` | Update `create_deterministic_cache_key()` |
| `Decorators/DaskParquetCache.py` | Ensure context passes through |
| `ServiceProviders/GeneratorContextProvider.py` | Add missing attack params |
| `tests/test_cache_keys.py` | NEW - unit tests |
| `scripts/clear_cache.py` | NEW - cache clearing utility |

---

## Implementation Notes

### Proposed Cache Key Format

```
{version}_{function}_{columns_hash}_{attack_type}_{attack_params_hash}_{radius}_{dates_hash}_{ratio}
```

Example:
```
v2_clean_data_a3f9e2c1_rand_offset_b4c8d1e2_2000_c5d6e7f8_0.3
```

### Key Generation Pseudocode

```python
def create_deterministic_cache_key_v2(
    function_name: str,
    columns: List[str],
    attack_type: str,
    attack_params: Dict,
    radius_meters: int,
    date_range: Tuple[str, str],
    malicious_ratio: float,
    version: str = "v2"
) -> str:
    columns_hash = hashlib.md5(str(sorted(columns)).encode()).hexdigest()[:8]
    attack_hash = hashlib.md5(json.dumps(attack_params, sort_keys=True).encode()).hexdigest()[:8]
    dates_hash = hashlib.md5(f"{date_range[0]}_{date_range[1]}".encode()).hexdigest()[:8]
    
    key = f"{version}_{function_name}_{columns_hash}_{attack_type}_{attack_hash}_{radius_meters}_{dates_hash}_{malicious_ratio}"
    
    # Final hash for filesystem safety
    return hashlib.md5(key.encode()).hexdigest()
```

---

## Estimated Effort

| Task | Hours |
|------|-------|
| Investigation & planning | 2 |
| Implement new key generation | 4 |
| Unit tests | 3 |
| Integration testing | 2 |
| Cache clear script | 1 |
| Documentation | 1 |
| **Total** | **13 hours** |

---

## Success Metrics

1. ✅ Unit tests pass for all differentiation scenarios
2. ✅ No cache collisions in 18 pipeline validation runs
3. ✅ Cache keys are human-readable in logs
4. ✅ Clear script successfully wipes all caches
5. ✅ Version tag prevents old cache usage
