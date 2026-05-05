---
name: pre-delivery-audit
description: Use before delivering any task to a fixer. Explorer maps codebase context, reviewer defines acceptance criteria. Prevents fixer from coding blind and cycling through rejections.
license: MIT
compatibility: opencode
metadata:
  audience: agents
  workflow: pre-delivery-audit
---

# Pre-Delivery Audit

Before any task goes to fixer, two agents must independently complete their audit and write findings to Venus. Each agent is responsible for their own handoff — the orchestrator only sequences the delegation.

**Orchestrator sequence:**
1. Delegate to `explorer` → wait for explorer to complete and write task note
2. Delegate to `reviewer` → wait for reviewer to complete and write task note
3. Delegate to `fixer` → fixer reads both notes from Venus, then implements

---

## If You Are the Explorer

Your job: gather all context the fixer will need. You are NOT done until your findings are written to Venus.

**Steps:**

1. `bootstrap_session`
2. `get_task(id=<task_id>)` + `get_context_pack(anchor_task_id=<task_id>)` — understand the task
3. `search_knowledge` — find related decisions, prior attempts, patterns
4. Gather: relevant files, symbols, blast radius, dependencies, edge cases
5. **Call `write_task_section` (section='note') with your findings** (format below)
6. **Call `get_task(id=<task_id>)` to verify your note is persisted**
7. Report back to orchestrator: "Explorer audit complete. Note written to Venus."

**Your note format:**

```
EXPLORER AUDIT
Agent: explorer
Task: <Venus task ID>
Relevant files:
  - <path>:<line> — <why relevant>
Relevant symbols:
  - <symbol name> — <role/purpose>
Blast radius: <LOW / MEDIUM / HIGH / CRITICAL>
Direct callers affected: <list>
Dependencies: <libs or modules the fixer must understand>
Prior attempts: <any prior notes, failed fixes, related decisions>
Edge cases: <non-obvious behaviors the fixer must handle>
```

**You are done when:** `write_task_section` has been called AND `get_task` shows your note exists.

**Do NOT:** Write findings only in conversation. The reviewer reads Venus, not conversation history.

---

## If You Are the Reviewer

Your job: read the explorer note from Venus, then define concrete acceptance criteria. You are NOT done until your audit is written to Venus.

**Steps:**

1. `bootstrap_session`
2. `get_task(id=<task_id>)` — read ALL existing notes, including explorer audit
3. **If no explorer note found:** STOP. Write task note: "REVIEWER BLOCKED: no explorer audit found. Cannot define AC without codebase context." Report back to orchestrator.
4. Read the explorer note carefully. Define testable AC, rejection conditions, risk flags, scope guard.
5. **Call `write_task_section` (section='note') with your audit** (format below)
6. **Call `get_task(id=<task_id>)` to verify your note is persisted**
7. Report back to orchestrator: "Reviewer audit complete. AC written to Venus."

**Your note format:**

```
REVIEWER AUDIT
Agent: reviewer
Task: <Venus task ID>
Acceptance criteria:
  - [ ] <specific, testable criterion>
  - [ ] <specific, testable criterion>
Rejection conditions:
  - <what will cause rejection at code review>
  - <what will cause rejection at test>
Risk flags:
  - <regression risk, performance concern, security issue>
Scope guard:
  In scope: <explicit list>
  Out of scope: <what fixer must NOT touch>
Verification method: <how correctness will be confirmed>
```

**AC rules:**
- Each criterion must be independently verifiable
- No vague criteria ("works correctly", "looks good")
- Include happy path AND error cases
- Include regression protection (existing behavior that must not break)

**You are done when:** `write_task_section` has been called AND `get_task` shows your note exists.

**Do NOT:** Define AC only in conversation. The fixer reads Venus, not conversation history.

---

## If You Are the Fixer

Your job: implement what the task requires. You must read both audit notes from Venus before writing a single line of code.

**Steps:**

1. `bootstrap_session`
2. `get_task(id=<task_id>)` — read ALL notes
3. **If no explorer note found:** STOP. Write task note: "FIXER BLOCKED: no explorer audit. Cannot implement without codebase context." Report back to orchestrator.
4. **If no reviewer note found:** STOP. Write task note: "FIXER BLOCKED: no reviewer audit. Cannot implement without acceptance criteria." Report back to orchestrator.
5. Write your before-work handoff via `write_task_section` (section='note'; format below)
6. Implement ONLY within the scope defined in reviewer audit
7. For each AC item: verify with evidence before marking done
8. Write your after-work handoff via `write_task_section` (section='note'; format below)
9. Call `write_task_section` (section='summary') + `record_task_outcome`

**Before-work handoff:**

```
BEFORE-WORK HANDOFF
Agent: fixer
Task: <Venus task ID>
Explorer note read: yes — <one-line summary of what explorer found>
Reviewer note read: yes — <N acceptance criteria, blast radius>
Planned scope: <what will be implemented>
Non-scope: <what will NOT be touched per reviewer scope guard>
Known risks: <from reviewer audit>
```

**After-work handoff:**

```
AFTER-WORK HANDOFF
Agent: fixer
Task: <Venus task ID>
Done: <what was completed>
Artifacts: <files/symbols touched>
AC verified:
  - [x] <criterion> — <evidence: test output, screenshot, log line>
  - [x] <criterion> — <evidence>
Remaining risks: <anything unresolved>
Blockers: <what stopped progress, if any>
Follow-ups: <tasks to create after search_knowledge>
```

---

## Rejection Cycle

If reviewer or tester rejects fixer's work, the cycle must be logged in Venus.

**Reviewer writes rejection note:**

```
REJECTION — Round <N>
Agent: reviewer
Task: <Venus task ID>
Rejected because: <specific AC that failed>
Evidence: <what was tested, what result was expected vs actual>
Fixer instructions round <N+1>: <specific correction needed>
```

**Fixer writes re-attempt note:**

```
RE-ATTEMPT — Round <N>
Agent: fixer
Task: <Venus task ID>
Rejection read: yes
Root cause: <why the previous attempt failed>
What changed: <specific fix applied>
AC re-verified:
  - [x] <criterion> — <new evidence>
```

If round > 3: escalate to seniorfixer. Write task note: "ESCALATION: fixer failed 3 rounds. Handing off to seniorfixer."

---

## Common Mistakes

- Explorer writes findings in conversation, NOT in Venus → reviewer and fixer cannot read it
- Reviewer defines AC in conversation, NOT in Venus → fixer has no criteria to verify against
- Fixer starts implementing without calling `get_task` first → blind implementation
- Agent assumes previous agent wrote a note without verifying via `get_task` → phase based on phantom data
- Rejection not logged in Venus → next fixer attempt has no context on what failed

## Related Skills

**REQUIRED:** `venus-mcp` — handoff fields and MCP tool reference

- `task-execution-workflows`
- `bug-investigation`
- `skill-selection-and-escalation`
- `superpowers/systematic-debugging`
- `superpowers/requesting-code-review`
