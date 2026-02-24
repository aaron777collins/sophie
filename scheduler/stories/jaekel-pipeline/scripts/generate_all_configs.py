#!/usr/bin/env python3
"""
Generate ALL 36 pipeline configurations for ConnectedDrivingPipelineV4

Matrix:
- 3 Radii: 2km, 100km, 200km
- 3 Feature Sets: Basic, Movement, Extended
- 2 ID Variants: NoId, WithId
- 2 Attack Types: const_offset_per_id, rand_offset

Total: 3 × 3 × 2 × 2 = 36 configurations
"""

import json
import os

# Correct column names (from actual parquet schema)
CORRECT_COLUMNS = {
    "timestamp": "metadata_receivedAt",
    "lat": "coreData_position_lat",
    "long": "coreData_position_long",
    "elevation": "coreData_elevation",
    "speed": "coreData_speed",
    "heading": "coreData_heading",
    "yaw": "coreData_accelset_accelYaw",
    "id": "coreData_id"
}

# Feature sets
FEATURE_SETS = {
    "basic": {
        "columns_to_extract": [
            CORRECT_COLUMNS["timestamp"],
            CORRECT_COLUMNS["lat"],
            CORRECT_COLUMNS["long"],
            CORRECT_COLUMNS["elevation"]
        ],
        "ml_features": ["x_pos", "y_pos", CORRECT_COLUMNS["elevation"]]
    },
    "movement": {
        "columns_to_extract": [
            CORRECT_COLUMNS["timestamp"],
            CORRECT_COLUMNS["lat"],
            CORRECT_COLUMNS["long"],
            CORRECT_COLUMNS["elevation"],
            CORRECT_COLUMNS["speed"],
            CORRECT_COLUMNS["heading"]
        ],
        "ml_features": ["x_pos", "y_pos", CORRECT_COLUMNS["elevation"], 
                       CORRECT_COLUMNS["speed"], CORRECT_COLUMNS["heading"]]
    },
    "extended": {
        "columns_to_extract": [
            CORRECT_COLUMNS["timestamp"],
            CORRECT_COLUMNS["lat"],
            CORRECT_COLUMNS["long"],
            CORRECT_COLUMNS["elevation"],
            CORRECT_COLUMNS["speed"],
            CORRECT_COLUMNS["heading"],
            CORRECT_COLUMNS["yaw"]
        ],
        "ml_features": ["x_pos", "y_pos", CORRECT_COLUMNS["elevation"],
                       CORRECT_COLUMNS["speed"], CORRECT_COLUMNS["heading"],
                       CORRECT_COLUMNS["yaw"]]
    }
}

# Radii
RADII = {
    "2km": {"meters": 2000, "dask_workers": 2, "memory": "8GB"},
    "100km": {"meters": 100000, "dask_workers": 4, "memory": "12GB"},
    "200km": {"meters": 200000, "dask_workers": 6, "memory": "16GB"}
}

# Attack types (CORRECT mapping to code!)
ATTACK_TYPES = {
    "const": {
        "type": "const_offset_per_id",  # Per-vehicle constant offset
        "suffix": "const"
    },
    "rand": {
        "type": "rand_offset",  # Per-point random offset
        "suffix": "rand"
    }
}

# Wyoming center coordinates
CENTER = {
    "latitude": 41.538689,
    "longitude": -109.319556
}

