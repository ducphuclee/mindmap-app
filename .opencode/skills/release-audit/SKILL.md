---
name: release-audit
description: "Use when preparing a release, assessing production readiness, or the user says audit, release gate, ship readiness, or find bugs systematically"
---

# Release Audit

Run a systematic release audit: find every bug, stub, and gap — then fix them all. This skill orchestrates the full cycle from doc review through gate assessment using **3 adversarial pipelines** that challenge their own findings before fixing.

## When to Use

- "Run a release audit"
- "Are we ready to ship?"
- "Find all bugs before release"
- "Assess Alpha/Beta/GA gate"
- Before tagging any release version
- After a large batch of changes lands on main

## Prerequisites

Read these two files before starting — they are the source of truth:

| File | Contains |
|------|----------|
| `docs/release/RELEASE-AUDIT-PROCESS.md` | Reusable process — steps, gate criteria, delegation model, time estimates |
| `docs/release/RELEASE-READINESS.md` | Per-release state — bug register, gate evidence, Go/No-Go checklist |

Also read the 3 blueprint docs for domain knowledge:
- `docs/release/ARCHITECTURE.md` — tech stack, API surface, DB schema
- `docs/release/DOMAIN_LOGIC.md` — business logic, pipelines, algorithms
- `docs/release/RULES.md` — code conventions, security rules, test standards

## Workflow

```
Step 0: Smoke test ──▶ Step 1+2 (parallel) ──▶ Step 3: 3 Adversarial Pipelines ──▶ Step 4: Fix ──▶ Step 5: Gate
         │                │           │                        │
      start app      docs audit   test baseline     ┌─────────┼──────────┐
                                                     │         │          │
                                                  Pipeline  Pipeline  Pipeline
                                                  A: Docs   B: UX     C: Gaps
                                                  Find→     Find→     Find→
                                                  Challenge Challenge Challenge
                                                     │         │          │
                                                     └────┬────┘──────────┘
                                                          │
                                                    Merge confirmed
                                                          │
                                                    Step 4: Fix ──▶ Step 5: Gate
```

## Artifact Directory

All pipeline artifacts go in `.release-audit/`. Add this to `.gitignore`.

```bash
mkdir -p .release-audit
```

```
.release-audit/
├── pipeline-a-findings.json       # A1: static/doc raw findings
├── pipeline-a-challenges.json     # A2: challenge verdicts
├── pipeline-a-confirmed.json      # A3: confirmed findings only
├── pipeline-b-findings.json       # B1: browser raw findings
├── pipeline-b-challenges.json     # B2: challenge verdicts
├── pipeline-b-confirmed.json      # B3: confirmed findings only
├── pipeline-c-findings.json       # C1: test gap raw findings
├── pipeline-c-challenges.json     # C2: challenge verdicts
├── pipeline-c-confirmed.json      # C3: confirmed findings only
├── all-confirmed.json             # Merged from A3+B3+C3
├── fix-report.json                # Step 4 results
└── gate-assessment.json           # Step 5 results
```

### Step 0: Smoke Test

```bash
npm run dev &                              # backend on :3737
cd web && npm run dev &                    # frontend on :5173
curl http://localhost:3737/health           # must return 200
```

If anything fails, fix blockers first. App must be running before audit starts.

### Step 1: Doc Audit (skip if docs are already standardized)

Cross-reference blueprint docs against actual code:
- Are API endpoints in ARCHITECTURE.md current? Grep `server.ts` for handlers vs documented routes.
- Are MCP tools in ARCHITECTURE.md current? Grep `mcp/server.ts` for registered tools vs documented tools.
- Are domain logic descriptions in DOMAIN_LOGIC.md still accurate?
- Is RULES.md §5 gate status current?

Update stale content. Don't restructure — surgical fixes only.

### Step 2: Test Baseline

```bash
npm test                    # record: X/Y tests, Z files
npx tsc --noEmit            # must pass
```

Record baseline in RELEASE-READINESS.md §4. If tests fail, fix before proceeding.

---

## Step 3: Three Adversarial Pipelines

This is the core of the audit. Launch all 3 pipelines **in parallel**. Each pipeline is self-contained: **Find → Challenge → Confirmed**. The Challenge phase re-reads code/retries tests to eliminate false positives before any fix work begins.

