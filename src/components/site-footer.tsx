import { AudioLines } from "lucide-react";
import { Separator } from "@/components/ui/separator";
export function SiteFooter() { return <footer className="mt-auto"><div className="mx-auto max-w-6xl px-5 pb-8 sm:px-8"><Separator className="mb-6"/><div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-2"><AudioLines className="size-3.5"/> SoundScape — Music discovery, without the noise.</span><span>Catalog data provided by MusicBrainz.</span></div></div></footer>; }
