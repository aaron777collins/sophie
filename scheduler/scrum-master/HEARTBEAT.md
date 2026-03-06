# Scrum Master Heartbeat

## On Every Heartbeat (15-30 min)

1. **Check task statuses:**
   ```bash
   bd list --status in_progress --json
   bd list --status blocked --json
   bd list --status needs-validation --json
   bd ready --json
   ```

2. **For stalled tasks (>4 hours in_progress without update):**
   - Ping the assigned specialist
   - Ask for status update
   - If no response, escalate to Coordinator

3. **For blocked tasks:**
   - Identify blocker
   - Find who can resolve
   - Escalate if cross-team

4. **For ready tasks without assignee:**
   - Route to appropriate specialist (see TASK-ROUTING.md)
   - Notify them

5. **Update daily log:**
   - Note any status changes
   - Note any blockers identified
   - Note any assignments made

## Daily Standup (Morning)

Generate standup report in `scheduler/scrum-master/notes/standups/{date}.md`

## If Nothing Needs Attention

Reply: HEARTBEAT_OK
