import Link from "next/link";
import { ArrowLeft, Disc3, FolderHeart, Mic2, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteCollectionAction,
  removeCollectionItemAction,
  updateCollectionAction,
} from "@/server/actions/collection.actions";
import { collectionService } from "@/server/services/collection-service.instance";
import { getLibraryUserId } from "@/server/services/library-user";

interface CollectionPageProps {
  params: Promise<{ collectionId: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collectionId } = await params;
  const userId = await getLibraryUserId();
  const collection = await collectionService.getCollection({
    userId,
    collectionId,
  });
  if (!collection) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" /> All collections
      </Link>
      <section className="relative mt-8 overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-primary/10 blur-[90px]" />
        <div className="relative">
          <Badge
            variant="outline"
            className="border-primary/25 bg-primary/5 text-primary"
          >
            <FolderHeart className="mr-1.5 size-3" /> Collection
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">
            {collection.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {collection.description ||
              "A personal collection of music to revisit."}
          </p>
          <div className="mt-6">
            <Badge variant="secondary">
              {collection.items.length}{" "}
              {collection.items.length === 1 ? "item" : "items"}
            </Badge>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
                Curated selection
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Items</h2>
            </div>
          </div>
          {collection.items.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {collection.items.map((item) => {
                const isArtist = item.entityType === "ARTIST";
                const EntityIcon = isArtist ? Mic2 : Disc3;
                return (
                  <li key={item.id}>
                    <Card className="h-full bg-card/60">
                      <CardContent className="flex items-center gap-3 p-4">
                        <Link
                          href={item.entity.href}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <EntityIcon className="size-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {item.entity.name}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {isArtist ? "Artist" : "Album"}
                              {item.entity.subtitle
                                ? ` · ${item.entity.subtitle}`
                                : ""}
                            </span>
                          </span>
                        </Link>
                        <form action={removeCollectionItemAction}>
                          <input
                            type="hidden"
                            name="collectionId"
                            value={collection.id}
                          />
                          <input
                            type="hidden"
                            name="entityId"
                            value={item.entity.id}
                          />
                          <input
                            type="hidden"
                            name="entityType"
                            value={item.entityType}
                          />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${item.entity.name}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Card className="border-dashed bg-card/30 py-12 text-center shadow-none">
              <CardContent>
                <FolderHeart className="mx-auto size-8 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">This collection is empty</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Explore artists and albums, then add them to this collection.
                </p>
                <Link
                  href="/search"
                  className="mt-5 inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
                >
                  Explore catalog
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-5">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold">Edit collection</h2>
              <form action={updateCollectionAction} className="mt-4 grid gap-3">
                <input
                  type="hidden"
                  name="collectionId"
                  value={collection.id}
                />
                <label className="grid gap-2 text-sm font-medium">
                  Name
                  <Input
                    name="name"
                    defaultValue={collection.name}
                    maxLength={80}
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Description
                  <Input
                    name="description"
                    defaultValue={collection.description ?? ""}
                    maxLength={500}
                  />
                </label>
                <Button type="submit" variant="outline">
                  Save changes
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardContent className="p-5">
              <h2 className="font-semibold">Delete collection</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This removes the collection and its item list. Your library
                favorites are not affected.
              </p>
              <form action={deleteCollectionAction} className="mt-4">
                <input
                  type="hidden"
                  name="collectionId"
                  value={collection.id}
                />
                <Button type="submit" variant="destructive" className="w-full">
                  <Trash2 className="size-4" /> Delete collection
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
