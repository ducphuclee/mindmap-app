import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MindmapRepository } from '@/lib/mindmap/repository';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mindmap = await MindmapRepository.create(user.id);
  return NextResponse.json({ id: mindmap.id }, { status: 201 });
}
