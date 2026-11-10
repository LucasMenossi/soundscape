import "server-only";

import { CoverArtArchiveProvider } from "@/server/providers/cover-art-archive/cover-art-archive.provider";
import { TheAudioDbProvider } from "@/server/providers/theaudiodb/theaudiodb.provider";
import { PrismaArtworkRepository } from "./prisma-artwork.repository";
import { ArtworkService } from "./artwork.service";

export const artworkService = new ArtworkService(
  new PrismaArtworkRepository(),
  new TheAudioDbProvider(),
  new CoverArtArchiveProvider(),
);
