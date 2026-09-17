// Site-wide configuration shared by every page of the build.
// Content itself lives in ./tr.js and ./en.js.

export const site = {
  name: "Neşe Atasoy",
  brandMark: "NEŞE ATASOY",
  email: "info@neseatasoy.com",
  // Set this to the production origin before launch — it is used for
  // canonical links, hreflang alternates and sitemap.xml.
  origin: "https://neseatasoy.com",
  defaultLang: "tr",
  languages: ["tr", "en"]
};

// Page keys shared by both languages, with per-language slugs and metadata
// keys. `key` is what templates and navigation refer to.
export const pages = [
  { key: "home",     tr: { path: "index.html" },          en: { path: "en/index.html" } },
  { key: "about",    tr: { path: "hakkimda.html" },       en: { path: "en/about.html" } },
  { key: "services", tr: { path: "hizmetler.html" },      en: { path: "en/services.html" } },
  { key: "insights", tr: { path: "bilgi-merkezi.html" },  en: { path: "en/insights.html" } },
  { key: "contact",  tr: { path: "iletisim.html" },       en: { path: "en/contact.html" } }
];

// Per-language <title> / meta description. Kept next to the routes so a page
// can never ship without them.
export const meta = {
  tr: {
    home: {
      title: "Neşe Atasoy SMMM — Mali Müşavirlik ve Vergi Danışmanlığı",
      description:
        "KOBİ'ler, şahıs işletmeleri, serbest meslek sahipleri ve yeni kurulan şirketler için mevzuata tam uyumlu muhasebe, vergi planlaması ve finansal danışmanlık."
    },
    about: {
      title: "Hakkımda — Neşe Atasoy SMMM",
      description:
        "Serbest Muhasebeci Mali Müşavir Neşe Atasoy: deneyim, uzmanlık alanları ve çalışma ilkeleri."
    },
    services: {
      title: "Hizmetler — Neşe Atasoy SMMM",
      description:
        "Muhasebe ve defter tutma, vergi danışmanlığı, bordro ve SGK, şirket kuruluşu, e-dönüşüm, finansal danışmanlık, teşvik ve destekler."
    },
    insights: {
      title: "Bilgi Merkezi — Neşe Atasoy SMMM",
      description:
        "Mevzuat değişiklikleri, vergi takvimi ve işletmeler için pratik notlar."
    },
    contact: {
      title: "İletişim — Ücretsiz Ön Görüşme | Neşe Atasoy SMMM",
      description:
        "Formu bırakın, 48 saat içinde dönüş yapalım. İlk görüşme 30 dakika sürer, ücretsizdir ve bir taahhüt oluşturmaz."
    }
  },
  en: {
    home: {
      title: "Neşe Atasoy CPA — Accounting and Tax Advisory in Türkiye",
      description:
        "Fully compliant bookkeeping, tax planning and financial advisory for SMEs, sole traders, freelancers and newly founded companies in Türkiye."
    },
    about: {
      title: "About — Neşe Atasoy, Certified Public Accountant",
      description:
        "Certified Public Accountant Neşe Atasoy: experience, areas of expertise and working principles."
    },
    services: {
      title: "Services — Neşe Atasoy, Certified Public Accountant",
      description:
        "Bookkeeping, tax advisory, payroll and social security, company formation, digital transition, financial advisory, incentives and grants."
    },
    insights: {
      title: "Insights — Neşe Atasoy, Certified Public Accountant",
      description: "Legislation updates, the tax calendar and practical notes for businesses."
    },
    contact: {
      title: "Contact — Free Intro Call | Neşe Atasoy, CPA",
      description:
        "Leave the form and we'll come back within 48 hours. The first call takes 30 minutes, is free and commits you to nothing."
    }
  }
};

// Photography slots carried over from the design. Drop a file into
// src/assets/img/ and point the slot at it (e.g. "img/hero-signing.jpg") to
// replace the placeholder frame — no template change needed.
export const images = {
  "hero-signing": { src: null, tr: "Sözleşme imzası / resmi evrak sahnesi", en: "Contract signing / official documents" },
  "home-office":  { src: null, tr: "Toplantı masası / resmi evrak imzası sahnesi", en: "Meeting table / signing scene" },
  "about-portrait": { src: null, tr: "Kurumsal portre — masa başında, resmi kıyafet", en: "Corporate portrait at the desk" },
  "about-signing": { src: null, tr: "İmza / mühür / evrak detayı", en: "Signature / seal / document detail" }
};

// Strings that belong to the shell (header, footer, forms) rather than to a
// page's content.
export const ui = {
  tr: {
    skip: "İçeriğe geç",
    menu: "Menü",
    navLabel: "Site menüsü",
    close: "Kapat",
    langLabel: "Dil",
    newsletterTitle: "Bülten",
    newsletterBody: "Mevzuat değişiklikleri ve vergi takvimi hatırlatmaları için e-posta listesi.",
    newsletterEmail: "E-posta adresiniz",
    newsletterSubmit: "Abone Ol",
    newsletterPending: "Gönderiliyor…",
    newsletterOk: "Kaydınız alındı. Teşekkürler.",
    newsletterError: "Gönderilemedi. Lütfen daha sonra tekrar deneyin veya bize e-posta yazın.",
    newsletterOffline: "Bülten kaydı henüz devrede değil. Bu arada bize e-posta yazabilirsiniz:",
    newsletterConsent: "E-posta adresim bülten gönderimi için kullanılabilir.",
    formPending: "Gönderiliyor…",
    formError: "Form gönderilemedi. Lütfen daha sonra tekrar deneyin veya bize e-posta yazın.",
    formOffline: "Form gönderimi henüz devrede değil. Talebinizi doğrudan e-posta ile iletebilirsiniz:",
    formRequired: "Lütfen zorunlu alanları doldurun.",
    kvkk: "KVKK Aydınlatma Metni"
  },
  en: {
    skip: "Skip to content",
    menu: "Menu",
    navLabel: "Site navigation",
    close: "Close",
    langLabel: "Language",
    newsletterTitle: "Newsletter",
    newsletterBody: "Email updates on legislation changes and tax-calendar reminders.",
    newsletterEmail: "Your email address",
    newsletterSubmit: "Subscribe",
    newsletterPending: "Sending…",
    newsletterOk: "You're on the list. Thank you.",
    newsletterError: "Could not send. Please try again later or email us.",
    newsletterOffline: "Newsletter sign-up is not connected yet. In the meantime, email us at:",
    newsletterConsent: "My email address may be used to send the newsletter.",
    formPending: "Sending…",
    formError: "The form could not be sent. Please try again later or email us.",
    formOffline: "Form delivery is not connected yet. You can send your request by email:",
    formRequired: "Please fill in the required fields.",
    kvkk: "Privacy notice"
  }
};

export default site;
