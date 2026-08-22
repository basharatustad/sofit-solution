(function () {
  "use strict";

  const body = document.body;
  const nav = document.querySelector("nav");
  const links = document.querySelector(".links");

  if (!document.querySelector(".skip-link")) {
    const skipLink = document.createElement("a");
    skipLink.className = "skip-link";
    skipLink.href = "#main";
    skipLink.textContent = "Skip to content";
    body.prepend(skipLink);
  }

  const main =
    document.querySelector("main") || document.querySelector("section");
  if (main && !main.id) main.id = "main";

  if (links) {
    const aboutLink = Array.from(links.children).find(function (link) {
      return link.getAttribute("href") === "about.html";
    });

    [
      { href: "blog.html", label: "Blog" },
      { href: "resources.html", label: "Resources" },
    ].forEach(function (item) {
      if (!links.querySelector('a[href="' + item.href + '"]')) {
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        links.insertBefore(link, aboutLink || null);
      }
    });

    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const articlePages = [
      "blog-api-led-integration.html",
      "blog-multicloud-foundations.html",
      "blog-biztalk-modernisation.html",
    ];

    Array.from(links.querySelectorAll("a")).forEach(function (link) {
      const href = link.getAttribute("href");
      if (
        href === currentPage ||
        (href === "blog.html" && articlePages.includes(currentPage))
      ) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  if (nav && links && !nav.querySelector(".nav-toggle")) {
    const toggle = document.createElement("button");
    toggle.className = "nav-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "site-links");
    toggle.textContent = "Menu";
    links.id = "site-links";
    nav.insertBefore(toggle, links);

    toggle.addEventListener("click", function () {
      const open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    links.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  const revealItems = document.querySelectorAll(
    ".card, .module-card, .resource-card",
  );
  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    revealItems.forEach(function (item) {
      item.setAttribute("data-reveal", "");
    });
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -40px", threshold: 0.08 },
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }
})();
