interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`bg-stone-200 rounded-[4px] animate-pulse ${className}`} />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const widths = ["w-full", "w-4/5", "w-3/5", "w-2/3", "w-full", "w-11/12"];
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border-[1.5px] border-stone-200 rounded-[6px] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-[6px]" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <SkeletonText lines={2} />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-stone-100">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
      <Skeleton className="h-3.5 w-16" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-stone-200 rounded-[6px] p-4 flex flex-col gap-3"
          >
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-[6px] p-5 flex flex-col gap-3">
          <Skeleton className="h-4 w-1/3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
        <div className="bg-white border border-stone-200 rounded-[6px] p-5 flex flex-col gap-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <SkeletonText lines={3} />
        </div>
      </div>
    </div>
  );
}
