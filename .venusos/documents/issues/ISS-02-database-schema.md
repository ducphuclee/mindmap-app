# ISS-02: Database Schema & Supabase Config

**Type:** AFK  
**Severity:** high  
**Domain:** engineering  
**Blocked by:** ISS-01  

## What to build

Create the Supabase project, apply the `mindmaps` table schema, configure Row Level Security (RLS) policies, and wire the database types into the Next.js app. After this slice, the data layer is ready for auth and CRUD operations.

Schema:
```sql
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
```

RLS: users can only read/write their own mindmaps; public mindmaps readable by anyone via slug.

## Acceptance criteria

- [ ] Navigate to `http://localhost:3000` → page loads without Supabase connection errors in console
- [ ] Open browser DevTools → Network tab → no failed requests to Supabase on page load
- [ ] (Via Supabase dashboard) mindmaps table exists with correct columns: id, user_id, title, data, is_public, slug, created_at, updated_at
- [ ] (Via Supabase dashboard) RLS is enabled on mindmaps table with 2 policies present

## Blocked by

- ISS-01
