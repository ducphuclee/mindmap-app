---
name: write-use-cases
description: Expand PRD user stories into detailed use cases with main flows, alternative flows, edge cases, and error paths. Use when user wants to detail use cases before breaking into implementation issues.
---

# To Use Cases

Expand user stories into detailed use cases that map every flow through the system.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user references a PRD (Venus document ID, URL, or path), fetch it and read the full content — especially the User Stories and Implementation Decisions sections.

If no PRD exists yet, suggest running the `write-prd` skill first.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand existing flows, domain models, and integration points. Use the project's domain glossary vocabulary throughout.

### 3. Identify actors and systems

From the user stories, extract:

- **Actors**: all user roles and external systems that interact with the feature
- **Systems**: internal components, services, and data stores involved

Present this list to the user for confirmation before proceeding.

### 4. Expand use cases

For each significant user story (or group of related stories), write a use case:

<use-case-template>
### UC-{number}: {title}

**Actor:** {primary actor}
**Trigger:** {what initiates this use case}
**Preconditions:** {what must be true before this flow starts}

**Main flow (happy path):**
1. {step}
2. {step}
3. {step}

**Alternative flows:**
- **{number}a — {name}:** At step {N}, if {condition}, then {steps}

**Error flows:**
- **{number}e1 — {name}:** At step {N}, if {error condition}, then {system response}

**Postconditions:** {what is true after successful completion}
**Business rules:** {any domain rules that govern this flow}
</use-case-template>

Guidelines:
- Each use case should be **end-to-end** — from actor trigger to observable outcome
- Main flow = shortest happy path. Keep it under 10 steps.
- Alternative flows branch from a specific main flow step and may rejoin
- Error flows describe system behavior on failures (validation, auth, timeout, conflict)
- Group related user stories into one use case when they share the same flow with minor variations
- Split a user story into multiple use cases when it contains distinct triggers or actors

### 5. Map relationships

After drafting all use cases, present a dependency/relationship summary:

- **Includes**: UC-X includes UC-Y (shared sub-flow)
- **Extends**: UC-X extends UC-Y (optional behavior)
- **Depends on**: UC-X requires UC-Y to be implemented first

### 6. Quiz the user

Present the complete use case set. Ask:

- Are any flows missing? (especially error and edge cases)
- Are the actors and preconditions correct?
- Should any use cases be merged or split?
- Are the business rules accurate?

Iterate until the user approves.

### 7. Publish to Venus

Publish the approved use cases to Venus using:
```
create_document(
  type: 'artifact',
  domain: <project domain>,
  title: 'Use Cases: <feature name>',
  body: <all use cases formatted as above>
)
```

If a PRD document exists, link them:
```
add_document_reference(
  source_id: <use-cases document ID>,
  target_id: <PRD document ID>
)
```

After the use cases are approved, use the `write-issue` skill to break them into vertical-slice implementation issues. Each issue should trace back to one or more use cases (reference UC numbers in the issue description). Then use `write-tasks` to convert selected issues into agent-ready tasks.
