# Local Sequential Mode

Run all phases yourself in one context window. Each phase writes a JSON artifact — read it back before starting the next phase. Do NOT carry findings in working memory across phases.

## Phase Execution

### Phase 2: Recon

If SKIP_RECON=true or GitNexus tools unavailable, write a minimal recon.json:
```json
{
  "structuralClones": [],
  "redundantEntryPoints": [],
  "lowCohesionClusters": [],
  "gitnexusAvailable": false,
  "limitation": "GitNexus unavailable or skipped"
}
```

Otherwise run these GitNexus queries:

**Query 1 — Structural clones (shared callees):**
```
gitnexus_cypher({
  query: "MATCH (f1:Function)-[:CodeRelation {type: 'CALLS'}]->(callee:Function) MATCH (f2:Function)-[:CodeRelation {type: 'CALLS'}]->(callee) WHERE f1.name <> f2.name AND f1.filePath <> f2.filePath WITH f1, f2, count(DISTINCT callee) AS sharedCallees WHERE sharedCallees >= 3 RETURN f1.name AS fn1, f1.filePath AS path1, f2.name AS fn2, f2.filePath AS path2, sharedCallees ORDER BY sharedCallees DESC LIMIT 30"
})
```

**Query 2 — Redundant entry points (shared callers):**
```
gitnexus_cypher({
  query: "MATCH (caller:Function)-[:CodeRelation {type: 'CALLS'}]->(t1:Function) MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(t2:Function) WHERE t1.name < t2.name AND t1.filePath <> t2.filePath WITH caller, t1, t2 RETURN caller.name AS callerName, caller.filePath AS callerPath, t1.name AS fn1, t1.filePath AS path1, t2.name AS fn2, t2.filePath AS path2 LIMIT 20"
})
```

**Query 3 — Cluster cohesion:**
Read `gitnexus://repo/venus/clusters` resource. Include clusters with cohesionScore < 0.4.

Write `.code-cleaner/recon.json`. Validate:
```bash
node "$SKILL_DIR/scripts/schema-validate.cjs" recon .code-cleaner/recon.json
```

### Phase 3: Scanner

**Switch mindset.** You are now the Scanner — a code duplication analyst.

1. Read `$SKILL_DIR/skills/scanner/SKILL.md`
2. Read `.code-cleaner/triage.json`
3. Read `.code-cleaner/recon.json`
4. Process candidates in priority order (see scanner SKILL.md)
5. For each candidate: read the actual source files, categorize, assess confidence
6. Write `.code-cleaner/findings.json`
7. Validate:
```bash
node "$SKILL_DIR/scripts/schema-validate.cjs" findings .code-cleaner/findings.json
```

If findings.json is empty array `[]`, skip Phase 4 and go to Phase 5.

### Phase 4: Skeptic

**Switch mindset.** Forget the pride of finding duplications. You are now the Skeptic — an adversarial reviewer.

1. Read `$SKILL_DIR/skills/skeptic/SKILL.md`
2. Read `.code-cleaner/findings.json`
3. Challenge every finding using hard exclusions first, then standard analysis
4. For each finding: re-read the actual code (mandatory), apply category-specific challenges
5. Write `.code-cleaner/skeptic.json`
6. Validate:
```bash
node "$SKILL_DIR/scripts/schema-validate.cjs" skeptic .code-cleaner/skeptic.json
```

### Phase 5: Report

1. Run render-report:
```bash
node "$SKILL_DIR/scripts/render-report.cjs" .code-cleaner/findings.json .code-cleaner/skeptic.json
```

2. The script writes `.code-cleaner/report.json` and outputs markdown to stdout

3. If DRY_RUN=false, persist to Venus (see SKILL.md Step 5b)

4. Update `.code-cleaner/state.json` (see SKILL.md Step 5c)

## Important Rules

- NEVER skip schema validation between phases
- NEVER carry findings from Scanner mindset into Skeptic mindset — re-read from disk
- If a phase produces empty output, that is valid — proceed to next phase
- If schema validation fails, fix the JSON before continuing
