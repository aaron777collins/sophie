# 🪞 Self-Reflection System

## 📝 Summary

Daily learning and improvement system. Like how humans reflect on their day and get better over time.

**Two phases:**
1. Throughout day: Log notable moments (wins, failures, interesting situations)
2. Nightly cron: Circle analysis → insights → improvements

## 📅 Created
- [2026-02-11 01:33 EST] Aaron requested continuous improvement system

---

## 📁 Structure

```
memory/reflections/
├── daily/         # Raw notes (YYYY-MM-DD.md)
├── insights/      # Distilled learnings
├── improvements/  # Changes made
└── INDEX.md       # Navigation
```

---

## 📝 What To Log (Throughout Day)

| Type | Icon | When |
|------|------|------|
| Did Well | 🟢 | Better than usual |
| Could Improve | 🔴 | Failed or could do better |
| Interesting | 🤔 | Worth examining |
| Feedback | 💬 | Human said something |

Log to `memory/reflections/daily/YYYY-MM-DD.md`

---

## ⏰ Daily Reflection Cron

**Schedule:** 23:00 EST daily
**Model:** Sonnet with high thinking

**Process:**
1. Read today's notes + conversation log
2. Run Circle analysis (🟡 Standard)
3. Generate insights and improvements
4. Update docs/processes as needed
5. Create proactive jobs for tools
6. Log to `improvements/YYYY-MM-DD.md`

---

## 🎯 Key Principles

- **Log as it happens** — context is fresh
- **Be honest** — sugar-coating defeats the purpose
- **Look for patterns** — recurring issues need systemic fixes
- **Actually improve** — reflection without action is just journaling
- **Celebrate wins** — reinforce what works

---

**Full spec:** `docs/SELF-REFLECTION.md`
