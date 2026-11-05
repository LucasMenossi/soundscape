import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toggleFavoriteAction } from "@/server/actions/favorite.actions";
import type { FavoriteEntityType } from "@/server/domain/favorite";

interface FavoriteButtonProps {
  entityId: string;
  entityType: FavoriteEntityType;
  isFavorite: boolean;
  returnTo: string;
}

export function FavoriteButton({
  entityId,
  entityType,
  isFavorite,
  returnTo,
}: FavoriteButtonProps) {
  return (
    <form action={toggleFavoriteAction}>
      <input type="hidden" name="entityId" value={entityId} />
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <Button
        type="submit"
        variant={isFavorite ? "secondary" : "outline"}
        size="lg"
        className="gap-2"
        aria-label={isFavorite ? "Remove from library" : "Add to library"}
      >
        <Heart className={isFavorite ? "size-4 fill-current" : "size-4"} />
        {isFavorite ? "In your library" : "Add to library"}
      </Button>
    </form>
  );
}
