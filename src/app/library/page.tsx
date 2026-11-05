import Link from "next/link";
import { Disc3, Heart, Mic2, Music2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toggleFavoriteAction } from "@/server/actions/favorite.actions";
import { favoriteService } from "@/server/services/favorite-service.instance";
import { getLibraryUserId } from "@/server/services/library-user";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Library",
  description: "Your saved artists and albums on SoundScape.",
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed bg-card/30 py-10 text-center shadow-none">
      <CardContent className="flex flex-col items-center px-6">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Music2 className="size-5" />
        </span>
        <h3 className="mt-4 font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        <Link href="/search" className="mt-5 inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted">Explore the catalog</Link>
      </CardContent>
    </Card>
  );
}

export default async function LibraryPage() {
  const userId = await getLibraryUserId();
  const favorites = await favoriteService.getLibrary(userId);
  const artists = favorites.filter((favorite) => favorite.entityType === "ARTIST");
  const albums = favorites.filter((favorite) => favorite.entityType === "ALBUM");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-primary/10 blur-[90px]" />
        <div className="relative">
          <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
            <Heart className="mr-1.5 size-3" /> Personal space
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Your library</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Keep the artists and albums you want to revisit in one place.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Badge variant="secondary">{artists.length} {artists.length === 1 ? "artist" : "artists"}</Badge>
            <Badge variant="secondary">{albums.length} {albums.length === 1 ? "album" : "albums"}</Badge>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Your collection</p>
            <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight"><Mic2 className="size-5 text-muted-foreground" /> Artists</h2>
          </div>
          <span className="text-sm text-muted-foreground">{artists.length} saved</span>
        </div>
        {artists.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((favorite) => (
              <li key={favorite.id}>
                <Card className="h-full bg-card/60 transition-colors hover:border-primary/30">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Link href={favorite.entity.href} className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Mic2 className="size-5" /></span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{favorite.entity.name}</span>
                        {favorite.entity.subtitle && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{favorite.entity.subtitle}</span>}
                      </span>
                    </Link>
                    <form action={toggleFavoriteAction}>
                      <input type="hidden" name="entityType" value="ARTIST" />
                      <input type="hidden" name="entityId" value={favorite.entity.id} />
                      <input type="hidden" name="returnTo" value="/library" />
                      <Button type="submit" variant="ghost" size="icon" aria-label={`Remove ${favorite.entity.name} from library`}><Heart className="size-4 fill-current text-primary" /></Button>
                    </form>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : <EmptyState title="No artists saved yet" description="Save artists from their catalog pages and they will appear here." />}
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">On repeat</p>
            <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight"><Disc3 className="size-5 text-muted-foreground" /> Albums</h2>
          </div>
          <span className="text-sm text-muted-foreground">{albums.length} saved</span>
        </div>
        {albums.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((favorite) => (
              <li key={favorite.id}>
                <Card className="h-full bg-card/60 transition-colors hover:border-primary/30">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Link href={favorite.entity.href} className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Disc3 className="size-5" /></span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{favorite.entity.name}</span>
                        {favorite.entity.subtitle && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{favorite.entity.subtitle}</span>}
                      </span>
                    </Link>
                    <form action={toggleFavoriteAction}>
                      <input type="hidden" name="entityType" value="ALBUM" />
                      <input type="hidden" name="entityId" value={favorite.entity.id} />
                      <input type="hidden" name="returnTo" value="/library" />
                      <Button type="submit" variant="ghost" size="icon" aria-label={`Remove ${favorite.entity.name} from library`}><Heart className="size-4 fill-current text-primary" /></Button>
                    </form>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : <EmptyState title="No albums saved yet" description="Save albums from their detail pages and they will appear here." />}
      </section>
    </main>
  );
}
