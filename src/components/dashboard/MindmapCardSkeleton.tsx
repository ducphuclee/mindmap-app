export default function MindmapCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="h-36 animate-pulse bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
