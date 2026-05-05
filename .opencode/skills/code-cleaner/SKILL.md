---
name: code-cleaner
description: "Use when you want to detect and report duplicate code, redundant logic, and dead code. Runs Triage→Recon→Scanner→Skeptic→Report pipeline with incremental scan support via .code-cleaner/state.json. Reports only — no auto-fix."
---

# Code Cleaner — Duplication & Dead Code Detection

Detect duplicate code, redundant logic, and dead code. Report findings and persist to Venus. No auto-fix.

## Usage

```
/code-cleaner                    # Smart incremental scan
/code-cleaner src/               # Scan specific directory
/code-cleaner --full             # Force full rescan
/code-cleaner --dry-run          # Skip Venus persistence
/code-cleaner --skip-recon       # Skip GitNexus phase
```

## Target

$ARGUMENTS

Parse flags:
- `--full` → FORCE_FULL=true
- `--dry-run` → DRY_RUN=true
- `--skip-recon` → SKIP_RECON=true
- Remaining argument → TARGET_PATH (default: current working directory)

## Step 0: Preflight

### 0a. Resolve SKILL_DIR

Preferred: dirname of this SKILL.md file.

Fallback probes (try in order):
1. `$HOME/.claude/skills/code-cleaner`
2. `$HOME/.agents/skills/code-cleaner`
3. `$HOME/.codex/skills/code-cleaner`
4. `$HOME/.cursor/skills/code-cleaner`

Verify:
```bash
ls "$SKILL_DIR/skills/scanner/SKILL.md" "$SKILL_DIR/scripts/triage.cjs"
```
If missing → stop: "Code Cleaner skill files not found."

### 0b. Check Node.js

```bash
node --version
```
NODEJS_AVAILABLE=true if succeeds, warn but continue if not.

### 0c. Create output directory

```bash
mkdir -p .code-cleaner
```

### 0d. Determine SCAN_MODE

```bash
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "no-git")
```

Read `.code-cleaner/state.json`:
- If absent or empty → SCAN_MODE="full"
- If FORCE_FULL=true → SCAN_MODE="full"
- If present:
  ```bash
  COMMITS_SINCE=$(git rev-list "$(cat .code-cleaner/state.json | node -e 'process.stdin.on("data",d=>console.log(JSON.parse(d).lastCommit))')..HEAD" --count 2>/dev/null || echo "999")
  ```
  - COMMITS_SINCE=0 → SCAN_MODE="skip"
  - COMMITS_SINCE > 50 → SCAN_MODE="full"
  - else → SCAN_MODE="incremental"

Report:
```
Preflight: SCAN_MODE={mode} | Commit: {hash} | {N} commits since last run
```

### 0e. Select AGENT_BACKEND

Try in order:
- A: `subagent` tool available → "subagent"
- B: `teams` tool available → "teams"
- C: `interactive_shell` available → "interactive_shell"
- D: fallback → "local-sequential"

**local-sequential is the expected default. Not a degraded mode.**

If AGENT_BACKEND="local-sequential": read `$SKILL_DIR/modes/local-sequential.md`.

## Step 1: Triage (zero tokens)

```bash
node "$SKILL_DIR/scripts/triage.cjs" scan "$TARGET_PATH" --state .code-cleaner/state.json --output .code-cleaner/triage.json
```

Validate:
```bash
node "$SKILL_DIR/scripts/schema-validate.cjs" triage .code-cleaner/triage.json
```

Read `.code-cleaner/triage.json`. If `mode: "skip"`:
```
No changes since last scan. Use --full to force rescan.
```
Stop here.

Report:
```
Triage: {totalFiles} files | {exactDuplicateFiles} exact duplicates | {similarNamePairs} similar names | {nearClonePairs} near clones | {unusedExports} unused exports | {unreachableFiles} unreachable files
```

If all candidate counts are 0, report "No duplication candidates found" and stop.

## Step 2: Recon (GitNexus)

Skip if SKIP_RECON=true.

Check if `gitnexus_cypher` tool is available. If not: SKIP_RECON=true.

