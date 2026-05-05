import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { expandNode } from '@/lib/ai/mindmap-ai';
import type { MindmapData } from '@/types/mindmap';
import type { MindmapDiff } from '@/types/ai';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { nodeId, nodeLabel, context } = body as {
    nodeId: string;
    nodeLabel: string;
    context: MindmapData;
  };

  if (!nodeId || !nodeLabel || !context) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const diff: MindmapDiff = await expandNode(nodeId, nodeLabel, context);
    return NextResponse.json({ diff });
  } catch (err) {
    console.error('AI expand failed:', err);
    return NextResponse.json(
      { error: 'AI expand failed', details: String(err) },
      { status: 500 },
    );
  }
}
