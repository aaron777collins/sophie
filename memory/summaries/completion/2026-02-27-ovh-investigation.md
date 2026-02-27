# OVH VPS dev2 Investigation

**Completed:** 2026-02-27 02:00 EST
**Requested by:** Aaron (Slack, 01:37 EST)

## Summary

Investigated OVH pricing update email and dev2 VPS specs.

## dev2 Specs (from SSH inspection)

| Spec | Value |
|------|-------|
| **RAM** | 16 GB |
| **vCPUs** | 8 (Intel Haswell) |
| **Disk** | ~154 GB usable (~160 GB advertised) |
| **Currently Used** | 72 GB disk, 4.6 GB RAM |

## OVH Pricing Changes (Effective 2026-04-01)

### VPS 2026 Range (AFFECTED)

| Product | Current | New | Change |
|---------|---------|-----|--------|
| VPS-1 | $4.90 | $7.60 | +55% |
| VPS-2 | $7.70 | $11.75 | +53% |
| VPS-3 | $15.00 | $23.50 | +57% |
| VPS-4 | $26.00 | $43.50 | +67% |
| VPS-5 | $40.40 | $64.50 | +60% |
| VPS-6 | $53.40 | $86.00 | +61% |

### NOT Affected
- VPS Comfort, VPS Elite, VPS Value, VPS Starter, VPS Essentials, VPS LE
- If dev2 is on one of these older ranges, no price change

## What I Couldn't Determine

**Which exact VPS tier dev2 is on.** The specs (8 vCPU, 16GB RAM, 160GB disk) suggest:
- If VPS 2026 range: likely **VPS-4 or VPS-5**
  - VPS-4: $26 → $43.50 (+$17.50/mo, +$210/yr)
  - VPS-5: $40.40 → $64.50 (+$24.10/mo, +$289/yr)
- If older range (VPS Comfort): **no change**

## Recommendation

Aaron should check OVH Control Panel to confirm:
1. Which VPS product dev2 is on
2. Whether it's on a commitment (pricing update applies at renewal)

## Also Noted

Aaron mentioned Paperless now imports all emails - can search content there too for future investigations.
