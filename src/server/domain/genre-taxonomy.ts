/**
 * SoundScape's public genre vocabulary.
 *
 * MusicBrainz genres are community-maintained and can contain niche or unstable
 * labels. Only values explicitly mapped here are exposed as genres in the UI.
 * Unknown values are intentionally ignored; this is not a free-form tag system.
 */
const GENRE_ALIASES: Record<string, string[]> = {
  "Alternative rock": ["alternative rock", "alt rock"],
  "Afrobeat": ["afrobeat"],
  "Afrobeats": ["afrobeats"],
  "Ambient": ["ambient"],
  "Art pop": ["art pop"],
  "Art rock": ["art rock"],
  "Baroque pop": ["baroque pop"],
  "Black metal": ["black metal"],
  "Bluegrass": ["bluegrass"],
  "Blues": ["blues"],
  "Bossa nova": ["bossa nova", "bossanova"],
  "Breakbeat": ["breakbeat", "break beats"],
  "Britpop": ["britpop", "brit pop"],
  "Chiptune": ["chiptune", "chip tune"],
  "Classical": ["classical", "classical music"],
  "Contemporary classical": ["contemporary classical"],
  "Country": ["country", "country music"],
  "Dance": ["dance", "dance music"],
  "Dance-pop": ["dance-pop", "dance pop"],
  "Deep house": ["deep house"],
  "Dark ambient": ["dark ambient"],
  "Death metal": ["death metal"],
  "Disco": ["disco"],
  "Downtempo": ["downtempo", "down tempo"],
  "Dream pop": ["dream pop"],
  "Drum and bass": ["drum and bass", "drum & bass", "drum'n'bass", "dnb"],
  "Dub": ["dub"],
  "Dubstep": ["dubstep"],
  "Electro": ["electro"],
  "Electro house": ["electro house"],
  "Electronic": ["electronic", "electronica", "electronic music"],
  "Emo": ["emo", "emocore"],
  "Experimental": ["experimental", "experimental music"],
  "Flamenco": ["flamenco"],
  "Folk": ["folk", "folk music"],
  "Funk": ["funk"],
  "Garage rock": ["garage rock"],
  "Gospel": ["gospel"],
  "Grime": ["grime"],
  "Grunge": ["grunge"],
  "Hardcore punk": ["hardcore punk", "hardcore"],
  "Hard rock": ["hard rock"],
  "Heavy metal": ["heavy metal", "metal"],
  "Hip hop": ["hip hop", "hip-hop", "hiphop"],
  "House": ["house", "house music"],
  "Indie pop": ["indie pop"],
  "Indie rock": ["indie rock"],
  "Industrial": ["industrial", "industrial music"],
  "Industrial metal": ["industrial metal"],
  "J-pop": ["j-pop", "jpop", "j pop"],
  "Jungle": ["jungle", "jungle music"],
  "Jazz": ["jazz"],
  "K-pop": ["k-pop", "kpop", "k pop"],
  "Krautrock": ["krautrock"],
  "Latin": ["latin", "latin music"],
  "Metal": ["metal"],
  "Metalcore": ["metalcore"],
  "Minimal techno": ["minimal techno"],
  "Neo-soul": ["neo-soul", "neo soul"],
  "New age": ["new age", "new-age"],
  "New wave": ["new wave"],
  "Noise": ["noise", "noise music"],
  "Opera": ["opera"],
  "Pop": ["pop", "pop music"],
  "Pop rock": ["pop rock", "pop-rock"],
  "Pop punk": ["pop punk", "pop-punk"],
  "Post-hardcore": ["post-hardcore", "post hardcore"],
  "Post-punk": ["post-punk", "post punk"],
  "Post-rock": ["post-rock", "post rock"],
  "Power metal": ["power metal"],
  "Progressive metal": ["progressive metal", "prog metal"],
  "Progressive rock": ["progressive rock", "prog rock"],
  "Psychedelic rock": ["psychedelic rock", "psych rock"],
  "Punk": ["punk"],
  "Punk rock": ["punk rock", "punk-rock"],
  "R&B": ["r&b", "r & b", "rnb", "rhythm and blues", "rhythm & blues"],
  "Rap": ["rap"],
  "Reggae": ["reggae"],
  "Reggaeton": ["reggaeton", "reggaetón"],
  "Rock": ["rock", "rock music"],
  "Rock and roll": ["rock and roll", "rock n roll", "rock & roll"],
  "Salsa": ["salsa"],
  "Samba": ["samba"],
  "Shoegaze": ["shoegaze", "shoe-gaze"],
  "Singer-songwriter": ["singer-songwriter", "singer songwriter", "singer/songwriter"],
  "Ska": ["ska"],
  "Soul": ["soul"],
  "Surf rock": ["surf rock", "surf"],
  "Synth-pop": ["synth-pop", "synth pop", "synthpop"],
  "Tech house": ["tech house"],
  "Techno": ["techno"],
  "Trance": ["trance"],
  "Trip hop": ["trip hop", "trip-hop"],
  "Vaporwave": ["vaporwave"],
  "World music": ["world music"],
};

function normalizeGenreLabel(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const ALIAS_TO_CANONICAL = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(GENRE_ALIASES)) {
  for (const alias of [canonical, ...aliases]) {
    ALIAS_TO_CANONICAL.set(normalizeGenreLabel(alias), canonical);
  }
}

export const SOUNDSCAPE_GENRES = Object.keys(GENRE_ALIASES).sort((a, b) => a.localeCompare(b));

export function canonicalizeGenre(value: string): string | null {
  return ALIAS_TO_CANONICAL.get(normalizeGenreLabel(value)) ?? null;
}

export function canonicalizeGenres(values: string[]): string[] {
  return [...new Set(values.map(canonicalizeGenre).filter((value): value is string => value !== null))]
    .sort((a, b) => a.localeCompare(b));
}
