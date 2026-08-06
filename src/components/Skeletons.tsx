export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="skeleton-box mb-3" style={{ aspectRatio: '16/9' }} />
      <div className="skeleton-box mb-2 h-4 w-2/5" />
      <div className="skeleton-box mb-3 h-6 w-4/5" />
      <div className="skeleton-box h-10 w-full" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
