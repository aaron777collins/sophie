# CRITICAL METHODOLOGY FIX: Project Directory Validation

**Date:** 2026-02-19  
**Issue:** Repeated directory errors causing false fraud accusations  
**Severity:** CRITICAL - System trust compromised

## Error Pattern

**12:10 EST:** Made directory error (~/clawd/ vs /home/ubuntu/repos/melo/) - acknowledged correction  
**13:10 EST:** Made EXACT same error again - shows methodology not implemented  

## Impact

- **False fraud accusations** against legitimate workers
- **Wasted resources** - tasks incorrectly reverted 
- **Trust damage** - validation system credibility compromised
- **Person Manager intervention** required to correct errors

## ROOT CAUSE

Not implementing acknowledged corrections. Saying "I'll fix it" but not changing methodology.

## CORRECTED METHODOLOGY (NON-NEGOTIABLE)

### OLD (BROKEN) APPROACH
```bash
# Wrong - defaults to ~/clawd/
ls tests/e2e/integration/
```

### NEW (CORRECT) APPROACH  
```bash
# ALWAYS cd to project directory FIRST
cd /home/ubuntu/repos/melo
pwd  # verify correct location
ls tests/e2e/integration/
```

## VALIDATION CHECKLIST (MANDATORY)

For EVERY validation:

1. **[ ] Read PROACTIVE-JOBS.md header** - confirm project location
2. **[ ] cd /home/ubuntu/repos/melo** - go to correct directory  
3. **[ ] pwd** - verify location matches expected
4. **[ ] Document directory** in validation notes
5. **[ ] Triple-check before fraud accusations**

## IMPLEMENTATION COMMITMENT

- [x] Acknowledged the repeated error pattern
- [x] Documented corrected methodology  
- [ ] Applied to next validation (TBD)
- [ ] Verified no false accusations going forward

## Key Learning

**Acknowledging corrections without implementing them is worse than not acknowledging at all.**

Methodology changes require immediate implementation, not just verbal commitment.