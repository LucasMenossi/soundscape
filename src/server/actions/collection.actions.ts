"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { collectionService } from "@/server/services/collection-service.instance";
import { CollectionItemAlreadyExistsError } from "@/server/services/collection.service";
import { requireCurrentUser } from "@/lib/auth/current-user";

const idSchema = z.string().trim().min(1).max(128);
const nameSchema = z
  .string()
  .trim()
  .min(1, "Collection name is required")
  .max(80);
const descriptionSchema = z.string().trim().max(500).optional();

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createCollectionAction(
  formData: FormData,
): Promise<void> {
  const name = nameSchema.parse(readText(formData, "name"));
  const description = descriptionSchema.parse(
    readText(formData, "description"),
  );
  const { id: userId } = await requireCurrentUser();
  const collection = await collectionService.createCollection({
    userId,
    name,
    description,
  });
  revalidatePath("/collections");
  redirect(`/collections/${collection.id}`);
}

export async function updateCollectionAction(
  formData: FormData,
): Promise<void> {
  const collectionId = idSchema.parse(readText(formData, "collectionId"));
  const name = nameSchema.parse(readText(formData, "name"));
  const description = descriptionSchema.parse(
    readText(formData, "description"),
  );
  const { id: userId } = await requireCurrentUser();
  const collection = await collectionService.updateCollection({
    userId,
    collectionId,
    name,
    description,
  });
  if (!collection) redirect("/collections");
  revalidatePath("/collections");
  revalidatePath(`/collections/${collectionId}`);
  redirect(`/collections/${collectionId}`);
}

export async function deleteCollectionAction(
  formData: FormData,
): Promise<void> {
  const collectionId = idSchema.parse(readText(formData, "collectionId"));
  const { id: userId } = await requireCurrentUser();
  await collectionService.deleteCollection({ userId, collectionId });
  revalidatePath("/collections");
  redirect("/collections");
}

export interface AddCollectionItemActionState {
  status: "idle" | "success" | "error" | "info";
  message: string;
}

export async function addCollectionItemAction(
  _previousState: AddCollectionItemActionState,
  formData: FormData,
): Promise<AddCollectionItemActionState> {
  try {
    const collectionId = idSchema.parse(readText(formData, "collectionId"));
    const entityId = idSchema.parse(readText(formData, "entityId"));
    const entityType = z
      .enum(["ARTIST", "ALBUM"])
      .parse(readText(formData, "entityType"));
    const returnTo = z
      .string()
      .regex(/^\/(artists|albums)\/[a-zA-Z0-9_-]+$/)
      .parse(readText(formData, "returnTo"));
    const { id: userId } = await requireCurrentUser();
    await collectionService.addItem({
      userId,
      collectionId,
      entityType,
      entityId,
    });
    revalidatePath("/collections");
    revalidatePath(`/collections/${collectionId}`);
    revalidatePath(returnTo);
    return { status: "success", message: "Added to your collection." };
  } catch (error) {
    if (error instanceof CollectionItemAlreadyExistsError) {
      return {
        status: "info",
        message: "This item is already in that collection.",
      };
    }

    console.error("[SoundScape] Failed to add item to collection", error);
    return {
      status: "error",
      message: "Could not add this item. Please try again.",
    };
  }
}

export async function removeCollectionItemAction(
  formData: FormData,
): Promise<void> {
  const collectionId = idSchema.parse(readText(formData, "collectionId"));
  const entityId = idSchema.parse(readText(formData, "entityId"));
  const entityType = z
    .enum(["ARTIST", "ALBUM"])
    .parse(readText(formData, "entityType"));
  const { id: userId } = await requireCurrentUser();
  await collectionService.removeItem({
    userId,
    collectionId,
    entityType,
    entityId,
  });
  revalidatePath("/collections");
  revalidatePath(`/collections/${collectionId}`);
  redirect(`/collections/${collectionId}`);
}
