# Cache Validation Checklist for Task Managers
**Date:** 2026-02-20  
**Context:** Cache key audit revealed critical issues in Connected Driving Pipeline  
**Purpose:** Prevent cache collision issues in all future projects

## 🚨 CRITICAL: Add to ALL Project Validation

### **Pre-Deployment Cache Validation (MANDATORY)**

**Before marking any project as validated/complete:**

#### ✅ **Step 1: Identify All Caching Mechanisms**
- [ ] Search codebase for: `@cache`, `@lru_cache`, `FileCache`, `CSVCache`, `ParquetCache`
- [ ] Check for: `pickle.dump`, `joblib.dump`, manual file caching
- [ ] Identify: Database caching, Redis caching, memory caching
- [ ] Document: All cached functions and their purposes

#### ✅ **Step 2: Validate Cache Key Completeness**
For each cached function, verify cache keys include:
- [ ] Function name/identifier
- [ ] ALL input parameters that affect output
- [ ] ALL configuration values that affect output  
- [ ] Environment variables that affect output
- [ ] Random seeds (if applicable)
- [ ] Dataset versions/paths
- [ ] Model parameters (if applicable)

#### ✅ **Step 3: Test Cache Key Uniqueness**
- [ ] Create test with 2+ different configurations
- [ ] Verify different configurations produce different cache keys
- [ ] Verify same configuration produces same cache key (reproducibility)
- [ ] Test edge cases (similar but not identical configs)

#### ✅ **Step 4: Monitor Cache Performance**
- [ ] Verify cache hit rate >85% for repeated configurations
- [ ] Alert if cache hit rate <50% (indicates cache key issues)
- [ ] Monitor for unexpected cache key collisions

### **Cache Key Testing Template**

**Use this code pattern for validation:**

```python
def validate_project_cache_keys():
    """MANDATORY test for all projects using caching."""
    
    # Test different configurations
    config1 = {'param_a': 'value1', 'param_b': 123}
    config2 = {'param_a': 'value2', 'param_b': 123}  # Different param_a
    config3 = {'param_a': 'value1', 'param_b': 456}  # Different param_b
    
    # Generate cache keys
    key1 = generate_cache_key('function_name', ['args'], config1)
    key2 = generate_cache_key('function_name', ['args'], config2)
    key3 = generate_cache_key('function_name', ['args'], config3)
    
    # Validation assertions
    assert key1 != key2, f"CRITICAL: Cache collision! {key1} == {key2}"
    assert key1 != key3, f"CRITICAL: Cache collision! {key1} == {key3}"
    assert key2 != key3, f"CRITICAL: Cache collision! {key2} == {key3}"
    
    # Test reproducibility
    key1_repeat = generate_cache_key('function_name', ['args'], config1)
    assert key1 == key1_repeat, "CRITICAL: Cache key not reproducible!"
    
    print("✅ Cache key validation PASSED")
    return True

# MUST run this test and pass before project validation
validate_project_cache_keys()
```

### **Common Cache Key Anti-Patterns to Reject**

#### ❌ **REJECT: Incomplete cache keys**
```python
# BAD - Missing critical parameters
@cache
def process_data(data_path, config):
    cache_key = f"process_{data_path}"  # Missing config!
```

#### ❌ **REJECT: Non-deterministic cache keys**
```python
# BAD - Uses memory addresses, timestamps
@cache  
def analyze(model):
    cache_key = f"analyze_{id(model)}_{time.time()}"  # Non-reproducible!
```

#### ❌ **REJECT: Singleton-dependent keys**
```python
# BAD - Singleton state can change between runs
@cache
def clean_data():
    config = ConfigProvider()  # Singleton - state can change!
    cache_key = f"clean_{config.current_state}"
```

#### ✅ **APPROVE: Complete cache keys**
```python
# GOOD - Includes all relevant parameters
@cache
def process_data(data_path, config):
    config_hash = hash(sorted(config.items()))
    cache_key = f"process_{data_path}_{config_hash}"
```

### **Validation Failure Actions**

#### **If cache validation fails:**
1. **IMMEDIATELY STOP** validation process
2. **Document the issue** in validation notes
3. **Spawn cache fix worker** with Sonnet+ model
4. **Clear potentially corrupted cache** files
5. **Re-run affected configurations** after fix
6. **Re-validate cache keys** before continuing

#### **Escalation Triggers:**
- Any cache key collision detected
- Cache hit rate <25% (indicates severe issues)
- Different configurations producing identical results
- Workers reporting "mysterious result variations"

### **Documentation Requirements**

**For each project with caching, document:**
- [ ] All cached functions and their cache key generation logic
- [ ] List of parameters included in cache keys
- [ ] Cache performance metrics (hit rates, sizes)
- [ ] Cache invalidation strategies
- [ ] Known cache dependencies and edge cases

### **Red Flags During Validation**

**Stop validation and investigate if you see:**
- 🚨 Cache hit rate 0% (complete cache invalidation)
- 🚨 Same cache key for obviously different configurations  
- 🚨 Results vary between runs with same input
- 🚨 Cache files with identical names but different expected content
- 🚨 Worker reports about "inconsistent results"

## Project-Specific Validation Notes

### **Connected Driving Pipeline - COMPLETED ✅**
- **Issue:** Cache key collisions between different attack ratios, spatial radii
- **Fix:** Enhanced cache key generation with full context snapshots
- **Status:** Fixed and validated 2026-02-20

### **Melo v2 - NEEDS AUDIT**
- **Risk Level:** MEDIUM - May use caching for data processing
- **Action:** Audit for cache mechanisms, validate key uniqueness
- **Priority:** Next validation cycle

### **HAOS - NEEDS AUDIT** 
- **Risk Level:** LOW-MEDIUM - May cache computation results
- **Action:** Search for caching patterns, validate if found
- **Priority:** Standard validation cycle

### **PortableRalph - NEEDS AUDIT**
- **Risk Level:** MEDIUM - May cache builds, file operations  
- **Action:** Check build caching, file operation caching
- **Priority:** Next validation cycle

---

## Summary Checklist

**Before validating ANY project:**
- [ ] All caching mechanisms identified
- [ ] Cache key completeness verified
- [ ] Cache key uniqueness tested  
- [ ] Cache performance monitored
- [ ] Documentation complete
- [ ] Validation test passes

**REMEMBER:** Cache key collisions cause silent data corruption. Better to be overly cautious than miss a critical bug that corrupts analysis results.