---
name: venus-mcp
description: Use when working inside a Venus project, or when user asks to manage tasks, context, documents, memory, rules, conventions, decisions, proposals, handoffs, or durable agent work state.
---

# Venus MCP Integration Contract

## Overview

Venus MCP is the canonical substrate for tasks, context, documents, memory, rules, decisions, proposals, and agent handoffs in Venus projects.

| System | Owns |
|---|---|
| Venus | Tasks, plans, notes, outcomes, documents, memory, rules, conventions, decisions, proposals, handoffs |
| GitNexus | Code graph, symbol impact, execution flows |
| agent-browser | Browser interaction; evidence written to Venus |
| External trackers | References only |
| Legacy agent-memory | Not used |

Tools: see [venus-tools.md](venus-tools.md) — key: `bootstrap_session`, `get_context_pack`, `search_knowledge`, `write_task_section` (section='note'), `create_task`, `create_memory_candidate`, `record_task_outcome`

## Quick Reference

| Situation | Action |
|---|---|
| Start substantial work | `bootstrap_session` → `get_context_pack` → before-work `write_task_section` (section='note') |
| Create any artifact | `search_knowledge` first, then create |
| New task or draft | `search_knowledge` → `create_task` or `create_draft` |
| Architecture / design choice | `search_knowledge` → `create_proposal` (NOT `create_decision` directly) |
| Propose a rule / convention / decision | `create_governance` → creates a **Suggestion** for user approval |
| Update an existing rule / convention / decision | `update_rule` / `update_convention` / `update_decision` → creates a **rewrite Suggestion** |
| Stop the server | `shutdown_server` (MCP) or `POST /api/shutdown` — **never `pkill`** |
| Blocker found | `write_task_section` (section='note') |
| Hand off to another agent | after-work `write_task_section` (section='note') with scope, evidence, risks, next steps |
| Work complete | `write_task_section` (section='summary') → `record_task_outcome` |
| Reusable lesson identified | `create_memory_candidate` (non-obvious and future-useful only) |
| MCP unavailable | Ask user: `knowledge start`; non-durable work only; stop otherwise |

## Universal Workflow

**Prelude** — before substantial task-bound work:

1. `bootstrap_session`
2. Resolve active Venus project and task
3. `get_context_pack(task_id, agent_role)` — intent, constraints, governance, prior notes (filtered by agent role)
4. `search_knowledge` before creating any task, document, proposal, rule, or memory candidate
5. Write before-work handoff

**During** — write to Venus for meaningful events only:
plan · blocker · handoff · decision · root cause · review finding · verification evidence · QA finding · follow-up

Use `write_task_section` (section='note'). Do not record every command, click, or snapshot.

**Epilogue** — after work finishes or stops:

1. Write after-work handoff
2. `write_task_section` (section='summary') for completion
3. `record_task_outcome` when result is known
4. `search_knowledge` before creating follow-up tasks or proposals
5. `create_memory_candidate` for reusable, non-obvious lessons only
6. Promote memory only after review and validation

## Required Handoff Protocol

Every agent doing substantial work writes two handoff records.

**Before-work** (`write_task_section` (section='note')) — before implementation, investigation, review, testing, browser QA, design, or refactoring:

> agent role · active task ID/title · objective · context pack used · linked governance consulted · planned scope · explicit non-scope · expected outputs · known risks/blockers

**After-work** (`write_task_section` (section='note') / `write_task_section` (section='summary') / `record_task_outcome`):

> what was done · files/artifacts touched · decisions made · evidence collected · verification performed · remaining risks · blockers · follow-up tasks/proposals needed · reusable lessons for memory candidates

Skip only for trivial read-only checks or single-command operations with no effect on task state.

## Role-Filtered Context

When delegating to a sub-agent, use `agent_role` parameter to filter governance items:

```
get_context_pack(task_id, agent_role='coder')
```

Output is organized into:
- **Binding** — rules/conventions that explicitly target this role (must follow)
- **Reference** — general items tagged `["all"]` (awareness only, do not execute)

PM MUST specify `agent_role` matching the delegated agent's role. Valid roles: `fixer`, `tester`, `reviewer`, `pm`, `architect`, `all`, `coder`, `spec-reviewer`, `task-keeper`, `senior-fixer`.

