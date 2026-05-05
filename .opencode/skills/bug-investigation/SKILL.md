---
name: bug-investigation
description: Use when investigating a bug, incident, or root cause — either to hand off an active investigation mid-work or to create a durable forensic record in Venus.
license: MIT
compatibility: opencode
metadata:
  audience: agents
  workflow: venus-bug-investigation
---

# Bug Investigation

## Skill Boundary

**Use Active Handoff mode** when transferring an investigation to another agent or pausing to resume with full context.

**Use Forensic Record mode** when creating a durable artifact of a *completed* investigation — reproduction, root cause, fix, follow-up.

Venus is canonical. External tracker IDs (Linear, Jira) are references only.

## Artifact Mapping

| Issue information | Venus artifact/tool |
|---|---|
| Active bug/remediation | `create_task` or update task |
| Detailed evidence | `write_task_section` (section='note') or `create_document` |
| Long-form investigation | `create_document` |
| Systemic unresolved issue | `create_proposal` |
| Conflicting findings | `resolve_conflict` |
| Raw evidence/materials | `ingest_materials` |
| Linked artifacts | `add_document_reference` |
| Architectural implication | `create_decision` |
| Reusable non-obvious lesson | `create_memory_candidate` |
| Follow-up work | `create_task` / `create_draft` / `create_proposal` |

## Example

**In Linear:**
```
Root cause: null pointer in SyncQueue when task deleted mid-flight.
Fix: null guard at sync/queue.ts:42. Severity: high, data loss risk.
Verified: regression test added, 24h soak passed.
Full investigation: Venus task note on TASK-1234.
```

**In Venus (full detail):**
- Reproduction: delete task during sync → NullPointerException in `SyncQueue.flush()`
- Evidence: stack trace lines 847-863; connection log rules out DB timeout
- False leads: DB timeout (log clean), parser race (unit tests pass)
- Root cause: `flush()` reads `task.id` without null check after concurrent delete
- Fix: `task?.id` guard; reviewed 3 similar queue patterns
- Verification: `sync-queue-concurrent-delete.test.ts`, 24h soak no recurrence

## Before-Investigation Handoff

**REQUIRED:** Follow the before-work handoff protocol in `venus-mcp` — include agent role, task ID, symptom/question, context pack, linked governance, scope, non-scope, expected outputs, known risks.

Use `write_task_section` (section='note').

## Investigation Record

Write meaningful evidence: full reproduction · raw logs/traces · false leads · root cause · fix strategy · verification · residual risk · raw materials via `ingest_materials`.

Use task notes for task-local evidence; documents for records outliving the task. Link artifacts with `add_document_reference`.

## After-Investigation Handoff

**REQUIRED:** Follow the after-work handoff protocol in `venus-mcp` — cover what was investigated, root cause, evidence, false leads, fix/mitigation status, verification, remaining risks, blockers, follow-ups, reusable lessons. Resolve competing root causes with `resolve_conflict`.

Use `write_task_section` (section='note') for handoff, `write_task_section` (section='summary') for completion, `record_task_outcome` when result is known.

## Workflow

1. Run `bootstrap_session`.
2. Resolve the active Venus task; use `get_context_pack`.
3. Run `search_knowledge` for related prior investigations.
4. Write before-investigation handoff.
5. Investigate with `systematic-debugging`.
6. Write evidence as task notes or documents; ingest raw materials with `ingest_materials`.
7. Link artifacts with `add_document_reference`; resolve competing root causes with `resolve_conflict`.
8. Run `search_knowledge` before creating follow-up tasks or proposals.
9. Create memory candidates only for reusable, non-obvious lessons.
10. Write after-investigation handoff or final summary; call `record_task_outcome`.

## Graceful Degradation

If Venus MCP is unavailable, ask the user to run `knowledge start`. Continue only for non-durable advisory work. Stop before any work requiring durable state, evidence, memory, or handoff. Do not fabricate task IDs, create fallback notes, or use agent-memory.

## Rules

- Never leave an active investigation only in chat — write Venus task notes.
- `search_knowledge` before creating any issue record or follow-up task.
- No memory candidates for routine bug details.
- Do not promote lessons to rules/conventions without validation.
- Use `resolve_conflict` for conflicting root causes.
- Always write after-work handoff when pausing or transferring ownership.

## Common Mistakes

| Mistake | Correct approach |
|---|---|
| Leave investigation only in chat | Write Venus task note before pausing |
| External tracker as canonical record | Venus is canonical; external IDs are references only |
| Memory candidates for routine findings | Only for reusable, non-obvious lessons |
| Skip handoff on transfer | Always write handoff when stopping or handing off |
| Ignore competing root causes | Use `resolve_conflict` |

## Related Skills

**REQUIRED:** `venus-mcp` — Venus workflow contract

- `write-knowledge`
- `systematic-debugging`
- `write-activity`
