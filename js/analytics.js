/* =========================================================
   WasteWise – Waste Analytics script (js/analytics.js)
   ---------------------------------------------------------
   Needs (loaded before this file in analytics.html):
     • js/data/waste-items.js → WASTE_CATEGORIES (names, icons, colours)
     • js/storage.js          → Storage.load

   HOW THE DATA GETS HERE
   The Waste Calculator (js/calculator.js) saves every valid
   calculation in localStorage under the key below:

     wasteWiseCalculatorData = {
       version: 1,
       latest:  { savedAt, unit, quantities, percentages, totals },
       history: [ ...older records... ]
     }

   This page only READS "latest". It never changes the data.

   What this file does:
   1. Loads and checks the saved calculation
   2. Fills the summary cards
   3. Draws the donut chart (SVG)
   4. Draws the horizontal bar chart (SVG)
   5. Builds the six category cards
   6. Creates rule-based insights
   7. Updates itself when new data is saved
   ========================================================= */


/* ---------- Settings ---------- */
const STORAGE_KEY = "wasteWiseCalculatorData";   // must match calculator.js


/* ---------- HTML elements ---------- */
const emptyState   = document.getElementById("empty-state");
const emptyMessage = document.getElementById("empty-message");
const dashboard    = document.getElementById("dashboard");
const reloadButton = document.getElementById("reload-btn");
const donutBox     = document.getElementById("donut-chart");
const donutLegend  = document.getElementById("donut-legend");
const barChartBox  = document.getElementById("bar-chart");
const categoryBox  = document.getElementById("category-stats");
const insightsList = document.getElementById("insights-list");

// The record currently shown (kept so the bar chart can be
// redrawn when the window is resized)
let currentRecord = null;


/* ---------- Start ---------- */
loadAndRender();
setupEvents();


/* =========================================================
   SMALL HELPERS
   ========================================================= */

// Rounds to 2 decimals, e.g. 53.5714 → 53.57
function round2(number) {
  return Math.round(number * 100) / 100;
}

