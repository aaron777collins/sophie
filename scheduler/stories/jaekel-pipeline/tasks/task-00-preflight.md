# Task 00: Pre-Flight Checks

**Status:** 🟡 PENDING  
**Dependencies:** None  
**Estimated Time:** 10 minutes  
**Slack Update:** Yes (after completion)

---

## Objective

Prepare the Jaekel server for pipeline execution by fixing known bugs and verifying resources.

---

## Commands

### Step 1: SSH to Jaekel

```bash
ssh jaekel
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
```

### Step 2: Fix Run Script Paths (CRITICAL)

```bash
cd production_configs_v2/

# Fix all run scripts to use production_configs_v2
for f in Run*.py; do
  sed -i 's|production_configs/|production_configs_v2/|g' "$f"
done

# Verify fix
echo "Scripts with correct path:"
grep -l 'production_configs_v2/' Run*.py | wc -l
# EXPECTED: 36
```

### Step 3: Clear Old Caches

```bash
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

# Remove old cache directories
rm -rf cache/basic-*-randomoffset
rm -rf cache/basic_with_id-*-randomoffset
rm -rf cache/movement-*-randomoffset
rm -rf cache/movement_with_id-*-randomoffset
rm -rf cache/extended-*-randomoffset
rm -rf cache/extended_with_id-*-randomoffset

# Create fresh matrix cache structure
mkdir -p cache/matrix

echo "Cache state:"
ls -la cache/
# EXPECTED: Only 'matrix' directory
```

### Step 4: Kill Orphan Processes

```bash
# Check for running pipelines
echo "Running pipeline processes:"
pgrep -fa "DaskPipelineRunner\|dask-worker\|dask-scheduler"

# Kill if found
pkill -f "DaskPipelineRunner" 2>/dev/null || true
pkill -f "dask-worker" 2>/dev/null || true
pkill -f "dask-scheduler" 2>/dev/null || true

# Verify clean
echo "Remaining dask processes:"
pgrep -fa dask
# EXPECTED: No output
```

### Step 5: Verify Server Resources

```bash
echo "=== DISK SPACE ==="
df -h /home/ubuntu
# EXPECTED: >250GB free

echo "=== MEMORY ==="
free -h
# EXPECTED: >50GB available

echo "=== DASHBOARD ==="
curl -s http://localhost:5000/api/pipelines | head -5
# EXPECTED: JSON response
```

### Step 6: Verify Config Integrity

```bash
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4/production_configs_v2

echo "=== CONFIG COUNTS ==="
echo "const_offset_per_id configs: $(grep -l 'const_offset_per_id' *.json | wc -l)"
# EXPECTED: 18

echo "rand_offset configs: $(grep -l 'rand_offset' *.json | wc -l)"
# EXPECTED: 18

echo "=== COLUMN NAME CHECK ==="
echo "Correct column names: $(grep -l 'coreData_position_lat' *.json | wc -l)"
# EXPECTED: 36

echo "=== NO BAD NAMING ==="
echo "random_offset (should be 0): $(grep -l '"random_offset"' *.json | wc -l)"
# EXPECTED: 0
```

### Step 7: Activate Virtual Environment

```bash
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
source .venv/bin/activate

# Verify
which python
# EXPECTED: /home/ubuntu/repos/ConnectedDrivingPipelineV4/.venv/bin/python
```

---

## Success Criteria

- [ ] All 36 run scripts point to `production_configs_v2/`
- [ ] Old caches cleared
- [ ] No orphan dask/python processes
- [ ] Disk space >250GB free
- [ ] Memory >50GB available
- [ ] Dashboard responding
- [ ] 18 const_offset_per_id configs
- [ ] 18 rand_offset configs
- [ ] Virtual environment activated

---

## If Failed

If any check fails:
1. Document the failure in this file
2. Post to Slack with details
3. DO NOT proceed to Task 01

---

## Completion

When all checks pass:
1. Update status to ✅ COMPLETE
2. Post pre-flight summary to Slack
3. Proceed to Task 01
