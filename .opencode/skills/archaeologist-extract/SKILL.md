---
name: archaeologist-extract
description: "Systematically extract CodeInsight knowledge from a codebase using 3 perspective lenses (Architecture, Domain Logic, Integration), each with a review phase that challenges quality before persisting to Venus. Use when you need full knowledge base population or refresh."
---

# Archaeologist Extract — Adversarial Knowledge Extraction

Decompose a codebase into high-quality CodeInsight nodes using 3 sequential pipelines with quality gates. Each pipeline applies a different analytical lens, extracts draft insights, challenges their quality, then persists only what passes review.

## When to Use

- First-time knowledge extraction for a new project
- Full refresh after major refactor
- Systematic coverage gap filling
- "Populate the knowledge base" / "Extract knowledge from code"

## Usage

```
/archaeologist-extract                # Auto-detect full vs incremental
/archaeologist-extract --full         # Force full analysis (ignore existing state)
/archaeologist-extract --force        # Run even if check_analysis_needed says not needed
/archaeologist-extract --focus <dir>  # Only extract from a specific directory
/archaeologist-extract --dry-run      # Extract + Review but don't persist (preview mode)
```

## Architecture

```
Phase 0: Bootstrap
  check_analysis_needed → query_code_knowledge (inventory) → source file scan
                |
                v
Pipeline A: Architecture Lens
  A-Extract (top-down: entry points, module graph, data flow)
  A-Review  (accuracy? utility? redundancy? substance?)
  A-Persist (create_code_insight for ACCEPT/UPDATE drafts)
                |
                v
Pipeline B: Domain Logic Lens
  B-Extract (type defs → business rules → state machines → validation)
  B-Review  (same challenge rubric + "describes the RULE not the mechanism?")
  B-Persist
                |
                v
Pipeline C: Integration Points Lens
  C-Extract (API boundaries → error propagation → trust boundaries → I/O)
  C-Review  (same challenge rubric + "source files actually contain this boundary?")
  C-Persist
                |
                v
Phase 4: Coverage Audit
Phase 5: update_archaeologist_state + report
```

Pipelines run **sequentially** (not parallel) because:
- Pipeline B uses A's accepted insights to avoid redundancy
- Pipeline C uses A+B to avoid redundancy
- The orchestrator maintains a focused analytical lens per pipeline

## Artifact Directory

```bash
mkdir -p .archaeologist-extract
```

```
.archaeologist-extract/
├── run-state.json           # Master state, pipeline progress, coverage map
├── pipeline-A-drafts.json   # Architecture drafts with review results
├── pipeline-B-drafts.json   # Domain Logic drafts with review results
├── pipeline-C-drafts.json   # Integration drafts with review results
├── persisted-A.json         # IDs persisted from pipeline A
├── persisted-B.json         # IDs persisted from pipeline B
├── persisted-C.json         # IDs persisted from pipeline C
└── report.md                # Human-readable summary
```

---

## Phase 0: Session Bootstrap

### 0a: Check analysis state

Call `check_analysis_needed` MCP tool.

- If `needed: false` and no `--force` flag: report "Knowledge is current (commit {hash}). Use `--force` to re-extract anyway." **Stop.**
- If `needed: true` with `lastProcessedCommit: null`: this is **Full mode**.
- If `needed: true` with `staleInsights` or `changedFiles`: this is **Incremental mode**.

Record: `currentCommit`, `changedFiles`, `staleInsights`.

### 0b: Inventory existing insights

Call `query_code_knowledge` with empty query, `include_stale: true`, `limit: 100`.

Build the **existing coverage map**:
```json
{
  "insight_count": 8,
  "insights": [{"id": "ci-graph-xxx", "domain": "graph", "query": "...", "source_files": [...]}],
  "covered_files": ["src/modules/graph.ts", ...],
  "domains": ["graph", "authentication", ...]
}
```

### 0c: Build source file inventory

Scan the target directory for all source files:
```
Glob("src/**/*.ts")      # adjust for project language
```

Exclude: `node_modules/`, `dist/`, `.venusos/`, `*.test.ts`, `*.spec.ts`, `__tests__/`, `coverage/`, `scripts/hooks/`.

Record `source_file_inventory` — the denominator for coverage tracking.

### 0d: Write initial state

Write `.archaeologist-extract/run-state.json`:
```json
{
  "run_id": "ae-YYYYMMDD-HHMMSS",
  "mode": "full",
  "current_commit": "abc123",
  "changed_files": [],
  "stale_insight_ids": [],
  "existing_coverage": { ... },
  "source_file_inventory": ["src/..."],
  "total_source_files": 42,
  "pipeline_progress": { "A": "pending", "B": "pending", "C": "pending" }
}
```

