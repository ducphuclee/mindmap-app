# PRD: MindMap Web App (GitMind-inspired)

**Type:** plan  
**Domain:** product  
**Created:** 2026-05-05  

---

## Problem Statement

Người dùng cần một công cụ trực quan để tổ chức ý tưởng, lập kế hoạch và trình bày thông tin dưới dạng sơ đồ tư duy (mindmap). Các giải pháp hiện tại hoặc quá phức tạp, hoặc không đủ tính năng, hoặc yêu cầu cài đặt phần mềm. Người dùng cần một web app mindmap hiện đại, dễ dùng, có thể truy cập từ bất kỳ trình duyệt nào mà không cần cài đặt — tương tự GitMind nhưng với trải nghiệm mượt mà hơn.

## Solution

Xây dựng một web application mindmap đầy đủ tính năng với:
- **Landing page** chuyên nghiệp để giới thiệu sản phẩm
- **Dashboard** quản lý các mindmap của người dùng
- **Editor** mạnh mẽ dựa trên React Flow cho phép tạo, chỉnh sửa, và tổ chức mindmap với nhiều kiểu layout
- **Export & Share** để chia sẻ và xuất mindmap

**Tech Stack:**
- Next.js 15 (App Router) — full-stack framework
- React Flow — interactive mindmap canvas
- Supabase — authentication + database
- Tailwind CSS — styling
- html-to-image + jsPDF — export functionality

## User Stories

### Authentication & Onboarding
1. As a new visitor, I want to see a landing page that explains the product's value, so that I can decide whether to sign up.
2. As a new visitor, I want to sign up with my email and password, so that I can create an account and start using the app.
3. As a new visitor, I want to sign up with my Google account in one click, so that I can onboard quickly without creating a new password.
4. As a returning user, I want to log in with email/password, so that I can access my mindmaps.
5. As a returning user, I want to log in with Google, so that I can access my account quickly.
6. As a logged-in user, I want to log out securely, so that my account is protected on shared devices.
7. As a user, I want to see a loading state while authentication is processing, so that I know the app is working.
8. As a user, I want to be redirected to the dashboard after login, so that I can immediately access my work.
9. As a user, I want to receive a clear error message if my credentials are wrong, so that I know what to fix.

### Landing Page
10. As a visitor, I want to see a hero section with a compelling tagline and "Get Started Free" CTA, so that I'm motivated to sign up.
11. As a visitor, I want to see a features section highlighting 4-6 key capabilities with icons, so that I understand what the product offers.
12. As a visitor, I want to see a "How it works" section with 3 simple steps, so that I know how to get started.
13. As a visitor, I want to see a pricing section with Free and Pro tiers, so that I can choose the right plan.
14. As a visitor, I want to see a footer with navigation links and social links, so that I can find more information.
15. As a visitor on mobile, I want the landing page to be fully responsive, so that I have a good experience on any device.

### Dashboard
16. As a logged-in user, I want to see all my mindmaps displayed as grid cards with thumbnails, so that I can quickly identify and open them.
17. As a logged-in user, I want to create a new mindmap by clicking a "+ New Mindmap" button, so that I can start a new project immediately.
18. As a logged-in user, I want to rename a mindmap inline or via context menu, so that I can keep my workspace organized.
19. As a logged-in user, I want to duplicate an existing mindmap, so that I can use it as a starting point for a new project.
20. As a logged-in user, I want to delete a mindmap with a confirmation dialog, so that I don't accidentally lose my work.
21. As a logged-in user, I want to search my mindmaps by name, so that I can find a specific map quickly when I have many.
22. As a logged-in user, I want to sort my mindmaps by date created, date modified, or name, so that I can organize my view.
23. As a logged-in user, I want to see when each mindmap was last modified, so that I can track my recent work.
24. As a logged-in user, I want to open a mindmap by clicking on its card, so that I can start editing immediately.
25. As a logged-in user, I want to see an empty state with a prompt to create my first mindmap, so that I'm guided when starting out.

### Mindmap Editor — Canvas
26. As a user editing a mindmap, I want to zoom in and out on the canvas, so that I can work on detailed areas or see the big picture.
27. As a user editing a mindmap, I want to pan/drag the canvas, so that I can navigate large mindmaps.
28. As a user editing a mindmap, I want to use a minimap/overview panel, so that I can navigate and see the full structure at a glance.
29. As a user editing a mindmap, I want to fit the entire mindmap to screen with one click, so that I can reset my view quickly.
30. As a user editing a mindmap, I want my changes to be auto-saved, so that I never lose work due to forgetting to save.
31. As a user editing a mindmap, I want to see the mindmap title in the editor header, so that I know which map I'm working on.
32. As a user editing a mindmap, I want a toolbar with key actions (layout, export, share), so that I can access features quickly.

