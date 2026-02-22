# Critical Thinking Checkpoint Template

> **USE THIS TEMPLATE** when conducting critical thinking checkpoints throughout project lifecycle.
> Apply Circle perspectives to ensure comprehensive evaluation at key decision points.

## Overview

Critical thinking checkpoints are mandatory validation points where all four Circle perspectives must be consulted before proceeding. This template integrates with existing planning workflows and validation requirements to ensure thorough perspective analysis.

**Based on:** THE-CIRCLE-PLANNING-INTEGRATION.md (p1-3-a dependency)
**Integrates with:** TDD validation requirements from AGENTS.md

---

## Checkpoint Process Framework

### Step 1: Checkpoint Assessment
```markdown
## Checkpoint Context
**Decision/Phase:** {What are we evaluating?}
**Date:** {YYYY-MM-DD HH:MM EST}
**Trigger Type:** [ ] Mandatory [ ] Conditional
**Stakeholders:** {Who needs to be involved?}
**Background:** {Context and current situation}
```

### Step 2: Circle Perspective Analysis

#### Pragmatist Perspective
**Focus:** Implementation, feasibility, and practical execution

**Key Questions:**
- Can we actually implement/execute this?
- What resources do we realistically need?
- What are the practical constraints we're facing?
- How does this work in the real world?
- What's the minimum viable approach?

**Assessment:**
```markdown
## Pragmatist Analysis
**Feasibility:** {Can this be done with current resources?}
**Resource Requirements:** {Time, people, budget, tools}
**Practical Constraints:** {Technical, organizational, timeline limits}
**Implementation Risks:** {What could block execution?}
**Recommendation:** {Proceed/Modify/Block with reasoning}
```

#### Skeptic Perspective
**Focus:** Critical analysis, edge cases, and potential failures

**Key Questions:**
- What could go wrong with this approach?
- What assumptions are we making that might be false?
- What edge cases haven't we considered?
- Where are the weak points in our plan?
- What evidence supports this direction?

**Assessment:**
```markdown
## Skeptic Analysis
**Assumptions Challenged:** {What are we taking for granted?}
**Edge Cases Identified:** {Scenarios we haven't planned for}
**Failure Points:** {Where could this break down?}
**Evidence Required:** {What validation do we need?}
**Risk Assessment:** {High/Medium/Low with specifics}
**Recommendation:** {Proceed/Modify/Block with reasoning}
```

#### Guardian Perspective
**Focus:** Security, risk mitigation, and protective measures

**Key Questions:**
- What are the security implications?
- How do we protect against identified threats?
- What safeguards need to be in place?
- What could cause permanent or irreversible damage?
- How do we ensure compliance and safety?

**Assessment:**
```markdown
## Guardian Analysis
**Security Implications:** {Data, access, vulnerabilities}
**Risk Mitigation Required:** {Safeguards and protections}
**Compliance Considerations:** {Legal, regulatory, policy}
**Damage Prevention:** {What protections are essential?}
**Recovery Planning:** {Backup/rollback strategies}
**Recommendation:** {Proceed/Modify/Block with reasoning}
```

#### Dreamer Perspective
**Focus:** Vision, possibilities, and long-term thinking

**Key Questions:**
- What's the bigger picture and strategic vision?
- How does this align with our long-term goals?
- What opportunities might we be missing?
- How could this evolve and scale over time?
- What's the ideal outcome we're working toward?

**Assessment:**
```markdown
## Dreamer Analysis
**Strategic Alignment:** {How does this serve the bigger vision?}
**Future Opportunities:** {What doors does this open?}
**Scalability Potential:** {How does this grow with us?}
**Innovation Aspects:** {What new possibilities emerge?}
**Long-term Value:** {Benefits beyond immediate goals}
**Recommendation:** {Proceed/Modify/Block with reasoning}
```

### Step 3: Circle Synthesis and Decision

```markdown
## Circle Synthesis
**Consensus Areas:** {Where all perspectives agree}
**Conflicts Identified:** {Where perspectives diverge}
**Trade-offs Required:** {What must we balance?}
**Integrated Recommendation:** {Synthesized decision}

## Decision Outcome
**Final Decision:** [ ] Proceed [ ] Proceed with Modifications [ ] Block/Postpone
**Modifications Required:** {If proceeding with changes}
**Action Items:** 
- [ ] {Specific next steps with owners}
- [ ] {Timeline and milestones}
- [ ] {Monitoring and review points}

**Validation Plan:** {How will we verify this decision was right?}
**Next Checkpoint:** {When do we reassess?}
```

---

## Checkpoint Triggers and Timing