### Delegation Prompt Template

```
## Context for you ({role})
{binding_rules_and_conventions}

## Project reference (do not execute, awareness only)
{reference_items}
```

## Write Thresholds

**Record:** start/end handoffs · blockers · ownership transfers · plans · decisions · root cause analysis · verification evidence · review/QA findings · reusable learning · high-risk findings

**Do not record:** routine commands · intermediate thoughts · every click/snapshot · low-value administrative actions

## Governance Constraints

**Rules, Conventions, and Decisions are user-owned.** Agents may never create or modify them directly.

```
Agent intent               → Correct tool              → Outcome
─────────────────────────────────────────────────────────────────
New rule/convention/decision  create_governance          Suggestion (inbox)
Update existing governance    update_rule/convention/    rewrite Suggestion (inbox)
                               decision
User approves suggestion      (Suggestions UI)           Entity actually created/updated
User rejects suggestion       (Suggestions UI)           Discarded
```

`create_decision` and `create_rule` do NOT exist as direct agent actions. `create_governance` is the only entry point.

## Memory Promotion Lifecycle

```
task note → memory candidate → reviewed promotion → rule / convention / decision / document
```

Use `create_memory_candidate` only for lessons likely useful across future tasks.

**Promotion path heuristic:**
- Agent-*observed* patterns (recurring behavior, discovered convention) → `create_memory_candidate` → `promote_memory_item`
- Agent-*reasoned* design choices (architectural decision, proposed change) → `create_proposal` → `promote_proposal`
- Agent-proposed governance (new rule, convention, decision) → `create_governance` → user approves in Suggestions UI

## Graceful Degradation

If Venus MCP is unavailable: ask user to run `knowledge start`. Continue only for low-risk, non-durable work. Do not fabricate task IDs, context packs, or Venus state. Stop for work requiring durable state, handoff, evidence, or audit history.

## PM Sub-agent Handoff Templates

Sub-agents have no Venus MCP access. PM writes all Venus notes on their behalf.

**Before spawning** — write via `write_task_section` (section='note'):
```
BEFORE-WORK HANDOFF
Agent: <sub-agent type> (Claude Code)
Task: <Venus task ID>
Objective: <what this sub-agent will do>
Context: <key rules/conventions/decisions loaded>
Scope: <files the sub-agent may touch>
Non-scope: <explicit exclusions>
```

**Include in sub-agent prompt:**
- Venus task ID + title, all prior task notes, AC list, scope/non-scope, relevant conventions
- End the prompt with: *"End your response with a HANDOFF REPORT: Done / Artifacts / Decisions / Evidence / Risks / Blockers / Follow-ups"*

**After sub-agent returns** — write via `write_task_section` (section='note'):
```
AFTER-WORK HANDOFF
Agent: <sub-agent type> (Claude Code)
Task: <Venus task ID>
Done / Artifacts / Decisions / Evidence / Risks / Blockers / Follow-ups
```

Then: `update_task` status → toggle completed AC items → if done: `write_task_section` (section='summary') + `record_task_outcome`.

## Red Flags — Stop, You're Rationalizing

- *"I'll use agent-memory just this once"* → No. Ask user: `knowledge start`. Stop if durable state needed.
- *"Linear/GitHub is already tracking this"* → External trackers are references only. Venus task is canonical.
- *"It's a small task, no handoff needed"* → Skip only for trivial read-only checks.
- *"I'll backfill Venus later"* → No backfill. Summarize when MCP becomes available.
- *"I know the task ID from last session"* → Never fabricate context. Run `bootstrap_session`.
- *"Recording every step makes me thorough"* → Over-recording wastes context. Meaningful events only.

## Common Mistakes

| Mistake | Correct approach |
|---|---|
| Skip `bootstrap_session` | Always run it first |
| Record every command as a task note | Only meaningful events: blockers, decisions, evidence |
| Create artifacts without `search_knowledge` | Search first, link/update existing before creating |
| Use agent-memory when MCP unavailable | Ask user: `knowledge start`; stop if durable state needed |
| Promote memory candidate immediately | Promote only after validation and review |
| Treat external tracker ID as Venus task | External trackers are references only; Venus task is canonical |
| `pkill venus` to stop the server | Use `shutdown_server` MCP tool or `POST /api/shutdown` |
| `create_decision` / `create_rule` directly | Use `create_governance` — creates a suggestion, not the entity |
| `update_rule` to directly change a rule | Creates a rewrite suggestion; user must approve |

