"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Disc3, Music2 } from "lucide-react";

import type { ResolvedArtwork } from "@/server/artwork/artwork.service";
import { cn } from "@/lib/utils";

interface ArtworkFrameProps {
  artwork: ResolvedArtwork | null;
  title: string;
  subtitle?: string | null;
  seed: string;
  className?: string;
  imageSizes?: string;
  kind?: "artist" | "album";
}

function getPalette(seed: string): [number, number] {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return [hue, (hue + 72 + (Math.abs(hash >>> 8) % 90)) % 360];
}

export function ArtworkFrame({
  artwork,
  title,
  subtitle,
  seed,
  className,
  imageSizes = "(max-width: 768px) 100vw, 340px",
  kind = "artist",
}: ArtworkFrameProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [hueA, hueB] = getPalette(seed);
  const Icon = kind === "album" ? Disc3 : Music2;
  const hasDisplayableImage = artwork !== null && !imageFailed;

  return (
    <figure className={cn("min-w-0", className)}>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl shadow-black/20">
        {artwork && !imageFailed ? (
          <Image
            src={artwork.src}
            alt={artwork.alt}
            fill
            sizes={imageSizes}
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-6 text-center"
            style={{
              background: `radial-gradient(ellipse at 25% 20%, hsl(${hueA} 65% 48% / .72), transparent 55%), radial-gradient(ellipse at 80% 85%, hsl(${hueB} 58% 36% / .82), transparent 58%), linear-gradient(145deg, hsl(${hueA} 34% 19%), hsl(${hueB} 38% 10%))`,
            }}
          >
            <div className="absolute -right-10 -top-10 size-44 rounded-full border border-white/10" />
            <div className="absolute -bottom-16 -left-12 size-56 rounded-full border border-white/10" />
            <Icon
              className="relative size-14 text-white/65"
              strokeWidth={1.1}
            />
            <p className="relative mt-6 line-clamp-3 max-w-full text-xl font-semibold tracking-tight text-white">
              {title}
            </p>
            {subtitle && (
              <p className="relative mt-2 line-clamp-2 text-xs uppercase tracking-[.18em] text-white/60">
                {subtitle}
              </p>
            )}
            <span className="absolute bottom-4 text-[9px] uppercase tracking-[.24em] text-white/40">
              SoundScape original artwork
            </span>
          </div>
        )}
      </div>
      {hasDisplayableImage && artwork && (
        <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">
          Image via {artwork.sourceName}.{" "}
          <Link
            href={artwork.sourcePageUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Source
          </Link>
          {artwork.attribution && (
            <>
              {" · "}
              {artwork.attribution.creator
                ? `Photo by ${artwork.attribution.creator}. `
                : ""}
              <Link
                href={artwork.attribution.licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                {artwork.attribution.licenseShortName}
              </Link>
              {artwork.attribution.credit && (
                <span className="block">{artwork.attribution.credit}</span>
              )}
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}
