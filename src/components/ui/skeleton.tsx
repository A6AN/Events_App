import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden bg-white/5 rounded-md",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-zinc-900/80 border border-white/5">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="h-full overflow-hidden">
      <Skeleton className="h-[55vh] w-full rounded-none" />
      <div className="p-4 space-y-4 bg-black -mt-1">
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="aspect-[3/4] rounded-2xl" />
          <Skeleton className="aspect-[3/4] rounded-2xl" />
          <Skeleton className="aspect-[3/4] rounded-2xl" />
          <Skeleton className="aspect-[3/4] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2 mb-4">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-12 w-full rounded-full mb-4" />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

function VenueCardSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-zinc-900/80 border border-white/5">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, CardSkeleton, ProfileSkeleton, FeedSkeleton, VenueCardSkeleton };
