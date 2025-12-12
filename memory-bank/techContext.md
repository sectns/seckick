# Tech Context

- Runtime: Node.js (Express) for API proxy + static serve; Vite + React on the client.
- Styling: TailwindCSS; Plyr.js on the player with native HLS (Hls.js currently removed).
- Auth/DB: Firebase Auth (email/password, social extendable), Firestore for follow list persistence post-login.
- Storage: Cookies/localStorage for guest follow lists.
- APIs: Kick public HTTP endpoints for channel info and livestream playback; require browser-like headers and 403 handling.
- Tooling: npm scripts for dev/build, dotenv for config, axios/undici for HTTP, zod for response guards (if needed).
