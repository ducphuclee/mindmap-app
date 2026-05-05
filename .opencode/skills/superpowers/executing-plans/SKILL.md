---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---

# Executing Plans

## Overview

Load plan, review critically, execute tasks in batches, report for review between batches.

**Core principle:** Batch execution with checkpoints for architect review.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

## Venus MCP Integration

When executing a plan in a Venus project, use Venus as the canonical execution record:

- **Bootstrap Session:** Call `bootstrap_session` first.
- **Context:** Use `get_context_pack` for task intent, constraints, governance, and prior notes.
- **Before-Work Handoff:** Before executing the plan or a substantial batch, write a Venus task note with agent role, active task, objective, context pack used, scope, non-scope, expected outputs, and risks using `write_task_section` (section='note').
- **Execution Checkpoints:** Write Venus task notes at meaningful batch completion points using `write_task_section` (section='note').
- **Plan Deviations:** Record deviations from the original plan as task notes with justification.
- **Blockers:** Record blockers as task notes with context and next action.
- **Acceptance Criteria:** Track plan completion progress using `toggle_ac_item` for individual task steps.
- **Draft Management:** If plan needs adjustment, consider demoting to draft with `demote_task` and promoting again with `promote_draft`.
- **Context Feedback:** Use `record_context_feedback` when the context pack was missing important information.
- **After-Work Handoff:** After each substantial batch or stop point, write a task note with what changed, files/artifacts touched, evidence, remaining risks, blockers, and follow-ups.
- **Final Summary:** Use `write_task_section` (section='summary') or `record_task_outcome` when the plan result is known.
- **Archiving:** Use `archive_task` when plan execution is complete and should leave the active board.
- **Follow-up Tasks:** Use `search_knowledge` before `create_task`, `create_draft`, or `create_proposal` for deferred work.

If Venus MCP server is unavailable, ask the user to run `knowledge start`. Continue only for non-durable advisory work. Stop before any work that requires durable task state, context, evidence, memory, or handoff. Do not create fallback/backfill notes and do not use agent-memory.

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify any questions or concerns about the plan
3. If concerns: Raise them with your human partner before starting
4. If no concerns: Create TodoWrite and proceed

### Step 2: Execute Batch
**Default: First 3 tasks**

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

### Step 3: Report
When batch complete:
- Show what was implemented
- Show verification output
- Say: "Ready for feedback."

### Step 4: Continue
Based on feedback:
- Apply changes if needed
- Execute next batch
- Repeat until complete

### Step 5: Complete Development

After all tasks complete and verified:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use superpowers:finishing-a-development-branch
- Follow that skill to verify tests, present options, execute choice

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker mid-batch (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Between batches: just report and wait
- Stop when blocked, don't guess
