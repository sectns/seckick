# System Patterns

- Architecture: Node.js backend (Express) exposing a Kick proxy API for channel details and playback URLs; frontend SPA (Vite + React) served statically by the Node server.
- API surface: GET `/api/kick/channel/:slug` (normalized status) and GET `/api/kick/playback/:slug` (playback URL + status). CORS origin env (`ALLOWED_ORIGIN`); optional `KICK_COOKIES` header to bypass Cloudflare.
- Data sources:
  - Kick public endpoints (v1/v2 channel info + livestream/playback) called from backend with browser-like headers; backend normalizes shape for UI.
  - Firebase Auth for sign-in; Firestore for signed-in follow lists.
  - Guest storage via cookies/localStorage (client side).
- UI layout: landing (login/guest), follow list dashboard, player view with left follow rail and right-side HLS player + quality selector; chat link opens a new tab.
- Player: Plyr-based video element using native HLS support (no Hls.js currently), automatic quality only.
- Styling: TailwindCSS with custom green palette; avoid Kick visual cloning.
