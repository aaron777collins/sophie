# Connected Driving Simulation Matrix Project

## Overview
[2026-02-20 19:37 EST] Comprehensive simulations across 3 spatial radii (200km, 100km, 2km) and 6 feature sets to analyze connected vehicle security vulnerabilities in Wyoming's connected vehicle data.

**Location**: Jaekel Server: `~/repos/ConnectedDrivingPipelineV4`  
**Dashboard**: http://65.108.237.46/dashboard/  
**Data Source**: April 2021 Wyoming CV BSM data (`April_2021_Wyoming_Data_Fixed.csv`)

## Data Verification Results (cdp-1-1)

[2026-02-20 19:37 EST] **COMPLETED** - Spatial distribution analysis of Wyoming CV BSM data

### Data Source
- **File**: `April_2021_Wyoming_Data_Fixed.csv`
- **Size**: 13.2GB (13,318,201 total records)
- **Valid Records**: 13,318,200 (99.999% valid coordinates)

### Spatial Distribution Analysis

**Center Point**: (41.538689, -109.319556)

| Radius | Records | Percentage | Status |
|--------|---------|------------|---------|
| **200km** | **6,276,427** | **47.13%** | ✅ **SUFFICIENT** |
| **100km** | **3,434,980** | **25.79%** | ✅ **SUFFICIENT** |
| **2km** | **238,744** | **1.79%** | ✅ **SUFFICIENT** |

### Verification Outcome
✅ **ALL RADII CONFIRMED SUFFICIENT** for planned simulation matrix

- **200km experiments**: 6.3M records available - excellent coverage for comprehensive analysis
- **100km experiments**: 3.4M records available - strong dataset for medium-range scenarios  
- **2km experiments**: 239K records available - adequate density for detailed local analysis

## Configurable Pipeline Template System (cdp-1-2)

[2026-02-20 21:15 EST] **COMPLETED** - Configurable pipeline template supporting all spatial radii and feature sets

### Template System Components
- **Location**: `~/repos/ConnectedDrivingPipelineV4/templates/`
- **Schema**: `config_schema.json` - Defines all parameters and mappings
- **Generator**: `config_generator.py` - Creates pipeline configs from templates
- **Template**: `configurable_pipeline_template.py` - Adaptable pipeline implementation  
- **Validator**: `template_validator.py` - Comprehensive testing (8/8 tests passed)

### Supported Configurations
**✅ 3 Spatial Radii**:
- 200km (200,000m) - Large area analysis - 6.3M records available
- 100km (100,000m) - Medium area analysis - 3.4M records available  
- 2km (2,000m) - Local area analysis - 239K records available

**✅ 6 Feature Sets**:
- BASIC: x_pos, y_pos, coreData_elevation
- BASIC_WITH_ID: Above + coreData_id
- MOVEMENT: Above + coreData_heading, coreData_speed  
- MOVEMENT_WITH_ID: Above + coreData_id
- EXTENDED: Above + coreData_accelset_accelYaw
- EXTENDED_WITH_ID: Above + coreData_id

### Matrix Coverage
**18 Total Combinations**: 3 spatial radii × 6 feature sets
- All combinations tested and validated ✅
- Template generation working for all parameter sets ✅
- Ready for production configuration generation ✅

### Usage
```bash
# Generate single configuration
python3 config_generator.py --template sample_configs/basic_200km_sample.json

# Generate all 18 combinations  
python3 config_generator.py --generate-all --output-dir production_configs/

# Validate template system
python3 template_validator.py

# Run pipeline with configuration
python3 configurable_pipeline_template.py --config <config_file>
```

## ⚠️ CRITICAL: Caching Requirements (Added 2026-02-20)

**[2026-02-20 23:30 EST] MANDATORY** - Following cache key audit that revealed critical issues

### **Cache Key Collision Fix - COMPLETED ✅**
**Issue**: Different configurations (attack ratios, spatial radii, feature sets) were generating identical cache keys, causing:
- Silent data corruption (wrong cached results used)
- Non-reproducible analysis results  
- 0% cache hit rate indicating cache invalidation issues

**Resolution**: Enhanced cache key generation in `Decorators/FileCache.py` to include:
- Complete configuration snapshots from GeneratorContextProvider
- All attack parameters (ratios, distance ranges)
- All spatial parameters (radii, coordinates)
- All feature set specifications
- Full context parameter sets

### **Validation Requirements**
**Before running ANY simulation matrix configurations:**

1. **✅ COMPLETED**: Cache key uniqueness validation
   ```bash
   cd ~/repos/ConnectedDrivingPipelineV4/
   python3 test_snapshot_approach.py  # Must show "SUCCESS" 
   ```

2. **✅ COMPLETED**: Cleared corrupted cache files
   - All potentially affected cache directories cleared
   - Cache metadata reset for fresh monitoring

3. **🔄 REQUIRED**: Re-run any prior configurations that may have used corrupted cache
   - **DaskMClassifierConstOffsetPerID100To200.py**
   - **DaskMClassifierConstOffsetPerIDExtFeatures100To200.py**  
   - Any runs with different attack ratios (10% vs 30%)
   - Any runs with different spatial radii

### **Cache Monitoring**
**Target Metrics**: 
- Cache hit rate >85% for repeated identical configurations
- 0 cache key collisions detected
- Unique cache keys for all 18 matrix combinations

**Monitoring Command**:
```bash
# Check cache performance
cat ~/repos/ConnectedDrivingPipelineV4/cache/cache_metadata.json

# Validate cache key uniqueness for current configs
python3 test_snapshot_approach.py
```

### **Configuration Matrix Cache Requirements**
**Each of the 18 combinations MUST generate unique cache keys:**
- 3 spatial radii (2km, 100km, 200km) × 6 feature sets = 18 unique cache patterns
- Attack parameters MUST be included in cache keys
- Spatial parameters MUST be included in cache keys  
- Feature set selections MUST be included in cache keys

**Critical**: If any two configurations generate the same cache key, **STOP IMMEDIATELY** and escalate for cache key debugging.

## Next Steps
- **Phase 3 (cdp-1-3)**: Generate 18 production configurations for simulation matrix
- **Phase 4 (cdp-2-x)**: Execute full simulation matrix across all combinations
- **Phase 5 (cdp-3-x)**: Results analysis and reporting

## Technical Details
- **Analysis Method**: Haversine distance calculation from geographic center
- **Processing**: Chunked analysis of 13.3M records using pandas
- **Coordinate System**: WGS84 (latitude/longitude)
- **Analysis Tool**: Custom Python script with geospatial calculations