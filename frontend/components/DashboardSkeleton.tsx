export default function DashboardSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="space-y-3">
        <div className="h-6 w-28 animate-pulse rounded-lg bg-zoom-border/50" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="zoom-card animate-pulse p-4">
            <div className="h-5 w-3/4 rounded bg-zoom-border/50" />
            <div className="mt-3 h-4 w-1/2 rounded bg-zoom-border/30" />
            <div className="mt-4 h-9 w-24 rounded-lg bg-zoom-border/50" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-6 w-24 animate-pulse rounded-lg bg-zoom-border/50" />
        <div className="zoom-card animate-pulse overflow-hidden">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex justify-between border-b border-zoom-border px-4 py-3 last:border-0"
            >
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-zoom-border/50" />
                <div className="h-3 w-24 rounded bg-zoom-border/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
