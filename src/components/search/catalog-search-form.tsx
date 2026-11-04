import { Search, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
interface CatalogSearchFormProps { defaultValue?: string; }
export function CatalogSearchForm({ defaultValue = "" }: CatalogSearchFormProps) {
  return <form action="/search" method="get" role="search" className="flex w-full flex-col gap-3 sm:flex-row">
    <div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      <label htmlFor="catalog-search" className="sr-only">Search for an artist or album</label>
      <Input id="catalog-search" type="search" name="q" defaultValue={defaultValue} placeholder="Search artists, albums..." autoComplete="off" required minLength={1} maxLength={100} className="h-14 rounded-xl pl-12 pr-4 text-base" />
    </div>
    <Button type="submit" size="lg" className="h-14 rounded-xl px-7"><Search aria-hidden="true" className="size-4" /> Search <ArrowUpRight aria-hidden="true" className="size-4 opacity-60" /></Button>
  </form>;
}
