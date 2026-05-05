'use server';

import { createClient } from '@/lib/supabase/server';
import { MindmapRepository } from './repository';
import type { MindmapData } from '@/types/mindmap';

export async function createMindmap(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  const mindmap = await MindmapRepository.create(user.id);
  return mindmap.id;
}

export async function renameMindmap(
  id: string,
  title: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  await MindmapRepository.rename(id, title);
}

export async function duplicateMindmap(id: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  const mindmap = await MindmapRepository.duplicate(id);
  return mindmap.id;
}

export async function deleteMindmap(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  await MindmapRepository.deleteById(id);
}

export async function saveMindmapData(
  id: string,
  data: MindmapData,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  await MindmapRepository.updateData(id, data);
}
