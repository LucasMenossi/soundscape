import Link from "next/link";
import { ArrowLeft, Disc3 } from "lucide-react";
import { MainContent } from "@/components/main-content";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <MainContent className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
        <Disc3 aria-hidden="true" className="size-7" />
      </span>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[.2em] text-primary">
        404 · Lost in the catalog
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        We couldn`&apos;`t find that page.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
        This artist, album, genre, or page may have moved or may no longer be
        available.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/search" className={buttonVariants()}>
          <Disc3 aria-hidden="true" className="size-4" /> Explore the catalog
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          <ArrowLeft aria-hidden="true" className="size-4" /> Home
        </Link>
      </div>
    </MainContent>
  );
}
