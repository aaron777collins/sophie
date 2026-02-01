# Wyoming Connected Vehicle Data Format

## Overview
Technical documentation of the WYDOT (Wyoming DOT) Connected Vehicle data format from the USDOT ITS CV Pilot program.

---

## Data Source

| Field | Value |
|-------|-------|
| Source | data.transportation.gov |
| View ID | `9k4m-a3jc` |
| S3 Bucket | `usdot-its-cvpilot-publicdata` |
| Region | Wyoming I-80 corridor |
| Date Range | 2019 (appears to be) |

### Dataset Size
- [2026-01-31 20:35 EST] Full download completed
- **Actual Size:** ~40GB (42.2 GB / 42,199,913,810 bytes)
- **Record Count:** 45,721,861 records (45.7M)
- **Original Estimate:** 3.5GB / 100M records (significantly underestimated)

---

## Message Types

### BSM (Basic Safety Messages)
- **Standard:** SAE J2735
- **Purpose:** Vehicle-to-vehicle (V2V) safety communications
- **Contents:** Position, speed, heading, acceleration, brake status
- **Update Rate:** Typically 10 Hz (10 messages/second)

### TIM (Traveler Information Messages)
- **Standard:** SAE J2735
- **Purpose:** Infrastructure-to-vehicle (I2V) information
- **Contents:** Road conditions, advisories, work zones, weather alerts

---

## Schema Structure

### BSM Record Path
```
payload.data.coreData.*
```

### Key Field Paths

| Field | Path | Description |
|-------|------|-------------|
| Elevation | `payload.data.coreData.position.elevation` | Vehicle altitude |
| Latitude | `payload.data.coreData.position.lat` | WGS84 latitude |
| Longitude | `payload.data.coreData.position.long` | WGS84 longitude |
| Speed | `payload.data.coreData.speed` | Vehicle speed |
| Heading | `payload.data.coreData.heading` | Direction of travel |

### Bug Note
- [2026-01-29 10:30 EST] SchemaValidator originally had wrong path: `payload.data.coreData.elevation`
- **Correct path:** `payload.data.coreData.position.elevation`

---

## Schema Versions

| Version | Years | Notes |
|---------|-------|-------|
| v2 | 2017-2018 | Early pilot |
| v3 | 2018-2020 | Mid-pilot |
| v6 | 2020+ | Current format |

---

## File Format

- **Format:** NDJSON (Newline-Delimited JSON)
- **S3 Structure:** Organized by date/hour
- **Local Export:** CSV available from data.transportation.gov

---

## Wyoming Geographic Bounds

For synthetic data generation and validation:
- **Longitude Range:** -108 to -104 (W)
- **Latitude Range:** Wyoming I-80 corridor
- **Note:** Coordinate clamping needed to prevent drift outside bounds

---

## Related Files
- [WYDOT Connected Driving Project](../projects/wydot-connected-driving.md)
- [AWS S3 Authentication](./aws-s3-authentication.md)

---

## Timeline
- [2026-01-28] First learned about ConnectedDrivingPipelineV4 and WYDOT data
- [2026-01-29 09:30 EST] Discovered S3 requires authentication (no longer anonymous)
- [2026-01-29 10:30 EST] Fixed schema elevation path bug
- [2026-01-31 18:34 EST] Started full dataset download
- [2026-01-31 20:35 EST] Download completed - discovered true size (~40GB, not 3.5GB)
- [2026-02-01 16:26 EST] Verified file intact
