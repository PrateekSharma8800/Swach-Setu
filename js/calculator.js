/* =========================================================
   SwachSetu – Waste Calculator script (js/calculator.js)
   ---------------------------------------------------------
   Needs (loaded before this file in calculator.html):
     • js/data/waste-items.js → WASTE_CATEGORIES (names, icons, colours)
     • js/storage.js          → Storage.save / Storage.load / Storage.remove

   What this file does:
   1. Creates the six input fields
   2. Reads and validates what the user typed
   3. Calculates daily, weekly, monthly totals and percentages
   4. Shows the results dashboard
   5. Saves the result in localStorage (for Phase 5 Analytics)
   6. Shows the last saved result when the page is opened again
   ========================================================= */


/* ---------- Settings (change these in one place) ---------- */
const STORAGE_KEY = "wasteWiseCalculatorData";
const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;
const MAX_KG_PER_CATEGORY = 100;  // sanity limit for one household, per day
const HISTORY_LIMIT = 30;         // how many past calculations we keep


/* ---------- HTML elements ---------- */
const form          = document.getElementById("calc-form");
const inputGrid     = document.getElementById("input-grid");
const formAlert     = document.getElementById("form-alert");
const resultsSection = document.getElementById("results");
const savedInfo     = document.getElementById("saved-info");
const deleteButton  = document.getElementById("delete-btn");
const breakdownList = document.getElementById("breakdown-list");
const insightsList  = document.getElementById("insights-list");


/* ---------- Start ---------- */
createInputFields();
setupEvents();
showSavedResult();


/* =========================================================
   SMALL HELPERS
   ========================================================= */

// Rounds a number to 2 decimal places, e.g. 1.23456 → 1.23
// (Also fixes JavaScript float issues like 0.1 + 0.2 = 0.30000000000000004)
function round2(number) {
  return Math.round(number * 100) / 100;
}