**Why challenge?** Prior audits show ~15-30% of raw findings are false positives (intentional `as any`, guarded `!.`, flaky browser tests, implicit test coverage). Fixing false positives wastes time and introduces unnecessary code churn.

### Finding Schema (shared across all pipelines)

```json
{
  "id": "DA-001",
  "pipeline": "A",
  "severity": "CRITICAL",
  "surface": "backend",
  "category": "security",
  "file": "src/web/server.ts",
  "lines": "276-280",
  "claim": "No wss.on('error') handler on WebSocketServer",
  "evidence": "server.ts:276 creates WebSocketServer, no .on('error') found in file",
  "runtimeTrigger": "WebSocket connection error crashes server silently",
  "status": "OPEN"
}
```

### Challenge Schema (shared across all pipelines)

```json
{
  "findingId": "DA-001",
  "response": "CONFIRM",
  "reason": "Re-read server.ts:270-290. No error handler found. Global uncaughtException at line 15 does not cover WS-specific errors.",
  "newSeverity": null,
  "codeVerified": true
}
```

`response` values:
- `CONFIRM` — finding is real, proceed to fix
- `DISMISS` — false positive, remove from fix list
- `RECLASSIFY` — real but wrong severity/category, set `newSeverity`

---

### Pipeline A: Documents (Static Analysis + Doc Cross-ref)

#### A1: Find (Explore agent)

Dispatch an `Explore` agent with these tasks:

**Grep patterns:**
```
# Stubs and TODOs
grep -r "not yet implemented\|stub\|TODO\|FIXME\|HACK" src/ --include="*.ts"

# Empty catch blocks
grep -rn "catch\s*{}" src/ --include="*.ts"
grep -rn "catch\s*(\w*)\s*{}" src/ --include="*.ts"

# Non-null assertions (crash risk)
grep -rn "!\." src/web/ src/mcp/ --include="*.ts" | grep -v node_modules | grep -v "\.d\.ts"

# Missing sanitizeId on REST handlers that take :id params
# Cross-reference: every handler that reads params.id must call sanitizeId()

# as any casts (type safety gaps)
grep -rn "as any" web/src/ --include="*.ts" --include="*.tsx"

# Empty .catch(() => {}) (silent error swallowing)
grep -rn "\.catch.*=>\s*{" web/src/ --include="*.ts" --include="*.tsx"
```

**Cross-reference docs vs code:**
- Every documented API endpoint must exist in code
- Every MCP tool must be registered and functional
- Every documented feature must work (not stub)

**Output:** Write findings to `.release-audit/pipeline-a-findings.json`

#### A2: Challenge (Explore agent — fresh context, MUST re-read code)

Dispatch a **separate** `Explore` agent. This agent reads `pipeline-a-findings.json` and challenges each finding by re-reading the actual code.

**Challenge rules — DISMISS when:**

1. **`as any` is intentional**: has explanatory comment, or is a known workaround for a library type issue (e.g., third-party type mismatch). Re-read the line + 3 lines above for comments.
2. **`!.` is guarded**: TypeScript narrowing, null check, or guard clause exists within the same function above the assertion. Re-read the full function.
3. **`TODO`/`FIXME` is stale**: the described functionality is already fully implemented. Re-read the function body — does it do what the TODO says it should?
4. **Empty catch has fallback**: logging, retry logic, or graceful degradation exists in the surrounding code. Re-read the full try/catch block + caller.
5. **`sanitizeId` not needed**: the route is only accessible behind admin/internal middleware, OR the parameter is not user-controlled (e.g., hardcoded in frontend). Trace the route middleware chain.
6. **Doc drift, not code bug**: doc says endpoint X exists but endpoint was renamed/merged. The code is correct — the doc needs updating. RECLASSIFY as `category: "doc-drift"`, severity LOW.
7. **Feature behind flag or alternative path**: "not implemented" claim but the feature exists via a different code path or is gated by a feature flag. Re-read the module exports and callers.

**Mandatory re-read rule:** Every DISMISS decision must cite the specific file:line that disproves the finding. Do NOT dismiss from memory or general knowledge.

**When uncertain:** CONFIRM. False negatives (missing a real bug) are worse than false positives (fixing something harmless).

**Output:** Write challenges to `.release-audit/pipeline-a-challenges.json`

#### A3: Merge

Orchestrator merges findings + challenges:
- CONFIRM → keep in confirmed list
- DISMISS → move to dismissed list (for transparency)
- RECLASSIFY → update severity/category, keep in confirmed list

