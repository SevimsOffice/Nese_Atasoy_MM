/* Static site generator for neseatasoy.com — no dependencies.
 *
 *   node build.mjs            build into dist/
 *   node build.mjs --serve    build, then serve dist/ on http://localhost:4173
 *
 * Content lives in src/content/*.js, assets in src/assets/. Every page is
 * rendered twice, once per language: Turkish at the root, English under /en/.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { site, pages, meta, images, ui } from "./src/content/site.js";
import { tr } from "./src/content/tr.js";
import { en } from "./src/content/en.js";
import { serviceIcons, corpIcons, corpMenu } from "./src/content/icons.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, "dist");
const content = { tr, en };

/* ── helpers ──────────────────────────────────────────────────────────── */

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const attr = esc;
const otherLang = (lang) => (lang === "tr" ? "en" : "tr");

/** Path of a page, relative to the site root. */
const pathOf = (lang, key) => pages.find((p) => p.key === key)[lang].path;

/** Prefix that takes a page back to the site root ("" or "../"). */
const baseOf = (lang) => (lang === "tr" ? "" : "../");

/** Link to another page of the site from a page in `lang`. */
const href = (lang, key, fromLang = lang) => {
  const target = pathOf(lang, key);
  return baseOf(fromLang) + (target === "index.html" ? "./" : target);
};

const asset = (lang, file) => baseOf(lang) + "assets/" + file;

const canonical = (lang, key) => {
  const p = pathOf(lang, key);
  return site.origin + "/" + p.replace(/(^|\/)index\.html$/, "$1");
};

const corners = (onDark = false) => {
  const cls = onDark ? "corner corner--onDark" : "corner";
  return ["tl", "tr", "bl", "br"].map((c) => `<i class="${cls} ${c}"></i>`).join("");
};

