import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MindmapRepository } from '@/lib/mindmap/repository';
import MindmapEditor from '@/components/editor/MindmapEditor';

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const mindmap = await MindmapRepository.findById(id);

  if (!mindmap) {
    notFound();
  }

  // Ownership check — users can only edit their own mindmaps (unless public)
  if (mindmap.user_id !== user.id && !mindmap.is_public) {
    notFound();
  }

  return <MindmapEditor mindmap={mindmap} />;
}
