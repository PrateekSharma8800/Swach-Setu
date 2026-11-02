# WasteWise – Smart Waste Management & Awareness System


## Features

1. **Home Dashboard** – overview and quick stats
2. **Waste Segregation Guide** – which bin each item belongs in
3. **Waste Calculator** – estimate weekly household waste
4. **Waste Analytics** – charts of your saved calculations
5. **Awareness Quiz** – test your waste-management knowledge
6. **Smart Disposal Assistant** – rule-based (keyword) disposal guidance
7. **Indore Case Study** – how India's cleanest city manages waste

## Technology

HTML5, CSS3 and Vanilla JavaScript only. No frameworks, backend, database or paid APIs. Data is saved in the browser with `localStorage`.

## How to run

Open `index.html` in any modern browser, or use the **Live Server** extension in VS Code (right-click `index.html` → *Open with Live Server*).

## Folder structure

```
├── *.html            One page per feature
├── css/style.css     Shared design system (colours, cards, buttons, navbar, footer)
├── css/responsive.css  Mobile and tablet layouts
├── css/pages/        Page-specific styles
├── js/main.js        Shared navbar and animation logic
├── js/storage.js     localStorage helpers
├── js/data/          Data files (waste items, quiz questions, calculator constants)
├── js/*.js           Page-specific logic
└── assets/           Images, icons and favicon
```
