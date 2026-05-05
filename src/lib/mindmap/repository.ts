import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Mindmap, MindmapData } from '@/types/mindmap';
import type { Database } from '@/lib/supabase/types';

type DbMindmap = Database['public']['Tables']['mindmaps']['Row'];

function toMindmap(row: DbMindmap): Mindmap {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    data: row.data as unknown as MindmapData,
    is_public: row.is_public,
    slug: row.slug,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const DEFAULT_DATA: MindmapData = {
  nodes: [],
  edges: [],
  layoutType: 'radial',
};

export const MindmapRepository = {
  async findBySlug(slug: string): Promise<Mindmap | null> {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { data, error } = await supabase
        .from('mindmaps')
        .select('*')
        .eq('slug', slug)
        .eq('is_public', true)
        .single();

      if (error) return null; // PGRST116 (not found), network error, or any other error → graceful fallback
      return toMindmap(data);
    } catch {
      return null; // catch fetch failed / network-level errors
    }
  },

  async setPublic(id: string, isPublic: boolean, slug: string | null): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('mindmaps')
      .update({ is_public: isPublic, slug, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to update mindmap visibility: ${error.message}`);
  },

  async findByUserId(userId: string): Promise<Mindmap[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('mindmaps')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch mindmaps: ${error.message}`);
    return (data ?? []).map(toMindmap);
  },

  async create(userId: string): Promise<Mindmap> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('mindmaps')
      .insert({
        user_id: userId,
        title: 'Untitled Mindmap',
        data: DEFAULT_DATA as unknown as Database['public']['Tables']['mindmaps']['Insert']['data'],
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create mindmap: ${error.message}`);
    return toMindmap(data);
  },

  async rename(id: string, title: string): Promise<Mindmap> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('mindmaps')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to rename mindmap: ${error.message}`);
    return toMindmap(data);
  },

  async duplicate(id: string): Promise<Mindmap> {
    const supabase = await createServerClient();

    // Fetch original
    const { data: original, error: fetchError } = await supabase
      .from('mindmaps')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError)
      throw new Error(`Failed to fetch original mindmap: ${fetchError.message}`);

    // Create copy
    const { data, error } = await supabase
      .from('mindmaps')
      .insert({
        user_id: original.user_id,
        title: `${original.title} (Copy)`,
        data: original.data,
        is_public: original.is_public,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to duplicate mindmap: ${error.message}`);
    return toMindmap(data);
  },

  async deleteById(id: string): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase.from('mindmaps').delete().eq('id', id);

    if (error) throw new Error(`Failed to delete mindmap: ${error.message}`);
  },

  async countByUserId(userId: string): Promise<number> {
    const supabase = await createServerClient();
    const { count, error } = await supabase
      .from('mindmaps')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to count mindmaps: ${error.message}`);
    return count ?? 0;
  },

  async findById(id: string): Promise<Mindmap | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('mindmaps')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch mindmap: ${error.message}`);
    }
    return toMindmap(data);
  },

  async updateData(id: string, data: MindmapData): Promise<void> {
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('mindmaps')
      .update({ data: data as unknown as Database['public']['Tables']['mindmaps']['Update']['data'], updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to update mindmap data: ${error.message}`);
  },
};
