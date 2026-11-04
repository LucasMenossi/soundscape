import "server-only";

import { PrismaAlbumRepository } from "@/server/repositories/prisma-album.repository";
import { MusicBrainzAlbumProvider } from "@/server/providers/musicbrainz/album.provider";
import { AlbumService } from "./album.service";

export const albumService = new AlbumService(
  new PrismaAlbumRepository(),
  new MusicBrainzAlbumProvider(),
);