### Mindmap Editor — Nodes
33. As a user, I want to add a child node to any existing node by pressing Tab or clicking an "+" button, so that I can expand my mindmap.
34. As a user, I want to add a sibling node by pressing Enter, so that I can quickly add ideas at the same level.
35. As a user, I want to double-click a node to edit its text inline, so that I can update content without leaving the canvas.
36. As a user, I want to delete a node (and its subtree) by pressing Delete or Backspace, so that I can remove unwanted branches.
37. As a user, I want to drag and drop nodes to reorganize the mindmap, so that I can restructure my ideas freely.
38. As a user, I want nodes to display with rounded card style and drop shadow (like GitMind), so that the mindmap looks professional and clean.
39. As a user, I want edges/connections to be displayed as smooth curved lines, so that the mindmap looks visually appealing.
40. As a user, I want to select multiple nodes, so that I can move or delete them together.
41. As a user, I want to undo and redo my actions (Ctrl+Z / Ctrl+Y), so that I can recover from mistakes.

### Mindmap Editor — Node Customization (Floating Toolbar)
42. As a user, I want to select a node and see a floating toolbar appear, so that I can customize it without navigating to a separate panel.
43. As a user, I want to change the background color of a node from a color picker, so that I can visually categorize ideas.
44. As a user, I want to change the text color of a node, so that I can improve readability and visual hierarchy.
45. As a user, I want to change the font size of node text (small/medium/large), so that I can emphasize important nodes.
46. As a user, I want to apply bold formatting to node text, so that I can highlight key ideas.
47. As a user, I want to apply italic formatting to node text, so that I can add stylistic emphasis.

### Mindmap Editor — Layouts
48. As a user, I want to apply a Mind Map (radial) layout where the root is centered and branches spread outward, so that I can create classic mindmaps.
49. As a user, I want to apply a Tree (top-down) layout where the root is at the top and branches go downward, so that I can create hierarchical diagrams.
50. As a user, I want to apply a Tree (left-right) layout where the root is on the left and branches extend rightward, so that I can create flowchart-style diagrams.
51. As a user, I want to switch between layouts with one click, so that I can find the best view for my content.
52. As a user, I want the layout to animate smoothly when switching, so that I can track how nodes move.

### Export & Share
53. As a user, I want to export my mindmap as a PNG image, so that I can share it in documents or presentations.
54. As a user, I want to export my mindmap as a PDF file, so that I can print it or attach it to emails.
55. As a user, I want to generate a public share link for my mindmap, so that others can view it without an account.
56. As a user with a share link, I want to view a mindmap in read-only mode, so that I can see the content without accidentally editing it.
57. As a user, I want to revoke a public share link, so that I can make my mindmap private again.
58. As a user, I want to copy the share link to clipboard with one click, so that I can share it quickly.

### Pricing (Free vs Pro)
59. As a free user, I want to create up to 3 mindmaps, so that I can evaluate the product without paying.
60. As a free user who has reached the limit, I want to see a clear upgrade prompt, so that I know how to unlock more maps.
61. As a Pro user, I want to create unlimited mindmaps, so that I have no constraints on my work.

## Implementation Decisions

### Architecture
- **Next.js 15 App Router**: Landing page và share view dùng Server Components (SSR/SSG) cho SEO. Dashboard và Editor là Client Components (`"use client"`) cho full interactivity.
- **Supabase** handles: Auth (email + Google OAuth), PostgreSQL database, Row Level Security (RLS) for data isolation per user.
- **React Flow**: Core rendering engine for nodes, edges, drag & drop, zoom/pan. Custom node types extend the base.

### Modules

**1. AuthModule**
- Wraps Supabase Auth client
- Provides: `signIn(email, password)`, `signInWithGoogle()`, `signOut()`, `getCurrentUser()`, `onAuthStateChange(callback)`
- Next.js middleware handles protected routes (redirect to login if unauthenticated)

**2. MindmapRepository**
- Supabase DB queries for mindmap CRUD
- Schema: `mindmaps(id, user_id, title, data JSONB, is_public, slug, created_at, updated_at)`
- `data` field stores `{ nodes: Node[], edges: Edge[] }` as React Flow format
- RLS: users can only read/write their own mindmaps; public mindmaps readable by anyone via slug

**3. MindmapEditor**
- React Flow canvas wrapped in a parent component
- Manages local node/edge state with `useNodesState` / `useEdgesState`
- Auto-save: debounced save to MindmapRepository on every change (500ms debounce)
- Custom node type: `MindmapNode` — renders rounded card with text, applies style props (bgColor, textColor, fontSize, bold, italic)
- Keyboard shortcuts: Tab (add child), Enter (add sibling), Delete (remove node), Ctrl+Z (undo), Ctrl+Y (redo)