Report to user:
```
Archaeologist Extract — {mode} mode
  Commit: {hash}
  Source files: {N} scannable
  Existing insights: {N} ({M} stale)
  Coverage: {X}% ({covered}/{total} files)
```

---

## Pipeline A: Architecture Lens

### A-Extract: System-Level Knowledge

**Focus:** How the system is organized, how data flows, what the tech stack is, how modules connect.

**Reading order:**
1. Root configs: `package.json`, `tsconfig.json`, `Dockerfile`, `.env.example`
2. Entry points: `src/index.ts`, `src/main.ts`, `src/web/server.ts`, `src/cli/index.ts`
3. Directory structure: Glob top-level `src/*/` to identify module boundaries
4. Hub modules: Grep for most-imported files (modules that many others depend on)
5. Data flow: trace from entry point → handler → domain module → persistence

**Questions to answer** (each becomes a draft insight):
- "What is the overall system architecture and module organization?"
- "How does data flow from HTTP request to database persistence?"
- "What is the tech stack and why were these choices made?"
- "How are modules organized and what are the dependency boundaries?"
- "How does the build/dev/test toolchain work?"
- "What background processes or async pipelines exist?"

**For each finding**, write a draft to `.archaeologist-extract/pipeline-A-drafts.json`:
```json
{
  "draft_id": "A-1",
  "title": "Venus Module Architecture",
  "query": "How is the Venus codebase organized into modules?",
  "summary": "Venus uses a layered architecture with 4 tiers: ...",
  "domain": "architecture",
  "source_files": ["src/index.ts", "src/web/server.ts"],
  "status": "draft",
  "review_result": null
}
```

**Rules:**
- Read the actual files. Never draft from memory or assumptions.
- Summary must be ~200-400 tokens of **specific technical information**.
- `source_files` must list only files you actually read for this insight.
- Each insight answers exactly ONE canonical question.

### A-Review: Challenge Each Draft

Switch to **Skeptic mindset**. For each draft in `pipeline-A-drafts.json`, apply the 5-point challenge rubric:

**Challenge 1 — Accuracy (mandatory, re-read code)**
Re-read every file in `source_files`. Spot-check 3 specific claims in the summary.
- If a claim is wrong or unverifiable → `REVISE` with correction
- If a file in `source_files` wasn't actually relevant → remove it

**Challenge 2 — Utility**
"Would an agent or developer type this query into `query_code_knowledge`?"
- Good: "How does data flow from HTTP request to database?" → someone will ask this
- Bad: "What does line 42 of server.ts do?" → too specific, no one searches this
- If query is weak → propose a better one

**Challenge 3 — Redundancy**
Call `query_code_knowledge({ query: "<draft query>", include_stale: true, limit: 3 })`.
- If an existing insight answers the same question equally well → `DROP`
- If an existing insight is stale and covers the same area → `ACCEPT_UPDATE` with `existing_id`
- If the draft adds meaningfully new information → `ACCEPT`

**Challenge 4 — Substance**
Is the summary ~300 tokens of **real information**?
- Red flags: "handles X", "manages Y", "provides Z" without explaining **HOW**
- Acceptable: specific function names, data structures, conditional branches, module relationships
- If >40% hand-wavy prose → `REVISE` with specific content to add

**Challenge 5 — Source File Accuracy**
Every file in `source_files` must:
- Have been actually read during Extract
- Contain code relevant to the insight's claims
- Not be a phantom citation

This matters because `source_files` drives the staleness checker. Inaccurate files = broken staleness detection.

**Review verdicts:**
- `ACCEPT` — persist as new insight
- `ACCEPT_UPDATE` — update existing stale insight (set `existing_id`)
- `REVISE` — rewrite summary, then re-check (one revision max, then ACCEPT or DROP)
- `DROP` — duplicate or zero utility
- `WEAK` — persist but flag for improvement

Write review results back into each draft's `review_result` field.

### A-Persist

For each draft with verdict ACCEPT / ACCEPT_UPDATE / WEAK:

```
create_code_insight({
  id: draft.existing_id || undefined,   // only for ACCEPT_UPDATE
  title: draft.title,
  query: draft.query,
  summary: draft.summary,
  domain: draft.domain,
  source_files: draft.source_files
})
```

Record returned `{ id, updated }` in `.archaeologist-extract/persisted-A.json`.

