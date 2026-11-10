# 02 — MVP Scope and Acceptance Criteria

## 1. MVP modules

### 1.1 Public discovery

- Home/discovery landing page with entry points to search and browse.
- Search for artists and albums.
- Search results distinguish entity type and link to canonical detail routes.
- Browse genres and open genre pages where catalog data is available.

### 1.2 Artist exploration

- Artist detail page with name, available image, genres, disambiguation/context where available, and discography.
- Album list is paginated or progressively loaded when necessary.
- Artist relationships are shown only when supported by catalog data and normalized relationship types.
- Missing optional metadata is handled gracefully.

### 1.3 Album exploration

- Album/release-group detail page with title, artist, release date where available, genres/tags where available, and artwork state.
- Album page identifies the canonical MusicBrainz release-group MBID.
- Artwork may be shown only when it has passed the image policy in `06-artwork-and-image-policy.md`.

### 1.4 Authentication and personal library

- Sign up, sign in, and sign out.
- User can favorite/unfavorite artists and albums.
- User can view a personal library of saved entities.
- User can create, rename, and delete collections.
- User can add/remove artists and albums from collections.
- Ownership checks prevent users from modifying another user's data.

### 1.5 Resilience and operational behavior

- Provider calls are rate-limited and cached.
- Transient provider errors are retried with bounded backoff.
- Cached catalog pages can be served when appropriate, with clear freshness behavior.
- Empty, partial, and unavailable states are designed and tested.

## 2. User stories and acceptance criteria

### Search

**As a visitor, I want to search artists and albums so that I can find music to explore.**

Acceptance:
- Search supports artist and album entities.
- Results display the entity type and canonical display name.
- Selecting a result opens a stable internal URL.
- Empty results and provider failures have distinct UI states.
- Search input is keyboard accessible and has a clear loading state.

### Artist page

**As a visitor, I want to explore an artist so that I can understand their catalog and connections.**

Acceptance:
- Artist page resolves through a stable internal ID backed by MusicBrainz MBID.
- Available genres/tags and discography are displayed.
- Relationships are omitted when unavailable; the page remains functional.
- An image is displayed only if it is approved by the media policy; otherwise original fallback art is used.

### Album page

**As a visitor, I want to inspect an album so that I can learn its release context.**

Acceptance:
- Album page resolves through a stable internal ID backed by release-group MBID.
- Title, primary artist, and available date/metadata are displayed.
- Artwork state is explicit in the resolver; unknown-rights images never reach the public UI.

### Favorites and library

**As a signed-in user, I want to save artists and albums so that I can return to them.**

Acceptance:
- Authenticated user can add and remove favorites.
- Duplicate favorite records are prevented.
- User can view saved items.
- Unauthenticated users are prompted to sign in when attempting a personal action.

### Collections

**As a signed-in user, I want to organize discoveries into collections.**

Acceptance:
- User can create, rename, and delete a collection.
- User can add/remove artist and album entries.
- Collection item order is stable and can be changed if ordering UI is included in the implementation slice.
- Access is scoped to the owning user.

## 3. MVP release gates

- No critical accessibility or security issues in the primary journeys.
- Search, artist, album, favorites, and collection flows pass end-to-end tests.
- Provider rate limits and retry behavior have automated tests.
- Third-party artist artwork is enabled only through the automatic rights/relevance allowlist; all unsupported cases use original artwork.
- Cover Art Archive and TheAudioDB album artwork remain disabled unless a compatible reuse basis is established.
- Privacy policy and terms appropriate to the final authentication and data-handling implementation are prepared before public launch.
