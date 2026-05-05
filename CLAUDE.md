# Workflow Seminar Demo

## Overview

Demo project for AI-powered planning workflow chain seminar.

## Workflow Chain

```
brainstorming (PM — interview user about requirements)
  └→ @product-analyst (PRD → use cases → Venus docs)
       └→ @planner (issues → tasks → agent-ready contracts)
            └→ @coder (implement từng task)
```

## Agents

| Agent | Role | When to use |
|-------|------|-------------|
| `@product-analyst` | Viết PRD, expand use cases | Khi có ý tưởng/BRD, cần phân tích |
| `@planner` | Break thành issues + tasks | Khi có PRD/use cases, cần work items |
| `@coder` | Implement code | Khi có task với AC, scope_files |
| `@explorer` | Khám phá codebase | Khi cần hiểu code hiện tại |
| `@reviewer` | Review code quality | Sau khi implement xong |
| `@spec-reviewer` | Check spec compliance | Sau khi code viết xong |
| `@debugger` | Debug lỗi | Khi tests fail 2+ lần |
| `@solution-architect` | Architecture decisions | Khi blocked hoặc cần design |
| `@doc-writer` | Viết documentation | Khi feature done |

## Skills (Planning Chain)

| Skill | Purpose |
|-------|---------|
| `/brainstorming` | Interview user về plan/design |
| `/write-prd` | Tạo PRD từ conversation context → Venus plan document |
| `/write-use-cases` | Expand user stories → detailed use cases → Venus artifact |
| `/write-issue` | Break thành vertical-slice issues → Venus issues |
| `/write-tasks` | Convert issues → agent-ready tasks (AC, scope_files, fixer_guidance) |

## Common Commands

```bash
venus start            # start Venus server (port 3737)
venus stop             # graceful shutdown
npm run build          # compile TypeScript
npm test               # run tests
npm run typecheck      # type check
```

## Demo Flow

1. **Input:** BRD (Business Requirements Document)
2. **Brainstorming:** PM interviews user about gaps in BRD
3. **Analysis:** @product-analyst writes PRD + use cases
4. **Planning:** @planner breaks into issues + creates tasks
5. **Implementation:** @coder implements tasks
6. **Review:** @reviewer + @spec-reviewer verify
