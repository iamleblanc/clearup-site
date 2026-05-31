# Clear Up — Landing Page

Marketing landing page for **Clear Up Consulting** — *Clear the Knowledge. Cultivate the Future.*

Static site: plain HTML, CSS and vanilla JavaScript. No build step, no dependencies, no framework. It runs by just opening `index.html`.

## Structure

```
.
├── index.html          # The page
├── css/
│   └── clearup.css     # All styles (brand tokens, layout, responsive, motion)
├── js/
│   └── clearup.js      # Scroll reveals, accordion, animated flow-field background
├── assets/
│   └── mark.png        # Logo mark (lime "C")
└── .nojekyll           # Tells GitHub Pages to serve files as-is
```

Fonts (Inter) load from Google Fonts at runtime, so the site needs an internet connection to render in the brand typeface (it falls back to a system sans-serif offline).

## Run locally

Just open `index.html` in a browser. Or serve it:

```bash
# Python 3
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a new repository on GitHub and push these files to the `main` branch:

   ```bash
   git init
   git add .
   git commit -m "Clear Up landing page"
   git branch -M main
   git remote add origin https://github.com/<your-org>/<your-repo>.git
   git push -u origin main
   ```

2. In the repo on GitHub: **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Set **Branch** to `main` and the folder to `/ (root)`, then **Save**.
5. Wait ~1 minute. Your site will be live at:
   `https://<your-org>.github.io/<your-repo>/`

### Note on paths
All asset links are **relative** (`css/…`, `js/…`, `assets/…`), so the site works whether it is served from a user/organization root (`<org>.github.io`) or a project subpath (`<org>.github.io/<repo>/`). No configuration needed.

### Custom domain (optional)
Add a file named `CNAME` containing your domain (e.g. `clearup.pro`) at the repo root, then point your DNS at GitHub Pages.

## Editing content

- **Copy / text:** edit directly in `index.html`.
- **Colors & type:** the brand tokens live at the top of `css/clearup.css` under `:root` (indigo `#1A1240`, lime `#BDD630`, mint `#C2E6DA`, wash `#F0FEE1`).
- **Contact links:** email (`mailto:contact@clearup.pro`) and LinkedIn appear in the nav, the contact section, and the footer.

## Accessibility & motion
The animated background and scroll reveals automatically reduce/disable themselves for visitors who set **"reduce motion"** in their OS preferences.