// Formats kg with at most 2 decimals, e.g. 19.6 → "19.6"
function formatKg(number) {
  return number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// Formats a percentage with 1 decimal, e.g. 53.57 → "53.6%"
function formatPercent(number) {
  return number.toFixed(1) + "%";
}

// Formats the saved date, e.g. "2 Nov 2026, 4:30 pm"
function formatDate(isoText) {
  const date = new Date(isoText);
  if (isNaN(date)) return "an unknown date";
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

// Joins names nicely: ["A"] → "A", ["A","B"] → "A and B", ["A","B","C"] → "A, B and C"
function joinNames(names) {
  if (names.length <= 1) return names.join("");
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}


/* =========================================================
   1. LOAD AND CHECK THE SAVED CALCULATION
   Returns a clean "view" object, or null if there is no data.
   ========================================================= */
function loadLatestRecord() {
  const data = Storage.load(STORAGE_KEY, null);

  if (!data || !data.latest) {
    return { status: "empty" };
  }

  const latest = data.latest;
  const quantities = {};
  let total = 0;

  // Check every category: must be a number, 0 or more
  for (const category of WASTE_CATEGORIES) {
    const kg = latest.quantities ? Number(latest.quantities[category.id]) : NaN;
    if (!Number.isFinite(kg) || kg < 0) {
      return { status: "invalid" };
    }
    quantities[category.id] = kg;
    total += kg;
  }

  // Zero waste → nothing to chart (also avoids dividing by zero)
  if (total <= 0) {
    return { status: "zero" };
  }

  // Percentages are re-calculated with the same formula as the
  // calculator, so the page never depends on a damaged value.
  const percentages = {};
  WASTE_CATEGORIES.forEach(function (category) {
    percentages[category.id] = round2((quantities[category.id] / total) * 100);
  });

  return {
    status: "ok",
    savedAt: latest.savedAt,
    quantities: quantities,
    percentages: percentages,
    totals: {
      daily:   round2(total),
      weekly:  round2(total * 7),
      monthly: round2(total * 30)
    }
  };
}


/* =========================================================
   MAIN: decide between empty state and dashboard
   ========================================================= */
function loadAndRender() {
  const record = loadLatestRecord();

  if (record.status !== "ok") {
    showEmptyState(record.status);
    return;
  }

  currentRecord = record;
  emptyState.hidden = true;
  dashboard.hidden = false;

  document.getElementById("saved-date").textContent = formatDate(record.savedAt);
  renderSummary(record);
  renderDonutChart(record);
  renderBarChart(record);
  renderCategoryCards(record);
  renderInsights(record);
}

function showEmptyState(status) {
  currentRecord = null;
  dashboard.hidden = true;
  emptyState.hidden = false;

  // A different message if data exists but can't be used
  if (status === "zero") {
    emptyMessage.textContent = "Your saved calculation has no waste quantities above 0 kg, so there is nothing to analyse yet. Please enter your waste quantities in the Waste Calculator.";
  } else if (status === "invalid") {
    emptyMessage.textContent = "Your saved calculation could not be read. Please calculate your waste again in the Waste Calculator.";
  }
  // status "empty" keeps the default message written in the HTML
}


/* =========================================================
   2. SUMMARY CARDS
   ========================================================= */

// Returns every category that has the biggest quantity
// (more than one if there is a tie)
function getLargestCategories(record) {
  let max = 0;
  WASTE_CATEGORIES.forEach(function (c) {
    max = Math.max(max, record.quantities[c.id]);
  });
  return WASTE_CATEGORIES.filter(function (c) {
    return record.quantities[c.id] === max;
  });
}

function renderSummary(record) {
  document.getElementById("daily-total").textContent   = formatKg(record.totals.daily);
  document.getElementById("weekly-total").textContent  = formatKg(record.totals.weekly);
  document.getElementById("monthly-total").textContent = formatKg(record.totals.monthly);

  const largest = getLargestCategories(record);
  const first = largest[0];
  const card = document.getElementById("largest-card");
  card.style.setProperty("--cat-color", first.color);

  if (largest.length === 1) {
    document.getElementById("largest-name").innerHTML =
      '<span aria-hidden="true">' + first.icon + "</span> " + first.shortName;
    document.getElementById("largest-sub").textContent =
      formatKg(record.quantities[first.id]) + " kg/day · " + formatPercent(record.percentages[first.id]);
  } else {
    document.getElementById("largest-name").textContent =
      largest.map(function (c) { return c.shortName; }).join(" & ");
    document.getElementById("largest-sub").textContent =
      "Tied at " + formatKg(record.quantities[first.id]) + " kg/day each";
  }
}


/* =========================================================
   3. DONUT CHART (SVG)
   ---------------------------------------------------------
   The trick: a circle with radius 15.915 has a circumference
   of exactly 100 (2 × π × 15.915 ≈ 100). So a category with
   40% simply draws 40 units of the circle's outline.

   stroke-dasharray="40 60"  → draw 40, leave 60 empty
   stroke-dashoffset         → where along the circle to start

   We draw one circle per category, each starting where the
   previous one ended.

   Note: colours like "var(--wet)" only work inside style="",
   not in SVG attributes such as stroke="", so we use style.
   ========================================================= */
function renderDonutChart(record) {
  const RADIUS = 15.915;
  const used = WASTE_CATEGORIES.filter(function (c) { return record.quantities[c.id] > 0; });
  const gap = used.length > 1 ? 0.6 : 0;   // small white gap between slices

  let segments = "";
  let alreadyDrawn = 0;   // how much of the circle (in %) is already used

  used.forEach(function (category) {
    const percent = record.percentages[category.id];
    const length = Math.max(percent - gap, 0.2);   // keep tiny slices visible

    // 25 moves the start to 12 o'clock (a circle normally starts at 3 o'clock)
    const offset = 25 - alreadyDrawn;

    segments += `
      <circle class="donut__segment" data-id="${category.id}"
              cx="21" cy="21" r="${RADIUS}" fill="none" stroke-width="5.5"
              style="stroke: ${category.color};"
              stroke-dasharray="${length} ${100 - length}"
              stroke-dashoffset="${offset}">
        <title>${category.name}: ${formatPercent(percent)}</title>
      </circle>`;

    alreadyDrawn += percent;
  });

  // Text description for screen readers
  const description = WASTE_CATEGORIES.map(function (c) {
    return c.name + " " + formatPercent(record.percentages[c.id]);
  }).join(", ");

  donutBox.innerHTML = `
    <svg viewBox="0 0 42 42" role="img" aria-labelledby="donut-title donut-desc">
      <title id="donut-title">Donut chart of waste share by category</title>
      <desc id="donut-desc">Total ${formatKg(record.totals.daily)} kg per day. ${description}.</desc>
      <circle class="donut__track" cx="21" cy="21" r="${RADIUS}" fill="none" stroke-width="5.5"></circle>
      ${segments}
      <text x="21" y="20.5" class="donut__total">${formatKg(record.totals.daily)}</text>
      <text x="21" y="25" class="donut__unit">kg / day</text>
    </svg>`;

  // Legend: every category, including those at 0%
  donutLegend.innerHTML = WASTE_CATEGORIES.map(function (c) {
    const zero = record.quantities[c.id] === 0 ? " is-zero" : "";
    return `
      <li class="legend__item${zero}" data-id="${c.id}" style="--cat-color: ${c.color};">
        <span class="legend__swatch" aria-hidden="true"></span>
        <span class="legend__name">${c.shortName}</span>
        <span class="legend__value">${formatPercent(record.percentages[c.id])}</span>
      </li>`;
  }).join("");
}


/* =========================================================
   4. HORIZONTAL BAR CHART (SVG)
   ---------------------------------------------------------
   The SVG is drawn at the real width of its box, so text stays
   readable on phones. When the window is resized we redraw it.

   Each bar's length = (quantity ÷ axis maximum) × available width
   ========================================================= */

// Picks a "nice" axis maximum, e.g. 1.37 → 2, 3.1 → 4, 7.2 → 8.
// The steps divide evenly by 4, so the 5 axis numbers stay simple.
function niceMax(value) {
  if (value <= 0) return 1;                       // safety: avoid dividing by 0
  const power = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 2, 4, 6, 8, 10];
  for (const step of steps) {
    if (value <= step * power) return step * power;
  }
  return 10 * power;
}

function renderBarChart(record) {
  const width = barChartBox.clientWidth || 500;   // real width in pixels
  const labelWidth = width < 420 ? 92 : 120;       // space for category names
  const valueSpace = 64;                           // space for "1.25 kg" after the bar
  const rowHeight = 46;
  const barHeight = 22;
  const top = 8;
  const axisHeight = 28;
  const chartWidth = Math.max(width - labelWidth - valueSpace, 40);
  const height = top + WASTE_CATEGORIES.length * rowHeight + axisHeight;

  let max = 0;
  WASTE_CATEGORIES.forEach(function (c) { max = Math.max(max, record.quantities[c.id]); });
  const axisMax = niceMax(max);

  // Vertical grid lines + numbers at 0, ¼, ½, ¾ and the maximum
  let grid = "";
  for (let i = 0; i <= 4; i++) {
    const x = labelWidth + (chartWidth * i) / 4;
    const tickValue = round2((axisMax * i) / 4);
    grid += `
      <line x1="${x}" y1="${top}" x2="${x}" y2="${height - axisHeight}" class="bar-chart__grid"></line>
      <text x="${x}" y="${height - 8}" class="bar-chart__tick">${formatKg(tickValue)}</text>`;
  }

  // One row per category
  let bars = "";
  WASTE_CATEGORIES.forEach(function (c, index) {
    const kg = record.quantities[c.id];
    const y = top + index * rowHeight + (rowHeight - barHeight) / 2;
    const barLength = (kg / axisMax) * chartWidth;

    bars += `
      <g class="bar-chart__row${kg === 0 ? " is-zero" : ""}">
        <text x="${labelWidth - 12}" y="${y + barHeight / 2}" class="bar-chart__label">${c.icon} ${c.shortName}</text>
        <rect x="${labelWidth}" y="${y}" width="${chartWidth}" height="${barHeight}" rx="6" class="bar-chart__track"></rect>
        <rect x="${labelWidth}" y="${y}" width="${barLength}" height="${barHeight}" rx="6" style="fill: ${c.color};" class="bar-chart__bar">
          <title>${c.name}: ${formatKg(kg)} kg per day</title>
        </rect>
        <text x="${labelWidth + barLength + 8}" y="${y + barHeight / 2}" class="bar-chart__value">${formatKg(kg)} kg</text>
      </g>`;
  });

  const description = WASTE_CATEGORIES.map(function (c) {
    return c.name + " " + formatKg(record.quantities[c.id]) + " kg";
  }).join(", ");

  barChartBox.innerHTML = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
         role="img" aria-labelledby="bar-title bar-desc">
      <title id="bar-title">Horizontal bar chart of daily waste quantity by category</title>
      <desc id="bar-desc">Kilograms per day: ${description}.</desc>
      ${grid}
      ${bars}
    </svg>
    <p class="bar-chart__axis-label">kg per day</p>`;
}


/* =========================================================
   5. CATEGORY CARDS
   ========================================================= */
function renderCategoryCards(record) {
  // Rank categories (1 = largest) so each card can show its position
  const ranked = WASTE_CATEGORIES.slice().sort(function (a, b) {
    return record.quantities[b.id] - record.quantities[a.id];
  });

  categoryBox.innerHTML = WASTE_CATEGORIES.map(function (c) {
    const kg = record.quantities[c.id];
    const percent = record.percentages[c.id];
    const rank = ranked.indexOf(c) + 1;
    const zero = kg === 0;

    return `
      <article class="card cat-stat${zero ? " is-zero" : ""}" style="--cat-color: ${c.color};">
        <div class="cat-stat__head">
          <span class="cat-stat__icon" aria-hidden="true">${c.icon}</span>
          <h3>${c.name}</h3>
          ${zero ? "" : `<span class="cat-stat__rank" title="Rank by quantity">#${rank}</span>`}
        </div>
        <div class="cat-stat__numbers">
          <p><strong>${formatKg(kg)}</strong> kg/day</p>
          <p class="cat-stat__percent">${formatPercent(percent)}</p>
        </div>
        <div class="meter" role="img" aria-label="${c.name}: ${formatPercent(percent)} of daily waste">
          <div class="meter__fill" style="width: ${percent}%;"></div>
        </div>
        ${zero ? '<p class="cat-stat__note">None recorded</p>' : ""}
      </article>`;
  }).join("");
}


/* =========================================================
   6. RULE-BASED INSIGHTS
   ---------------------------------------------------------
   Plain "if" rules – no AI. Each rule checks the user's
   numbers and, if it applies, adds one message.
   ========================================================= */
function renderInsights(record) {
  const q = record.quantities;
  const p = record.percentages;
  const insights = [];   // each item: { icon, type, text }

  // Rule 1: largest category (handles ties)
  const largest = getLargestCategories(record);
  if (largest.length === 1) {
    insights.push({
      icon: "🏆", type: "info",
      text: `<strong>${largest[0].name}</strong> is your largest category: ${formatKg(q[largest[0].id])} kg/day, which is <strong>${formatPercent(p[largest[0].id])}</strong> of your daily waste.`
    });
  } else {
    insights.push({
      icon: "🏆", type: "info",
      text: `${joinNames(largest.map(function (c) { return "<strong>" + c.name + "</strong>"; }))} are tied as your largest categories at ${formatKg(q[largest[0].id])} kg/day each.`
    });
  }

  // Rule 2: how many categories were used
  const used = WASTE_CATEGORIES.filter(function (c) { return q[c.id] > 0; });
  if (used.length === 1) {
    insights.push({
      icon: "🔍", type: "info",
      text: "All of your waste is recorded in one category. Use the <a href=\"segregation.html\">Segregation Guide</a> to check whether some items belong in other categories."
    });
  } else {
    insights.push({
      icon: "📋", type: "info",
      text: `You recorded waste in <strong>${used.length} of 6</strong> categories.`
    });
  }

  // Rule 3: wet waste → composting
  if (q.wet > 0) {
    const extra = p.wet >= 50 ? " More than half of your waste is wet waste, so composting could handle a large part of it." : "";
    insights.push({
      icon: "🌱", type: "tip",
      text: `You produce ${formatKg(q.wet)} kg of wet waste per day. Kitchen scraps like peels and tea leaves can be composted at home or handed over separately for composting.${extra}`
    });
  }

  // Rule 4: dry waste or plastic → recycling
  if (q.dry > 0 || q.plastic > 0) {
    const parts = [];
    if (q.dry > 0) parts.push(formatKg(q.dry) + " kg of dry waste");
    if (q.plastic > 0) parts.push(formatKg(q.plastic) + " kg of plastic");
    insights.push({
      icon: "♻️", type: "tip",
      text: `You produce ${joinNames(parts)} per day. Keep these clean and dry and send them through authorised recycling collection or a local scrap dealer.`
    });
  }

  // Rule 5: plastic → reduce
  if (q.plastic > 0) {
    insights.push({
      icon: "🛍️", type: "tip",
      text: `Plastic makes up ${formatPercent(p.plastic)} of your waste. Carrying a cloth bag and a refillable bottle are simple ways to reduce it.`
    });
  }

  // Rule 6: e-waste → authorised channels
  if (q.ewaste > 0) {
    insights.push({
      icon: "🔌", type: "warning",
      text: "You recorded e-waste. Give it to an authorised e-waste collection centre or a brand take-back programme. Never put it in household bins or burn it."
    });
  }

  // Rule 7: hazardous → keep separate
  if (q.hazardous > 0) {
    insights.push({
      icon: "☣️", type: "warning",
      text: "You recorded hazardous waste. Keep it sealed in its original container, separate from other waste, and follow your local authorised collection instructions."
    });
  }

  // Rule 8: sanitary → wrap safely
  if (q.sanitary > 0) {
    insights.push({
      icon: "🩹", type: "tip",
      text: "Wrap sanitary waste securely in paper before disposal and follow your municipal collection rules, to protect waste workers."
    });
  }

  insightsList.innerHTML = insights.map(function (item) {
    return `
      <li class="insight insight--${item.type}">
        <span class="insight__icon" aria-hidden="true">${item.icon}</span>
        <p>${item.text}</p>
      </li>`;
  }).join("");
}


/* =========================================================
   7. KEEPING THE PAGE UP TO DATE
   ========================================================= */
function setupEvents() {
  // "Reload analytics" button: read localStorage again
  reloadButton.addEventListener("click", function () {
    loadAndRender();
    reloadButton.classList.add("is-done");
    setTimeout(function () { reloadButton.classList.remove("is-done"); }, 1200);
  });

  // If the calculator is open in ANOTHER tab and saves new data,
  // the browser fires a "storage" event in this tab.
  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY || event.key === null) {
      loadAndRender();
    }
  });

  // When the user comes back with the browser's Back button, some
  // browsers show a cached copy of the page – reload the data then.
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) loadAndRender();
  });

  // Redraw the bar chart when the window size changes, so it always
  // fits its box. (Waits 150 ms after resizing stops – "debounce".)
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (currentRecord) renderBarChart(currentRecord);
    }, 150);
  });

  // Legend hover: highlight the matching donut slice
  donutLegend.addEventListener("mouseover", function (event) {
    const item = event.target.closest(".legend__item");
    highlightSlice(item ? item.dataset.id : null);
  });
  donutLegend.addEventListener("mouseleave", function () {
    highlightSlice(null);
  });
}

function highlightSlice(id) {
  donutBox.classList.toggle("has-highlight", id !== null);
  donutBox.querySelectorAll(".donut__segment").forEach(function (segment) {
    segment.classList.toggle("is-active", segment.dataset.id === id);
  });
}
