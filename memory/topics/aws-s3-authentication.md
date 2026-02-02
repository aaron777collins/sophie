# AWS S3 Authentication

## Overview
Patterns and learnings for authenticating with AWS S3, especially for public government data buckets.

## First Documented
2026-01-29

---

## Key Lesson: "Public" Doesn't Mean Anonymous

Government data buckets (like USDOT's) may change policies without notice.

**Example:** `usdot-its-cvpilot-publicdata` bucket
- **Before:** Anonymous access worked (`signature_version=UNSIGNED`)
- **After (2026):** Requires valid AWS credentials even for public data

---

## Authentication Setup

### Method 1: AWS CLI Configure (Recommended)
```bash
aws configure
# Enter: Access Key ID, Secret Access Key, Region, Output format
```

### Method 2: Manual Credentials File
Create `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = YOUR_KEY
aws_secret_access_key = YOUR_SECRET

[optional-profile-name]
aws_access_key_id = OTHER_KEY
aws_secret_access_key = OTHER_SECRET
```

### Method 3: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=YOUR_KEY
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET
```

---

## Getting AWS Credentials

1. Create free AWS account at https://aws.amazon.com
2. Go to AWS Console > Security Credentials
3. Create Access Keys
4. Download/save the credentials (shown only once!)

---

## Boto3 Code Patterns

### With Profile
```python
import boto3
session = boto3.Session(profile_name='my-profile')
s3 = session.client('s3')
```

### With Default Credentials
```python
import boto3
s3 = boto3.client('s3')  # Uses default profile or env vars
```

### Anonymous (Usually Fails Now)
```python
from botocore import UNSIGNED
from botocore.config import Config
s3 = boto3.client('s3', config=Config(signature_version=UNSIGNED))
# ⚠️ Most "public" buckets now reject this
```

---

## USDOT-Specific Resources
- Sandbox docs: https://github.com/usdot-its-jpo-data-portal/sandbox#prerequisites-for-using-aws-cli
- Sandbox exporter: https://github.com/usdot-its-jpo-data-portal/sandbox_exporter

---

## Related
- [WYDOT Project](../projects/wydot-connected-driving.md)
