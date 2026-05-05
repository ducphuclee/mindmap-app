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