// Formats kg for display, e.g. 262.5 → "262.5", 1234 → "1,234"
function formatKg(number) {
  return number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// Formats a saved date, e.g. "2 Nov 2026, 4:30 pm"
function formatDate(isoText) {
  return new Date(isoText).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

// Finds a category's details by id, e.g. getCategory("wet")
function getCategory(id) {
  return WASTE_CATEGORIES.find(function (category) {
    return category.id === id;
  });
}


/* =========================================================
   1. CREATE THE SIX INPUT FIELDS
   ========================================================= */
function createInputFields() {
  let html = "";

  WASTE_CATEGORIES.forEach(function (category) {
    // type="number"   → number keyboard on phones, rejects most letters
    // min="0"         → no negative values
    // step="any"      → allows decimals like 0.5 or 1.25
    // inputmode       → shows a decimal keypad on mobile
    html += `
      <div class="field" style="--cat-color: ${category.color};">
        <label for="input-${category.id}" class="field__label">
          <span class="field__icon" aria-hidden="true">${category.icon}</span>
          ${category.name}
        </label>
        <div class="field__control">
          <input type="number" id="input-${category.id}" name="${category.id}"
                 class="field__input" min="0" max="${MAX_KG_PER_CATEGORY}" step="any"
                 inputmode="decimal" placeholder="0" aria-describedby="error-${category.id}">
          <span class="field__unit">kg/day</span>
        </div>
        <p class="field__error" id="error-${category.id}"></p>
      </div>`;
  });

  inputGrid.innerHTML = html;
}


/* =========================================================
   2. READ AND VALIDATE THE INPUTS
   Returns: { values: { wet: 1.5, dry: 0, ... }, hasErrors: true/false }
   ========================================================= */
function readInputs() {
  const values = {};
  let hasErrors = false;

  WASTE_CATEGORIES.forEach(function (category) {
    const input = document.getElementById("input-" + category.id);
    const text = input.value.trim();
    let error = "";

    // validity.badInput is true when the browser couldn't read the
    // text as a number (e.g. "abc" or "1..2")
    if (input.validity.badInput) {
      error = "Please enter a valid number.";
    } else if (text === "") {
      values[category.id] = 0;          // empty field counts as 0 kg
    } else {
      const number = Number(text);

      if (!Number.isFinite(number)) {
        error = "Please enter a valid number.";
      } else if (number < 0) {
        error = "Quantity cannot be negative.";
      } else if (number > MAX_KG_PER_CATEGORY) {
        error = "That seems too high. Enter up to " + MAX_KG_PER_CATEGORY + " kg per day.";
      } else {
        values[category.id] = number;
      }
    }

    if (error !== "") {
      showFieldError(input, error);
      hasErrors = true;
    }
  });

  return { values: values, hasErrors: hasErrors };
}

function showFieldError(input, message) {
  input.classList.add("is-invalid");
  input.setAttribute("aria-invalid", "true");
  document.getElementById("error-" + input.name).textContent = message;
}

function clearFieldError(input) {
  input.classList.remove("is-invalid");
  input.removeAttribute("aria-invalid");
  document.getElementById("error-" + input.name).textContent = "";
}

function clearAllErrors() {
  inputGrid.querySelectorAll(".field__input").forEach(clearFieldError);
  hideAlert();
}

function showAlert(message) {
  formAlert.textContent = message;
  formAlert.hidden = false;
}

function hideAlert() {
  formAlert.textContent = "";
  formAlert.hidden = true;
}


/* =========================================================
   3. THE CALCULATION
   Input:  { wet: 1.5, dry: 0.5, ... }   (kg per day)
   Output: one "calculation record" – the same object we save
   ========================================================= */
function calculateWaste(values) {
  // Total daily waste = sum of all six categories
  let dailyTotal = 0;
  WASTE_CATEGORIES.forEach(function (category) {
    dailyTotal += values[category.id];
  });

  // Category % = (category ÷ daily total) × 100
  // If the total is 0 we would divide by zero, so use 0% instead.
  const percentages = {};
  WASTE_CATEGORIES.forEach(function (category) {
    percentages[category.id] = dailyTotal > 0
      ? round2((values[category.id] / dailyTotal) * 100)
      : 0;
  });

  return {
    savedAt: new Date().toISOString(),   // when it was calculated
    unit: "kg",
    quantities: Object.assign({}, values),   // kg per day, per category
    percentages: percentages,               // % of daily total, per category
    totals: {
      daily:   round2(dailyTotal),
      weekly:  round2(dailyTotal * DAYS_PER_WEEK),
      monthly: round2(dailyTotal * DAYS_PER_MONTH)
    }
  };
}


/* =========================================================
   4. SHOW THE RESULTS DASHBOARD
   ========================================================= */
function showResults(record) {
  // Summary cards
  document.getElementById("daily-total").textContent   = formatKg(record.totals.daily);
  document.getElementById("weekly-total").textContent  = formatKg(record.totals.weekly);
  document.getElementById("monthly-total").textContent = formatKg(record.totals.monthly);

  savedInfo.textContent = "Last saved: " + formatDate(record.savedAt);

  renderBreakdown(record);
  renderInsights(record);

  resultsSection.hidden = false;
}

// Category list with progress bars, largest first
function renderBreakdown(record) {
  // Copy the categories and sort by quantity (biggest first)
  const sorted = WASTE_CATEGORIES.slice().sort(function (a, b) {
    return record.quantities[b.id] - record.quantities[a.id];
  });

  let html = "";
  sorted.forEach(function (category) {
    const kg = record.quantities[category.id];
    const percent = record.percentages[category.id];
    const emptyClass = kg === 0 ? " is-zero" : "";

    html += `
      <li class="bar-row${emptyClass}" style="--cat-color: ${category.color};">
        <div class="bar-row__top">
          <span class="bar-row__name"><span aria-hidden="true">${category.icon}</span> ${category.name}</span>
          <span class="bar-row__value">${formatKg(kg)} kg · <strong>${percent.toFixed(1)}%</strong></span>
        </div>
        <div class="bar" role="img" aria-label="${category.name}: ${percent.toFixed(1)} percent">
          <div class="bar__fill" data-width="${percent}"></div>
        </div>
      </li>`;
  });

  breakdownList.innerHTML = html;

  // Start bars at 0 width, then grow them on the next frame (animation)
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      breakdownList.querySelectorAll(".bar__fill").forEach(function (bar) {
        bar.style.width = bar.dataset.width + "%";
      });
    });
  });
}

