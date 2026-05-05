---
name: venus-mcp
description: Venus MCP workflow contract — tool reference, handoff fields, and lifecycle rules for all agents working in Venus.
license: MIT
compatibility: opencode
metadata:
  audience: agents
  workflow: venus-core-contract
---

# Venus MCP — Workflow Contract

Venus is the canonical system for task state, context, knowledge, and handoffs. All agents must use Venus MCP for durable state. No fallbacks to agent-memory, markdown files, or external trackers.

## HARD RULE — Shared Memory

**`write_task_section` is the ONLY shared memory between agents.**

Conversation messages are NOT visible to other agents. If explorer writes findings in conversation and does NOT call `write_task_section`, fixer has nothing to read. Every phase handoff MUST be written to Venus — not just thought or spoken.

After every `write_task_section`, call `get_task(id=...)` to verify the note was persisted before signaling the next phase.

## Tool Reference

| Tool | When to use |
|------|-------------|
| `bootstrap_session` | First call every session — resolves active project/task |
| `get_context_pack` | Load full context for a task (rules, docs, decisions, notes, memory) |
| `get_task` | Read a specific task |
| `create_task` | Create an executable work item |
| `create_draft` | Create a not-yet-actionable item |
| `promote_draft` | Make a draft executable |
| `demote_task` | Push a task back to draft |
| `update_task` | Update task fields (status, title, description) |
| `write_task_section` | Record progress, decisions, blockers, handoffs (section='note', content=...) |
| `write_task_section` | Write structured implementation plan on a task (section='plan', content=...) |
| `write_task_section` | Write completion summary when task is done (section='summary', content=...) |
| `record_task_outcome` | Record final outcome (success/partial/blocked) |
| `toggle_ac_item` | Check/uncheck an acceptance criteria item |
| `archive_task` | Move completed/cancelled task off the board |
| `search_knowledge` | Search before creating any artifact |
| `create_decision` | Record an accepted major choice |
| `create_proposal` | Record an uncertain option under consideration |
| `promote_proposal` | Accept a proposal → decision |
| `create_document` | Create long-form reference content |
| `add_document_reference` | Link a document to a task or artifact |
| `record_context_feedback` | Report poor context pack quality |
| `list_domains` | List knowledge domains |
| `get_routing_score` | Check routing score for a domain |

## Before-Work Handoff

**REQUIRED** before any substantial task-bound work. Call `write_task_section` with section='note' and content:

```
BEFORE-WORK HANDOFF
Agent: <role>
Task: <Venus task ID>
Objective: <what this session achieves>
Context pack: <key rules/docs/decisions loaded>
Linked governance: <rule IDs, decision IDs, convention IDs>
Planned scope: <what will be done>
Non-scope: <what is explicitly excluded>
Expected outputs: <deliverables>
Known risks: <what could go wrong>
```

## After-Work Handoff

**REQUIRED** before stopping or handing off. Use `write_task_section` (section='note') for interim, `write_task_section` (section='summary') + `record_task_outcome` for completion.

```
AFTER-WORK HANDOFF
Agent: <role>
Task: <Venus task ID>
Done: <what was completed>
Artifacts: <files/symbols touched>
Decisions: <choices made and why>
Evidence: <test results, screenshots, logs>
Verification: <how correctness was confirmed>
Risks: <remaining risks>
Blockers: <anything that stopped progress>
Follow-ups: <tasks/drafts to create>
Lessons: <reusable, non-obvious learnings>
```

## Lifecycle Rules

- **Search before creating**: Always run `search_knowledge` before creating any task, draft, decision, proposal, document, or memory candidate.
- **Notes for substance only**: Use `write_task_section` for decisions, blockers, evidence, handoffs — not routine command output.
- **MCP unavailable**: Ask user to run `knowledge start`. Stop if durable state is required.
- **Status transitions**: `todo` → `in_progress` when starting, → `done` when complete, → `archived` when off board.
- **Child tasks**: Only for work with a separate owner, deliverable, or verification path.

## Graceful Degradation

If Venus MCP is unavailable: ask user to run `knowledge start`. Do not fabricate task IDs. Do not use agent-memory, markdown fallbacks, or local files as canonical state. Stop before any work requiring durable state.
