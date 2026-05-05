---
name: create-work-item
description: Use when substantial work needs a Venus task, draft, proposal, decision, document, or execution breakdown.
license: MIT
compatibility: opencode
metadata:
  audience: agents
  workflow: venus-work-items
---

# Create Work Item

Use Venus to create and shape work. Venus tasks, drafts, proposals, decisions, and documents are canonical. External trackers are references only.

## Artifact Mapping

| Need | Venus artifact/tool |
|---|---|
| Executable work | `create_task` |
| Not-yet-actionable work | `create_draft` |
| Draft ready for execution | `promote_draft` |
| Task needs reshaping | `demote_task` |
| Uncertain option | `create_proposal` |
| Accepted major choice | `create_decision` |
| Long-form context | `create_document` |
| Separate owner/deliverable | Child task after `search_knowledge` |
| Acceptance criteria | `toggle_ac_item` |
| Draft management | `list_drafts`, `promote_draft`, `demote_task` |
| Proposal promotion | `promote_proposal` |
| Artifact linking | `add_document_reference` |

## Workflow

1. Run `bootstrap_session` and resolve the active Venus project/task.
2. Use `get_context_pack` for constraints and governance.
3. Run `search_knowledge` before creating anything new.
4. Choose the correct artifact from the mapping table and create it; link related items with `add_document_reference`.
5. Write before-work handoff for substantial new work.
6. Track outcomes with task notes, acceptance criteria (`toggle_ac_item`), and child tasks.

## Required Handoff

**REQUIRED:** Follow the before-work and after-work handoff protocols in `venus-mcp`.

## Do Not Use It For / Common Mistakes

- Replacing Venus task state with markdown
- Creating duplicate tasks without running `search_knowledge` first
- Creating task spam for tiny subtasks
- Treating external tracker IDs as canonical work state
- Storing reusable knowledge directly as rules before validation
- Hardcoding acceptance criteria state instead of using `toggle_ac_item`

## Graceful Degradation

If Venus MCP is unavailable, ask the user to run `knowledge start`. Do not fabricate task IDs or Venus artifacts. Stop before any work that requires durable task state, context, evidence, memory, or handoff — do not create fallback notes or use agent-memory.

## Related Skills

**REQUIRED:** `venus-mcp`
Others: `task-execution-workflows`, `write-activity`, `write-knowledge`
