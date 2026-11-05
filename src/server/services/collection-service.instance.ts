import "server-only";

import { PrismaCollectionRepository } from "@/server/repositories/prisma-collection.repository";
import { CollectionService } from "./collection.service";

export const collectionService = new CollectionService(new PrismaCollectionRepository());
