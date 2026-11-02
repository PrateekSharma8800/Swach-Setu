/* =========================================================
   SwachSetu – Storage Helpers (storage.js)
   ---------------------------------------------------------
   Small wrapper around the browser's localStorage so other
   files can save and load data with one line.

   localStorage only stores text, so we convert objects to
   text with JSON.stringify and back with JSON.parse.

   Keys used by SwachSetu (all start with "wasteWise"):
     wasteWiseCalculatorData  → calculator.js (Phase 4),
                                read by analytics.js (Phase 5)

   Every function is wrapped in try/catch because localStorage
   can be blocked (e.g. some private browsing modes). If that
   happens the site still works – it just can't remember data.
   ========================================================= */

const Storage = {
  // Save any value (object, array, number, string).
  // Returns true if it worked, false if storage is unavailable.
  save: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Could not save data:", error);
      return false;
    }
  },

  // Load a value; returns defaultValue if nothing is saved
  // or if the saved text is damaged.
  load: function (key, defaultValue) {
    try {
      const text = localStorage.getItem(key);
      return text === null ? defaultValue : JSON.parse(text);
    } catch (error) {
      console.warn("Could not load data:", error);
      return defaultValue;
    }
  },

  // Delete one saved value
  remove: function (key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Could not remove data:", error);
    }
  }
};
