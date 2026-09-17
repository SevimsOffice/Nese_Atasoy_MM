/* Form handling for every [data-form] on the page (contact, newsletter).

   The markup carries the strings, so this file stays language-agnostic:
     data-form           form name, matched against SITE_CONFIG.endpoints
     data-msg-pending    status text while the request is in flight
     data-msg-ok         status text on success
     data-msg-error      status text on failure
     data-msg-offline    status text when no endpoint is configured yet
     data-msg-required   status text when a required field is empty

   A submission posts JSON:
     { form, lang, page, submittedAt, fields: { name: value, ... } }
   so later automations (CRM, newsletter provider, autoresponder) only need a
   URL in config.js — no template changes. */
(function () {
  "use strict";

  var forms = Array.prototype.slice.call(document.querySelectorAll("form[data-form]"));
  if (!forms.length) return;

  function config() {
    return (window.SITE_CONFIG || {});
  }

  function setStatus(el, state, text, email) {
    if (!el) return;
    el.setAttribute("data-state", state);
    el.textContent = text || "";
    if (state === "offline" && email) {
      el.appendChild(document.createTextNode(" "));
      var a = document.createElement("a");
      a.href = "mailto:" + email;
      a.textContent = email;
      el.appendChild(a);
    }
  }

  function collect(form) {
    var fields = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled || el.type === "submit") return;
      if (el.type === "checkbox") { fields[el.name] = el.checked; return; }
      fields[el.name] = el.value;
    });
    return fields;
  }

  forms.forEach(function (form) {
    var status = form.querySelector(".form-status");
    var submit = form.querySelector("[type=submit]");
    var name = form.getAttribute("data-form");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Honeypot: a real visitor never fills a hidden field.
      var trap = form.querySelector("[name=website]");
      if (trap && trap.value) return;

      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        setStatus(status, "error", form.getAttribute("data-msg-required"));
        return;
      }

      var endpoints = config().endpoints || {};
      var endpoint = endpoints[name];
      if (!endpoint) {
        setStatus(status, "offline", form.getAttribute("data-msg-offline"), config().email);
        return;
      }

      var payload = {
        form: name,
        lang: document.documentElement.lang || "tr",
        page: window.location.pathname,
        submittedAt: new Date().toISOString(),
        fields: collect(form)
      };

      setStatus(status, "pending", form.getAttribute("data-msg-pending"));
      if (submit) submit.disabled = true;

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          setStatus(status, "ok", form.getAttribute("data-msg-ok"));
          form.reset();
        })
        .catch(function () {
          setStatus(status, "error", form.getAttribute("data-msg-error"));
        })
        .then(function () {
          if (submit) submit.disabled = false;
        });
    });
  });
})();