If `--dry-run`: skip this phase. Write "DRY RUN — would persist N insights" to report.

Update `run-state.json`: `pipeline_progress.A = "persisted"`.

---

## Pipeline B: Domain Logic Lens

### B-Extract: Business Rules and Data Models

**Focus:** What the system DOES — its rules, constraints, algorithms, state machines.

**Reading order:**
1. Type definitions: `src/types/`, entity interfaces, enums
2. Domain modules: files with business verbs (process, validate, compute, reconcile, promote, archive)
3. State management: lifecycle transitions, FSMs, event handlers
4. Validation: zod schemas, constraint checks, input sanitization
5. Algorithms: scoring, ranking, conflict resolution, deduplication

**Questions to answer:**
- "What are the core entities and their relationships?"
- "How does [entity] lifecycle work (create → update → archive)?"
- "What validation rules govern [entity] creation/modification?"
- "How does [algorithm/pipeline] work step by step?"
- "What are the business rules for [domain-specific computation]?"
- "How does conflict resolution / deduplication work?"

**Cross-pipeline dedup:** Before writing a draft, check if Pipeline A already covered this topic. If A-3 already explains "module architecture" and your B-draft is about the same module's logic, make sure B adds the RULE perspective, not architecture.

**Additional B-specific rule:** The summary must describe the **RULE** or **BEHAVIOR**, not just the mechanism.
- Bad: "The createTask function takes title, domain, and optional fields"
- Good: "Tasks require a title and domain. Optional fields (priority, assignee) default to null. Task IDs are auto-generated as `task-{uuid}`. Duplicate title+domain combinations are allowed."

### B-Review

Same 5-point challenge rubric as A-Review, plus:

**Challenge 6 — Rule vs Mechanism (B-specific)**
Does the summary describe WHAT the system decides/enforces, or just HOW the code runs?
- Rule: "Documents older than 90 days are flagged for archival"
- Mechanism: "The function iterates over documents and checks the date field"
- If mechanism-only → `REVISE` to include the actual rule/constraint

### B-Persist

Same as A-Persist. Update `pipeline_progress.B = "persisted"`.

---

## Pipeline C: Integration Points Lens

### C-Extract: APIs, Boundaries, and Error Propagation

**Focus:** Where the system connects to the outside world — HTTP, MCP, database, filesystem, external services.

**Reading order:**
1. HTTP route definitions: `src/web/server.ts`, route handlers
2. MCP tool definitions: `src/mcp/server.ts`, tool schemas
3. Database layer: query functions, transaction boundaries
4. Error handling: middleware, error types, fallback logic
5. Auth/trust boundaries: middleware, session checks, permission guards
6. File I/O: read/write operations, path construction
7. External service calls: HTTP clients, queue producers

**Questions to answer:**
- "What are the HTTP API endpoints and their contracts?"
- "How does the MCP server register tools and route requests?"
- "How does error propagation work from domain to HTTP response?"
- "What are the trust boundaries and where is auth enforced?"
- "How does the database layer handle queries and transactions?"
- "What external dependencies exist and how does the system degrade?"

**Cross-pipeline dedup:** Check A and B accepted drafts. If A covered "module architecture" including the API surface, C should focus on the CONTRACT (input/output shapes, error codes) not the structure.

### C-Review

Same 5-point challenge rubric, plus:

**Challenge 7 — Boundary Accuracy (C-specific)**
For trust boundary insights: is the claim about WHERE auth/validation is enforced verified by reading the actual middleware/handler code?
- "All routes require auth" → did you read the middleware chain to confirm?
- "Input is validated by zod" → did you find the actual schema?

### C-Persist

Same as A-Persist. Update `pipeline_progress.C = "persisted"`.

---

## Phase 4: Coverage Audit

After all 3 pipelines complete:

1. Load `run-state.json` to get `source_file_inventory`
2. Collect all `source_files` from persisted insights (A + B + C)
3. Compute: `covered = files referenced by any insight`, `uncovered = inventory - covered`
4. Categorize uncovered files:
   - **Expected uncovered:** test files, scripts, configs, migrations
   - **Coverage gaps:** source modules with no insight coverage

Report:
```
Coverage Summary
  Total source files:    {N}
  Covered by insights:   {M} ({pct}%)
  Uncovered:             {K}
    Expected (tests/scripts): {X}
    Coverage gaps:            {Y}
      - src/modules/shadow.ts (consider adding insight)
      - src/utils/format.ts (utility, low priority)
```

