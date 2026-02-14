#!/bin/bash
# Spawn documentation review worker for HAOS v2

# Ensure we're in the right directory
cd /home/ubuntu/clawd

# Spawn the worker with Sonnet model
claude -p "Review and update HAOS v2 documentation. 
Specific tasks:
1. Locate HAOS v2 documentation files:
   - README.md
   - docs/DEPLOYMENT.md
   - docs/USER_GUIDE.md
2. Analyze current feature set and stabilization status
3. Update documentation to reflect:
   - Current features
   - Deployment instructions
   - Usage guidelines
   - Stability and maturity level
4. Propose changes with clear rationale
5. Prepare documentation updates" \
  --model sonnet