import MindmapGrid from '@/components/dashboard/MindmapGrid';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MindmapGrid
        initialMindmaps={[]}
        count={0}
        isPro={false}
        isLoading
      />
    </div>
  );
}
