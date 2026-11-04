import { MusicBrainzAlbumProvider } from "../src/server/providers/musicbrainz/album.provider";

async function main() {
  const provider = new MusicBrainzAlbumProvider();
  const query = "OK Computer";

  console.log(`Searching albums: ${query}`);

  const response = await provider.searchAlbums(query, {
    limit: 5,
  });

  console.log(`\nFound ${response.count} release groups`);

  for (const result of response.results) {
    console.log({
      title: result.album.title,
      musicBrainzReleaseGroupId: result.album.musicBrainzReleaseGroupId,
      primaryArtist: result.album.primaryArtist.name,
      artistMBID: result.album.primaryArtist.musicBrainzId,
      firstReleaseDate: result.album.firstReleaseDate,
      albumType: result.album.albumType,
      score: result.score,
    });
  }

  const okComputer = response.results.find(
    (result) =>
      result.album.title.toLowerCase() === "ok computer" &&
      result.album.primaryArtist.name.toLowerCase() === "radiohead",
  );

  if (!okComputer) {
    throw new Error("Radiohead's OK Computer was not found");
  }

  console.log("\nIntegration test successful:", {
    title: okComputer.album.title,
    artist: okComputer.album.primaryArtist.name,
    releaseGroupId: okComputer.album.musicBrainzReleaseGroupId,
  });
}

main().catch((error: unknown) => {
  console.error("\nMusicBrainz album integration test failed:", error);
  process.exitCode = 1;
});
