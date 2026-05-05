---
name: get-api-docs
description: Use when writing code that depends on a third-party library, SDK, or API — fetch documentation before touching any API surface.
---

# Get API Documentation (chub → context7 fallback)

Never assume API signatures from training data. Always retrieve docs first. Primary source: **chub**. Fallback: **context7**.

## Quick Reference

| Goal              | Command                                       |
| ----------------- | --------------------------------------------- |
| Search docs       | `chub search "nextjs"`                        |
| Fetch docs        | `chub get stripe/api --lang py`               |
| Save docs to file | `chub get anthropic/sdk --lang py -o docs.md` |
| Query fallback    | `context7 query "nextjs 15 api reference"`    |
| Add note          | `chub annotate stripe/api "needs raw body"`   |
| List notes        | `chub annotate --list`                        |
| Rate docs         | `chub feedback stripe/api up`                 |

## Decision Flow

```
Search chub
     │
     ├─ Found + correct version → use chub docs (Step 2)
     │
     ├─ Found but version mismatch → fallback context7 (Step 3)
     │
     └─ Not found → fallback context7 (Step 3)
```

## Step 1 — Search chub

```bash
chub search "<library name>" --json
```

Identify the best matching ID and confirm the version matches the user's requirement. If found and version matches, go to Step 2. Otherwise go to Step 3.

## Step 2 — Fetch from chub

```bash
chub get <id> --lang ts   # or --lang py; omit --lang if single-language doc
```

Only use API shapes that appear in the docs. Do not guess missing parameters. After using the document, complete Step 6.

## Step 3 — Fallback to context7

```bash
context7 query "<library> <version> API reference — return method signatures, request/response schema, auth rules, breaking changes, minimal examples"
```

Avoid tutorials. Extract only what is needed for implementation.

## Step 4 — Write the code

Follow the API exactly: official method signatures, required headers, auth flows, request bodies. Never invent parameters.

## Step 5 — Persist new knowledge

If you used context7, save critical findings to chub so future sessions benefit.

```bash
chub annotate <id> "vX update: <important change>"         # existing ID
chub annotate custom/<library> "<important API behavior>"  # no ID yet
```

Annotate only high-value facts: breaking changes, auth requirements, version-specific behavior, undocumented constraints. Keep annotations short and actionable.

## Step 6 — Provide feedback (chub docs only)

```bash
chub feedback <id> up
chub feedback <id> down --label outdated
```

Available quality labels — see `chub feedback --help`.

## Core Principles

1. **Never write API code without documentation**
2. **Prefer chub over context7**
3. **Use context7 only as a fallback**
4. **Persist critical findings to chub**
5. **Never rely on training memory for API shapes**
