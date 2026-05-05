# TASK-02: Supabase Database Schema & RLS Policies

**Source issue:** ISS-02  
**Priority:** P0  
**Status:** done  

## Plan

Create the Supabase project schema: `mindmaps` table with all required columns, Row Level Security (RLS) enabled, and two RLS policies. Generate TypeScript types from the schema and wire them into the app.

## Acceptance Criteria

- [ ] Navigate to `http://localhost:3000` → browser console shows no Supabase connection errors
- [ ] Navigate to `http://localhost:3000` → Network tab shows no failed requests to Supabase endpoints
- [ ] (Supabase dashboard) mindmaps table exists with columns: `id`, `user_id`, `title`, `data`, `is_public`, `slug`, `created_at`, `updated_at`
- [ ] (Supabase dashboard) RLS is enabled on mindmaps table with exactly 2 policies present

## Scope Files

- `supabase/migrations/001_mindmaps.sql`
- `src/types/mindmap.ts`
- `src/lib/supabase/types.ts`

## Out of Scope

- No auth changes — that is TASK-03
- No repository functions (create/read/update/delete) — those are in TASK-05 and TASK-06

## Fixer Guidance

- Migration SQL:
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
  ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can manage own mindmaps" ON mindmaps USING (auth.uid() = user_id);
  CREATE POLICY "Public mindmaps viewable by anyone" ON mindmaps FOR SELECT USING (is_public = true);
  ```
- TypeScript type `Mindmap` in `src/types/mindmap.ts` should match the DB columns
- `data` field type: `{ nodes: MindmapNode[]; edges: MindmapEdge[] }` using React Flow node/edge types
- Run `supabase gen types typescript` to generate `src/lib/supabase/types.ts`
