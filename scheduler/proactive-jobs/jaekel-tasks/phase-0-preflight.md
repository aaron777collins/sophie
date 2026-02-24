# Phase 0: Pre-Flight Checks

**Priority:** 🔴 CRITICAL - Must complete before any pipeline execution
**Estimated Time:** 5-10 minutes
**Server:** jaekel (ssh jaekel)

---

## Pre-Execution Checks

### ✅ Check 1: Verify SSH Access
```bash
ssh jaekel "echo 'Connection successful'"
```
**Expected:** `Connection successful`

### ✅ Check 2: Verify Working Directory
```bash
ssh jaekel "ls -la /home/ubuntu/repos/ConnectedDrivingPipelineV4/production_configs_v2/*.json | wc -l"
```
**Expected:** `36`

---

## Execution Commands

### Step 1: Fix Run Script Paths (CRITICAL)
```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4/production_configs_v2/

# Replace config paths in all run scripts
for f in Run*.py; do
  sed -i 's|production_configs/|production_configs_v2/|g' "$f"
done

# Verify fix
echo "Fixed scripts count:"
grep -l 'production_configs_v2/' Run*.py | wc -l
EOF
```
**Expected:** `36`

### Step 2: Clear Old Caches
```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4

# Remove old cache directories
rm -rf cache/basic-*-randomoffset
rm -rf cache/basic_with_id-*-randomoffset
rm -rf cache/movement-*-randomoffset
rm -rf cache/movement_with_id-*-randomoffset
rm -rf cache/extended-*-randomoffset
rm -rf cache/extended_with_id-*-randomoffset

# Create fresh v3 cache structure
mkdir -p cache/matrix

# Verify clean state
echo "Cache contents:"
ls -la cache/
EOF
```
**Expected:** Only `matrix` directory and metadata

### Step 3: Kill Orphan Processes
```bash
ssh jaekel << 'EOF'
# Check for running pipelines
echo "Checking for orphan processes..."
pgrep -fa "DaskPipelineRunner\|dask-worker\|dask-scheduler" || echo "No orphan processes found"

# Kill if any found
pkill -f "DaskPipelineRunner" 2>/dev/null || true
pkill -f "dask-worker" 2>/dev/null || true
pkill -f "dask-scheduler" 2>/dev/null || true

# Verify clean
echo "Final check:"
pgrep -fa dask || echo "Clean - no dask processes"
EOF
```

### Step 4: Verify Server Resources
```bash
ssh jaekel << 'EOF'
echo "=== DISK SPACE ==="
df -h /home/ubuntu

echo ""
echo "=== MEMORY ==="
free -h

echo ""
echo "=== DASHBOARD CHECK ==="
curl -s http://localhost:5000/api/pipelines 2>/dev/null | head -20 || echo "Dashboard not responding"
EOF
```
**Expected:**
- Disk: >250GB free
- Memory: >50GB available
- Dashboard: JSON response

### Step 5: Verify Config Integrity
```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4/production_configs_v2

echo "=== ATTACK TYPE COUNTS ==="
echo "const_offset_per_id configs:"
grep -l 'const_offset_per_id' *.json | wc -l

echo "rand_offset configs:"
grep -l 'rand_offset' *.json | wc -l

echo ""
echo "=== COLUMN VERIFICATION ==="
echo "Configs with coreData_position_lat:"
grep -l 'coreData_position_lat' *.json | wc -l

echo ""
echo "=== NO OLD NAMING ==="
echo "random_offset (should be 0):"
grep -l 'random_offset' *.json | wc -l || echo "0"

echo "const_offset without _per_id (should be 0):"
grep -l '"const_offset"' *.json | wc -l || echo "0"
EOF
```
**Expected:**
- const_offset_per_id: 18
- rand_offset: 18
- coreData_position_lat: 36
- random_offset: 0
- const_offset (old): 0

### Step 6: Ensure Log Directory
```bash
ssh jaekel << 'EOF'
cd /home/ubuntu/repos/ConnectedDrivingPipelineV4
mkdir -p logs
chmod 755 logs
echo "Log directory ready at: $(pwd)/logs"
EOF
```

---

## Log Audit Steps

```bash
# Verify all checks passed by reviewing output above
# All expected values must match
```

---

## Success Criteria

- [ ] SSH connection works
- [ ] 36 run scripts point to production_configs_v2/
- [ ] Old cache directories removed
- [ ] No orphan processes running
- [ ] >250GB disk free
- [ ] >50GB RAM available
- [ ] All 36 configs have correct attack types
- [ ] No old naming conventions remain
- [ ] Log directory exists and writable

---

## Slack Update Template

```
🚀 **Pre-flight checks complete!**
- Run script paths: ✅ FIXED (36/36)
- Old caches: ✅ CLEARED
- Orphan processes: ✅ NONE
- Server resources: ✅ OK
  - Disk: {DISK_FREE}GB free
  - RAM: {RAM_FREE}GB available
- Config integrity: ✅ VERIFIED (36 valid)

Ready to start Phase 1 (2km pipelines)...
```

---

## On Failure

If any check fails:
1. Document which check failed
2. Post to Slack with failure details
3. Do NOT proceed to Phase 1
4. Escalate for human review
