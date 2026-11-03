import { artistService } from "../src/server/services/artist.service";

async function main() {
  const query = "Radiohead";

  console.log(`Searching artists: ${query}`);

  const searchResult = await artistService.searchArtists(query, {
    limit: 5,
  });

  console.log(`\nFound ${searchResult.count} artists`);

  for (const result of searchResult.results) {
    console.log({
      name: result.artist.name,
      musicBrainzId: result.artist.musicBrainzId,
      score: result.score,
    });
  }

  const radiohead = searchResult.results.find(
    (result) => result.artist.name.toLowerCase() === "radiohead",
  );

  if (!radiohead) {
    throw new Error("Radiohead was not found in MusicBrainz results");
  }

  console.log("\nFetching artist by MusicBrainz ID...");

  const firstArtist = await artistService.getArtist(
    radiohead.artist.musicBrainzId,
  );

  if (!firstArtist) {
    throw new Error("Artist was not found");
  }

  console.log("Artist retrieved:", {
    id: firstArtist.id,
    name: firstArtist.name,
    musicBrainzId: firstArtist.musicBrainzId,
  });

  console.log("\nFetching the same artist again...");

  const secondArtist = await artistService.getArtist(
    radiohead.artist.musicBrainzId,
  );

  if (!secondArtist) {
    throw new Error("Artist was not found on the second request");
  }

  if (firstArtist.id !== secondArtist.id) {
    throw new Error("Artist IDs do not match");
  }

  console.log("\nSuccess! Artist was reused:", {
    id: secondArtist.id,
    name: secondArtist.name,
  });
}

main().catch((error: unknown) => {
  console.error("\nMusicBrainz integration test failed:", error);
  process.exitCode = 1;
});
