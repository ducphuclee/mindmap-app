---
name: startup
description: Use when starting or resuming a Venus project session that needs active task state, context packs, governance, memory, or handoff continuity.
license: MIT
compatibility: opencode
metadata:
  audience: agents
  workflow: startup
---

# Startup

Start from Venus. Venus is canonical for task state, context, documents, rules, decisions, memory, notes, and handoffs. External trackers are references only.

If Venus MCP is unavailable and durable state is needed: ask user to run `knowledge start` or stop.

## Startup Sequence

**1. Bootstrap Venus**

Run `bootstrap_session`. Resolve the active Venus project and task.

**2. Load task context**

Use `get_context_pack` — task intent, linked rules, conventions, decisions, documents, memory, and prior task notes. Check `list_domains` and `get_routing_score` when routing matters. Record poor context with `record_context_feedback`.

**3. Search before creating anything**

Use `search_knowledge` before creating tasks, drafts, documents, proposals, decisions, rules, conventions, or memory candidates. Link/update existing artifacts over duplicates.

**4. Write before-work handoff**

**REQUIRED:** Follow the before-work handoff protocol in `venus-mcp` — include agent role, task ID, objective, context pack used, linked governance, planned scope, non-scope, expected outputs, and known risks.

Use `write_task_section` (section='note').

## Checklist

- [ ] `bootstrap_session` ran
- [ ] Active Venus project/task resolved
- [ ] `get_context_pack` loaded
- [ ] `list_domains` / `get_routing_score` checked when applicable
- [ ] Linked governance reviewed
- [ ] `search_knowledge` run before any artifact creation
- [ ] Single next action identified
- [ ] Before-work handoff written for substantial work

## Quick Reference

| Situation | Action |
|---|---|
| Starting new session | `bootstrap_session` → `get_context_pack` → before-work handoff |
| No active task exists | `search_knowledge` → `create_task` or `create_draft` |
| Need current task context | `get_context_pack` |
| Before creating any artifact | `search_knowledge` first |
| MCP unavailable | Ask user: `knowledge start`; stop if durable state needed |

## Graceful Degradation

Ask user to run `knowledge start`. Continue only for non-durable advisory work. Do not create fallback notes or use agent-memory.

## Common Mistakes

| Mistake | Correct approach |
|---|---|
| Check Linear/external tracker first | Start with `bootstrap_session`; external trackers are references only |
| Start work without before-work handoff | Write handoff before any substantial task-bound work |
| Create artifact without `search_knowledge` | Always search first to avoid duplicates |
| Use `agent-memory/` for context | Venus MCP is canonical; no agent-memory fallback |

## Related Skills

**REQUIRED:** `venus-mcp` — Venus workflow contract

- `task-execution-workflows`
