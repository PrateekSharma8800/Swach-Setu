/* =========================================================
   WasteWise – Indore Case Study script (js/case-study.js)
   ---------------------------------------------------------
   The page is mostly static content. This file only adds one
   helpful feature:

   "On this page" highlighting – as you scroll, the link for the
   section you are reading turns green in the sticky menu.

   It uses IntersectionObserver, which tells us when a section
   crosses an imaginary line near the top of the screen.
   (The fade-in animations come from js/main.js.)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  setupSectionHighlight();
});

function setupSectionHighlight() {
  const links = document.querySelectorAll(".toc__link");
  if (links.length === 0 || !("IntersectionObserver" in window)) return;

  // Find the section each link points to, e.g. href="#workflow" → <section id="workflow">
  const sections = [];
  links.forEach(function (link) {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) sections.push(section);
  });

  // Turns one link green and the rest back to normal
  function setActive(id) {
    links.forEach(function (link) {
      const isActive = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
        // On phones the menu scrolls sideways: keep the active link visible
        link.scrollIntoView({ block: "nearest", inline: "nearest" });
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // rootMargin "-30% 0px -60% 0px" means: only count a section as
  // "being read" when it is in a band 30%–40% down the screen.
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  sections.forEach(function (section) { observer.observe(section); });
}
