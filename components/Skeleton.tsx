"use client";
export default function Skeleton({ className = "", lines = 1 }: { className?: string; lines?: number }) {
  if (lines === 1) {
    return <div className={`shimmer bg-white/5 rounded-lg animate-pulse ${className}`} />;
  }
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`shimmer bg-white/5 rounded-lg h-3 ${i === lines - 1 ? "w-3/4" : "w-full"}`} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="shimmer w-10 h-10 rounded-lg bg-white/5" />
      <div className="shimmer w-20 h-6 rounded bg-white/5" />
      <div className="shimmer w-32 h-3 rounded bg-white/5" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="shimmer flex-1 h-10 rounded-lg bg-white/5" />
          ))}
        </div>
      ))}
    </div>
  );
}
