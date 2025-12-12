# Product Context

- Purpose: Provide a fast, modern dashboard to track and watch Kick streams without mirroring Kick’s exact branding.
- Users: Signed-in users (Firebase Auth) whose follow lists persist in Firestore, and guests whose follows persist in cookies/local storage.
- Core flows:
  - Landing: choose Firebase login or continue as guest.
  - Follow list: add/remove channels; see name, live/offline, viewer count, category when live; stored per user (Firestore) or guest (cookie/local storage).
  - Player: left rail shows follows, right side hosts custom HLS player fed by backend playback URL; includes quality selector; chat opens in a new tab.
- Constraints: Use Kick public APIs for channel status and playback data. Avoid embedded chat/iframe. Keep theme green but distinct from Kick.
- Experience goals: quick load, dynamic updates, minimal friction to watch live streams, clean responsive layout.
