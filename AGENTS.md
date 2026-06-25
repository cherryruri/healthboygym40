# AGENTS.md

## Cursor Cloud specific instructions

### What this is
HEALTHBOYGYM (헬스보이짐 수내점) is a **static website** for a Korean gym: a marketing
landing page plus a member portal (login, my page, community board, admin). It is plain
HTML/CSS/vanilla-JS ES modules with **no build step and no package manager** (no
`package.json`, no `node_modules`, no bundler). Third‑party libs are either CDN‑loaded
(Firebase SDK, fonts) or vendored under `js/` and `css/` (GSAP, Swiper, Feather). Deployment
is GitHub Pages via `.github/workflows/pages.yml`.

### Running it (dev)
Serve the repo root over HTTP, then open `http://localhost:8080/`:

```
python3 -m http.server 8080   # run from the repo root
```

Use a real HTTP server, not `file://` — the pages load JS as ES modules and Firebase needs an
http(s) origin. Port `8080` matches `.vscode/launch.json`, but any port works. There is nothing
to install or build; editing a file and refreshing the browser is the full dev loop.

### Lint / test / build
There is **no lint, test, or build tooling** in this repo (no configs, no scripts, no CI checks
beyond the Pages deploy). Do not expect `npm`/`make`/test commands to exist.

### Backend: live Firebase (important caveat)
There is **no local backend**. The member features talk directly to a **production Firebase
project** (`healthboygym40-4ee44`) whose config/API key is hardcoded in `firebase-auth.js`,
`firebase-index.js`, and `mypage.js`. Collections: `users`, `userIds`, `phoneNumbers`,
`memberKeys`, `boards`. Profile images are stored as base64 in Firestore (Firebase Storage is
not used).

Non‑obvious gotcha discovered during setup:
- **Firestore security rules deny unauthenticated reads/writes.** The **signup wizard**
  (`login.html`) fails at the ID "중복확인" (duplicate‑check) step with
  `FirebaseError: Missing or insufficient permissions`, so you cannot complete signup from the
  served UI against the live project. This is a backend rules configuration, not an app/env bug.
- **Firebase Authentication works fine** (it is not governed by Firestore rules). Logging in via
  the UI succeeds and redirects to `mypage.html`. On My Page, the Auth‑derived fields (ID/email)
  render, but Firestore‑backed fields show `-` / `정보 불러오기 오류` because the authenticated
  read is also blocked by rules — expected given the above.
- To exercise the login flow end‑to‑end without the blocked signup wizard, create an Auth user
  via the Identity Toolkit REST API (`accounts:signUp` with the hardcoded `apiKey`), then log in
  through the UI. A throwaway test account already exists: ID `clouddevtest0625` /
  password `Cloud@2026`. Avoid writing real/production member data.

### Repo notes
- Many large image/video assets and a `백업용 코드` ("backup code") folder live at the repo
  root; they are not part of any build and can be ignored for dev.
- Filenames are frequently Korean (UTF‑8); preserve encoding when scripting over files.
