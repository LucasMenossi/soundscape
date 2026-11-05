import Link from "next/link";
import { ArrowUpRight, FolderHeart, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateCollectionForm } from "@/components/collections/create-collection-form";
import { collectionService } from "@/server/services/collection-service.instance";
import { requireCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Collections",
  description:
    "Curate artists and albums into personal collections on SoundScape.",
};

export default async function CollectionsPage() {
  const { id: userId } = await requireCurrentUser();
  const collections = await collectionService.listCollections(userId);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-primary/10 blur-[90px]" />
        <div className="relative">
          <Badge
            variant="outline"
            className="border-primary/25 bg-primary/5 text-primary"
          >
            <FolderHeart className="mr-1.5 size-3" /> Personal curation
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">
            Your collections
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Bring artists and albums together around the sounds, eras, and ideas
            you want to keep close.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Badge variant="secondary">
              {collections.length}{" "}
              {collections.length === 1 ? "collection" : "collections"}
            </Badge>
            <Badge variant="secondary">
              {collections.reduce(
                (total, collection) => total + collection.items.length,
                0,
              )}{" "}
              saved items
            </Badge>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Plus className="size-4 text-primary" />
          <h2 className="text-xl font-semibold">Create a collection</h2>
        </div>
        <CreateCollectionForm />
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
              Your workspace
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              All collections
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {collections.length} total
          </span>
        </div>
        {collections.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.id}`}
                  className="group block h-full"
                >
                  <Card className="h-full bg-card/60 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FolderHeart className="size-5" />
                        </span>
                        <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                      </div>
                      <CardTitle className="mt-2 text-lg">
                        {collection.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 min-h-10">
                        {collection.description ||
                          "A personal collection of music to revisit."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {collection.items.length}{" "}
                        {collection.items.length === 1 ? "item" : "items"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Open collection
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Card className="border-dashed bg-card/30 py-12 text-center shadow-none">
            <CardContent>
              <FolderHeart className="mx-auto size-8 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No collections yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first collection to start curating artists and
                albums.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