const icon = (d, { size = 26, stroke = "currentColor", extra = "" } = {}) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}><path d="${attr(d)}"></path></svg>`;

/** An image slot: a real photo once one is configured, a framed placeholder
 *  until then (see `images` in src/content/site.js). */
const imageSlot = (id, lang) => {
  const slot = images[id];
  const alt = slot ? slot[lang] : "";
  if (slot && slot.src) {
    return `<div class="img-slot"><img src="${attr(baseOf(lang) + "assets/" + slot.src)}" alt="${attr(alt)}" loading="lazy"></div>`;
  }
  return `<div class="img-slot" role="img" aria-label="${attr(alt)}"></div>`;
};

const withServiceIcons = (t) =>
  t.services.items.map((s, i) => ({ ...s, icon: serviceIcons[i] }));

/* ── shell ────────────────────────────────────────────────────────────── */

function renderNav(lang, key) {
  const t = content[lang];
  const corp = corpMenu[lang];
  const services = withServiceIcons(t);
  const current = (k) => (k === key ? ' aria-current="page"' : "");

  const corpPanel = `
        <div class="nav__panel">
          <div class="nav__grid">
            ${corp.items
              .map(
                (c, i) => `<a class="nav__card" href="${href(lang, c.page)}">
              ${icon(corpIcons[i], { size: 18 })}
              <span><span class="nav__card-label">${esc(c.label)}</span><span class="nav__card-desc">${esc(c.desc)}</span></span>
            </a>`
              )
              .join("\n            ")}
          </div>
        </div>`;

  const servicesPanel = `
        <div class="nav__panel nav__panel--wide">
          <div class="nav__grid nav__grid--wide">
            ${services
              .map(
                (s) => `<a class="nav__card" href="${href(lang, "services")}#${attr(slug(s.title))}">
              ${icon(s.icon, { size: 18 })}
              <span><span class="nav__card-label">${esc(s.title)}</span><span class="nav__card-desc">${esc(s.body)}</span></span>
            </a>`
              )
              .join("\n            ")}
          </div>
        </div>`;

  return `<nav class="nav" aria-label="${attr(ui[lang].navLabel)}">
      <div class="nav__item"><a class="nav__link" href="${href(lang, "home")}"${current("home")}>${esc(t.nav[0].label)}</a></div>
      <div class="nav__item" data-menu data-open="false">
        <a class="nav__link" href="${href(lang, "about")}" aria-expanded="false"${current("about")}>${esc(corp.label)}${chevron()}</a>${corpPanel}
      </div>
      <div class="nav__item" data-menu data-open="false">
        <a class="nav__link" href="${href(lang, "services")}" aria-expanded="false"${current("services")}>${esc(t.nav[2].label)}${chevron()}</a>${servicesPanel}
      </div>
      <div class="nav__item"><a class="nav__link" href="${href(lang, "insights")}"${current("insights")}>${esc(t.nav[3].label)}</a></div>
      <div class="nav__item"><a class="nav__link" href="${href(lang, "contact")}"${current("contact")}>${esc(t.nav[4].label)}</a></div>
    </nav>`;
}

const chevron = () =>
  `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>`;

function renderHeader(lang, key) {
  const t = content[lang];
  const u = ui[lang];
  return `<header class="site-header" data-nav-open="false">
    <div class="shell site-header__inner">
      <a class="brand" href="${href(lang, "home")}">
        <img src="${attr(asset(lang, "img/logo.jpeg"))}" alt="${attr(site.name + " — " + t.brandLine)}" width="42" height="42">
        <span class="brand__text">
          <span class="brand__name">${esc(site.brandMark)}</span>
          <span class="brand__line">${esc(t.brandLine)}</span>
        </span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false">${esc(u.menu)}</button>
      ${renderNav(lang, key)}
      <div class="header-tools">
        <div class="lang-switch blueprint" role="group" aria-label="${attr(u.langLabel)}">
          <a href="${lang === "tr" ? "#" : href("tr", key, lang)}" aria-current="${lang === "tr"}" hreflang="tr">TR</a>
          <a href="${lang === "en" ? "#" : href("en", key, lang)}" aria-current="${lang === "en"}" hreflang="en">EN</a>
        </div>
        <a class="btn btn-primary blueprint btn-cta" href="${href(lang, "contact")}">${esc(t.navCta)}${corners()}</a>
      </div>
    </div>
  </header>`;
}

function renderFooter(lang) {
  const t = content[lang];
  const navKeys = ["home", "about", "services", "insights", "contact"];
  return `<footer class="site-footer">
    <div class="shell footer-grid">
      <div>
        <div class="footer-brand">
          <img src="${attr(asset(lang, "img/logo.jpeg"))}" alt="" width="40" height="40">
          <span>${esc(site.brandMark)}</span>
        </div>
        <p class="footer-blurb">${esc(t.footer.blurb)}</p>
      </div>
      <div>
        <div class="footer-title">${esc(t.footer.navTitle)}</div>
        <div class="footer-list">
          ${navKeys.map((k, i) => `<a href="${href(lang, k)}">${esc(t.nav[i].label)}</a>`).join("\n          ")}
        </div>
      </div>
      <div>
        <div class="footer-title">${esc(t.footer.servicesTitle)}</div>
        <div class="footer-list">
          ${t.services.items
            .slice(0, 5)
            .map((s) => `<a href="${href(lang, "services")}#${attr(slug(s.title))}">${esc(s.title)}</a>`)
            .join("\n          ")}
        </div>
      </div>
      <div>
        <div class="footer-title">${esc(t.footer.contactTitle)}</div>
        <a class="footer-mail" href="mailto:${attr(site.email)}">${esc(site.email)}</a>
        <p class="footer-hours">${esc(t.footer.hours)}</p>
        ${renderNewsletter(lang)}
      </div>
    </div>
    <div class="shell footer-bottom">
      <span>© ${new Date().getFullYear()} ${esc(site.name)} — SMMM</span>
      <span>${esc(t.footer.legal)}</span>
    </div>
  </footer>`;
}

function renderNewsletter(lang) {
  const u = ui[lang];
  return `<form class="newsletter" data-form="newsletter"
      data-msg-pending="${attr(u.newsletterPending)}"
      data-msg-ok="${attr(u.newsletterOk)}"
      data-msg-error="${attr(u.newsletterError)}"
      data-msg-offline="${attr(u.newsletterOffline)}"
      data-msg-required="${attr(u.formRequired)}">
      <div class="footer-title" style="margin:6px 0 0">${esc(u.newsletterTitle)}</div>
      <p>${esc(u.newsletterBody)}</p>
      <label class="sr-only" for="newsletter-email-${lang}" hidden>${esc(u.newsletterEmail)}</label>
      <input class="input" id="newsletter-email-${lang}" type="email" name="email" required placeholder="${attr(u.newsletterEmail)}" autocomplete="email">
      <input type="text" name="website" tabindex="-1" autocomplete="off" hidden aria-hidden="true">
      <button class="btn" type="submit">${esc(u.newsletterSubmit)}</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>`;
}

function layout({ lang, key, body }) {
  const m = meta[lang][key];
  const u = ui[lang];
  const other = otherLang(lang);
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)}</title>
<meta name="description" content="${attr(m.description)}">
<link rel="canonical" href="${attr(canonical(lang, key))}">
<link rel="alternate" hreflang="${lang}" href="${attr(canonical(lang, key))}">
<link rel="alternate" hreflang="${other}" href="${attr(canonical(other, key))}">
<link rel="alternate" hreflang="x-default" href="${attr(canonical(site.defaultLang, key))}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${attr(site.name)}">
<meta property="og:title" content="${attr(m.title)}">
<meta property="og:description" content="${attr(m.description)}">
<meta property="og:url" content="${attr(canonical(lang, key))}">
<meta property="og:locale" content="${lang === "tr" ? "tr_TR" : "en_US"}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${attr(asset(lang, "img/logo.jpeg"))}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${attr(asset(lang, "css/tokens.css"))}">
<link rel="stylesheet" href="${attr(asset(lang, "css/site.css"))}">
<script src="${attr(asset(lang, "js/config.js"))}"></script>
${key === "home" ? organizationJsonLd(lang) : ""}
</head>
<body>
<a class="skip-link" href="#main">${esc(u.skip)}</a>
<div class="page">
  ${renderHeader(lang, key)}
  <main id="main">
${body}
  </main>
  ${renderFooter(lang)}
</div>
<script src="${attr(asset(lang, "js/site.js"))}"></script>
<script src="${attr(asset(lang, "js/forms.js"))}"></script>
</body>
</html>
`;
}