If significant gaps exist (>5 non-test uncovered files in a domain), recommend: "Run `/archaeologist-extract --focus src/modules/` to cover remaining gaps."

## Phase 5: State Update and Report

1. Call `update_archaeologist_state({ commit_hash: currentCommit })`
2. Write `.archaeologist-extract/report.md`:

```markdown
# Archaeologist Extract Report — {date}

## Run Summary
- Mode: {full/incremental}
- Commit: {hash}
- Source files scanned: {N}

## Pipeline Results
| Pipeline | Extracted | Reviewed | Accepted | Dropped | Updated |
|----------|-----------|----------|----------|---------|---------|
| A: Architecture   | 6 | 6 | 5 | 1 | 0 |
| B: Domain Logic   | 8 | 8 | 6 | 1 | 1 |
| C: Integration    | 5 | 5 | 4 | 1 | 0 |
| **Total**         | **19** | **19** | **15** | **3** | **1** |

## Insights Persisted
[list each with id, domain, query]

## Dropped Drafts
[list each with reason: duplicate/weak/zero-utility]

## Coverage
[coverage summary from Phase 4]

## State
archaeologist-state updated to commit {hash}
```

3. Report summary to user.

---

## Incremental Mode

When `check_analysis_needed` returns `staleInsights` and/or `changedFiles`:

### Stale insight refresh
For each stale insight in `staleInsights`:
1. Re-read its `source_files`
2. Rewrite the summary based on current code
3. Skip the full Extract phase — go directly to Review with the rewritten draft
4. In Review: check accuracy + substance only (skip redundancy — it's already in the knowledge base)
5. Persist with `create_code_insight({ id: stale.id, ... })`

### Changed file coverage
For files in `changedFiles` NOT covered by any existing insight:
1. Run the normal 3-pipeline Extract → Review → Persist on those files only
2. Focus on the pipeline most relevant to each file's directory (e.g., `src/mcp/` → Pipeline C)

### Unchanged domains
Skip entirely. Don't re-read, don't re-extract.

---

## Deduplication Protocol

**Level 1 — Cross-pipeline within this run:**
Before Pipeline B, read A's accepted drafts. Before C, read A+B. If a draft's query is semantically covered by an earlier pipeline's accepted draft → `DROP` with "covered by {draft_id}".

**Level 2 — Against existing Venus insights:**
Review phase calls `query_code_knowledge` for each draft. Same question + same depth = DROP. Stale version of same question = ACCEPT_UPDATE.

**Level 3 — Source file overlap:**
Two drafts sharing >80% source_files AND answering related questions → DROP the weaker one, expand the stronger one's summary.

---

## Review Challenge Rubric (Quick Reference)

| # | Challenge | Verdict if fails | Mandatory? |
|---|-----------|-----------------|------------|
| 1 | Accuracy — re-read source files, spot-check 3 claims | REVISE | Yes |
| 2 | Utility — would someone search this query? | REVISE query | Yes |
| 3 | Redundancy — `query_code_knowledge` check | DROP or UPDATE | Yes |
| 4 | Substance — ~300 tokens of specific information, not prose | REVISE | Yes |
| 5 | Source file accuracy — only files actually read | Fix list | Yes |
| 6 | Rule vs mechanism (Pipeline B only) | REVISE | B only |
| 7 | Boundary accuracy (Pipeline C only) | REVISE | C only |

**Default on uncertainty:** ACCEPT. A slightly overlapping insight is better than a knowledge gap.

---

## Error Handling

| Failure | Recovery |
|---------|----------|
| `check_analysis_needed` fails | Assume full analysis needed, proceed |
| `query_code_knowledge` fails in Review | Skip redundancy check, note in report |
| `create_code_insight` fails | Retry once; if fails, log as "not persisted" |
| Source file unreadable | Skip file, note in coverage gaps |
| Mid-pipeline interruption | `run-state.json` records progress; restart from incomplete pipeline |
| `update_archaeologist_state` fails | Report commit hash for manual state update |

## Delegation Model

This skill runs in **local-sequential mode** — the orchestrator plays each role (Extractor, Reviewer) itself within its own context window. No subagent dispatch.

Rationale:
- Review phase needs MCP tool access (`query_code_knowledge`) for redundancy check
- Cross-pipeline dedup requires access to earlier pipeline drafts
- Archaeologist analysis needs broad codebase read access

The existing `archaeologist` agent (`.claude/agents/archaeologist.md`) is for ad-hoc exploration. This skill is for systematic knowledge base population.