### Mandatory Checkpoints
Apply Circle analysis before:
- [ ] Major technical architecture decisions
- [ ] Resource allocation >40 hours or >$10K
- [ ] Security or compliance-critical decisions  
- [ ] Project phase transitions
- [ ] Risk-tolerant actions with significant impact
- [ ] Final approval/deployment decisions

### Conditional Checkpoints
Consider Circle analysis when:
- [ ] New requirements emerge mid-project
- [ ] Core assumptions are being challenged
- [ ] Risk levels escalate beyond tolerance
- [ ] Timeline shifts significantly (>25% change)
- [ ] Stakeholder concerns arise
- [ ] Integration issues surface

### Timing Guidelines

| Project Phase | Checkpoint Focus | Circle Emphasis |
|---------------|------------------|-----------------|
| **Initiation** | Feasibility and alignment | All perspectives equal |
| **Planning** | Resource and risk validation | Pragmatist + Skeptic focus |
| **Design** | Security and scalability | Guardian + Dreamer focus |
| **Implementation** | Execution and testing | Pragmatist + Skeptic focus |
| **Validation** | Comprehensive review | All perspectives required |
| **Deployment** | Risk and rollback planning | Guardian + Pragmatist focus |

---

## Evaluation Criteria

### Assessment Standards
Each perspective must provide:
- **Clear reasoning** for their position
- **Specific evidence** supporting their analysis  
- **Actionable recommendations** with next steps
- **Risk assessment** with mitigation strategies
- **Success criteria** for their concerns

### Decision Quality Gates
Proceed only when:
- [ ] All four perspectives have been thoroughly analyzed
- [ ] Conflicts between perspectives are acknowledged and addressed
- [ ] Action items have clear owners and timelines
- [ ] Validation plan includes testing all perspective concerns
- [ ] Next checkpoint is scheduled

### Red Flags (Automatic Block)
- [ ] Any perspective recommends "Block" without mitigation
- [ ] Critical assumptions lack evidence
- [ ] High security/compliance risks without safeguards
- [ ] Resource requirements exceed available capacity by >25%
- [ ] Timeline conflicts with hard constraints

---

## Integration with Existing Templates

### Worker Spawn Template Integration
When using WORKER-SPAWN-TEMPLATE.md, add checkpoint guidance:

```markdown
## Circle Analysis Requirements
**Apply critical thinking checkpoints when:**
- Task involves architectural decisions
- Security/compliance implications exist
- Resource allocation exceeds 20 hours
- Integration with existing systems required

**Reference:** scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md
```

### Validation Requirements Integration
Circle checkpoints enhance TDD validation through perspective-driven test planning:

- **Pragmatist Testing:** Functional and performance validation
- **Skeptic Testing:** Edge cases and failure scenarios  
- **Guardian Testing:** Security and compliance verification
- **Dreamer Testing:** Strategic value and future-readiness

### Template References
Include in all project templates:
```markdown
## Critical Thinking Checkpoints
**Major decisions require Circle analysis using:**
`scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md`

**Checkpoint triggers:** Architecture, security, resources >20hrs, phase transitions
```

---

## Usage Guidelines

### When to Use Critical Thinking Checkpoints

**Always Use For:**
- Decisions affecting system architecture
- Security or data protection choices
- Resource commitments >20 hours or >$5K
- Technology stack or platform selections
- Process changes affecting team workflow
- Risk-taking with potential for significant impact

**Consider Using For:**
- Feature prioritization decisions
- Testing strategy selections
- Documentation approach choices
- Tool selection with team impact
- Timeline adjustment decisions

### How to Facilitate Checkpoints

**Preparation:**
1. Gather relevant context and background
2. Identify key stakeholders for each perspective
3. Prepare specific questions for each Circle viewpoint
4. Set aside adequate time (30-60 minutes for major decisions)

**Facilitation:**
1. Present decision context clearly
2. Work through each perspective systematically
3. Capture all input without immediate judgment
4. Synthesize perspectives before making decision
5. Document reasoning and action items

**Follow-up:**
1. Communicate decision and reasoning to stakeholders
2. Execute action items with clear ownership
3. Monitor outcomes against success criteria
4. Schedule next checkpoint if needed

### Documentation Requirements

All checkpoints must be documented with:
- [ ] Complete perspective analysis
- [ ] Decision reasoning and trade-offs
- [ ] Action items with owners and timelines
- [ ] Success criteria and validation plan
- [ ] Next checkpoint scheduled

**Storage:** Save in `scheduler/progress/{project}/checkpoints/YYYY-MM-DD-{decision-name}.md`

---

## Quick Reference Checklist

### Before Starting Checkpoint
- [ ] Context and background gathered
- [ ] Stakeholders identified for each perspective
- [ ] Trigger type determined (mandatory/conditional)
- [ ] Time allocated for thorough analysis

