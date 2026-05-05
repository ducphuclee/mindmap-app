'use server';

import { createClient } from '@/lib/supabase/server';
import { ShareService } from '@/lib/mindmap/share-service';

export async function generateShareLinkAction(mindmapId: string): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  return ShareService.generateShareLink(mindmapId);
}

export async function revokeShareLinkAction(mindmapId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  await ShareService.revokeShareLink(mindmapId);
}
