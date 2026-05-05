export default function MindmapCardSkeleton() {
  return (
    <div className="rounded-large border border-frost bg-transparent">
      <div className="h-36 animate-pulse bg-[rgba(255,255,255,0.06)]" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/5 animate-pulse rounded-sharp bg-[rgba(255,255,255,0.06)]" />
        <div className="h-4 w-2/5 animate-pulse rounded-sharp bg-[rgba(255,255,255,0.06)]" />
      </div>
    </div>
  );
}
