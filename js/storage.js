/* =========================================================
   WasteWise – Storage Helpers (storage.js)
   ---------------------------------------------------------
   Small wrapper around the browser's localStorage so other
   files can save and load data with one line.
   Used later by: calculator.js, analytics.js, quiz.js.

   localStorage only stores text, so we convert objects to
   text with JSON.stringify and back with JSON.parse.
   ========================================================= */

const Storage = {
  // All our keys start with this prefix so they don't clash
  prefix: "wastewise_",

  // Save any value (object, array, number, string)
  save: function (key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.warn("Could not save data:", error);
    }
  },

  // Load a value; returns defaultValue if nothing is saved
  load: function (key, defaultValue) {
    try {
      const text = localStorage.getItem(this.prefix + key);
      return text === null ? defaultValue : JSON.parse(text);
    } catch (error) {
      console.warn("Could not load data:", error);
      return defaultValue;
    }
  },

  // Delete one saved value
  remove: function (key) {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn("Could not remove data:", error);
    }
  }
};
