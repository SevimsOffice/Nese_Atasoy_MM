/* Runtime configuration — the one file to edit when the automations behind
   the site are connected. Nothing here is secret: it ships to the browser,
   so only put public endpoint URLs in it.

   endpoints.contact     — receives the contact / intro-call form
   endpoints.newsletter  — receives newsletter sign-ups

   While an endpoint is null the matching form still validates and renders,
   and tells the visitor to email us instead. Set the URL and the form starts
   POSTing JSON:

     { form, lang, page, submittedAt, fields: { ... } }

   Any endpoint that accepts a JSON POST works (a serverless function, a
   form service, an n8n / Make / Zapier webhook). */
window.SITE_CONFIG = {
  endpoints: {
    contact: null,
    newsletter: null
  },
  // Fallback address shown, and used for mailto links, while an endpoint is
  // not connected yet.
  email: "info@neseatasoy.com"
};
