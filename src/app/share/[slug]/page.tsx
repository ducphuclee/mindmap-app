import { ShareService } from '@/lib/mindmap/share-service';
import ReadOnlyEditor from '@/components/share/ReadOnlyEditor';

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;
  const mindmap = await ShareService.findBySlug(slug);

  if (!mindmap) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800">Not Found</h1>
          <p className="mt-2 text-sm text-gray-500">
            This mindmap is no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <ReadOnlyEditor nodes={mindmap.data.nodes} edges={mindmap.data.edges} />
    </div>
  );
}
