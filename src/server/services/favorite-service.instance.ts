import "server-only";

import { PrismaFavoriteRepository } from "@/server/repositories/prisma-favorite.repository";

import { FavoriteService } from "./favorite.service";

export const favoriteService = new FavoriteService(new PrismaFavoriteRepository());
