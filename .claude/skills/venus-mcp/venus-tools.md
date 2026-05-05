# Venus MCP Tool Reference

## Session and Project Tools
- `bootstrap_session`

## Task and Draft Tools

| Tool | Key Params | Notes |
|---|---|---|
| `create_task` | title, description, ... | |
| `get_task` | id | |
| `update_task` | id, ... | Supports optional `priority: low\|medium\|high` |
| `list_tasks` | status?, ... | |
| `archive_task` | id | |
| `create_draft` | title, ... | |
| `list_drafts` | | |
| `promote_draft` | id | |
| `demote_task` | id | |
| `toggle_ac_item` | id, item | |

## Knowledge and Document Tools
- `create_document`
- `get_document`
- `update_document`
- `list_documents`
- `add_document_reference`
- `ingest_materials`
- `search_knowledge`

## Governance Tools
- `create_governance` — `type` ('rule'|'convention'|'decision'|'proposal'), `domain`, `title`, `body` + type-specific optional fields
- `list_governance` with `type='rules'`
- `list_governance` with `type='conventions'`
- `list_governance` with `type='decisions'`
- `explain_decision`

## Proposal and Conflict Tools
- `get_proposal`
- `update_proposal`
- `list_proposals`
- `promote_proposal`
- `resolve_conflict`

## Memory and Context Tools

| Tool | Key Params | Notes |
|---|---|---|
| `create_memory_candidate` | body, ... | Uses `body` for content |
| `update_memory_item` | id, description, ... | Uses `description` for content |
| `promote_memory_item` | id | |
| `list_memory_items` | lifecycle? | List memory items, filter by lifecycle (inbox/promoted/archived) |
| `get_memory_item` | id | Fetch a single memory item by ID |
| `get_context_pack` | | |
| `record_context_feedback` | | |

> Note: `create_memory_candidate` uses `body` for content; `update_memory_item` uses `description`. Both refer to the same field.

## Agent/Task Evidence Tools

| Tool | Key Params | Notes |
|---|---|---|
| `write_task_section` (section='note') | task_id, note | Use `task_id` (not `id`) |
| `write_task_section` (section='plan') | task_id, ... | |
| `write_task_section` (section='summary') | task_id, ... | |
| `record_task_outcome` | task_id, ... | |

## Routing and Domain Tools
- `get_routing_score`
- `list_domains`

## Suggestion Workflow

Suggestions are auto-generated knowledge graph improvements. Agents can participate in the review cycle.

| Tool | Params | When to use |
|---|---|---|
| `generate_suggestions` | kind?, max_items?, max_pairs?, dry_run? | After sync, to surface new relationship/governance suggestions |
| `list_suggestions` | status?, kind?, suggestion_kind?, confidence?, risk? | Browse pending suggestions (status: inbox/reviewing/accepted/rejected/archived/applied/failed) |
| `get_suggestion` | id | Read full suggestion detail before reviewing |
| `review_suggestion` | id, status, reviewed_by? | Accept or reject a suggestion (status: accepted/rejected/archived) |
| `apply_suggestion` | id | Apply an accepted suggestion to the knowledge graph |

**Typical agent flow:**
1. `generate_suggestions` — surface candidates
2. `list_suggestions(status='inbox')` — see what needs review
3. `get_suggestion(id)` — read full detail
4. `review_suggestion(id, status='accepted')` — approve
5. `apply_suggestion(id)` — apply to graph

## Meter and Metrics Tools

| Tool | Key Params | Notes |
|---|---|---|
| `record_metric_event` | task_id, event_type, component, outcome, agent?, round?, reason?, memory_used?, rules_applied?, duration_ms?, tokens_used?, metadata_json?, prediction_json?, verification_json? | Record structured metric event. event_type: stage_start \| stage_complete \| rejection \| test_failure \| outcome \| knowledge_change \| escalation \| governance_prediction \| auto_rollback \| manual_rollback \| cross_verification \| governance_audit. component: agent_logic \| agent_prompt \| knowledge.memory \| knowledge.rule \| knowledge.convention \| knowledge.decision \| pipeline.routing \| pipeline.handoff \| infrastructure |
| `get_metrics` (view='health') | window? ('7d' \| '30d' \| '90d') | Get system health metrics: success_rate, mttf_hours, cost_per_task, knowledge_hit_rate, task_count |
| `get_task_analysis` | task_id | Get detailed analysis for a specific task: events, failure_count, success_count, component_breakdown, failure_chain |

**Typical meter flow for agents:**
1. Before work: `record_metric_event(event_type='stage_start', prediction_json={...})`
2. After work: `record_metric_event(event_type='stage_complete', outcome='pass'\|'fail', memory_used=[...], verification_json={...})`
3. PM review: `get_metrics(view='health', window='7d')` — check for anomalies
4. Deep dive: `get_task_analysis(task_id)` — understand a specific failure

> Note: Meter tools are optional — if unavailable, skip silently. Never block work for metrics.
