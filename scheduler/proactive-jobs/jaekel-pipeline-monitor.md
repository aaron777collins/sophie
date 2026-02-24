# Jaekel Pipeline Monitor

**Created:** 2026-02-24 05:05 EST
**Status:** 🟢 ACTIVE
**Frequency:** Every 30 minutes during active execution

## Purpose

Monitor the autonomous pipeline executor on Jaekel and send Slack updates.

## Check Commands

```bash
# Check progress
ssh jaekel "cat /home/ubuntu/repos/ConnectedDrivingPipelineV4/execution_progress.json 2>/dev/null"

# Check if executor is running
ssh jaekel "ps aux | grep execute_all_pipelines | grep -v grep"

# Check current pipeline
ssh jaekel "ps aux | grep 'Run.*km' | grep python | grep -v grep"
```

## Update Triggers

1. **Phase completion** (after 12 pipelines each)
2. **All 36 complete**
3. **Any failures detected**
4. **Executor stopped unexpectedly**

## Slack Updates

Post to: #aibot-chat thread 1771904073.130349

Template:
```
📊 **Pipeline Progress: {completed}/36**
Phase {current_phase}/3 ({phase_name})
Last completed: {last_pipeline}
Time elapsed: {hours}h {minutes}m
```