Execute recon queries (see `$SKILL_DIR/modes/local-sequential.md` for exact queries).

Write `.code-cleaner/recon.json`. Validate schema.

Report:
```
Recon: {structuralClones.length} structural clones | {redundantEntryPoints.length} redundant entries | {lowCohesionClusters.length} low-cohesion clusters
```

## Step 3: Scanner

Read `$SKILL_DIR/skills/scanner/SKILL.md`.

**In local-sequential mode:** switch mindset to Scanner. Execute scanner instructions using triage.json + recon.json as input.

**In subagent/teams mode:** dispatch scanner as sub-agent with triage.json + recon.json content.

Write `.code-cleaner/findings.json`. Validate schema.

Report:
```
Scanner: {findings.length} findings ({byCategory breakdown})
```

If findings.json is empty `[]`: report "No findings — codebase is clean." Skip to Step 5c (update state).

## Step 4: Skeptic

Read `$SKILL_DIR/skills/skeptic/SKILL.md`.

**In local-sequential mode:** switch mindset to Skeptic. Challenge every finding.

**In subagent/teams mode:** dispatch skeptic as sub-agent with findings.json content.

Write `.code-cleaner/skeptic.json`. Validate schema.

Report:
```
Skeptic: {accepted} accepted | {dismissed} dismissed | {manualReview} manual review
```

## Step 5: Report + Persist

### 5a. Render report

```bash
node "$SKILL_DIR/scripts/render-report.cjs" .code-cleaner/findings.json .code-cleaner/skeptic.json > .code-cleaner/report.md
```

This also writes `.code-cleaner/report.json`.

### 5b. Venus persistence (skip if DRY_RUN=true)

For each ACCEPTED finding:

1. Check existing insights:
```
query_code_knowledge({ query: finding.title, domain: "code-quality" })
```
If similar insight exists with same source files → skip (deduplicate).

2. Create insight:
```
create_code_insight({
  title: finding.title,
  query: "Is there duplicate/dead code involving " + finding.affectedSymbols.join(", ") + "?",
  summary: finding.claim + "\n\nEvidence: " + finding.evidence + "\nEstimated duplication: " + finding.estimatedDuplicationLines + " lines\nAction: " + finding.actionableNote,
  domain: "code-quality",
  source_files: finding.affectedFiles
})
```

3. For High-severity findings, also create issue:
```
create_issue({
  title: "[code-cleaner] " + finding.title,
  issue_type: "known_limitation",
  severity: finding.severity === "High" ? "high" : "medium",
  reporter: "code-cleaner",
  reporter_type: "agent",
  description: finding.claim + "\n\nFiles: " + finding.affectedFiles.join(", ") + "\nAction: " + finding.actionableNote,
  domain: "code-quality"
})
```

### 5c. Update state.json

Write `.code-cleaner/state.json`:
```json
{
  "schemaVersion": 1,
  "lastRunAt": "<ISO now>",
  "lastCommit": "<CURRENT_COMMIT>",
  "commitCount": <total commits>,
  "scanMode": "<SCAN_MODE used>",
  "fileHashes": <from triage.json.fileHashes>,
  "confirmedFindingIds": ["CC-1", ...],
  "venusInsightIds": ["ci-xxx", ...],
  "venusIssueIds": ["issue-xxx", ...],
  "stats": {
    "totalConfirmed": N,
    "totalDismissed": N,
    "estimatedDuplicateLines": N
  }
}
```

### 5d. Present report

Display the content of `.code-cleaner/report.md` to the user.

## Error Handling

| Step | Failure | Fallback |
|------|---------|----------|
| triage.cjs | script error | Warn, set SCAN_MODE=full, use LLM file discovery |
| GitNexus | unavailable | SKIP_RECON=true, continue |
| Scanner | timeout | Retry on narrowed file set (top 20) |
| Skeptic | timeout | Accept all findings as-is, note in report |
| Venus MCP | unavailable | Write report.json only, log warning |
| state.json | write error | Warn, skip state update |
| schema validation | fails | Fix JSON before continuing to next phase |