def generate_config(radius_name, feature_name, with_id, attack_name):
    """Generate a single pipeline config"""
    
    radius = RADII[radius_name]
    features = FEATURE_SETS[feature_name]
    attack = ATTACK_TYPES[attack_name]
    
    # Build name
    id_suffix = "_withid" if with_id else ""
    name = f"{feature_name}_{radius_name}{id_suffix}_{attack['suffix']}"
    
    # Add ID to features if needed
    columns = features["columns_to_extract"].copy()
    ml_features = features["ml_features"].copy()
    
    if with_id:
        if CORRECT_COLUMNS["id"] not in columns:
            columns.append(CORRECT_COLUMNS["id"])
        if CORRECT_COLUMNS["id"] not in ml_features:
            ml_features.append(CORRECT_COLUMNS["id"])
    
    config = {
        "pipeline_name": name,
        "version": "2.0.0",
        "created": "2026-02-23",
        "template_generated": True,
        "template_parameters": {
            "spatial_radius": radius_name,
            "feature_set": feature_name.upper(),
            "attack_type": attack["type"],
            "with_vehicle_id": with_id,
            "malicious_ratio": 0.3
        },
        "data": {
            "source_file": "April_2021_Wyoming_Data_Fixed.parquet",
            "source_type": "parquet",
            "columns_to_extract": columns,
            "num_subsection_rows": None,  # Use ALL rows - no limit!
            "filtering": {
                "center_longitude": CENTER["longitude"],
                "center_latitude": CENTER["latitude"],
                "radius_meters": radius["meters"]
            },
            "date_range": {
                "start": "2021-04-01",
                "end": "2021-04-30"
            },
            "coordinate_conversion": {
                "enabled": True,
                "method": "local_projection",
                "output_columns": ["x_pos", "y_pos"]
            }
        },
        "attack": {
            "type": attack["type"],
            "malicious_ratio": 0.3,
            "label_column": "isAttacker",
            "offset_distance_min": 100,
            "offset_distance_max": 200,
            "offset_direction_min": 0,
            "offset_direction_max": 360,
            "seed": 42
        },
        "ml": {
            "features": ml_features,
            "label": "isAttacker",
            "train_test_split": {
                "test_size": 0.2,
                "random_state": 42,
                "shuffle": True
            },
            "classifiers": ["RandomForest", "DecisionTree", "KNeighbors"]
        },
        "cache": {
            "enabled": True,
            "version": "v3",
            "clean_dataset": f"cache/matrix/{name}/clean.parquet",
            "attack_dataset": f"cache/matrix/{name}/attack.parquet"
        },
        "output": {
            "results_dir": f"results/matrix/{name}/",
            "log_dir": "logs/"
        },
        "dask": {
            "n_workers": radius["dask_workers"],
            "threads_per_worker": 2,
            "memory_limit": radius["memory"],
            "dashboard_address": ":0"  # Dynamic port to avoid conflicts
        }
    }
    
    return name, config


def generate_run_script(config_name):
    """Generate a Run*.py script for a config"""
    
    # Convert config name to script name
    # e.g., basic_2km_const -> Run2kmBasicConst.py
    parts = config_name.split('_')
    
    # Handle different naming patterns
    if 'withid' in config_name:
        # basic_2km_withid_const -> Run2kmBasicWithIdConst
        feature = parts[0].capitalize()
        radius = parts[1]
        attack = parts[3].capitalize()
        script_name = f"Run{radius.capitalize()}{feature}WithId{attack}.py"
    else:
        # basic_2km_const -> Run2kmBasicConst
        feature = parts[0].capitalize()
        radius = parts[1]
        attack = parts[2].capitalize()
        script_name = f"Run{radius.capitalize()}{feature}{attack}.py"
    
    script_content = f'''#!/usr/bin/env python3
"""
Auto-generated pipeline runner for {config_name}
Generated: 2026-02-23
"""

import json
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from MachineLearning.DaskPipelineRunner import DaskPipelineRunner

def main():
    config_path = "production_configs/{config_name}_pipeline_config.json"
    
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    print(f"Running pipeline: {{config['pipeline_name']}}")
    print(f"Config: {{config_path}}")
    
    runner = DaskPipelineRunner(config)
    runner.run()
    
    print(f"Pipeline {{config['pipeline_name']}} complete!")

if __name__ == "__main__":
    main()
'''
    
    return script_name, script_content


def main():
    configs = []
    scripts = []
    
    # Generate all 36 configurations
    for radius_name in RADII.keys():
        for feature_name in FEATURE_SETS.keys():
            for with_id in [False, True]:
                for attack_name in ATTACK_TYPES.keys():
                    name, config = generate_config(radius_name, feature_name, with_id, attack_name)
                    configs.append((name, config))
                    
                    script_name, script_content = generate_run_script(name)
                    scripts.append((script_name, script_content))
    
    print(f"Generated {len(configs)} configurations:")
    for name, _ in configs:
        print(f"  - {name}")
    
    print(f"\nGenerated {len(scripts)} run scripts:")
    for name, _ in scripts:
        print(f"  - {name}")
    
    # Output configs as JSON
    output = {
        "total_configs": len(configs),
        "configs": {name: config for name, config in configs},
        "scripts": {name: content for name, content in scripts}
    }
    
    # Write to files
    os.makedirs("generated_configs", exist_ok=True)
    
    for name, config in configs:
        with open(f"generated_configs/{name}_pipeline_config.json", 'w') as f:
            json.dump(config, f, indent=2)
    
    for name, content in scripts:
        with open(f"generated_configs/{name}", 'w') as f:
            f.write(content)
    
    print(f"\nWrote files to generated_configs/")
    return output


if __name__ == "__main__":
    main()
