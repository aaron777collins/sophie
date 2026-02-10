# HAOS Project

**Status:** In Progress  
**Started:** 2026-02-09  
**Type:** Discord-clone UI implementation

## Goal

Transform the Matrix-based HAOS frontend into a Discord-like interface with:
- Discord-style CSS design system
- TSX component transformations
- Voice integration
- Modern chat UX

## Current State

- [2026-02-09] CSS design system complete (25 files, 560KB)
- [2026-02-09] SpacePanel.tsx transformation done
- [2026-02-09] RoomSublist.tsx transformation done

## Next Up

- MessageList.tsx transformation
- UserMenu component
- Settings modal
- Voice integration

## Key Files

- `/home/ubuntu/test-haos/element-web/` - Main codebase
- CSS files in `res/css/views/` and `res/css/structures/`

## Git Workflow

**IMPORTANT:** Commit and push frequently!
```bash
cd /home/ubuntu/repos/haos
git add -A
git commit -m "descriptive message about what changed"
git push
```

- Commit after each component/file is done
- Push after each meaningful chunk of work
- Don't let work pile up uncommitted

## Notes

This is a continuous project managed by the proactive scheduler.
