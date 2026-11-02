/* =========================================================
   WasteWise – Home Dashboard script (js/home.js)
   Logic specific to index.html.

   Staggered animation: inside every ".stagger" group, each
   ".reveal" card gets a slightly bigger delay than the one
   before it, so the cards fade in one after another instead
   of all at once. (The fade-in itself is handled by main.js.)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  setupStaggeredCards();
});

function setupStaggeredCards() {
  const groups = document.querySelectorAll(".stagger");

  groups.forEach(function (group) {
    const cards = group.querySelectorAll(".reveal");

    cards.forEach(function (card, index) {
      // 1st card: 0s, 2nd: 0.1s, 3rd: 0.2s ... (capped at 0.6s)
      const delay = Math.min(index * 0.1, 0.6);
      card.style.setProperty("--delay", delay + "s");
    });
  });
}
