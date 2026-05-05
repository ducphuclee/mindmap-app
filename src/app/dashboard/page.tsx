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

  const [mindmaps, count] = await Promise.all([
    MindmapRepository.findByUserId(user.id),
    MindmapRepository.countByUserId(user.id),
  ]);

  // isPro is hardcoded false — no billing integration yet
  // Note: add is_pro BOOLEAN DEFAULT false to profiles table when billing is integrated
  const isPro = false;

  return (
    <div className="min-h-screen bg-gray-50">
      <MindmapGrid initialMindmaps={mindmaps} count={count} isPro={isPro} />
    </div>
  );
}
