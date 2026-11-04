"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, Tags } from "lucide-react";
import type { GenreBrowseItem } from "@/server/domain/genre";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 60;

export function GenreCatalog({ genres }: { genres: GenreBrowseItem[] }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const filteredGenres = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return genres;
    return genres.filter((genre) => genre.name.toLocaleLowerCase().includes(normalizedQuery));
  }, [genres, query]);
  const visibleGenres = filteredGenres.slice(0, visibleCount);

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search genres..."
            aria-label="Search genres"
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="w-fit">
          {filteredGenres.length.toLocaleString()} genres
        </Badge>
      </div>

      {visibleGenres.length > 0 ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleGenres.map((genre) => (
              <Link key={genre.id} href={`/genres/${genre.slug}`} className="group">
                <Card className="flex h-full items-center justify-between p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold transition-colors group-hover:text-primary">
                      {genre.name}
                    </h2>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {genre.artistCount} artists · {genre.albumCount} albums in SoundScape
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </Card>
              </Link>
            ))}
          </div>
          {visibleGenres.length < filteredGenres.length && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Show more genres
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="mt-5 border-dashed p-10 text-center">
          <Tags className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">No matching genres</h2>
          <p className="mt-2 text-sm text-muted-foreground">Try another search term.</p>
        </Card>
      )}
    </section>
  );
}
