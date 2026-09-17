/* Header behaviour: dropdown menus and the mobile navigation drawer. */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  if (!header) return;

  var items = Array.prototype.slice.call(header.querySelectorAll(".nav__item[data-menu]"));
  var desktop = window.matchMedia("(min-width: 881px)");

  function close(item) { item.setAttribute("data-open", "false"); }
  function closeAll(except) {
    items.forEach(function (item) { if (item !== except) close(item); });
  }

  items.forEach(function (item) {
    var trigger = item.querySelector(".nav__link");
    if (!trigger) return;

    item.addEventListener("mouseenter", function () {
      if (!desktop.matches) return;
      closeAll(item);
      item.setAttribute("data-open", "true");
    });
    item.addEventListener("mouseleave", function () {
      if (!desktop.matches) return;
      close(item);
    });

    trigger.addEventListener("click", function (event) {
      // The trigger is also a real link to the section; on touch and on the
      // mobile layout the first tap opens the panel instead of navigating.
      if (desktop.matches && item.getAttribute("data-open") === "true") return;
      event.preventDefault();
      var open = item.getAttribute("data-open") === "true";
      closeAll(item);
      item.setAttribute("data-open", open ? "false" : "true");
      trigger.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });

  document.addEventListener("click", function (event) {
    if (!header.contains(event.target)) closeAll(null);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAll(null);
      header.setAttribute("data-nav-open", "false");
    }
  });

  var toggle = header.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = header.getAttribute("data-nav-open") === "true";
      header.setAttribute("data-nav-open", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }
})();
