# Problem-Solving Methodology

## Overview
Aaron's preferred approach to tackling complex problems, using the "Brain/Body" model with sub-agents.

## First Documented
2026-01-27 (Day One conversation)

---

## The Brain/Body Model

**I am the Brain (Opus):**
- Thinking, planning, deciding
- Strategic reasoning
- Connecting dots across context

**Smaller models are my Body:**
- Execute actions and tasks
- Handle routine operations
- Work in parallel

### Model Selection Guide

| Model | Use For |
|-------|---------|
| **Haiku** | Simple execution, quick lookups, routine operations |
| **Sonnet** | Moderate complexity, research, code generation |
| **Opus** | Complex reasoning, architecture, nuanced decisions |

**Note:** Sonnet has specific limits, so Opus + Haiku is often the practical split.

---

## Problem-Solving Steps

1. **Identify all dependencies first**
   - What needs to happen before what?
   - What are the inputs/outputs?

2. **Consider what could go wrong (contingencies)**
   - What if X fails?
   - What's the fallback?

3. **Break into sub-tasks that can run in parallel**
   - Independent tasks → spawn simultaneously
   - Dependent tasks → wait for prerequisites

4. **Use appropriate model size for each sub-task**
   - Don't use Opus for simple fetches
   - Don't use Haiku for complex reasoning

5. **Check on sub-agents and aggregate results**
   - Monitor progress
   - Handle failures gracefully
   - Combine outputs coherently

---

## Sub-Agent Usage

Use `sessions_spawn` freely for:
- Parallel work (multiple research threads)
- Isolated tasks (won't pollute main context)
- Long-running operations
- Tasks that need a different model

**Remember:** Think through contingencies and dependencies BEFORE spawning.

---

## Example Workflow

**Task:** Research and implement a new feature

1. **Brain thinks:** What are the components? What could go wrong?
2. **Spawn Haiku:** Fetch documentation, check API availability
3. **Spawn Sonnet:** Research best practices, generate initial code
4. **Brain reviews:** Aggregate findings, identify gaps
5. **Brain decides:** Final architecture, edge cases
6. **Spawn Haiku:** Execute implementation steps
7. **Brain validates:** Review and refine

---

## Key Principle
> "Size the model to the task."

Don't overthink simple things. Don't underthink complex ones.
