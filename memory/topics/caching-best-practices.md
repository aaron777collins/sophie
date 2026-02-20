# Caching Best Practices and Pitfalls

## Overview
[2026-02-20 23:35 EST] Critical organizational knowledge from Connected Driving Pipeline cache key audit that revealed serious cache collision issues.

**Key Learning**: Cache key collisions can cause silent data corruption and non-reproducible results. This affects any project using caching mechanisms.

## Critical Incident: Cache Key Collisions

**[2026-02-20 EST]** Sophie conducted urgent cache key audit at Aaron's direction, revealing:

### The Problem
- **Different configurations generated identical cache keys**
  - 10% vs 30% attack ratios → same cache key
  - 2km vs 200km spatial radii → same cache key  
  - Different feature sets → same cache key
- **Silent data corruption**: Wrong cached results served without warning
- **0% cache hit rate**: Complete cache invalidation indicating systemic issues
- **Non-reproducible results**: Same configuration could produce different results

### Root Cause Analysis
1. **Incomplete cache key generation**: Only included subset of parameters (class name, filename) but omitted:
   - Configuration context parameters
   - Attack/model parameters
   - Spatial/temporal boundaries
   - Feature set selections
   - Random seeds
2. **Singleton GeneratorContextProvider**: Shared state between runs complicated cache key generation
3. **No cache key validation**: No tests to ensure different configurations produce different keys

## Universal Caching Rules

### 🔴 **RULE 1: Complete Parameter Coverage**
**If it affects the function output, it MUST be in the cache key. No exceptions.**

```python
# ❌ BAD - Incomplete cache key
@cache
def analyze_data(file_path):
    # Missing: analysis_type, parameters, random_seed, etc.
    cache_key = f"analyze_{file_path}"

# ✅ GOOD - Complete cache key  
@cache
def analyze_data(file_path, analysis_type, params, random_seed):
    param_hash = hash(sorted(params.items()))
    cache_key = f"analyze_{file_path}_{analysis_type}_{param_hash}_{random_seed}"
```

### 🔴 **RULE 2: Handle Configuration Context**
**Include ALL configuration that affects results:**

```python
# ✅ Capture complete configuration snapshot
def generate_cache_key(func_name, variables, config_provider):
    key_parts = [func_name] + [str(v) for v in variables]
    
    # CRITICAL: Include ALL configuration context
    if config_provider:
        config_snapshot = config_provider.getAll().copy()
        sorted_config = sorted(config_snapshot.items())
        key_parts.append(f"CONFIG_{str(sorted_config)}")
    
    return hashlib.md5("_".join(key_parts).encode()).hexdigest()
```

### 🔴 **RULE 3: Mandatory Cache Key Validation**
**Every project using caching MUST implement these tests:**

```python
def test_cache_key_uniqueness():
    """MANDATORY: Test that different configs produce different keys"""
    
    config_a = {'param': 'value_a', 'setting': 123}
    config_b = {'param': 'value_b', 'setting': 123}  # Different param
    config_c = {'param': 'value_a', 'setting': 456}  # Different setting
    
    key_a = generate_cache_key('func', ['args'], config_a)
    key_b = generate_cache_key('func', ['args'], config_b) 
    key_c = generate_cache_key('func', ['args'], config_c)
    
    # All keys must be different
    assert key_a != key_b, "CRITICAL: Cache collision!"
    assert key_a != key_c, "CRITICAL: Cache collision!"
    assert key_b != key_c, "CRITICAL: Cache collision!"
    
    # Same config must produce same key (reproducibility)
    key_a2 = generate_cache_key('func', ['args'], config_a)
    assert key_a == key_a2, "CRITICAL: Non-reproducible cache key!"

# Must pass before deploying any caching system
test_cache_key_uniqueness()
```

### 🔴 **RULE 4: Monitor Cache Health**
**Set up monitoring and alerting:**

```python
# Target metrics
CACHE_HIT_RATE_TARGET = 0.85  # >85% for repeated configs
CACHE_HIT_RATE_ALERT = 0.50   # <50% indicates problems  
CACHE_COLLISION_TOLERANCE = 0 # Zero tolerance for collisions

def monitor_cache_health():
    hit_rate = cache.get_hit_rate()
    collisions = cache.detect_collisions()
    
    if hit_rate < CACHE_HIT_RATE_ALERT:
        alert("Cache hit rate too low: potential key issues")
    
    if collisions > CACHE_COLLISION_TOLERANCE:
        alert("CRITICAL: Cache key collisions detected")
```

## Common Anti-Patterns to Avoid

### ❌ **Anti-Pattern 1: Partial Parameter Inclusion**
```python
# BAD - Missing critical parameters
@cache
def train_model(data_path, model_type):
    # Missing: hyperparameters, random_seed, preprocessing_config
    return f"model_{data_path}_{model_type}"
```

