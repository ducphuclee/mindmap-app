import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateFromText } from '@/lib/ai/mindmap-ai';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.text !== 'string' || body.text.trim() === '') {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  try {
    const data = await generateFromText(body.text);
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error('AI generate failed:', err);
    return NextResponse.json(
      { error: 'AI generation failed', details: String(err) },
      { status: 500 },
    );
  }
}
