export default function DashboardSkeleton() {
  return (
    <div className="mt-12 grid gap-8 md:grid-cols-2">
      <div className="space-y-3">
        <div className="h-6 w-28 animate-pulse rounded bg-[#E8E8ED] dark:bg-[#3D3D3D]" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-[#E8E8ED] bg-white p-4 dark:border-[#3D3D3D] dark:bg-[#2C2C2C]"
          >
            <div className="h-5 w-3/4 rounded bg-[#E8E8ED] dark:bg-[#3D3D3D]" />
            <div className="mt-3 h-4 w-1/2 rounded bg-[#F7F7F7] dark:bg-[#3D3D3D]" />
            <div className="mt-2 h-4 w-1/3 rounded bg-[#F7F7F7] dark:bg-[#3D3D3D]" />
            <div className="mt-4 h-8 w-24 rounded bg-[#E8E8ED] dark:bg-[#3D3D3D]" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-6 w-24 animate-pulse rounded bg-[#E8E8ED] dark:bg-[#3D3D3D]" />
        <div className="animate-pulse rounded-lg border border-[#E8E8ED] bg-white p-4 dark:border-[#3D3D3D] dark:bg-[#2C2C2C]">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex justify-between border-b border-[#F7F7F7] py-3 last:border-0 dark:border-[#3D3D3D]"
            >
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-[#E8E8ED] dark:bg-[#3D3D3D]" />
                <div className="h-3 w-24 rounded bg-[#F7F7F7] dark:bg-[#3D3D3D]" />
              </div>
              <div className="h-4 w-12 rounded bg-[#F7F7F7] dark:bg-[#3D3D3D]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
