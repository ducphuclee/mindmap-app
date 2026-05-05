---
name: task-execution-workflows
description: Use when starting features, bug fixes, refactors, or parallel work that needs Venus task state, context, notes, outcomes, or handoffs.
license: MIT
compatibility: opencode
metadata:
  audience: agents
  workflow: venus-task-execution
---

# Task Execution Workflows

Venus is the canonical task and execution state system. External trackers are references only.

## Quick Reference

| Trigger | Action |
|---------|--------|
| Starting work | `bootstrap_session` → resolve task → `get_context_pack` → before-work handoff |
| Progress / decisions | `write_task_section` (section='note') |
| Blocker | `write_task_section` (section='note', blocker) + update status |
| Finishing / pausing | after-work handoff → `write_task_section` (section='summary') → `record_task_outcome` |
| MCP down | `knowledge start`; stop if durable state required |

## Pre-Delivery Audit (Required Before Fixer)

Before any task goes to a fixer agent, run the pre-delivery audit. **See `pre-delivery-audit` skill for full protocol.**

Summary:
1. **Explorer audit**: Map relevant files, symbols, impact blast radius, dependencies, prior attempts, edge cases. Write as task note.
2. **Reviewer audit**: Define concrete acceptance criteria (testable), rejection conditions, risk flags, explicit scope guard (in/out). Write as task note.
3. **Pre-delivery handoff note**: Summarize both audits, file paths, AC count, fixer instructions. Update task status to `todo` (ready for fixer).

Do not deliver to fixer until both audit notes are written on the task.

## Feature Workflow (Fixer perspective)

**HARD RULE: Conversation history is NOT shared between agents. `write_task_section` is the only channel between explorer → reviewer → fixer. Each agent reads Venus, not chat.**

1. `bootstrap_session` + `get_task(id=<task_id>)` — read ALL notes written by prior agents
2. If no explorer note → STOP. Write task note: "FIXER BLOCKED: no explorer audit." Report to orchestrator.
3. If no reviewer note → STOP. Write task note: "FIXER BLOCKED: no reviewer audit." Report to orchestrator.
4. Write your own before-work handoff via `write_task_section` (section='note'; see `venus-mcp` for fields)
5. Run GitNexus impact analysis if code symbols may change
6. Apply TDD where behavior changes. Implement ONLY within reviewer's defined scope guard
7. Verify EVERY acceptance criterion from the reviewer note — with evidence per AC item
8. Write after-work handoff via `write_task_section` (section='note') with AC verification evidence
9. Call `write_task_section` (section='summary') + `record_task_outcome`
10. Create follow-ups only after `search_knowledge`

## Bug Fix Workflow

1. Resolve or create bug task (after `search_knowledge`); read context and prior memory.
2. Read pre-delivery audit notes if present. Write before-work handoff. Apply `systematic-debugging`.
3. Record root cause, evidence, and fix strategy as task notes.
4. Write/update regression tests. Implement. Capture evidence. Write after-work handoff.

## Refactor Workflow

1. Resolve task; read context and linked decisions. Write before-work handoff.
2. Run GitNexus impact and refactoring analysis. Record risk, blast radius, migration plan.
3. Create decision/proposal for major changes (after `search_knowledge`).
4. Implement in scoped steps. Capture evidence. Write final summary and outcome.

## Parallel Work

Use child tasks for work with a separate owner, deliverable, or verification path. Every substantial subagent writes before-work and after-work handoffs. Parent task summarizes outcomes and follow-ups. Do not create child tasks for trivial subtasks.

## After-Work Handoff

Write a task note or final summary: what was done, artifacts touched, decisions, evidence, verification, risks, blockers, follow-ups, lessons for memory. Use `write_task_section` (section='note') for interim handoffs, `write_task_section` (section='summary') for completion, `record_task_outcome` when result is known.

## Venus Task Lifecycle Integration

Not actionable → `create_draft`. Promote/demote → `promote_draft` / `demote_task`. Track AC → `toggle_ac_item`. Substantial plan → `write_task_section` (section='plan'). Major decision → `create_decision` (after `search_knowledge`). Completion → `write_task_section` (section='summary') + `record_task_outcome`. Off active board → `archive_task`. Improve context pack → `record_context_feedback`.

## Graceful Degradation

Ask user to run `knowledge start`. Continue only for non-durable advisory work. Stop before any work requiring durable state, evidence, or handoff. Do not use agent-memory or fallback notes.

## Common Mistakes

- External trackers or agent-memory as canonical — Venus is authoritative.
- Blockers kept only in chat — lost at session boundary; must be task notes.
- Notes for every minor command — reserve for decisions, blockers, evidence, handoffs.
- Memory for routine findings — reserve for reusable, non-obvious lessons.
- Skipping before/after-work handoffs — required for all substantial work.

## Related Skills

**REQUIRED:** `venus-mcp` — workflow contract (before-work handoff fields, MCP tool reference)

- `pre-delivery-audit` — required before delivering any task to fixer
- `investigation-handoff`
- `gitnexus-impact-analysis`
- `verification-before-completion`
