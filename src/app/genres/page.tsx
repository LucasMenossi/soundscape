import { Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GenreCatalog } from "@/components/genres/genre-catalog";
import { genreService } from "@/server/services/genre-service.instance";

export const metadata = {
  title: "Genres",
  description:
    "Explore SoundScape’s curated music genres and the artists and albums connected to them.",
};

export default async function GenresPage() {
  const genres = await genreService.listGenres();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-3xl">
        <Badge
          variant="outline"
          className="border-primary/25 bg-primary/5 text-primary"
        >
          <Tags className="mr-1.5 size-3" /> Catalog exploration
        </Badge>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-.05em] sm:text-6xl">
          Follow a sound.
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          Browse a curated selection of musical genres. Only recognized genre
          names are included. Artist and album counts reflect only records
          currently available in the SoundScape catalog.
        </p>
      </div>

      {genres.length > 0 ? (
        <GenreCatalog genres={genres} />
      ) : (
        <Card className="mt-12 border-dashed p-10 text-center">
          <Tags className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">Genre catalog is not available</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The genre vocabulary could not be loaded. Please try again later.
          </p>
        </Card>
      )}
    </main>
  );
}
