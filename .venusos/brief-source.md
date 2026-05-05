# Brief Source

> Deterministic source data for `.venusos/brief.md`.

## Project Metadata

- **Name**: mindmap-app
- **Generated At**: 2026-05-05T06:50:07.057Z
- **Root**: /Users/phucld/workspace/workflow-seminar

## Architecture Signals

### Directories

- `scripts`
- `.venusos/documents`

### Package Scripts

- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `lint`: `next lint`

### Known Modules

- **Scripts**: Automation and maintenance scripts
- **Documents**: Structured knowledge documents

## Overview Candidates

- **Task** task-backend-task-003-Fixmult `done` (backend) — Fix multi-project DB isolation — connection pool broken after refactor
  - *Description*: ## Problem

Venus web server returns 0 entities for ALL projects after connection pool refactor.

**Root cause (hypothesis):** `initProjectDb()` creates a fresh empty LadybugDB connection for each project path. But Venus's sync process (which populates rules/conventions/decisions from `.venusos/` markdown files) still uses the singleton `initDb()` path. The pool connections have empty databases because sync was never run on them.

Additionally, `venus start` calls `initDb()` (singleton), then `importDbPrimaryNodes()` to load entities — but `resolveProject()` now calls `initProjectDb()` which creates a *different* connection that bypasses this populated state.

## What was changed (WIP — broken)

- `src/modules/graph.ts`: Added `DbConnection` interface, `connectionPool` Map<string, DbConnection>, `initProjectDb()`, `ensureSchemaOn()`. Added optional `optConn` params to `executePrepared()` and `queryByType()`.
- `src/web/server.ts`: Updated `resolveProject()` to return `{ projectPath, conn }` and pass `projectConn` to all query functions.

## Expected behavior

- Each project path gets an isolated DB connection
- Default project (`initDb()`) still works as before
- Switching projects in the web UI shows different data

## Acceptance Criteria

- [ ] `GET /api/tasks` returns correct data for default project (no regression)
- [ ] `GET /api/tasks?projectPath=/other/project` returns data for that project
- [ ] Two projects with different tasks do not leak data between them
- [ ] `venus start` initializes and serves the default project correctly
- [ ] Tests in `tests/graph-connection-pool.test.ts` pass

## Key files

- `src/modules/graph.ts` — connection pool implementation
- `src/web/server.ts` — `resolveProject()` and all API handlers
- `src/modules/sync.ts` — sync still uses singleton, may need update
- `tests/graph-connection-pool.test.ts` — new tests (currently failing)


## Workflows

### Initialize Project

- **Commands**: `venus init`
- **Description**: Initialize a new Venus project

### Sync Knowledge

- **Commands**: `venus sync`
- **Description**: Run the knowledge sync pipeline

### Generate Brief

- **Commands**: `venus brief`
- **Description**: Generate the project brief

### MCP Integration

- **Commands**: `venus mcp`
- **Description**: Start MCP server for agent integration


## Domains

- backend
- implementation

## Pinned Rules

No pinned rules found.

## Active Tasks

No active tasks found.

## References

- `CLAUDE.md`
- `.venusos/.meta/config.json`
- `.venusos/documents`
- `package.json`