### During Circle Analysis
- [ ] Pragmatist: Feasibility and resources assessed
- [ ] Skeptic: Risks and edge cases identified
- [ ] Guardian: Security and protection evaluated  
- [ ] Dreamer: Vision and opportunity explored
- [ ] All perspectives documented thoroughly

### Synthesis and Decision
- [ ] Areas of consensus identified
- [ ] Conflicts acknowledged and addressed
- [ ] Integrated recommendation developed
- [ ] Decision made with clear reasoning
- [ ] Action items assigned with timelines

### After Checkpoint
- [ ] Decision documented and communicated
- [ ] Action items tracked for completion
- [ ] Validation plan activated
- [ ] Next checkpoint scheduled if needed
- [ ] Outcomes monitored against criteria

---

## Circle Integration Summary

This template enhances the testing-first planning approach established in PLANNING-SYSTEM.md by adding comprehensive perspective analysis at critical decision points. The Circle framework ensures that:

- **Technical decisions** consider implementation, risks, security, and strategy
- **Validation planning** incorporates all four perspective types
- **Quality gates** include perspective-based success criteria
- **Risk management** addresses multiple threat categories

**Result:** More robust decisions with reduced blind spots and enhanced strategic alignment while maintaining rigorous validation standards.

---

## Checkpoint Process Improvement

### Iterative Enhancement Framework

Critical thinking checkpoints should evolve and improve through systematic feedback and refinement. This ensures the process remains effective and adapts to team needs over time.

### After Each Checkpoint

**Capture Lessons Learned:**
- What aspects of the Circle analysis were most/least valuable?
- Which perspectives provided unexpected insights?
- What questions could be refined or added?
- How long did the checkpoint take vs. value provided?
- What would you do differently next time?

**Document Process Notes:**
```markdown
## Checkpoint Process Reflection
**Decision:** {What was analyzed}
**Date:** {YYYY-MM-DD}
**Duration:** {Time invested in analysis}
**Most Valuable Perspective:** {Which provided key insights}
**Process Improvements:** {What could be refined}
**Outcome Quality:** {Did checkpoint improve decision quality?}
```

### Weekly Checkpoint Reviews

**Review Recent Checkpoints:**
- [ ] Assess checkpoint quality and thoroughness
- [ ] Identify patterns in perspective value
- [ ] Evaluate time investment vs. decision improvement
- [ ] Collect feedback from checkpoint participants

**Refine Process:**
- [ ] Update template questions based on usage experience
- [ ] Adjust checkpoint triggers and criteria
- [ ] Improve perspective guidance and examples
- [ ] Enhance integration with existing workflows

### Pattern Recognition and Learning

**Track Recurring Themes:**
- Which perspective types consistently identify overlooked issues?
- What decision categories benefit most from checkpoint analysis?
- Are there systematic blind spots the team consistently misses?
- How can checkpoint insights inform future process improvements?

**Build Institutional Knowledge:**
- Document successful checkpoint applications as examples
- Create specialized prompts for common decision types
- Share insights across projects and teams
- Build repository of perspective-specific question refinements

### Template Evolution

**Regular Template Updates:**
- **Monthly:** Review and refine perspective questions based on usage
- **Quarterly:** Assess checkpoint triggers and evaluation criteria
- **Ongoing:** Incorporate user feedback and usage patterns
- **Version Control:** Track template changes with rationale

**Feedback Integration:**
- Collect input from checkpoint users on template clarity and completeness
- Test revised questions and guidance with real decisions
- Validate improvements through comparison of decision outcomes
- Share refinements across related projects and teams

### Success Measurement

**Quality Indicators:**
- Decisions made with checkpoints show fewer reversals or significant changes
- Risk identification improves through systematic perspective application
- Strategic alignment increases through consistent Dreamer perspective use
- Implementation feasibility improves through Pragmatist validation

**Process Indicators:**
- Checkpoint completion time stabilizes as team gains experience
- Template usage becomes more natural and less forced
- Perspective analysis depth improves with practice
- Integration with existing workflows becomes seamless

### Continuous Improvement Cycle

1. **Apply Checkpoint** → Use current template and process
2. **Capture Feedback** → Document lessons and improvement opportunities
3. **Analyze Patterns** → Identify systematic improvements needed
4. **Refine Template** → Update questions, guidance, and examples
5. **Test Refinements** → Apply updates to new decisions
6. **Validate Improvements** → Assess enhanced decision quality
7. **Share Learning** → Distribute insights to related projects

This improvement cycle ensures checkpoint effectiveness grows over time and adapts to changing team needs and decision contexts.

---

*For detailed Circle framework documentation, see docs/THE-CIRCLE-PLANNING-INTEGRATION.md*
*For integration with planning workflows, see PLANNING-SYSTEM.md*