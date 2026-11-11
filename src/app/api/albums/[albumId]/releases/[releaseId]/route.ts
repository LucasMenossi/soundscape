import { NextResponse } from "next/server";
import { albumService } from "@/server/services/album-service.instance";

interface ReleaseRouteContext {
  params: Promise<{ albumId: string; releaseId: string }>;
}

export async function GET(_request: Request, { params }: ReleaseRouteContext) {
  const { albumId, releaseId } = await params;

  try {
    const release = await albumService.getAlbumReleaseDetails(
      albumId,
      releaseId,
    );

    if (!release) {
      return NextResponse.json(
        { message: "Release edition not found for this album." },
        { status: 404 },
      );
    }

    return NextResponse.json(release, {
      headers: { "Cache-Control": "private, max-age=0, must-revalidate" },
    });
  } catch (error) {
    console.error("[SoundScape] Failed to load album release details", {
      albumId,
      releaseId,
      error,
    });

    return NextResponse.json(
      { message: "Release details are temporarily unavailable." },
      { status: 502 },
    );
  }
}
