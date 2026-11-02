/* =========================================================
   WasteWise – Smart Disposal Assistant (js/assistant.js)
   ---------------------------------------------------------
   A RULE-BASED helper (not AI). It compares the words the user
   types with a fixed list of items in js/data/waste-items.js
   (WASTE_ITEMS and WASTE_CATEGORIES, loaded before this file).

   How a search works, step by step:
   1. Clean the text      "Old PLASTIC Bottles!" → "old plastic bottles"
   2. Split into words    ["old", "plastic", "bottles"]
   3. Drop filler words   ["plastic", "bottles"]     ("old" is ignored)
   4. Simple singular     ["plastic", "bottle"]      ("bottles" → "bottle")
   5. An item MATCHES if every word appears somewhere in its
      name, keywords, description or category name.
   6. Matches are SORTED by a score, so the closest names come first.
   7. The category filter is applied as well (search + filter together).
   ========================================================= */


/* ---------- Settings ---------- */

// Popular searches shown before the user types
const SUGGESTIONS = [
  { label: "Banana peel",      icon: "🍌" },
  { label: "Plastic bottle",   icon: "🍶" },
  { label: "Newspaper",        icon: "📰" },
  { label: "Battery",          icon: "🔋" },
  { label: "Old mobile phone", icon: "📱" },
  { label: "Cardboard box",    icon: "📦" },
  { label: "Old charger",      icon: "🔌" },
  { label: "Glass bottle",     icon: "🫙" }
];

// Common words that don't help identify an item
const FILLER_WORDS = ["old", "used", "empty", "broken", "a", "an", "the", "my", "of", "and", "some", "waste", "how", "to", "dispose", "throw"];


/* ---------- Current state ---------- */
let activeFilter = "all";   // selected category button
let searchText = "";        // what the user typed (cleaned)


/* ---------- HTML elements ---------- */
const searchInput   = document.getElementById("search-input");
const clearButton   = document.getElementById("search-clear");
const resetButton   = document.getElementById("reset-btn");
const filterButtons = document.querySelectorAll(".filter-btn");
const suggestionBox = document.getElementById("suggestions");
const resultsInfo   = document.getElementById("results-info");
const resultsBox    = document.getElementById("results");
const welcomeState  = document.getElementById("welcome-state");
const noResults     = document.getElementById("no-results");
const noResultsText = document.getElementById("no-results-text");


/* ---------- Start ---------- */
renderSuggestions();
addFilterCounts();
render();
setupEvents();


/* =========================================================
   HELPERS
   ========================================================= */

function getCategory(id) {
  return WASTE_CATEGORIES.find(function (c) { return c.id === id; });
}

