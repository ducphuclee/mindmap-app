import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import pdfParse from 'pdf-parse';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await pdfParse(buffer);

  return NextResponse.json({ text: result.text }, { status: 200 });
}
