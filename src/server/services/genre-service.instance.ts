import "server-only";

import { PrismaGenreRepository } from "@/server/repositories/prisma-genre.repository";
import { MusicBrainzGenreProvider } from "@/server/providers/musicbrainz/genre.provider";
import { GenreService } from "./genre.service";

export const genreService = new GenreService(
  new PrismaGenreRepository(),
  new MusicBrainzGenreProvider(),
);
