import "server-only";

import { PrismaArtistRepository } from "@/server/repositories/prisma-artist.repository";
import { MusicBrainzArtistProvider } from "@/server/providers/musicbrainz/artist.provider";

import { ArtistService } from "./artist.service";

export const artistService = new ArtistService(
  new PrismaArtistRepository(),
  new MusicBrainzArtistProvider(),
);
