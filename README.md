# Neşe Atasoy Mali Müşavirlik — website

Bilingual (TR / EN) static website for Neşe Atasoy, SMMM. No framework, no
runtime dependencies: a small Node script renders plain HTML from the content
files, and the result is a folder of static pages that any host can serve.

## Quick start

```bash
node build.mjs          # build into dist/
node build.mjs --serve  # build, then preview on http://localhost:4173
```

Node 18+ is enough — there is nothing to install.

## Layout

```
build.mjs              generator: templates, page renderers, sitemap, preview server
src/content/site.js    routes, page titles/descriptions, image slots, UI strings
src/content/tr.js      all Turkish copy
src/content/en.js      all English copy
src/content/icons.js   service icons and the "Kurumsal / Firm" menu
src/assets/css/        tokens.css (design system) + site.css (page styles)
src/assets/js/         config.js (endpoints), site.js (navigation), forms.js
src/assets/img/        logo and photography
src/root/              optional: files copied to the site root as-is (CNAME, …)
dist/                  build output — generated, not committed
```

Pages, in both languages:

| Page     | Turkish              | English             |
| -------- | -------------------- | ------------------- |
| Home     | `/`                  | `/en/`              |
| About    | `/hakkimda.html`     | `/en/about.html`    |
| Services | `/hizmetler.html`    | `/en/services.html` |
| Insights | `/bilgi-merkezi.html`| `/en/insights.html` |
| Contact  | `/iletisim.html`     | `/en/contact.html`  |

The build also emits `404.html`, `sitemap.xml`, `robots.txt` and `.nojekyll`.

## Editing content

All copy lives in `src/content/tr.js` and `src/content/en.js`, mirroring each
other key for key. Change the text, run the build, done — no template edits.

Adding a service to `services.items` in both files adds it to the services
page, the home grid, the header dropdown and the footer at once (keep an icon
in `src/content/icons.js` at the same index).

Page `<title>` and meta description live in `meta` in `src/content/site.js`.

## Photography

The four photo areas from the design are placeholders until real images are
dropped in:

1. put the file in `src/assets/img/` (e.g. `hero-signing.jpg`),
2. set `src: "img/hero-signing.jpg"` for that slot in `images` in
   `src/content/site.js`.

Slots: `hero-signing`, `home-office`, `about-portrait`, `about-signing`.

## Forms, newsletter and automations

The contact form and the footer newsletter form are already on the page and
fully wired; only the destination is missing. Until an endpoint is configured
each form validates normally and tells the visitor to email instead — nothing
is silently dropped.

To connect them, set the URLs in `src/assets/js/config.js`:

```js
window.SITE_CONFIG = {
  endpoints: {
    contact: "https://…",      // intro-call / contact form
    newsletter: "https://…"    // newsletter sign-ups
  },
  email: "info@neseatasoy.com"
};
```

Each submission is a JSON `POST`:

```json
{
  "form": "contact",
  "lang": "tr",
  "page": "/iletisim.html",
  "submittedAt": "2026-01-01T09:00:00.000Z",
  "fields": { "name": "…", "company": "…", "email": "…", "phone": "…", "subject": "…", "message": "…" }
}
```

Anything that accepts a JSON POST works: a serverless function, a form
service, or an n8n / Make / Zapier webhook. Both forms carry a hidden
honeypot field (`website`) — treat a submission with a non-empty `website` as
spam and drop it.

Adding another form later needs no JavaScript: give the `<form>` a
`data-form="name"` attribute matching a key in `endpoints`, a
`.form-status` paragraph, and the `data-msg-*` strings.

## Deployment

`.github/workflows/deploy.yml` builds the site and publishes `dist/` to GitHub
Pages on every push to `main` (enable Pages → "GitHub Actions" in the
repository settings once). Pull requests and other branches run
`.github/workflows/build-check.yml`, which only verifies the build.

Any static host works just as well: build, upload `dist/`.

Before launch, set `origin` in `src/content/site.js` to the production domain —
canonical links, hreflang alternates and `sitemap.xml` are derived from it. For
a custom domain on GitHub Pages, put a `CNAME` file in `src/root/` (everything
in that folder is copied to the site root untouched) or set the domain in the
repository settings.
