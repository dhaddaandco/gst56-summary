# GST 56th Meeting — Tabbed Summary (Static Site)

A tiny, fast static site with **tabbed sections** (no frameworks). Built for 1‑click deploys to **Render (Static Site)** or **GitHub Pages**.

## Files
- `index.html` — markup with tabs
- `style.css` — minimal styling, dark/light aware
- `script.js` — accessible tabs + hash routing
- `README.md` — these instructions

---

## Quick Deploy — Render (Free)
1. Create a new public repo on GitHub (e.g., `gst56-summary`) and push these files to the repo root.
2. Go to **render.com** → **New** → **Static Site**.
3. Connect your repo.
4. Set:
   - **Build Command:** *(leave empty)*
   - **Publish Directory:** `/` (repo root)
   - **Plan:** Free
5. Click **Create Static Site**. Render assigns a URL like `https://your-site.onrender.com`.

> Any commit to the repo auto-deploys.

## Alternative — GitHub Pages (Free)
1. Push the files to the **main** branch.
2. In your repo: **Settings** → **Pages** → **Source: Deploy from a branch** → Branch: `main` → Folder: `/root` → **Save**.
3. Open the URL GitHub gives you, like `https://username.github.io/gst56-summary`.

## Customize
- Update headings/content directly in `index.html`.
- Add real tables/annexures under each section.
- Tabs support deep links like `#services` (works with back/forward navigation).

---

Made with ❤️ in plain HTML/CSS/JS.
