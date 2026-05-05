---
name: write-activity
description: Use when meaningful progress, handoff detail, execution evidence, or task outcome should be preserved in Venus.
license: MIT
compatibility: opencode
metadata:
  audience: agents
  workflow: venus-activity
---

# Write Activity

Venus task notes, summaries, and outcomes are the canonical durable activity trail. External trackers are references only.

## Use It For

- Before-work and after-work handoff
- Significant progress, blockers, risk changes
- Verification evidence, review findings, browser QA evidence
- Final summary, outcome, follow-up tasks
- Acceptance criteria toggling (`toggle_ac_item`), task archiving (`archive_task`), outcome recording (`record_task_outcome`)

## Do Not Use It For

- Every command, click, or browser snapshot
- Routine status chatter
- Observations not affecting task state, evidence, decisions, or follow-ups
- Hardcoding AC state instead of calling `toggle_ac_item`

## Before-Work

**REQUIRED:** Follow the before-work handoff protocol in `venus-mcp`.

Use `write_task_section` (section='note').

## During-Work

Write task notes for meaningful events only: blocker found · plan changed · decision made · evidence collected · root cause identified · review or QA finding · handoff needed · AC progress via `toggle_ac_item`.

## After-Work

**REQUIRED:** Follow the after-work handoff protocol in `venus-mcp`.

Summary fields: what was done · files/artifacts · decisions · evidence · verification · risks · blockers · follow-ups · reusable lessons.

Use `write_task_section` (section='note') for intermediate handoff, `write_task_section` (section='summary') for completion, `record_task_outcome` when result is known.

## Workflow

1. `bootstrap_session` → resolve active task → `get_context_pack`.
2. `search_knowledge` before creating any artifact.
3. Write before-work handoff.
4. Write meaningful activity notes during work; track AC with `toggle_ac_item`.
5. Write after-work handoff or final summary.
6. `record_task_outcome` → `archive_task`.
7. Create memory candidates only for reusable, non-obvious lessons.

## Quick Reference

| When | Use |
|---|---|
| Before substantial work starts | `write_task_section` (section='note', before-work handoff) |
| Blocker found | `write_task_section` (section='note') with blocker detail |
| Decision made | `write_task_section` (section='note') with rationale |
| AC item completed | `toggle_ac_item` |
| Work finished or paused | `write_task_section` (section='note') or `write_task_section` (section='summary') |
| Task result is known | `record_task_outcome` |
| Task complete | `archive_task` |

## Graceful Degradation

If Venus MCP is unavailable: ask user to run `knowledge start`. Continue only if low-risk with no durable trail required. Do not fabricate task IDs. Stop before work requiring durable state, evidence, memory, or handoff. No fallback notes; no agent-memory.

## Common Mistakes

- Noting every command or click — write only for meaningful events.
- Skipping before-work handoff — required for substantial work.
- Hardcoding AC state in text instead of `toggle_ac_item`.

## Related Skills

**REQUIRED:** `venus-mcp` — Venus workflow contract

- `write-knowledge`
- `write-issue`
- `task-execution-workflows`
