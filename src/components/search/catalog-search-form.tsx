import { Search } from "lucide-react";

interface CatalogSearchFormProps {
  defaultValue?: string;
}

export function CatalogSearchForm({ defaultValue = "" }: CatalogSearchFormProps) {
  return (
    <form
      action="/search"
      method="get"
      role="search"
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
        />

        <label htmlFor="artist-search" className="sr-only">
          Search for an artist or album
        </label>

        <input
          id="artist-search"
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search for an artist or album..."
          autoComplete="off"
          required
          minLength={1}
          maxLength={100}
          className="h-12 w-full rounded-lg border border-input bg-background pr-4 pl-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Search aria-hidden="true" className="size-4" />
        Search
      </button>
    </form>
  );
}
