import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Disc3,
  LibraryBig,
  Sparkles,
  Tags,
} from "lucide-react";
import { CatalogSearchForm } from "@/components/search/catalog-search-form";
import { Badge } from "@/components/ui/badge";
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-20 pt-20 sm:px-8 sm:pt-28">
      <section className="relative mx-auto w-full max-w-4xl text-center">
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
        <Badge
          variant="outline"
          className="mb-7 border-primary/25 bg-primary/5 px-3 py-1.5 text-primary"
        >
          <Sparkles className="mr-1.5 size-3.5" /> Your personal music atlas
        </Badge>
        <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-7xl">
          Find the music <span className="text-primary">between</span> the
          tracks.
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          Explore the artists, albums and connections behind the music you love.
          A quieter, more intentional way to discover.
        </p>
        <div className="mx-auto mt-10 max-w-2xl text-left">
          <CatalogSearchForm />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Search the catalog · No streaming · Just discovery
        </p>
      </section>
      <section className="mx-auto mt-24 grid w-full max-w-4xl gap-4 sm:grid-cols-2">
        <Link
          href="/search"
          className="group rounded-2xl border border-border/80 bg-card/70 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card"
        >
          <div className="mb-8 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Disc3 className="size-5" />
          </div>
          <h2 className="text-lg font-semibold">Explore the catalog</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Search artists and albums, then follow the connections between them.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
            Start exploring{" "}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
        <div className="rounded-2xl border border-border/80 bg-card/40 p-6">
          <div className="mb-8 flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <LibraryBig className="size-5" />
          </div>
          <h2 className="text-lg font-semibold">Build your own library</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Keep track of the artists and records you want to remember. Personal
            collections are coming later.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowDown className="size-4" /> Coming in a future release
          </span>
        </div>
        <Link
          href="/genres"
          className="group mt-4 rounded-2xl border border-border/80 bg-card/40 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 sm:col-span-2"
        >
          <div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Tags className="size-5" />
          </div>
          <h2 className="text-lg font-semibold">Explore by genre</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Browse a curated selection of musical genres and find connected
            artists and albums.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
            Browse genres{" "}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>
    </main>
  );
}
