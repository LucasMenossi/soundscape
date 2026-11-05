"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { favoriteService } from "@/server/services/favorite-service.instance";
import { getLibraryUserId } from "@/server/services/library-user";

const favoriteInputSchema = z.object({
  entityType: z.enum(["ARTIST", "ALBUM"]),
  entityId: z.string().trim().min(1).max(128),
  returnTo: z.string().startsWith("/").default("/library"),
});

export async function toggleFavoriteAction(formData: FormData): Promise<void> {
  const input = favoriteInputSchema.parse({
    entityType: formData.get("entityType"),
    entityId: formData.get("entityId"),
    returnTo: formData.get("returnTo") ?? "/library",
  });
  const userId = await getLibraryUserId();
  const favoriteInput = { userId, entityType: input.entityType, entityId: input.entityId };

  if (await favoriteService.hasFavorite(favoriteInput)) {
    await favoriteService.removeFavorite(favoriteInput);
  } else {
    await favoriteService.addFavorite(favoriteInput);
  }

  revalidatePath("/library");
  revalidatePath(input.returnTo);
}
