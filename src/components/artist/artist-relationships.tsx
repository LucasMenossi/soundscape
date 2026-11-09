import Link from "next/link";
import { ArrowUpRight, UsersRound } from "lucide-react";

import type { ArtistRelationship } from "@/server/domain/artist";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type RelationshipType = ArtistRelationship["relationshipType"];

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  "band member": "Band members",
  "member of band": "Member of",
  collaboration: "Collaborations",
  "supporting artist": "Supporting artists",
  "supported artist": "Artists supported",
  subgroup: "Subgroups",
  "renamed from": "Former names",
  "band relationship": "Band relationships",
  "supporting relationship": "Supporting relationships",
};

const RELATIONSHIP_ORDER: RelationshipType[] = [
  "band member",
  "member of band",
  "collaboration",
  "supporting artist",
  "supported artist",
  "subgroup",
  "renamed from",
  "band relationship",
  "supporting relationship",
];

export interface ArtistRelationshipGroup {
  type: RelationshipType;
  label: string;
  artists: ArtistRelationship["artist"][];
}

export function groupArtistRelationships(
  relationships: ArtistRelationship[],
): ArtistRelationshipGroup[] {
  const byType = new Map<RelationshipType, ArtistRelationship["artist"][]>();

  for (const relationship of relationships) {
    const artists = byType.get(relationship.relationshipType) ?? [];
    if (!artists.some((artist) => artist.id === relationship.artist.id)) {
      artists.push(relationship.artist);
    }
    byType.set(relationship.relationshipType, artists);
  }

  return RELATIONSHIP_ORDER.flatMap((type) => {
    const artists = byType.get(type);
    if (!artists?.length) return [];

    return [
      {
        type,
        label: RELATIONSHIP_LABELS[type],
        artists: [...artists].sort((a, b) => a.name.localeCompare(b.name)),
      },
    ];
  });
}

export function ArtistRelationships({
  relationships,
}: {
  relationships: ArtistRelationship[];
}) {
  const groups = groupArtistRelationships(relationships);

  if (groups.length === 0) return null;

  return (
    <section className="mt-14" aria-labelledby="artist-relationships-heading">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">
          The connections
        </p>
        <h2
          id="artist-relationships-heading"
          className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight"
        >
          <UsersRound className="size-7 text-primary" />
          Connected artists
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Artist relationships recorded in MusicBrainz. These catalog
          connections are not algorithmic recommendations.
        </p>
      </div>

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.type}>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-semibold">{group.label}</h3>
              <Badge variant="secondary">{group.artists.length}</Badge>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.artists.map((relatedArtist) => (
                <li key={relatedArtist.id}>
                  <Link
                    href={`/artists/${relatedArtist.id}`}
                    className="group block h-full"
                  >
                    <Card className="flex h-full items-center justify-between gap-3 p-4 transition-colors group-hover:border-primary/40 group-hover:bg-muted/40">
                      <div className="min-w-0">
                        <p className="truncate font-medium transition-colors group-hover:text-primary">
                          {relatedArtist.name}
                        </p>
                        {relatedArtist.disambiguation && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {relatedArtist.disambiguation}
                          </p>
                        )}
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