**Output:** `.release-audit/pipeline-a-confirmed.json`

---

### Pipeline B: Browser/UX Testing

#### B1: Find (agent-browser)

Execute flows from `docs/release/USER_FLOWS.md` using `agent-browser`:

```bash
AGENT_BROWSER="node ~/.nvm/versions/node/v22.21.1/lib/node_modules/agent-browser/bin/agent-browser.js"
$AGENT_BROWSER --headed --executable-path "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" --profile ~/.agent-browser-edge-profile open 'http://localhost:5173'
$AGENT_BROWSER snapshot -i    # get element refs
$AGENT_BROWSER click e19      # interact by ref
```

For each flow, record:
- PASS: flow works as documented
- PARTIAL: loads but has issues (capture screenshot + element ref + error)
- FAIL: broken or inaccessible (capture screenshot + console error)

**Output:** Write failures to `.release-audit/pipeline-b-findings.json`

#### B2: Challenge (agent-browser — fresh session)

For each failure from B1, run a fresh verification:

**Challenge rules — DISMISS when:**

1. **Flaky test**: close browser completely (`$AGENT_BROWSER close`), reopen fresh session, retry exact same flow. If it passes 2 out of 3 retries → DISMISS as flaky.
2. **Setup issue**: failure is caused by empty DB, missing seed data, or stale session state — not a code bug. RECLASSIFY as `category: "test-setup"`, severity LOW.
3. **Timing issue**: failure caused by animation, lazy loading, or async rendering that resolves with a brief wait. Add appropriate wait, retry — if passes → DISMISS.
4. **Viewport/zoom artifact**: failure only reproduces at specific viewport/zoom. If passes at default 1280x720 → DISMISS.

**Mandatory retry rule:** Every DISMISS must include the retry result. "I think it's flaky" without retrying = not valid.

**When uncertain:** CONFIRM. A UI bug that reaches users is worse than a wasted fix.

**Output:** Write challenges to `.release-audit/pipeline-b-challenges.json`

#### B3: Merge

Same merge logic as Pipeline A.

**Output:** `.release-audit/pipeline-b-confirmed.json`

---

### Pipeline C: Test Gaps

#### C1: Find (Explore agent)

Cross-reference `docs/release/DOMAIN_LOGIC.md` against test files:

1. List every documented business rule, algorithm, threshold, pipeline
2. For each, search for a corresponding test:
   - Direct test file (`*.test.ts`, `*.spec.ts`)
   - Test within a broader test file (grep for rule name/function name)
3. Flag: documented rule WITHOUT any test → finding
4. Flag: algorithm/threshold WITHOUT boundary tests → finding
5. Flag: source module WITHOUT test counterpart → finding

**Output:** Write findings to `.release-audit/pipeline-c-findings.json`

#### C2: Challenge (Explore agent — fresh context)

For each "missing test" finding, verify whether implicit coverage exists:

**Challenge rules — DISMISS when:**

1. **Integration test covers it**: the rule is tested as part of a broader integration test, not a dedicated unit test. Search for the function being called within other test files.
2. **E2E/browser test covers it**: the rule is exercised by a USER_FLOWS.md flow that Pipeline B already tests. Cross-reference flow steps against the flagged rule.
3. **Module is pure re-export or types**: the "untested" module only re-exports from other modules or defines TypeScript types/interfaces. No runtime logic to test.
4. **Boundary is unreachable**: the algorithm's "untested boundary" requires input that is validated/rejected by the caller. Trace the call chain — if the boundary value can never reach the function, RECLASSIFY as LOW.
5. **Test exists under different convention**: test file uses `__tests__/` directory, `.spec.ts` suffix, or different naming than expected. Search more broadly before declaring "no test".

**Mandatory verification rule:** Every DISMISS must cite the specific test file:line or flow step that provides coverage. "I think there's an integration test" without finding it = not valid.

**When uncertain:** CONFIRM. A missing test is low-cost to add and high-value for regression prevention.

**Output:** Write challenges to `.release-audit/pipeline-c-challenges.json`

#### C3: Merge

Same merge logic as Pipeline A.

**Output:** `.release-audit/pipeline-c-confirmed.json`

---

### Step 3 Merge: Combine All Pipelines

After all 3 pipelines complete, run the merge script:

```bash
node scripts/release-audit/merge-findings.cjs --dir .release-audit
```

This script:
1. Reads all 3 confirmed + challenge files from each pipeline
2. Merges findings + challenges (CONFIRM/DISMISS/RECLASSIFY) per pipeline
3. Deduplicates across pipelines (same file+line → keep higher severity)
4. Assigns final IDs: DA-001, DA-002, ...
5. Sorts by severity: CRITICAL → HIGH → MEDIUM → LOW
6. Writes `.release-audit/all-confirmed.json` and `.release-audit/all-dismissed.json`

If the script is not available, perform these steps manually by reading and merging the JSON files.

Then render the report and update RELEASE-READINESS.md:

```bash
node scripts/release-audit/render-readiness.cjs --dir .release-audit
```

This generates `.release-audit/report.md` (standalone report) and updates the bug register section in RELEASE-READINESS.md between `<!-- AUDIT:BUG_REGISTER:START -->` and `<!-- AUDIT:BUG_REGISTER:END -->` markers.

Use `--report-only` to skip updating RELEASE-READINESS.md.

---

### Step 4: Fix

Fix confirmed findings in severity batches. Each batch uses git branch + auto-revert safety.

#### 4a: Group findings by surface area

```
Batch 1: CRITICAL + HIGH     (must fix — blocks release)
Batch 2: MEDIUM              (should fix)
Batch 3: LOW                 (nice to have)
```

Within each batch, group by surface for parallel delegation:
- Backend (server.ts + modules)
- MCP (mcp/server.ts)
- Frontend (web/src/)
- Docs (docs/release/)

#### 4b: Safe fix with auto-revert

For each severity batch:

```bash
# 1. Create fix branch
git checkout -b release-audit/batch-1-critical-high

# 2. Delegate fixes to parallel coder agents (up to 3)
# 3. After agents complete, verify:
npx tsc --noEmit              # type check
npm test                       # regression check

# 4a. If ALL pass: commit
git add [specific files]
git commit -m "fix: N SEVERITY bugs from release audit (DA-XXX through DA-YYY)"
git checkout main && git merge release-audit/batch-1-critical-high

# 4b. If tests FAIL: identify which fix broke, revert it
git diff                       # see what changed
git checkout -- [broken files] # revert specific fix
# re-verify, commit what passes, log reverted fixes as REVERT_NEEDED
```

**Canary approach (for CRITICAL batch):** Fix the top 1-2 most critical findings first. Run full test suite. If green, continue with remaining fixes. This catches risky fixes early.

#### 4c: Delegate to parallel coder agents

Dispatch up to 3 `coder` agents in parallel, one per surface group. Each agent prompt must include:

1. **Exact file paths** and line numbers for every finding
2. **What to change** — not just "fix DA-001" but the specific code change
3. **Patterns to follow** — reference existing code patterns in the same file
4. **Verification command** — `npx tsc --noEmit` at minimum

#### 4d: Update bug register

After each commit, update RELEASE-READINESS.md and `.release-audit/fix-report.json`:
- `FIXED (commit_sha)` for resolved findings
- `REVERT_NEEDED` for fixes that caused regression
- `WONTFIX` for findings accepted as known limitations (with justification)

### Step 5: Gate Assessment

Read the gate criteria from RELEASE-AUDIT-PROCESS.md § Step 5.

For each criterion, run the check and record evidence:

| Gate | Criteria Count |
|------|---------------|
| Alpha | 9 criteria (C-01, C-02, R-01, R-02, S-01, O-01, OP-01, OP-02, A-01) |
| Beta | 13 additional criteria |
| GA | 4 additional criteria |

Update RELEASE-READINESS.md:
- §7 Gate Assessment table — PASS/FAIL per criterion with evidence
- §7a Go/No-Go Checklist — check/uncheck items
- §7b Evidence Record — command, result, timestamp, commit hash

Write machine-readable output to `.release-audit/gate-assessment.json`.

---

## Checklist

