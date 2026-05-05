---
id: convention-implementation-doc-001-ReactFl
type: convention
title: React Flow Mindmap Node Convention
description: ''
domain: implementation
status: active
updated_at: '2026-05-05T06:49:57.472Z'
---
## Node Style Convention

All mindmap nodes in the editor must follow GitMind-inspired visual style:

- **Shape**: Rounded rectangle with `borderRadius: 8px`
- **Shadow**: Subtle drop shadow (`box-shadow: 0 2px 4px rgba(0,0,0,0.1)`)
- **Default bg**: White (`#ffffff`), default text: Dark gray (`#333333`)
- **Edges**: Smooth cubic bezier curves (`type: 'smoothstep'` or custom bezier)
- **Font**: System font stack, medium weight by default
- **Customizable**: bgColor, textColor, fontSize (sm/md/lg), bold, italic via NodeToolbar

This ensures visual consistency and professional appearance across all node types.