## Meter MCP Tools

Three tools for observability and metric tracking.

### `record_metric_event`

Record a structured metric event for task execution tracking.

| Param | Required | Description |
|-------|----------|-------------|
| task_id | yes | Venus task ID |
| event_type | yes | `stage_start`, `stage_complete`, `rejection`, `test_failure`, `outcome`, `knowledge_change`, `escalation` |
| component | yes | `agent_logic`, `agent_prompt`, `knowledge.memory`, `knowledge.rule`, `knowledge.convention`, `pipeline.routing`, `pipeline.handoff`, `infrastructure` |
| outcome | yes | `pass`, `fail`, `reject`, `skip`, `error` |
| agent | no | Agent role that triggered this event |
| reason | no | Failure reason or decision rationale |
| memory_used | no | IDs of memory/rules used during this action |
| rules_applied | no | IDs of rules/conventions that influenced the work |
| duration_ms | no | Time taken for this action |
| tokens_used | no | Token count for this action |
| prediction_json | no | Agent's prediction before action (see Prediction Loop) |
| verification_json | no | Post-action verification result |

**Example — task completion:**
```
record_metric_event({ task_id: "task-123", event_type: "outcome", component: "agent_logic", outcome: "pass", agent: "coder", rules_applied: "rule-001, convention-003" })
```

### `get_metrics` (view='health')

Get project health summary. Optional `window` param: `7d`, `30d`, `90d` (default `30d`).

Returns: `success_rate`, `mttf_hours`, `cost_per_task`, `knowledge_hit_rate`, `task_count`.

### `get_task_analysis`

Get detailed metric analysis for a task. Required param: `task_id`.

Returns: `total_events`, `failure_count`, `success_count`, `component_breakdown`, `failure_chain`.

### When to Call

- **After task completion**: `record_metric_event` with `event_type: 'outcome'`
- **When using Venus knowledge**: `record_metric_event` with `rules_applied` listing IDs used
- **On rejection/failure**: `record_metric_event` with `event_type: 'rejection'` or `'test_failure'`
- **Project health check**: `get_metrics` (view='health') at session start or after batch work
- **Post-mortem**: `get_task_analysis` after task failures to understand the event chain

## Agent Prediction Protocol

Before starting work on a task, agents should emit a prediction:

### When to Predict
- Before implementing a fix or feature (coder agent)
- Before reviewing code (reviewer agent)
- Before any action where Venus knowledge influences the approach

### How to Predict
Call `record_metric_event` with:
- `event_type`: `'stage_start'`
- `component`: `'agent_logic'`
- `outcome`: `'pass'` (the prediction itself always succeeds)
- `prediction_json`: JSON string with:
  - `predicted_outcome`: `'pass'` or `'fail'`
  - `confidence`: 0.0 to 1.0
  - `reasoning`: Why you predict this outcome
  - `knowledge_used`: Array of rule/convention IDs that inform your prediction

### After Completing Work
Call `record_metric_event` with:
- `event_type`: `'stage_complete'`
- `verification_json`: JSON string with:
  - `predicted`: your original prediction
  - `actual`: what actually happened (`'pass'` or `'fail'`)
  - `correct`: boolean
  - `knowledge_helped`: boolean — did the knowledge items actually help?

### Example Flow
```
// Before: predict
record_metric_event({ task_id: "task-123", agent: "coder", event_type: "stage_start", component: "agent_logic", outcome: "pass", prediction_json: '{"predicted_outcome":"pass","confidence":0.8,"reasoning":"Similar to task-100 which succeeded","knowledge_used":["rule-001"]}' })

// After: verify
record_metric_event({ task_id: "task-123", agent: "coder", event_type: "stage_complete", component: "agent_logic", outcome: "pass", verification_json: '{"predicted":"pass","actual":"pass","correct":true,"knowledge_helped":true}' })
```
