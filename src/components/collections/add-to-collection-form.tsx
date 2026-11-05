"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, FolderPlus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { CollectionWithItems } from "@/server/domain/collection";
import {
  addCollectionItemAction,
  type AddCollectionItemActionState,
} from "@/server/actions/collection.actions";

interface AddToCollectionFormProps {
  collections: CollectionWithItems[];
  entityId: string;
  entityType: "ARTIST" | "ALBUM";
  returnTo: string;
}

const initialState: AddCollectionItemActionState = {
  status: "idle",
  message: "",
};

export function AddToCollectionForm({
  collections,
  entityId,
  entityType,
  returnTo,
}: AddToCollectionFormProps) {
  const [state, formAction, isPending] = useActionState(
    addCollectionItemAction,
    initialState,
  );

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!state.message || state.status === "idle") {
      return;
    }

    if (state.status === "success") {
      toast.success(state.message);
      return;
    }

    if (state.status === "info") {
      toast.info(state.message);
      return;
    }

    toast.error(state.message);
  }, [state]);

  if (collections.length === 0) {
    return (
      <Link
        href="/collections"
        className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border bg-background px-3.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        <FolderPlus className="size-4" />
        Create a collection
      </Link>
    );
  }

  return (
    <div className="relative inline-flex w-[168px] shrink-0 flex-col items-start">
      <Button
        type="button"
        variant="outline"
        size="lg"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
        className="h-9 w-[168px] gap-2 rounded-full px-3.5"
      >
        <FolderPlus className="size-4" />
        Add to collection
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Add to a collection"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(19rem,calc(100vw-3rem))] min-w-0 overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between px-2.5 py-2">
            <p className="text-sm font-medium">Choose a collection</p>

            <span className="text-xs text-muted-foreground">
              {collections.length}{" "}
              {collections.length === 1 ? "collection" : "collections"}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {collections.map((collection) => (
              <form key={collection.id} action={formAction}>
                <input
                  type="hidden"
                  name="collectionId"
                  value={collection.id}
                />

                <input type="hidden" name="entityId" value={entityId} />

                <input type="hidden" name="entityType" value={entityType} />

                <input type="hidden" name="returnTo" value={returnTo} />

                <button
                  type="submit"
                  disabled={isPending}
                  className="group flex min-h-12 w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <FolderPlus className="size-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {collection.name}
                    </span>

                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {collection.items.length}{" "}
                      {collection.items.length === 1 ? "item" : "items"}
                    </span>
                  </span>

                  {isPending ? (
                    <LoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
