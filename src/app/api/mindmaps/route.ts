import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MindmapRepository } from '@/lib/mindmap/repository';

// Note: is_pro BOOLEAN DEFAULT false column should be added to profiles table
// when billing integration is implemented. For now, isPro is always false.
const FREE_TIER_LIMIT = 3;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // isPro is hardcoded false — no billing integration yet
  const isPro = false;

  if (!isPro) {
    const count = await MindmapRepository.countByUserId(user.id);
    if (count >= FREE_TIER_LIMIT) {
      return NextResponse.json(
        { error: 'Free tier limit reached' },
        { status: 403 }
      );
    }
  }

  const mindmap = await MindmapRepository.create(user.id);
  return NextResponse.json({ id: mindmap.id }, { status: 201 });
}