### ❌ **Anti-Pattern 2: Non-Deterministic Keys** 
```python
# BAD - Uses timestamps, memory addresses
@cache  
def process_data(config_obj):
    # Non-reproducible: time changes, memory addresses vary
    return f"process_{id(config_obj)}_{time.time()}"
```

### ❌ **Anti-Pattern 3: Singleton Dependency**
```python
# BAD - Singleton state can change between cache key generation and usage
global_config = ConfigSingleton()

@cache
def analyze():
    # Dangerous: global_config might change after cache key generated
    return f"analyze_{global_config.current_state()}"
```

### ❌ **Anti-Pattern 4: Implicit Parameter Dependencies**
```python
# BAD - Function uses environment variables not in cache key
@cache
def load_data(file_path):
    data_version = os.getenv('DATA_VERSION')  # Not in cache key!
    processing_mode = os.getenv('PROCESSING_MODE')  # Not in cache key!
    # Cache key missing critical environment dependencies
```

## Best Practice Patterns

### ✅ **Pattern 1: Explicit Parameter Capture**
```python
@cache
def robust_analysis(data_path, model_params, processing_config, random_seed, env_context):
    """All parameters that affect output are explicit function parameters"""
    
    # Generate comprehensive cache key
    key_components = [
        'robust_analysis',
        data_path,
        hash(sorted(model_params.items())),
        hash(sorted(processing_config.items())), 
        random_seed,
        hash(sorted(env_context.items()))
    ]
    cache_key = '_'.join(str(c) for c in key_components)
    return hashlib.md5(cache_key.encode()).hexdigest()
```

### ✅ **Pattern 2: Configuration Snapshot Pattern**
```python
def cache_with_full_context(func):
    def wrapper(*args, **kwargs):
        # Capture complete configuration at cache time
        if hasattr(args[0], 'config_provider'):
            config_snapshot = args[0].config_provider.getAll().copy()
        else:
            config_snapshot = {}
            
        cache_key = generate_comprehensive_key(func.__name__, args, kwargs, config_snapshot)
        # ... rest of caching logic
    return wrapper
```

### ✅ **Pattern 3: Cache Validation Integration**
```python
class CacheManager:
    def __init__(self):
        self.validation_enabled = True
        self.collision_detector = CollisionDetector()
    
    def store(self, key, value):
        if self.validation_enabled:
            self.collision_detector.check_uniqueness(key, value)
        # ... store logic
        
    def validate_configuration_uniqueness(self, config_sets):
        """Ensure different configuration sets produce different cache keys"""
        keys = [self.generate_key(config) for config in config_sets]
        assert len(set(keys)) == len(keys), "Cache key collision detected!"
```

## Organizational Implementation

### **For New Projects**
1. **Design Phase**: Document all parameters that affect cached function outputs
2. **Implementation**: Use comprehensive cache key generation patterns  
3. **Testing**: Implement mandatory cache key uniqueness tests
4. **Monitoring**: Set up cache health metrics and alerting

### **For Existing Projects** 
1. **Audit Phase**: Search for all caching mechanisms (`@cache`, `@lru_cache`, file caching)
2. **Validation**: Test cache key uniqueness for different configurations
3. **Remediation**: Enhance cache keys to include missing parameters
4. **Verification**: Clear cache and re-run with enhanced keys

### **Code Review Requirements**
- [ ] All cached functions list parameters affecting output
- [ ] Cache keys include ALL relevant parameters
- [ ] Cache key uniqueness tests implemented and passing
- [ ] Cache performance monitoring configured

## Emergency Response

### **If Cache Key Collisions Detected:**
1. **IMMEDIATE**: Stop affected processes, prevent further data corruption
2. **ASSESS**: Identify all configurations potentially affected  
3. **CLEAR**: Remove corrupted cache files
4. **FIX**: Enhance cache key generation to include missing parameters
5. **VALIDATE**: Test cache key uniqueness before resuming
6. **RE-RUN**: Re-execute all potentially affected configurations

### **Warning Signs:**
- Cache hit rate suddenly drops or stays consistently low (<50%)
- Different configurations producing identical results
- "Mysterious" result variations between runs with same inputs
- Cache files with identical names for different configurations

## Historical Lessons

### **Connected Driving Pipeline (2026-02-20)**
- **Issue**: Attack ratios, spatial radii, feature sets not in cache keys
- **Impact**: Potential incorrect analysis results from shared cached data
- **Resolution**: Enhanced cache key generation with full context snapshots
- **Lesson**: Even sophisticated ML pipelines vulnerable to basic cache key issues

### **Key Organizational Takeaways**
1. **Cache issues are insidious**: They cause silent corruption that's extremely hard to debug
2. **Parameters evolve**: What seems "constant" today may become configurable tomorrow
3. **Testing is critical**: Cache key collisions won't be caught without explicit testing
4. **Monitoring is essential**: Cache health metrics can catch issues before they cause damage

---

**Remember**: Caching systems optimize performance but can destroy correctness if implemented incorrectly. Always err on the side of including too many parameters in cache keys rather than too few.