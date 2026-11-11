import { MainContent } from "@/components/main-content";
import { Skeleton } from "@/components/ui/skeleton";

type PageLoadingVariant =
  | "catalog"
  | "detail"
  | "library"
  | "collection"
  | "auth";

const loadingCopy: Record<PageLoadingVariant, string> = {
  catalog: "Loading the music catalog…",
  detail: "Loading music details…",
  library: "Loading your library…",
  collection: "Loading your collection…",
  auth: "Loading account page…",
};

function SkeletonBlock({ className }: { className: string }) {
  return <Skeleton aria-hidden="true" className={className} />;
}

function CatalogSkeleton() {
  return (
    <>
      <div className="max-w-3xl space-y-4">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-12 w-3/4 max-w-xl" />
        <SkeletonBlock className="h-4 w-full max-w-2xl" />
      </div>
      <SkeletonBlock className="mt-9 h-12 w-full max-w-2xl" />
      <div className="mt-12 grid gap-3 md:grid-cols-2">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl border border-border/70 p-5"
          >
            <SkeletonBlock className="size-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <>
      <SkeletonBlock className="h-4 w-36" />
      <div className="mt-9 grid gap-8 md:grid-cols-[minmax(240px,340px)_1fr] md:items-center">
        <SkeletonBlock className="mx-auto aspect-square w-full max-w-[340px] rounded-3xl" />
        <div className="space-y-5 py-4">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-12 w-4/5" />
          <SkeletonBlock className="h-4 w-2/5" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-32" />
            <SkeletonBlock className="h-9 w-36" />
          </div>
          <SkeletonBlock className="h-20 w-full max-w-xl" />
        </div>
      </div>
      <div className="mt-14 space-y-5">
        <SkeletonBlock className="h-7 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonBlock key={index} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      </div>
    </>
  );
}

function LibrarySkeleton({ collection = false }: { collection?: boolean }) {
  return (
    <>
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-11 w-64 max-w-full" />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>
      {collection && <SkeletonBlock className="mt-8 h-36 w-full rounded-3xl" />}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-border/70 p-4">
            <SkeletonBlock className="aspect-[4/3] w-full rounded-xl" />
            <SkeletonBlock className="mt-4 h-4 w-3/4" />
            <SkeletonBlock className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </>
  );
}

function AuthSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border/80 bg-card/70 p-6 sm:p-8">
      <SkeletonBlock className="h-9 w-2/3" />
      <SkeletonBlock className="mt-3 h-4 w-full" />
      <div className="mt-8 space-y-5">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        ))}
        <SkeletonBlock className="h-10 w-full" />
      </div>
    </div>
  );
}

export function PageLoading({
  variant = "catalog",
}: {
  variant?: PageLoadingVariant;
}) {
  return (
    <MainContent
      aria-busy="true"
      aria-label={loadingCopy[variant]}
      className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16"
    >
      <p role="status" className="sr-only">
        {loadingCopy[variant]}
      </p>
      {variant === "catalog" && <CatalogSkeleton />}
      {variant === "detail" && <DetailSkeleton />}
      {(variant === "library" || variant === "collection") && (
        <LibrarySkeleton collection={variant === "collection"} />
      )}
      {variant === "auth" && <AuthSkeleton />}
    </MainContent>
  );
}
