import { createClient } from '@/lib/supabase/server';
import { MindmapRepository } from '@/lib/mindmap/repository';
import { redirect } from 'next/navigation';
import MindmapGrid from '@/components/dashboard/MindmapGrid';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const mindmaps = await MindmapRepository.findByUserId(user.id);

  return (
    <div className="min-h-screen bg-black">
      <MindmapGrid initialMindmaps={mindmaps} currentUserId={user.id} />
    </div>
  );
}