function organizationJsonLd(lang) {
  const t = content[lang];
  const data = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name: site.name,
    description: t.hero.lead,
    email: site.email,
    url: site.origin,
    areaServed: "TR",
    availableLanguage: ["tr", "en"],
    knowsAbout: t.services.items.map((s) => s.title)
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

/** Stable anchor id for a service, used by the nav and footer deep links. */
function slug(value) {
  const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return String(value)
    .toLowerCase()
    .replace(/[çğıöşüİ]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ── pages ────────────────────────────────────────────────────────────── */

function homePage(lang) {
  const t = content[lang];
  const services = withServiceIcons(t);
  return `    <section class="hero">
      <div class="hero__bg">
        <div class="duotone" style="position:absolute;inset:0">${imageSlot("hero-signing", lang)}</div>
        <div class="hero__scrim"></div>
      </div>
      <div class="hero__inner">
        <div class="hero__body">
          <div class="hero__kicker"><span></span><span>${esc(t.hero.kicker)}</span></div>
          <h1>${esc(t.hero.title)}</h1>
          <p>${esc(t.hero.lead)}</p>
          <div class="hero__actions">
            <a class="btn btn-primary blueprint btn-onDark" href="${href(lang, "contact")}">${esc(t.hero.cta1)}${corners(true)}</a>
            <a class="btn btn-outlineOnDark" href="${href(lang, "services")}">${esc(t.hero.cta2)}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="shell stats__grid">
        ${t.stats
          .map((s) => `<div class="stat"><div class="stat__k">${esc(s.k)}</div><div class="stat__v">${esc(s.v)}</div></div>`)
          .join("\n        ")}
      </div>
    </section>

    <section class="section">
      <div class="shell split">
        <div>
          <p class="kicker">${esc(t.problems.kicker)}</p>
          <h2 class="h-section">${esc(t.problems.title)}</h2>
          <p class="muted" style="font-size:15.5px;line-height:1.65;max-width:38ch">${esc(t.problems.lead)}</p>
        </div>
        <div>
          ${t.problems.items
            .map(
              (p) => `<div class="problem">
            <div class="problem__q">${esc(p.problem)}</div>
            <div class="problem__a">${esc(p.solution)}</div>
          </div>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section section--dark">
      <div class="shell">
        <div class="section-head">
          <div>
            <p class="kicker">${esc(t.services.kicker)}</p>
            <h2 class="h-section" style="margin:0">${esc(t.services.title)}</h2>
          </div>
          <a class="section-head__link" href="${href(lang, "services")}">${esc(t.services.all)}</a>
        </div>
        <div class="card-grid">
          ${services
            .map(
              (s) => `<a class="blueprint service-card" href="${href(lang, "services")}#${attr(slug(s.title))}" style="text-decoration:none">
            <div class="service-card__top">${icon(s.icon, { stroke: "var(--color-accent-300)" })}<span class="service-card__no">${esc(s.no)}</span></div>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.body)}</p>
            ${corners(true)}
          </a>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="shell">
        <p class="kicker">${esc(t.process.kicker)}</p>
        <h2 class="h-section" style="max-width:22ch;margin-bottom:44px">${esc(t.process.title)}</h2>
        <div class="matrix">
          ${t.process.steps
            .map(
              (p) => `<div class="step">
            <div class="step__no">${esc(p.no)}</div>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.body)}</p>
          </div>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section section--rule">
      <div class="shell split split--wide">
        <div class="blueprint duotone media-frame" style="aspect-ratio:3/2">${imageSlot("home-office", lang)}${corners()}</div>
        <div>
          <p class="kicker">${esc(t.aboutTeaser.kicker)}</p>
          <h2 class="h-sub" style="margin-bottom:18px">${esc(t.aboutTeaser.title)}</h2>
          <p class="muted" style="font-size:15.5px;line-height:1.7;max-width:46ch;margin-bottom:20px">${esc(t.aboutTeaser.body)}</p>
          <div class="tag-row">
            ${t.aboutTeaser.tags.map((tag) => `<span class="tag tag-outline">${esc(tag)}</span>`).join("\n            ")}
          </div>
          <a class="btn btn-secondary" style="padding:12px 20px" href="${href(lang, "about")}">${esc(t.aboutTeaser.cta)}</a>
        </div>
      </div>
    </section>

    <section class="section section--rule">
      <div class="shell split">
        <div>
          <p class="kicker">${esc(t.faq.kicker)}</p>
          <h2 class="h-sub">${esc(t.faq.title)}</h2>
        </div>
        <div>
          ${t.faq.items
            .map(
              (f) => `<details class="faq">
            <summary>${esc(f.q)}<span class="faq-plus"><span></span><span></span></span></summary>
            <p>${esc(f.a)}</p>
          </details>`
            )
            .join("\n          ")}
        </div>
      </div>
      <script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: t.faq.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
      })}</script>
    </section>`;
}

function aboutPage(lang) {
  const t = content[lang];
  return `    <section class="section--tight">
      <div class="shell">
        <p class="kicker">${esc(t.about.kicker)}</p>
        <h1 class="h-display" style="max-width:20ch">${esc(t.about.title)}</h1>
      </div>
    </section>

    <section style="padding-bottom:72px">
      <div class="shell split split--top" style="gap:52px">
        <div class="about-media">
          <div class="blueprint duotone media-frame" style="aspect-ratio:1/1">${imageSlot("about-portrait", lang)}${corners()}</div>
          <div class="blueprint about-card">
            <span class="about-card__name">${esc(site.name)}</span>
            <span class="about-card__line">${esc(t.brandLine)}</span>
            ${corners()}
          </div>
          <div class="blueprint duotone media-frame" style="aspect-ratio:3/2">${imageSlot("about-signing", lang)}${corners()}</div>
        </div>
        <div>
          ${t.about.paras.map((p) => `<p class="about-para">${esc(p)}</p>`).join("\n          ")}
          <div class="facts">
            ${t.about.facts
              .map((f) => `<div class="fact"><div class="fact__k">${esc(f.k)}</div><div class="fact__v">${esc(f.v)}</div></div>`)
              .join("\n            ")}
          </div>
        </div>
      </div>
    </section>

    <section class="section section--dark" style="padding:64px 0">
      <div class="shell">
        <p class="kicker">${esc(t.about.valuesKicker)}</p>
        <div class="card-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
          ${t.about.values
            .map(
              (v) => `<div class="blueprint value-card">
            <h3>${esc(v.title)}</h3>
            <p>${esc(v.body)}</p>
            ${corners(true)}
          </div>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>`;
}

function servicesPage(lang) {
  const t = content[lang];
  const services = withServiceIcons(t);
  return `    <section class="section--tight">
      <div class="shell">
        <p class="kicker">${esc(t.services.kicker)}</p>
        <h1 class="h-display" style="max-width:22ch;margin-bottom:20px">${esc(t.servicesPage.title)}</h1>
        <p class="lead">${esc(t.servicesPage.lead)}</p>
      </div>
    </section>

    <section style="padding-bottom:40px">
      <div class="shell">
        <div class="service-matrix">
          ${services
            .map(
              (s) => `<article class="service-detail" id="${attr(slug(s.title))}">
            ${icon(s.icon, { size: 28, stroke: "var(--color-accent)", extra: ' style="margin-bottom:4px"' })}
            <div class="service-detail__head">
              <span class="service-detail__no">${esc(s.no)}</span>
              <h2>${esc(s.title)}</h2>
            </div>
            <p>${esc(s.body)}</p>
            <ul class="ticks">
              ${s.points.map((pt) => `<li>${esc(pt)}</li>`).join("\n              ")}
            </ul>
          </article>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>

    <section style="padding:24px 0 80px">
      <div class="shell">
        <div class="blueprint cta-band">
          <div>
            <h2>${esc(t.servicesPage.ctaTitle)}</h2>
            <p>${esc(t.servicesPage.ctaBody)}</p>
          </div>
          <a class="btn btn-primary blueprint" style="padding:13px 22px;font-size:14px" href="${href(lang, "contact")}">${esc(t.navCta)}${corners()}</a>
          ${corners()}
        </div>
      </div>
    </section>`;
}

function insightsPage(lang) {
  const t = content[lang];
  return `    <section class="section--tight">
      <div class="shell">
        <p class="kicker">${esc(t.insights.kicker)}</p>
        <h1 class="h-display" style="max-width:22ch;margin-bottom:20px">${esc(t.insights.title)}</h1>
        <p class="lead">${esc(t.insights.lead)}</p>
      </div>
    </section>

    <section style="padding-bottom:80px">
      <div class="shell insight-grid">
        ${t.insights.items
          .map(
            (a) => `<article class="blueprint insight">
          <span class="tag tag-accent" style="align-self:flex-start">${esc(a.tag)}</span>
          <h2>${esc(a.title)}</h2>
          <p>${esc(a.body)}</p>
          <div class="insight__date">${esc(a.date)}</div>
          ${corners()}
        </article>`
          )
          .join("\n        ")}
      </div>
    </section>`;
}

function contactPage(lang) {
  const t = content[lang];
  const u = ui[lang];
  const f = t.contact.f;
  return `    <section class="section--tight" style="padding-bottom:80px">
      <div class="shell split split--top" style="gap:52px;grid-template-columns:repeat(auto-fit,minmax(310px,1fr))">
        <div>
          <p class="kicker">${esc(t.contact.kicker)}</p>
          <h1 class="h-display" style="font-size:clamp(34px,4.2vw,54px);max-width:18ch;margin-bottom:20px">${esc(t.contact.title)}</h1>
          <p class="muted" style="font-size:16px;line-height:1.7;max-width:44ch;margin-bottom:32px">${esc(t.contact.lead)}</p>
          <div class="contact-rows">
            ${t.contact.rows
              .map(
                (r) => `<div class="contact-row"><div class="contact-row__k">${esc(r.k)}</div><div class="contact-row__v">${
                  r.v.includes("@") ? `<a href="mailto:${attr(r.v)}">${esc(r.v)}</a>` : esc(r.v)
                }</div></div>`
              )
              .join("\n            ")}
          </div>
          <p style="margin:20px 0 0;font-size:13px;color:color-mix(in srgb, var(--color-text) 55%, transparent)">${esc(t.contact.note)}</p>
        </div>
        <form class="blueprint site-form" data-form="contact"
          data-msg-pending="${attr(u.formPending)}"
          data-msg-ok="${attr(t.contact.sent)}"
          data-msg-error="${attr(u.formError)}"
          data-msg-offline="${attr(u.formOffline)}"
          data-msg-required="${attr(u.formRequired)}">
          <h2>${esc(t.contact.formTitle)}</h2>
          <div class="field-row">
            <div class="field"><label for="c-name">${esc(f.name)} <span class="req">*</span></label><input class="input" id="c-name" name="name" type="text" autocomplete="name" required></div>
            <div class="field"><label for="c-company">${esc(f.company)}</label><input class="input" id="c-company" name="company" type="text" autocomplete="organization"></div>
            <div class="field"><label for="c-email">${esc(f.email)} <span class="req">*</span></label><input class="input" id="c-email" name="email" type="email" autocomplete="email" required></div>
            <div class="field"><label for="c-phone">${esc(f.phone)}</label><input class="input" id="c-phone" name="phone" type="tel" autocomplete="tel"></div>
          </div>
          <div class="field">
            <label for="c-subject">${esc(f.subject)}</label>
            <select class="input" id="c-subject" name="subject">
              ${t.contact.subjects.map((opt) => `<option>${esc(opt)}</option>`).join("\n              ")}
            </select>
          </div>
          <div class="field"><label for="c-message">${esc(f.message)} <span class="req">*</span></label><textarea class="input" id="c-message" name="message" rows="5" required></textarea></div>
          <input type="text" name="website" tabindex="-1" autocomplete="off" hidden aria-hidden="true">
          <button class="btn btn-primary btn-block blueprint" type="submit" style="padding:14px 20px;font-size:14px">${esc(f.submit)}${corners()}</button>
          <p class="form-status" role="status" aria-live="polite"></p>
          ${corners()}
        </form>
      </div>
    </section>`;
}

const renderers = {
  home: homePage,
  about: aboutPage,
  services: servicesPage,
  insights: insightsPage,
  contact: contactPage
};

/* ── build ────────────────────────────────────────────────────────────── */

function write(relPath, data) {
  const target = path.join(outDir, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
  return relPath;
}

function notFoundPage() {
  const lang = site.defaultLang;
  const t = content[lang];
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 — ${esc(site.name)}</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/site.css">
</head>
<body>
<div class="page">
  <main id="main" class="section">
    <div class="shell">
      <h1 class="h-display">404</h1>
      <p class="lead" style="margin:20px 0 28px">${esc(lang === "tr" ? "Aradığınız sayfa bulunamadı." : "The page you are looking for was not found.")}</p>
      <a class="btn btn-primary blueprint" style="padding:13px 22px" href="/">${esc(t.nav[0].label)}${corners()}</a>
    </div>
  </main>
</div>
</body>
</html>
`;
}

function sitemap() {
  const urls = [];
  for (const lang of site.languages) {
    for (const page of pages) {
      urls.push(`  <url>
    <loc>${canonical(lang, page.key)}</loc>
${site.languages
  .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${canonical(l, page.key)}"/>`)
  .join("\n")}
  </url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function build() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  copyDir(path.join(root, "src", "assets"), path.join(outDir, "assets"));
  // Anything in src/root/ is copied to the site root as-is (CNAME, verification
  // files, and whatever a host needs to see there).
  const passthrough = path.join(root, "src", "root");
  if (fs.existsSync(passthrough)) copyDir(passthrough, outDir);

  const written = [];
  for (const lang of site.languages) {
    for (const page of pages) {
      const body = renderers[page.key](lang);
      written.push(write(pathOf(lang, page.key), layout({ lang, key: page.key, body })));
    }
  }

  written.push(write("404.html", notFoundPage()));
  written.push(write("sitemap.xml", sitemap()));
  written.push(write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`));
  // Keeps GitHub Pages from running the output through Jekyll.
  written.push(write(".nojekyll", ""));

  console.log(`built ${written.length} files into dist/`);
  for (const file of written) console.log("  " + file);
}

/* A tiny static server for local preview — no dependency, no config. */
async function serve(port = 4173) {
  const http = await import("node:http");
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml"
  };
  http
    .createServer((req, res) => {
      const url = decodeURIComponent(req.url.split("?")[0]);
      let file = path.join(outDir, url);
      if (url.endsWith("/")) file = path.join(file, "index.html");
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        const html = path.join(outDir, "404.html");
        res.writeHead(404, { "Content-Type": types[".html"] });
        res.end(fs.readFileSync(html));
        return;
      }
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
      res.end(fs.readFileSync(file));
    })
    .listen(port, () => console.log(`serving dist/ on http://localhost:${port}`));
}

build();
if (process.argv.includes("--serve")) serve();
