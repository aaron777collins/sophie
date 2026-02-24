# Connected Driving Pipeline - Critical Bug Fix

**Date:** 2026-02-24 00:35 EST

## Bug Discovery

While investigating XY coordinate conversion, discovered a critical bug in `MathHelper.py`:

```python
# BUG: Converting degrees to radians before passing to Geodesic.Inverse()
# But geographiclib.Geodesic.Inverse() expects DEGREES, not radians!

def dist_between_two_points(lat1, lon1, lat2, lon2):
    geod = Geodesic.WGS84
    lat1_rad = MathHelper.deg2rad(lat1)  # WRONG!
    ...
    distance = geod.Inverse(lat1_rad, ...)  # Geodesic expects degrees!
```

## Impact

**All distance calculations were 57.3x too small (180/π ratio):**

| Intended | Actual |
|----------|--------|
| 2km | 35m |
| 100km | 1.75km |
| 200km | 3.49km |

**This bug existed since the ORIGINAL pandas code (commit a070de3).**

## Fix Applied

```python
# FIXED: Pass degrees directly to Geodesic.Inverse
def dist_between_two_points(lat1, lon1, lat2, lon2):
    geod = Geodesic.WGS84
    distance = geod.Inverse(lat1, lon1, lat2, lon2)  # Degrees directly
    return distance['s12']
```

**Commit:** `5f647d6 fix: Remove deg2rad bug in dist_between_two_points`

## Actions Taken

1. ✅ Fixed MathHelper.py
2. ✅ Pushed fix to GitHub
3. ✅ Cleared all caches (33GB)
4. ✅ Cleared all old results
5. ✅ Started fresh pipeline run (all 36 configs)
6. ✅ Set up monitoring cron job
7. ✅ Symlinked results to web server

## Overnight Run

- **Total pipelines:** 36
- **Started:** 2026-02-24 06:35 EST
- **Monitoring:** Every 15 minutes via cron
- **Email notification:** aaron777collins@gmail.com, joshuapicchioni@gmail.com when complete
- **Results URL:** http://65.108.237.46/pipeline-results/

## For Previous Research

Multiply intended distances by **0.0175** to get actual distances that were used.
