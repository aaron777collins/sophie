# Pipeline Caching Best Practices

**Created:** [2026-02-20 19:17 EST]
**Source:** Connected Driving Pipeline cache audit findings

---

## 🔴 The Problem: Cache Key Collisions

**[2026-02-20] Learned the hard way:**
- Different configurations generated identical cache keys
- Result: Silent data corruption, wrong cached data returned
- Symptom: 0% cache hit rate (constant invalidation) OR high hit rate with different results

---

## ✅ Requirements for Cache Keys

**Cache keys MUST include ALL configuration parameters that affect output:**

1. **Spatial Parameters**
   - Radius/distance values
   - Coordinate bounds
   - Filter criteria

2. **Feature Parameters**
   - Feature sets being used
   - Column selections
   - Data transformations

3. **Attack Parameters** (for ML pipelines)
   - Attack type
   - Attack ratios
   - Distance ranges

4. **Processing Parameters**
   - Model types
   - Hyperparameters
   - Random seeds

---

## 🧪 Validation Steps

### Before Production Runs

1. **Generate cache keys for all config combinations:**
   ```python
   # Create test that generates keys for all configs
   # Verify no duplicates exist
   keys = [generate_cache_key(config) for config in all_configs]
   assert len(keys) == len(set(keys)), "Duplicate cache keys detected!"
   ```

2. **Monitor cache metadata:**
   ```bash
   cat cache/cache_metadata.json
   # Each unique config should have unique entry
   ```

### During Runs

3. **Watch cache hit rates:**
   - **Suspiciously LOW** hit rate = cache invalidation problem
   - **Suspiciously HIGH** hit rate with different configs = collision problem

4. **Include config fingerprints in output paths:**
   ```
   results/200km_basic_attack10pct/...
   results/100km_extended_attack30pct/...
   ```

---

## 💡 Implementation Pattern

```python
def generate_cache_key(config: dict) -> str:
    """
    Generate unique cache key including ALL variable parameters.
    """
    key_components = [
        # Spatial
        f"radius={config['spatial_radius']}",
        f"coords={config['center_coords']}",
        
        # Features
        f"features={sorted(config['feature_set'])}",
        
        # Attack (if applicable)
        f"attack_type={config.get('attack_type', 'none')}",
        f"attack_ratio={config.get('attack_ratio', 0)}",
        
        # Processing
        f"model={config.get('model_type', 'default')}",
        f"seed={config.get('random_seed', 0)}",
    ]
    
    return hashlib.sha256("|".join(key_components).encode()).hexdigest()
```

---

## 🔗 Related

- [2026-02-20] Connected Driving cache audit: `scheduler/coordinator/notes/2026-02-20-cache-audit-findings.md`
- Project plan: `memory/projects/connected-driving-simulation-plan.md`
