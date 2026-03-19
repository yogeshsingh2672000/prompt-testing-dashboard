function SkeletonCard({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-[2rem] border border-zinc-200/70 bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/40 ${className}`} />;
}

export default function PlatformLoading() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-10 w-full max-w-2xl animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-full max-w-3xl animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <SkeletonCard className="h-[340px]" />
                <SkeletonCard className="h-[340px]" />
            </div>

            <SkeletonCard className="h-[420px]" />
        </div>
    );
}
