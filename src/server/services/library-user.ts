import "server-only";

import { prisma } from "@/server/db";

/**
 * Provides one local workspace until authentication is implemented.
 * Production deployments must configure an explicit library owner ID.
 */
export async function getLibraryUserId(): Promise<string> {
  const configuredId = process.env.SOUNDSCAPE_LIBRARY_USER_ID;
  const userId = configuredId ?? (process.env.NODE_ENV === "production" ? null : "local-library");

  if (!userId) {
    throw new Error("SOUNDSCAPE_LIBRARY_USER_ID must be configured before enabling the library in production");
  }

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
    select: { id: true },
  });

  return userId;
}
