# WasteWise – Smart Waste Management & Awareness System

A BCA Semester 1 Environmental Studies (EVS) project that helps people segregate, measure and reduce their household waste.

## Features

| Page | File | What it does |
|---|---|---|
| Home Dashboard | `index.html` | Introduction, why segregation matters, links to every tool, how it works |
| Waste Segregation Guide | `segregation.html` | 6 waste categories and 48 everyday items, with search and category filters |
| Waste Calculator | `calculator.html` | Enter daily waste (kg) in 6 categories → daily, weekly and monthly totals with a category breakdown |
| Waste Analytics | `analytics.html` | Donut and bar charts (SVG) and rule-based insights from your latest calculation |
| Awareness Quiz | `quiz.html` | 15 multiple-choice questions with scoring, result levels and explanations |
| Smart Disposal Assistant | `assistant.html` | Rule-based (not AI) search that ranks matching items and gives disposal advice, warnings and tips |
| Indore Case Study | `case-study.html` | How Indore manages its waste, with sourced figures, challenges and lessons |

## Technology

- HTML5, CSS3 and vanilla JavaScript only.
- No frameworks, libraries, backend, database, paid APIs or AI models.
- Charts are drawn with plain SVG.
- Fonts: Poppins and Inter from Google Fonts. The site falls back to system fonts when offline.

## How to run

1. Open the `WasteWise` folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` → **Open with Live Server**.

You can also double-click `index.html` to open it directly in a browser.

## Folder structure

```
WasteWise/
├── index.html, segregation.html, calculator.html, analytics.html,
│   quiz.html, assistant.html, case-study.html     One page per feature
├── css/
│   ├── style.css          Shared design system: colours, buttons, cards, navbar,
│   │                      footer, search box, filters, badges, notes
│   ├── responsive.css     Shared tablet and mobile layouts
│   └── pages/             One stylesheet per page
├── js/
│   ├── main.js            Shared: mobile menu, active link, scroll animations
│   ├── storage.js         localStorage helpers (save / load / remove)
│   ├── data/
│   │   ├── waste-items.js     6 categories + 48 items (used by 4 pages)
│   │   └── quiz-questions.js  15 quiz questions
│   └── <page>.js          Logic for each page
└── assets/
    ├── favicon.svg
    └── images/            Case-study photo (see Credits)
```

## Data saved in the browser

Nothing leaves the user's device. Two `localStorage` keys are used:

| Key | Written by | Read by | Contents |
|---|---|---|---|
| `wasteWiseCalculatorData` | Calculator | Calculator, Analytics | `{ version, latest, history[] }` (up to 30 calculations) |
| `wasteWiseQuizResult` | Quiz | Quiz | Latest score, percentage, level, answers and best score |

## Accessibility and quality checks

- **HTML:** every page passes `html-validate` with no errors.
- **Colour contrast:** text colours meet WCAG AA (at least 4.5:1).
- **Keyboard:**
  - A "Skip to main content" link.
  - Visible focus outlines.
  - The Escape key closes the mobile menu.
  - The quiz has keyboard shortcuts.
- **Screen readers:** labelled form fields, `aria-live` result counts, text descriptions for both charts, and alt text on the image.
- **Reduced motion:** animations are reduced when the device's "reduce motion" setting is on.
- **Responsive:** tested from desktop down to phone widths with no horizontal scrolling.

## Case study sources

1. Indore Municipal Corporation — https://imcindore.mp.gov.in/waste-management
2. Indore Smart City — Solid Waste Management — https://www.smartcityindore.org/solid-waste/
3. NITI Aayog & CSE, *Waste-Wise Cities* (2021) — https://www.niti.gov.in/node/362
4. CAG, Performance Audit on Waste Management in Urban Local Bodies, Madhya Pradesh (Report No. 2 of 2024) — https://www.cag.gov.in/en/audit-report/details/121262
5. Global Methane Initiative / U.S. EPA, Indore case study — https://gmidev.org/web/how-indias-cleanest-city-reduces-methane-emissions-municipal-solid-waste

## Credits

- Photo: "Door-to-door Garbage Collection Vans in Indore - Under Swachh Bharat Abhiyan" by TheodoreIndiana, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Door-to-door_Garbage_Collection_Vans_in_Indore_-_Under_Swachh_Bharat_Abhiyan.jpg), licensed [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
- Fonts: [Poppins](https://fonts.google.com/specimen/Poppins) and [Inter](https://fonts.google.com/specimen/Inter), SIL Open Font License.

## Limitations

- The Assistant and Segregation Guide know only the 48 items in the dataset, and have no spelling correction.
- Calculator results are estimates (weekly = daily × 7, monthly = daily × 30).
- Saved data stays in one browser on one device and is lost if browser data is cleared.
- Waste rules and bin colours differ between cities, so users should follow their local municipal guidelines.
