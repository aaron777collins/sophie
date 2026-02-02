# USDOT ITS Connected Vehicle Pilot Data

Knowledge about accessing USDOT ITS JPO Connected Vehicle Pilot datasets.

## Overview

The USDOT ITS JPO (Intelligent Transportation Systems Joint Program Office) runs Connected Vehicle pilot programs collecting BSM (Basic Safety Message), TIM (Traveler Information Message), and SPaT (Signal Phase and Timing) data from multiple deployment sites including Wyoming, Tampa, and NYC.

## S3 Bucket

- **Bucket name:** `usdot-its-cvpilot-publicdata`
- **Region:** `us-east-1`
- **Data format:** NDJSON files organized by date/hour

## Access Changes

- [2026-01-29 09:30 EST] Discovered S3 bucket no longer allows anonymous access
- **Previously:** Anonymous/public access allowed (`botocore.config.signature_version=UNSIGNED`)
- **Now:** AWS credentials required for all access
- Using unsigned requests will fail with access denied errors

## AWS Configuration Required

To access the data, you need AWS credentials configured:

```bash
# Option 1: AWS CLI configure
aws configure

# Option 2: Manual credentials file (~/.aws/credentials)
[default]
aws_access_key_id = YOUR_KEY
aws_secret_access_key = YOUR_SECRET
```

For programmatic access, support AWS profile selection:
```python
# Python boto3 with profile
session = boto3.Session(profile_name='your-profile')
s3_client = session.client('s3')
```

## Official Resources

| Resource | URL | Description |
|----------|-----|-------------|
| Sandbox Docs | https://github.com/usdot-its-jpo-data-portal/sandbox | Main documentation for accessing ITS data |
| Sandbox Exporter | https://github.com/usdot-its-jpo-data-portal/sandbox_exporter | Tool for exporting data from the sandbox |
| Data Portal | https://data.transportation.gov | Alternative source with web UI |

## Alternative Data Sources

- [2026-01-29] `data.transportation.gov` provides web access to transportation datasets
- May have different data formats or subsets compared to raw S3 bucket
- Useful when AWS credentials are unavailable

## Key Learnings

- [2026-01-29 10:00 EST] Fixed S3DataFetcher to use proper AWS authentication
- [2026-01-29 10:00 EST] Added aws_profile config option for multi-account setups
- [2026-01-29 10:00 EST] Clear error messages needed when credentials missing
- [2026-01-29 10:30 EST] Created MockS3DataFetcher for testing without credentials
- [2026-01-29 11:00 EST] Cache layer critical to reduce S3 egress costs (19.7x speedup)

## Data Structure

Wyoming CV Pilot BSM data follows this S3 path structure:
```
s3://usdot-its-cvpilot-publicdata/wydot/BSM/{YYYY}/{MM}/{DD}/{HH}/
```

Each hour directory contains NDJSON files with BSM records including:
- Vehicle position (latitude, longitude, elevation)
- Motion data (speed, heading, acceleration)
- Timestamps and metadata

## Related Projects

- ConnectedDrivingPipelineV4 - Aaron's ML pipeline for CV data analysis
- Uses Dask for distributed processing of large BSM datasets
