---
name: write-knowledge
description: Use when a solved problem, reusable pattern, decision, or investigation outcome should be preserved in Venus for future tasks.
license: MIT
compatibility: opencode
metadata:
  audience: agents
  workflow: venus-knowledge
---

# Write Knowledge

Use Venus for canonical project knowledge — move findings through the Venus lifecycle instead of writing directly into permanent rules.

```text
task note → memory candidate → reviewed promotion → rule/convention/decision/document
```

## Use It For

- Reusable, non-obvious fixes
- Repeated project patterns
- Confirmed root causes
- Validated conventions
- Architectural or workflow decisions
- Long-form explanation that future agents need
- Conflict resolution with `resolve_conflict`
- Promotion through `promote_memory_item`
- Document references with `add_document_reference`

## Artifact Mapping

| Knowledge type | Venus artifact/tool |
|---|---|
| Initial observation | `write_task_section` (section='note') |
| Reusable non-obvious lesson | `create_memory_candidate` |
| Validated hard constraint | `create_rule` |
| Validated soft practice | `create_convention` |
| Architectural/product/workflow choice | `create_decision` |
| Long-form durable explanation | `create_document` |
| Related knowledge link | `add_document_reference` |
| Memory promotion | `promote_memory_item` |
| Conflict resolution | `resolve_conflict` |

## Workflow

1. Run `bootstrap_session`.
2. Resolve active Venus task when task-bound.
3. Use `get_context_pack`.
4. Run `search_knowledge` before creating any new artifact.
5. Write task-local findings as task notes first.
6. Create memory candidates only for reusable, non-obvious lessons.
7. Promote memories only after validation with `promote_memory_item`.
8. Resolve conflicts with `resolve_conflict` when competing knowledge emerges.
9. Link related artifacts with `add_document_reference`.
10. Create documents for long-form explanations and evidence.

## Do Not Store As Knowledge

- Routine command output
- Obvious facts
- Temporary observations
- Every failed attempt
- Unvalidated one-off preferences
- Anything task-local only
- Conflicting knowledge without using `resolve_conflict`

## Required Handoff

**REQUIRED:** Follow the handoff protocol in `venus-mcp` — include objective, context used, scope, and expected knowledge output before; what was learned, evidence, and proposed promotion path after.

## Graceful Degradation

If Venus MCP is unavailable: ask user to run `knowledge start`. Continue only for non-durable advisory work. Stop before any work requiring durable task state, context, evidence, or handoff. Do not create fallback notes, use agent-memory, or fabricate Venus IDs.

## Related Skills

**REQUIRED:** `venus-mcp` — Venus workflow contract

- `write-activity`
- `write-issue`
- `task-execution-workflows`
