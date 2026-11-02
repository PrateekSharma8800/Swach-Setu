/* =========================================================
   SwachSetu – Segregation Guide script (js/segregation.js)
   ---------------------------------------------------------
   Uses WASTE_CATEGORIES and WASTE_ITEMS from
   js/data/waste-items.js (loaded before this file).

   What this file does:
   1. Builds the six category cards
   2. Builds the item cards
   3. Search box  – filters items as you type
   4. Filter buttons – show one category at a time
   Search and filter work TOGETHER, e.g. "bottle" + "Plastic".
   ========================================================= */


/* ---------- Current state of the explorer ---------- */
let activeFilter = "all";   // which category button is selected
let searchText = "";        // what the user typed (lower-case)


/* ---------- Grab the HTML elements we need ---------- */
const categoryGrid = document.getElementById("category-grid");
const itemGrid     = document.getElementById("item-grid");
const searchInput  = document.getElementById("search-input");
const clearButton  = document.getElementById("search-clear");
const resultsInfo  = document.getElementById("results-info");
const emptyState   = document.getElementById("empty-state");
const resetButton  = document.getElementById("reset-btn");
const filterButtons = document.querySelectorAll(".filter-btn");


/* ---------- Start ---------- */
renderCategoryCards();
addFilterCounts();
renderItems();
setupEvents();


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

// Finds a category object by its id, e.g. getCategory("wet")
function getCategory(id) {
  return WASTE_CATEGORIES.find(function (category) {
    return category.id === id;
  });
}

// Makes text safe to put inside innerHTML
// (so characters like < or & can't break the page)
function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Wraps the part of "text" that matches the search in <mark>
// e.g. highlight("Milk pouches", "milk") → "<mark>Milk</mark> pouches"
function highlight(text, query) {
  const safeText = escapeHTML(text);
  if (query === "") return safeText;

  const start = text.toLowerCase().indexOf(query);
  if (start === -1) return safeText;

  const end = start + query.length;
  return escapeHTML(text.slice(0, start)) +
         "<mark>" + escapeHTML(text.slice(start, end)) + "</mark>" +
         escapeHTML(text.slice(end));
}


/* =========================================================
   1. CATEGORY CARDS
   ========================================================= */
function renderCategoryCards() {
  let html = "";

  WASTE_CATEGORIES.forEach(function (category) {
    // Turn the examples array into small "chip" labels
    const chips = category.examples.map(function (example) {
      return '<li class="chip">' + example + "</li>";
    }).join("");

    html += `
      <article class="card card--hover category-card reveal" style="--cat-color: ${category.color};">
        <div class="category-card__head">
          <span class="category-card__icon" aria-hidden="true">${category.icon}</span>
          <h3>${category.name}</h3>
        </div>

        <div class="category-card__body">
          <div>
            <span class="category-card__label">Examples</span>
            <ul class="chips">${chips}</ul>
          </div>

          <div>
            <span class="category-card__label">How to dispose</span>
            <p>${category.disposal}</p>
          </div>

          <div class="category-card__why">
            <span class="category-card__label">Why it matters</span>
            <p>${category.importance}</p>
          </div>

          <button type="button" class="category-card__btn" data-filter="${category.id}">
            View ${category.shortName.toLowerCase()} items
            <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </article>`;
  });

  categoryGrid.innerHTML = html;
}


/* =========================================================
   2. ITEM CARDS
   ========================================================= */

// Returns only the items that match the current filter AND search
function getVisibleItems() {
  return WASTE_ITEMS.filter(function (item) {
    // Check 1: category filter
    const matchesFilter = activeFilter === "all" || item.category === activeFilter;

    // Check 2: search text (looks in name, keywords and category name)
    const category = getCategory(item.category);
    const searchableText = (
      item.name + " " + item.keywords.join(" ") + " " + category.name
    ).toLowerCase();
    const matchesSearch = searchableText.includes(searchText);

    return matchesFilter && matchesSearch;
  });
}

// Draws the item cards on the page
function renderItems() {
  const items = getVisibleItems();
  let html = "";

  items.forEach(function (item) {
    const category = getCategory(item.category);

    html += `
      <article class="card item-card" style="--cat-color: ${category.color};">
        <div class="item-card__top">
          <span class="item-card__icon" aria-hidden="true">${item.icon}</span>
          <h3 class="item-card__name">${highlight(item.name, searchText)}</h3>
        </div>
        <button type="button" class="badge" data-filter="${category.id}"
                title="Show all ${category.shortName} items">
          ${category.shortName}
        </button>
        <p class="item-card__advice"><strong>How to dispose:</strong> ${escapeHTML(item.advice)}</p>
      </article>`;
  });

  itemGrid.innerHTML = html;
  updateResultsInfo(items.length);

  // Show the "No items found" box when the list is empty
  emptyState.hidden = items.length > 0;
}

// Updates the "Showing X of Y items" line
function updateResultsInfo(count) {
  let text = "Showing <strong>" + count + "</strong> of " + WASTE_ITEMS.length + " items";

  if (activeFilter !== "all") {
    text += " in <strong>" + getCategory(activeFilter).shortName + "</strong>";
  }
  if (searchText !== "") {
    text += " matching “<strong>" + escapeHTML(searchText) + "</strong>”";
  }

  resultsInfo.innerHTML = text;
}

// Adds the number of items to each filter button, e.g. "Wet 8"
function addFilterCounts() {
  filterButtons.forEach(function (button) {
    const filter = button.dataset.filter;
    const count = filter === "all"
      ? WASTE_ITEMS.length
      : WASTE_ITEMS.filter(function (item) { return item.category === filter; }).length;

    const bubble = document.createElement("span");
    bubble.className = "filter-btn__count";
    bubble.textContent = count;
    button.appendChild(bubble);
  });
}


/* =========================================================
   3 & 4. SEARCH AND FILTER EVENTS
   ========================================================= */

// Selects a filter button and redraws the items
function setFilter(filter) {
  activeFilter = filter;

  filterButtons.forEach(function (button) {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive);
  });

  renderItems();
}

// Scrolls smoothly to the item explorer
function scrollToExplorer() {
  document.getElementById("explorer").scrollIntoView({ behavior: "smooth" });
}

function setupEvents() {
  // Typing in the search box
  searchInput.addEventListener("input", function () {
    searchText = searchInput.value.trim().toLowerCase();
    clearButton.hidden = searchInput.value === "";
    renderItems();
  });

  // The ✕ button inside the search box
  clearButton.addEventListener("click", function () {
    searchInput.value = "";
    searchText = "";
    clearButton.hidden = true;
    renderItems();
    searchInput.focus();
  });

  // Filter buttons in the toolbar
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setFilter(button.dataset.filter);
    });
  });

  // "View … items" buttons on the category cards:
  // select that category and jump down to the item list
  categoryGrid.addEventListener("click", function (event) {
    const button = event.target.closest(".category-card__btn");
    if (!button) return;
    setFilter(button.dataset.filter);
    scrollToExplorer();
  });

  // Category badges on item cards: filter by that category.
  // (One listener on the grid handles every badge – this is
  //  called "event delegation" and works for redrawn cards too.)
  itemGrid.addEventListener("click", function (event) {
    const badge = event.target.closest(".badge");
    if (!badge) return;
    setFilter(badge.dataset.filter);
  });

  // "Reset search" button in the empty state
  resetButton.addEventListener("click", function () {
    searchInput.value = "";
    searchText = "";
    clearButton.hidden = true;
    setFilter("all");
    searchInput.focus();
  });
}
