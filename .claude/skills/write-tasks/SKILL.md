---
name: write-tasks
description: Convert Venus issues into agent-ready tasks with structured acceptance criteria, scope files, and fixer guidance. Use when user wants to promote issues to implementable tasks.
---

# To Tasks

Convert selected Venus issues into agent-ready tasks with full implementation contracts.

## Process

### 1. Gather issues

List available issues using `list_issues`. If the user specifies which issues to convert (by ID, title, or number), use those. Otherwise, present all open issues and let the user select which ones to promote.

If no issues exist yet, suggest running the `write-issue` skill first.

### 2. Explore the codebase

For each selected issue, explore the codebase to understand:

- Which files need to be created or modified
- Existing patterns and conventions in those areas
- Test file locations and testing patterns

### 3. Draft task contracts

For each selected issue, draft a task contract:

<task-contract-template>
### Issue: {issue title} (`{issue-id}`)

**Title:** {concise task title — action-oriented, e.g. "Add validation to user signup flow"}

**Priority:** {p0 | p1 | p2 | p3 — based on issue severity and dependency order}

**AC items** (each must be independently verifiable):
- [ ] {specific, testable criterion}
- [ ] {specific, testable criterion}
- [ ] {specific, testable criterion}

**Scope files** (files the agent may touch):
- `{path/to/file}`
- `{path/to/file}`

**Out of scope:**
- {what the agent must NOT touch or change}

**Fixer guidance:**
- {key patterns to follow from existing code}
- {gotchas or constraints the agent should know}
- {reference to relevant use case: UC-X}
</task-contract-template>

Guidelines:
- **AC items**: minimum 3, each must be a concrete assertion (not vague). Prefer "X returns Y when Z" over "X works correctly".
- **Scope files**: be specific — list actual file paths found during codebase exploration. Include test files.
- **Out of scope**: explicitly state boundaries so the agent doesn't over-reach.
- **Fixer guidance**: include code patterns, naming conventions, and reference to the use case (UC-number) that this task implements.
- Tasks should respect the dependency order from the original issues — if issue A blocks issue B, task A should be created first.

### 4. Quiz the user

Present all drafted task contracts. Ask:

- Are the AC items specific enough? Too many / too few?
- Are the scope files correct? Any missing?
- Is the fixer guidance helpful or misleading?
- Should any tasks be merged or split?

Iterate until the user approves.

### 5. Create tasks in Venus

For each approved contract, create the task:
```
create_task(
  title: <task title>,
  plan_body: <formatted plan with context from issue + use case>,
  ac_items: [<list of AC strings>],
  priority: <p0 | p1 | p2 | p3>,
  scope_files: [<list of file paths>],
  out_of_scope: <exclusions>,
  fixer_guidance: <guidance text>
)
```

After creating each task, link it back to the source issue by including the issue ID in the task's `plan_body`.

### 6. Summary

After all tasks are created, present a summary table:

| Task | Source Issue | Priority | AC Count | Status |
|------|-------------|----------|----------|--------|
| {title} | `{issue-id}` | {priority} | {count} | Created |

Note: Tasks are now ready for agent delegation via `get_context_pack(task_id, agent_role)`.