// Makes text safe to put inside innerHTML
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Step 1: lower-case, remove punctuation (keep letters, numbers,
// spaces and hyphens), squeeze extra spaces
function cleanText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

// Steps 2–4: turn the search text into a list of useful words
function getSearchWords(text) {
  const allWords = cleanText(text).split(" ").filter(function (w) { return w !== ""; });

  let words = allWords.filter(function (w) { return !FILLER_WORDS.includes(w); });

  // If the user typed ONLY filler words (e.g. "old"), use them anyway
  if (words.length === 0) words = allWords;

  // Very simple singular form: "bottles" → "bottle", "peels" → "peel"
  // (but not "glass" → "glas")
  return words.map(function (w) {
    return w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
  });
}

// All the text we search in for one item
function getSearchableText(item) {
  const category = getCategory(item.category);
  return cleanText([
    item.name,
    item.keywords.join(" "),
    item.description,
    category.name,
    category.shortName
  ].join(" "));
}


/* =========================================================
   SEARCH: match + score
   ========================================================= */

// Step 5: does the item contain EVERY search word?
function itemMatches(item, words) {
  const text = getSearchableText(item);
  return words.every(function (word) { return text.includes(word); });
}

// Step 6: a higher score means a closer match
//   +100  the search is exactly the item's name
//   +10   for each search word found in the name
//   +6    for each search word found only in the keywords
//   +1    for each search word found only in the description/category
//   +0–5  bonus for how much of the name was matched
//         ("Glass bottles & jars" beats a longer name with the same words)
function getScore(item, words, fullText) {
  const name = cleanText(item.name);
  const nameWords = getSearchWords(item.name);
  let score = 0;

  if (name === fullText) score += 100;

  words.forEach(function (word) {
    if (name.includes(word)) score += 10;
    else if (item.keywords.some(function (k) { return k.includes(word); })) score += 6;
    else score += 1;
  });

  const matchedNameWords = nameWords.filter(function (nameWord) {
    return words.some(function (word) { return nameWord.includes(word); });
  }).length;
  score += 5 * (matchedNameWords / nameWords.length);

  return score;
}

// Returns the items to show, already filtered and sorted
function getResults() {
  // Start with the chosen category (or every item)
  let items = WASTE_ITEMS.filter(function (item) {
    return activeFilter === "all" || item.category === activeFilter;
  });

  // No search text → show the whole category in normal order
  if (searchText === "") return items;

  const words = getSearchWords(searchText);
  const fullText = cleanText(searchText);

  items = items.filter(function (item) { return itemMatches(item, words); });

  // Sort by score (biggest first). If scores are equal, keep list order.
  return items
    .map(function (item, index) { return { item: item, score: getScore(item, words, fullText), index: index }; })
    .sort(function (a, b) { return b.score - a.score || a.index - b.index; })
    .map(function (entry) { return entry.item; });
}

// Wraps every searched word found in the name with <mark>
// e.g. highlight("Plastic water bottles", ["plastic","bottle"])
//      → "<mark>Plastic</mark> water <mark>bottle</mark>s"
function highlight(text, words) {
  if (words.length === 0) return escapeHTML(text);

  const lower = text.toLowerCase();
  const marked = new Array(text.length).fill(false);   // which letters to highlight

  words.forEach(function (word) {
    let start = lower.indexOf(word);
    while (start !== -1) {
      for (let i = start; i < start + word.length; i++) marked[i] = true;
      start = lower.indexOf(word, start + 1);
    }
  });

  // Build the result letter by letter, opening/closing <mark> as needed
  let html = "";
  let open = false;
  for (let i = 0; i < text.length; i++) {
    if (marked[i] && !open) { html += "<mark>"; open = true; }
    if (!marked[i] && open) { html += "</mark>"; open = false; }
    html += escapeHTML(text[i]);
  }
  if (open) html += "</mark>";
  return html;
}


/* =========================================================
   DRAW THE PAGE
   ========================================================= */
function render() {
  const nothingChosen = searchText === "" && activeFilter === "all";

  // Before the user does anything: show the welcome message only
  if (nothingChosen) {
    welcomeState.hidden = false;
    noResults.hidden = true;
    resultsBox.innerHTML = "";
    resultsInfo.textContent = "";
    return;
  }

  welcomeState.hidden = true;
  const results = getResults();

  if (results.length === 0) {
    resultsBox.innerHTML = "";
    noResults.hidden = false;
    const inCategory = activeFilter === "all" ? "" : " in " + getCategory(activeFilter).shortName;
    noResultsText.innerHTML = "We couldn't find <strong>“" + escapeHTML(searchText) + "”</strong>" + inCategory +
      ". Try a simpler word (for example “bottle” instead of “1 litre water bottle”), check the spelling" +
      (activeFilter === "all" ? "." : ", or choose “All” categories.");
    resultsInfo.textContent = "No results";
    return;
  }

  noResults.hidden = true;
  renderResultCards(results);
  updateResultsInfo(results.length);
}

function updateResultsInfo(count) {
  let text = "Showing <strong>" + count + "</strong> " + (count === 1 ? "item" : "items");
  if (searchText !== "") text += " for “<strong>" + escapeHTML(searchText) + "</strong>”";
  if (activeFilter !== "all") text += " in <strong>" + getCategory(activeFilter).shortName + "</strong>";
  resultsInfo.innerHTML = text;
}

function renderResultCards(items) {
  const words = searchText === "" ? [] : getSearchWords(searchText);

  resultsBox.innerHTML = items.map(function (item, index) {
    const category = getCategory(item.category);
    const isBest = index === 0 && searchText !== "";

    // The warning block is only added when the item has a warning
    const warningBlock = item.warning
      ? `<div class="result-card__block result-card__block--warning">
           <h4><span aria-hidden="true">⚠️</span> Warning</h4>
           <p>${escapeHTML(item.warning)}</p>
         </div>`
      : "";

    return `
      <article class="card result-card${isBest ? " is-best" : ""}" style="--cat-color: ${category.color};">
        ${isBest ? '<span class="result-card__best">Best match</span>' : ""}
        <div class="result-card__head">
          <span class="result-card__icon" aria-hidden="true">${item.icon}</span>
          <div>
            <h3 class="result-card__name">${highlight(item.name, words)}</h3>
            <button type="button" class="badge" data-filter="${category.id}"
                    title="Show all ${category.shortName} items">${category.name}</button>
          </div>
        </div>

        <p class="result-card__desc">${escapeHTML(item.description)}</p>

        <div class="result-card__block result-card__block--dispose">
          <h4><span aria-hidden="true">✅</span> How to dispose</h4>
          <p>${escapeHTML(item.advice)}</p>
        </div>

        ${warningBlock}

        <div class="result-card__block result-card__block--tip">
          <h4><span aria-hidden="true">💡</span> Tip</h4>
          <p>${escapeHTML(item.tip)}</p>
        </div>
      </article>`;
  }).join("");
}

function renderSuggestions() {
  suggestionBox.innerHTML = SUGGESTIONS.map(function (s) {
    return `<button type="button" class="suggestion" data-query="${s.label}">
              <span aria-hidden="true">${s.icon}</span> ${s.label}
            </button>`;
  }).join("");
}

// Adds item counts to the filter buttons, e.g. "Wet 8"
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
   ACTIONS
   ========================================================= */
function setSearch(text) {
  searchInput.value = text;
  searchText = text.trim();
  clearButton.hidden = text === "";
  render();
}

function setFilter(filter) {
  activeFilter = filter;
  filterButtons.forEach(function (button) {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive);
  });
  render();
}

function clearAll() {
  setFilter("all");
  setSearch("");
  searchInput.focus();
}


/* =========================================================
   EVENTS
   ========================================================= */
function setupEvents() {
  // Results update on every key press
  searchInput.addEventListener("input", function () {
    searchText = searchInput.value.trim();
    clearButton.hidden = searchInput.value === "";
    render();
  });

  // Escape key inside the search box clears it
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setSearch("");
  });

  clearButton.addEventListener("click", function () {
    setSearch("");
    searchInput.focus();
  });

  resetButton.addEventListener("click", clearAll);

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setFilter(button.dataset.filter);
    });
  });

  // Suggested item: search for it across all categories
  suggestionBox.addEventListener("click", function (event) {
    const chip = event.target.closest(".suggestion");
    if (!chip) return;
    setFilter("all");
    setSearch(chip.dataset.query);
    resultsInfo.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Category badge on a result card → filter by that category
  resultsBox.addEventListener("click", function (event) {
    const badge = event.target.closest(".badge");
    if (!badge) return;
    setFilter(badge.dataset.filter);
  });
}