```
- [ ] Read RELEASE-AUDIT-PROCESS.md and RELEASE-READINESS.md
- [ ] Read ARCHITECTURE.md, DOMAIN_LOGIC.md, RULES.md
- [ ] Step 0: App starts and serves requests
- [ ] Step 2: npm test baseline recorded
- [ ] Pipeline A: A1 static analysis complete
- [ ] Pipeline A: A2 challenge complete (code re-read for every DISMISS)
- [ ] Pipeline A: A3 confirmed findings merged
- [ ] Pipeline B: B1 browser testing complete
- [ ] Pipeline B: B2 challenge complete (fresh session retry for every DISMISS)
- [ ] Pipeline B: B3 confirmed findings merged
- [ ] Pipeline C: C1 test gap analysis complete
- [ ] Pipeline C: C2 challenge complete (coverage search for every DISMISS)
- [ ] Pipeline C: C3 confirmed findings merged
- [ ] Step 3 merge: all-confirmed.json written, bug register updated
- [ ] Step 4: CRITICAL + HIGH batch fixed and committed (with auto-revert safety)
- [ ] Step 4: MEDIUM batch fixed and committed
- [ ] Step 4: LOW batch fixed and committed
- [ ] Bug register updated with FIXED status + commit SHAs
- [ ] Step 5: Gate criteria assessed
- [ ] Evidence record filled
- [ ] Go/No-Go checklist updated
```

## Delegation Model

| Role | Agent Type | Pipeline | Phase |
|------|-----------|----------|-------|
| Orchestrator | (you) | All | Plan, dispatch, merge, gate |
| Static Finder | `Explore` agent | A | A1: grep patterns, cross-ref docs |
| Static Skeptic | `Explore` agent | A | A2: re-read code, challenge findings |
| Browser Finder | `agent-browser` CLI | B | B1: execute UI flows |
| Browser Skeptic | `agent-browser` CLI | B | B2: fresh session retry |
| Gap Finder | `Explore` agent | C | C1: cross-ref DOMAIN_LOGIC vs tests |
| Gap Skeptic | `Explore` agent | C | C2: search implicit coverage |
| Coder (x3) | `coder` agent | — | Step 4: fix batches by surface |
| Doc updater | `coder` agent | — | Step 4: doc fixes, register updates |

**Rules:**
- Orchestrator never implements fixes directly — routes to coder agents
- Challenge agents MUST re-read code / retry tests — never dismiss from memory
- Every DISMISS must cite specific evidence (file:line or retry result)
- When uncertain, CONFIRM — false negatives are worse than false positives
- Group independent fixes for parallel dispatch (up to 3 agents)
- Never dispatch a coder without exact file paths and line numbers
- Always verify typecheck + tests after each batch before committing

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping doc read, jumping to grep | Read all 5 blueprint docs first — they are the map |
| Finding bugs without logging them | Log EVERY finding in JSON artifacts before fixing anything |
| Skipping challenge phase | Challenge phase catches ~15-30% false positives — never skip |
| Dismissing without re-reading code | Every DISMISS must re-read actual code and cite evidence |
| Fixing bugs one at a time | Batch by severity, delegate in parallel |
| Delegating without exact code locations | Agent prompts must have file paths + line numbers |
| Committing all fixes in one giant commit | One commit per severity batch, with auto-revert safety |
| Skipping browser verification | Tests pass but UI crashes — browser testing is non-negotiable |
| Marking findings FIXED without commit SHA | Every FIXED status must reference the commit |
| Forgetting to update gate assessment after fixes | Gate evidence must reflect post-fix state |
| Claiming coverage without verification | Challenge agents must cite specific test file:line for DISMISS |

## Time Estimates

| Phase | Parallel | Serial |
|-------|----------|--------|
| Step 0: Smoke test | 10min | 10min |
| Step 1: Doc audit | 30min | 1h |
| Step 2: Test baseline | 5min | 5min |
| Pipeline A: Find + Challenge | 1h | 2h |
| Pipeline B: Find + Challenge | 1h | 2h |
| Pipeline C: Find + Challenge | 30min | 1h |
| Step 3 merge | 10min | 10min |
| Step 4: Fix (CRITICAL+HIGH) | 30min | 1-2h |
| Step 4: Fix (MEDIUM) | 30min | 1-2h |
| Step 4: Fix (LOW) | 30min | 1-2h |
| Step 5: Gate assessment | 1h | 1-2h |
| **Total** | **~6-7h** | **~14-16h** |

Full audit including Steps 0-2 (doc standardization + test baseline): add ~3-5h parallel / ~6-8h serial.

Partial re-audit (Step 3 pipelines + Step 4-5 only): ~3-4h parallel / ~4-6h serial.
