# FERDA 777 Link Hub

A modern, black & white Linktree-style site for a streamer/gamer. Responsive on phone and desktop, with subtle animations, glass cards, and a very dark blurred background.

## Files
- `index.html` – Page structure, tabs (Links, About, Contact)
- `styles.css` – Theme, animations, responsive layout
- `script.js` – Menu, tabs, share/copy actions, avatar/background customization
- `vercel.json` – Security headers + caching for Vercel

## Local preview
Open `index.html` directly in your browser.

## Deploy to Vercel (recommended)
1. Push this folder to a GitHub repository. If you don’t want others to browse your code, make the repository private.
2. Go to https://vercel.com → New Project → Import your repo.
3. Framework preset: “Other” (static). Output directory: root. No build step required.
4. Deploy. Vercel will serve `index.html` at the root.

The included `vercel.json` sets strict security headers:
- HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Permissions-Policy (limits powerful APIs)
- Content-Security-Policy (CSP) that allows scripts/styles from self only; images from `https:` or `data:`
- Long-term immutable caching for static assets

## Deploy to GitHub Pages (optional)
1. Push to a GitHub repo.
2. Settings → Pages → Deploy from branch → `main` (root) → Save.
3. Your site will be at `https://<user>.github.io/<repo>/`.

## Security notes (important)
- This is a static client-side site. Any HTML/CSS/JS sent to the browser can be viewed by visitors. There is no way to “encrypt” front-end code and still have the browser run it. Obfuscation exists but is not real security.
- Best practices implemented:
  - No secrets in client code.
  - Strong security headers via `vercel.json` (CSP, HSTS, etc.).
  - External images allowed broadly via CSP (`img-src https:`) so your custom logo/background work.
- If you want to hide source code from GitHub, keep your repository private. Even then, the served website HTML/CSS/JS remains visible to visitors’ browsers by design.

## Customization shortcuts
- Click the avatar to set a logo (paste URL or type `upload`). Right-click avatar to clear.
- Press `Ctrl+B` to set a background image URL; `Ctrl+Shift+B` to clear.
- Shift-click the Discord card to change the invite URL.

## Next improvements (optional)
- Host icon images locally instead of external CDNs for reliability under strict CSP.
- Add SEO/OG tags and favicon.
- Add sticky bottom nav on mobile.
- Add schedule + countdown with ICS export.