**4. LayoutEngine**
- Pure function module: `applyLayout(nodes, edges, type: 'radial' | 'tree-td' | 'tree-lr') → Node[]`
- Uses `dagre` library for tree layouts, custom radial algorithm for mindmap layout
- Returns new node positions; caller applies them via `setNodes`

**5. NodeToolbar**
- Floating UI component rendered via React Flow's `NodeToolbar`
- Shows on node selection
- Controls: color picker (bg + text), font size selector, bold toggle, italic toggle
- On change: updates node data via `updateNodeData` callback

**6. ExportService**
- `exportPNG(reactFlowInstance)`: uses `html-to-image` to capture the React Flow viewport as PNG
- `exportPDF(reactFlowInstance)`: captures PNG then embeds in PDF via `jsPDF`
- Both handle proper scaling and background color

**7. ShareService**
- `generateShareLink(mindmapId)`: sets `is_public=true`, generates unique `slug` (nanoid), returns share URL
- `revokeShareLink(mindmapId)`: sets `is_public=false`, clears slug
- `getMindmapBySlug(slug)`: public query (no auth) for share view page

**8. Dashboard**
- Grid layout using CSS Grid with responsive columns
- Each card shows: thumbnail (static SVG preview or screenshot), title, last modified date, action menu
- Actions via dropdown context menu: Rename, Duplicate, Delete
- Search: client-side filter on mindmap titles
- Sort: client-side sort by date/name
- Free tier: shows "3/3 maps used" badge + upgrade CTA when limit reached

**9. LandingPage**
- Fully static (SSG) — no auth required
- Sections: Hero, Features (6 items), How It Works (3 steps), Pricing (Free + Pro cards), Footer
- Responsive: mobile-first Tailwind CSS

### Database Schema

```sql
-- Mindmaps table
CREATE TABLE mindmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Mindmap',
  data JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own mindmaps" ON mindmaps
  USING (auth.uid() = user_id);
CREATE POLICY "Public mindmaps viewable by anyone" ON mindmaps
  FOR SELECT USING (is_public = true);
```

## Testing Decisions

**What makes a good test:**
- Tests external behavior (inputs → outputs), not implementation details
- Does not mock internal functions — only external dependencies (Supabase client, browser APIs)
- Deterministic and isolated (no shared state between tests)

**Modules to test:**

1. **LayoutEngine** — highest priority
   - Pure function, no side effects → ideal for unit tests
   - Test cases: radial layout positions root at center, tree-td positions root above children, tree-lr positions root left of children, handles single node, handles deep nested tree, handles disconnected nodes
   - Use Vitest with simple node/edge fixtures

2. **MindmapRepository** — critical data logic
   - Mock Supabase client
   - Test: create returns new mindmap with defaults, findByUser returns only user's maps, update saves JSONB data correctly, delete cascades, generateShareLink sets is_public + slug, getMindmapBySlug works without auth

3. **ExportService** — output validation
   - Mock html-to-image and jsPDF
   - Test: exportPNG calls html-to-image with correct element, exportPDF creates PDF with correct dimensions, handles empty canvas gracefully

## Out of Scope (Phase 2 Backlog)

The following features are intentionally deferred to Phase 2:

**UI/UX:**
- Dark mode toggle

**Editor — Additional Layouts:**
- Fishbone layout
- Timeline layout
- Org Chart layout

**Editor — Additional Node Features:**
- Emoji/Icon library for nodes
- Upload image into nodes
- Attach URL/hyperlink to nodes
- Node notes/annotations (secondary text)

**Export & Sharing:**
- SVG export
- Embed code (iframe embed for external websites)
- Realtime collaboration (multi-user simultaneous editing)

**Content:**
- Template library (preset mindmap templates)
- Real user testimonials

**Account:**
- User profile page
- Notification system

## Further Notes

- **Free tier limit**: 3 mindmaps per user. Enforced server-side via Supabase function or API route before insert.
- **Auto-save UX**: Show "Saving..." / "Saved" indicator in editor header. Debounce 500ms to avoid excessive writes.
- **Share view**: Route `/share/[slug]` — fully public, no auth required, renders mindmap in read-only React Flow instance.
- **Thumbnail generation**: MVP uses a styled placeholder card (title + node count). Phase 2 can implement actual canvas screenshot.
- **Mobile editor**: Editor is desktop-first. Landing page and dashboard should be responsive. Editor on mobile is acceptable but not optimized in MVP.
- **GitMind visual parity**: Aim for visual similarity to GitMind — rounded node cards, subtle drop shadows, smooth curved edges, clean sidebar, consistent color palette (blues/purples as accent).
