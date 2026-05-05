---
name: write-issue
description: Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues.
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

## Process

### 1. Gather context

Work from whatever is already in the conversation context — PRD, use cases, or both. If the user passes a reference (Venus document ID, issue number, URL, or path) as an argument, fetch it and read the full content.

If use cases exist, each vertical slice should trace back to one or more use cases (reference UC numbers in the issue description).

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Publish the issues to Venus

For each approved slice, publish a new issue using the Venus MCP `create_issue` tool. Use the issue body template below.

Publish issues in dependency order (blockers first) so you can reference real issue IDs in the "Blocked by" field.

For each issue, call:
```
create_issue(
  title: <slice title>,
  issue_type: 'feature_request',
  severity: <'high' for blockers, 'medium' for mid-chain, 'low' for leaf slices>,
  description: <rendered issue body from template below>,
  domain: <project domain>
)
```

If the source material was an existing Venus issue, include its ID in the description's "Parent" section.

After all issues are created, use the `write-tasks` skill to convert selected issues into agent-ready tasks with full implementation contracts (AC items, scope files, fixer guidance).

<issue-template>
## Parent

A reference to the parent issue on the issue tracker (if the source was an existing issue, otherwise omit this section).

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- `issue-xxx` (Venus issue ID of the blocking issue, if any)

Or "None - can start immediately" if no blockers.

</issue-template>

Do NOT close or modify any parent issue.
