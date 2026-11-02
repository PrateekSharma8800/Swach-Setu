/* =========================================================
   WasteWise – Shared Script (main.js)
   ---------------------------------------------------------
   Linked on EVERY page. It handles:
   1. Mobile menu (hamburger) open / close
   2. Highlighting the nav link of the current page
   3. Navbar shadow after scrolling
   4. Fade-in animation for elements with class "reveal"
   5. Current year in the footer
   ========================================================= */

// Wait until the HTML is fully loaded before running our code
document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  highlightActiveLink();
  setupNavbarShadow();
  setupRevealAnimation();
  setFooterYear();
});


/* ---------- 1. Mobile menu ---------- */
function setupMobileMenu() {
  const toggleButton = document.querySelector(".navbar__toggle");
  const linkList = document.querySelector(".navbar__links");

  // Stop if this page has no navbar (safety check)
  if (!toggleButton || !linkList) return;

  // Open / close the menu when the hamburger is clicked
  toggleButton.addEventListener("click", function () {
    const isOpen = linkList.classList.toggle("is-open");
    toggleButton.classList.toggle("is-open", isOpen);
    // Tell screen readers whether the menu is open
    toggleButton.setAttribute("aria-expanded", isOpen);
  });

  // Close the menu after a link is clicked (useful on phones)
  linkList.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      linkList.classList.remove("is-open");
      toggleButton.classList.remove("is-open");
      toggleButton.setAttribute("aria-expanded", "false");
    });
  });
}


/* ---------- 2. Active link ----------
   Compares each link's file name with the current page's file name. */
function highlightActiveLink() {
  // e.g. ".../WasteWise/quiz.html" → "quiz.html"
  let currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "") currentPage = "index.html"; // site root

  document.querySelectorAll(".navbar__link").forEach(function (link) {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}


/* ---------- 3. Navbar shadow on scroll ---------- */
function setupNavbarShadow() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  window.addEventListener("scroll", function () {
    // Add the class when scrolled more than 10px from the top
    navbar.classList.toggle("is-scrolled", window.scrollY > 10);
  });
}


/* ---------- 4. Reveal on scroll ----------
   IntersectionObserver tells us when an element enters the screen. */
function setupRevealAnimation() {
  const elements = document.querySelectorAll(".reveal");

  // Older browsers: just show everything
  if (!("IntersectionObserver" in window)) {
    elements.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(function (el) { observer.observe(el); });
}


/* ---------- 5. Footer year ---------- */
function setFooterYear() {
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}