// Short educational messages based on the user's numbers.
// They only describe the user's own data + general good practice.
function renderInsights(record) {
  const q = record.quantities;
  const messages = [];

  // Find the largest category
  const largest = WASTE_CATEGORIES.slice().sort(function (a, b) {
    return q[b.id] - q[a.id];
  })[0];

  messages.push(
    "<strong>" + largest.name + "</strong> is your largest category, at " +
    record.percentages[largest.id].toFixed(1) + "% of your daily waste."
  );

  // A tip for whichever category is largest
  const tipForLargest = {
    wet: "Wet waste can be composted at home or handed over separately for composting, so keeping it apart from other waste makes the biggest difference for your household.",
    dry: "Keep paper, cardboard and metal clean and dry. Clean dry waste is much easier to recycle.",
    plastic: "Try cutting down single-use plastic: carry a cloth bag, refill water bottles and choose products with less packaging.",
    ewaste: "Check whether old devices can be repaired, donated or returned through a brand take-back programme.",
    hazardous: "Choose milder cleaning products where possible and buy chemicals only in the amount you need.",
    sanitary: "Consider reusable options where suitable, such as cloth or menstrual cups, and always wrap sanitary waste securely."
  };
  messages.push(tipForLargest[largest.id]);

  // If everything was entered in one category, gently suggest a check
  const usedCategories = WASTE_CATEGORIES.filter(function (c) { return q[c.id] > 0; });
  if (usedCategories.length === 1) {
    messages.push("All your waste is in one category. Use the Segregation Guide to check whether some items belong in other bins.");
  }

  // Safety reminders for special waste types
  if (q.ewaste > 0 || q.hazardous > 0) {
    messages.push("You entered e-waste or hazardous waste. Keep these separate from household bins and use authorised collection points.");
  }
  if (q.sanitary > 0 && largest.id !== "sanitary") {
    messages.push("Wrap sanitary waste securely in paper before disposal to protect waste workers.");
  }

  // Encourage tracking over time (used by Analytics in Phase 5)
  messages.push(
    "At this rate your household would produce about <strong>" + formatKg(record.totals.monthly) +
    " kg</strong> in a month. Calculate again after changing a habit to compare."
  );

  insightsList.innerHTML = messages.map(function (text) {
    return "<li>" + text + "</li>";
  }).join("");
}


/* =========================================================
   5. SAVE TO LOCALSTORAGE
   Saved structure (easy to reuse in Analytics):
   {
     version: 1,
     latest:  { ...record },     ← most recent calculation
     history: [ {record}, ... ]  ← up to 30 past calculations, oldest first
   }
   ========================================================= */
function loadSavedData() {
  const data = Storage.load(STORAGE_KEY, null);

  // Ignore missing or damaged data
  if (!data || !data.latest || !data.latest.totals || !Array.isArray(data.history)) {
    return null;
  }
  return data;
}

function saveRecord(record) {
  const existing = loadSavedData();
  const history = existing ? existing.history : [];

  history.push(record);

  // Keep only the newest HISTORY_LIMIT records
  while (history.length > HISTORY_LIMIT) {
    history.shift();
  }

  return Storage.save(STORAGE_KEY, {
    version: 1,
    latest: record,
    history: history
  });
}


/* =========================================================
   6. SHOW THE SAVED RESULT WHEN THE PAGE OPENS
   ========================================================= */
function showSavedResult() {
  const data = loadSavedData();
  if (!data) return;

  // Put the saved numbers back into the form so the user can edit them
  WASTE_CATEGORIES.forEach(function (category) {
    const kg = data.latest.quantities[category.id];
    document.getElementById("input-" + category.id).value = kg > 0 ? kg : "";
  });

  showResults(data.latest);
}


/* =========================================================
   EVENTS
   ========================================================= */
function setupEvents() {
  // "Calculate My Waste" (the form's submit button)
  form.addEventListener("submit", function (event) {
    event.preventDefault();   // stop the page from reloading
    clearAllErrors();

    const input = readInputs();

    if (input.hasErrors) {
      showAlert("Please correct the highlighted fields and try again.");
      form.querySelector(".is-invalid").focus();
      return;
    }

    const record = calculateWaste(input.values);

    if (record.totals.daily === 0) {
      showAlert("Please enter at least one quantity greater than 0 before calculating.");
      document.getElementById("input-" + WASTE_CATEGORIES[0].id).focus();
      return;
    }

    const saved = saveRecord(record);
    showResults(record);

    if (!saved) {
      savedInfo.textContent = "Calculated, but your browser blocked saving (private mode?).";
    }

    resultsSection.scrollIntoView({ behavior: "smooth" });
  });

  // "Reset" button: the browser clears the inputs automatically
  // (it is type="reset"); we clear errors and hide the results.
  // Saved data is kept so Analytics can still use it.
  form.addEventListener("reset", function () {
    clearAllErrors();
    resultsSection.hidden = true;
  });

  // "Delete saved data" button
  deleteButton.addEventListener("click", function () {
    Storage.remove(STORAGE_KEY);
    form.reset();
    savedInfo.textContent = "";
  });

  inputGrid.querySelectorAll(".field__input").forEach(function (input) {
    // Block characters that number inputs normally allow
    // but we don't want: minus, plus and "e" (as in 1e5)
    input.addEventListener("keydown", function (event) {
      if (["-", "+", "e", "E"].includes(event.key)) {
        event.preventDefault();
      }
    });

    // Remove a field's error as soon as the user edits it
    input.addEventListener("input", function () {
      clearFieldError(input);
      hideAlert();
    });
  });
}
