/* =========================================================
   WasteWise – Waste Data (js/data/waste-items.js)
   ---------------------------------------------------------
   The single source of waste information for the website.
   Used by:
     • segregation.js  (Segregation Guide – Phase 3)
     • assistant.js    (Disposal Assistant – Phase 7)

   Two lists:
   1. WASTE_CATEGORIES – the six categories with examples,
      disposal method and environmental importance.
   2. WASTE_ITEMS – everyday household items. Each item has:
        name      → shown on the card
        category  → must match a category "id" below
        icon      → emoji shown on the card
        advice    → how to dispose of it
        keywords  → extra search words (incl. common Hindi
                    names) so searches like "chai" or "roti" work

   To add a new item, copy any item block and change its values.
   ========================================================= */

const WASTE_CATEGORIES = [
  {
    id: "wet",
    name: "Wet / Biodegradable Waste",
    shortName: "Wet",
    icon: "🥬",
    color: "var(--wet)",
    examples: ["Vegetable peels", "Fruit waste", "Tea leaves", "Leftover food"],
    disposal: "Hand over to the wet-waste collection, or compost it at home or in a community composter.",
    importance: "Wet waste rots in landfills and releases methane, a powerful greenhouse gas. Composted, it becomes rich manure for soil."
  },
  {
    id: "dry",
    name: "Dry / Recyclable Waste",
    shortName: "Dry",
    icon: "📰",
    color: "var(--dry)",
    examples: ["Newspaper", "Cardboard", "Clean paper", "Metal cans"],
    disposal: "Keep it clean and dry, then send it through authorised recycling collection or a local scrap dealer (kabadiwala).",
    importance: "Recycling paper and metal saves trees, water, energy and raw materials. Food-soiled paper often cannot be recycled."
  },
  {
    id: "plastic",
    name: "Plastic Waste",
    shortName: "Plastic",
    icon: "🧴",
    color: "var(--plastic)",
    examples: ["Plastic bottles", "Containers", "Packaging"],
    disposal: "Empty and rinse where practical, let it dry, and separate it according to your local collection rules.",
    importance: "Plastic can last for hundreds of years, breaking into microplastics that pollute rivers, oceans and food chains."
  },
  {
    id: "ewaste",
    name: "E-Waste",
    shortName: "E-Waste",
    icon: "🔌",
    color: "var(--ewaste)",
    examples: ["Mobile phones", "Batteries", "Chargers", "Cables"],
    disposal: "Give it to an authorised e-waste collection centre or a brand's take-back programme. Never burn or break it open.",
    importance: "Electronics contain toxic metals like lead and mercury, and also valuable metals like copper and gold that can be recovered."
  },
  {
    id: "hazardous",
    name: "Domestic Hazardous Waste",
    shortName: "Hazardous",
    icon: "☣️",
    color: "var(--hazardous)",
    examples: ["Paints", "Chemicals", "Pesticides", "Some household cleaners"],
    disposal: "Keep it separate in its original container, sealed and labelled, and follow authorised local collection instructions.",
    importance: "Toxic chemicals can poison soil and groundwater, catch fire, and seriously harm sanitation workers who handle mixed waste."
  },
  {
    id: "sanitary",
    name: "Sanitary Waste",
    shortName: "Sanitary",
    icon: "🩹",
    color: "var(--sanitary)",
    examples: ["Sanitary pads", "Diapers", "Similar hygiene waste"],
    disposal: "Wrap securely in paper or the pouch provided, label it where required, and follow municipal collection rules.",
    importance: "Unwrapped sanitary waste spreads infection and is unsafe for waste workers who often sort waste by hand."
  }
];


const WASTE_ITEMS = [
  /* ---------- WET / BIODEGRADABLE ---------- */
  { name: "Vegetable peels", category: "wet", icon: "🥕",
    advice: "Put in the wet-waste bin or compost pit. Peels compost quickly.",
    keywords: ["sabzi", "chilka", "onion", "potato", "vegetable"] },
  { name: "Fruit waste", category: "wet", icon: "🍌",
    advice: "Banana peels, seeds and rotten fruit go in the wet bin or compost.",
    keywords: ["phal", "banana", "mango", "apple", "orange", "fruit"] },
  { name: "Used tea leaves", category: "wet", icon: "🍵",
    advice: "Squeeze out the liquid and add to wet waste. Great for compost and plants.",
    keywords: ["chai", "chai patti", "tea"] },
  { name: "Leftover cooked food", category: "wet", icon: "🍛",
    advice: "Drain excess liquid, then put it in the wet bin. Better still, cook only what you need.",
    keywords: ["khana", "roti", "rice", "chawal", "dal", "food"] },
  { name: "Eggshells", category: "wet", icon: "🥚",
    advice: "Crush them and add to wet waste or compost. They add calcium to soil.",
    keywords: ["anda", "egg"] },
  { name: "Puja flowers & garlands", category: "wet", icon: "🌼",
    advice: "Remove threads, plastic and foil first, then compost the flowers. Don't throw them into rivers.",
    keywords: ["phool", "mala", "flowers", "garland", "temple"] },
  { name: "Coffee grounds", category: "wet", icon: "☕",
    advice: "Add to wet waste or compost. Coffee grounds are rich in nitrogen.",
    keywords: ["coffee"] },
  { name: "Garden leaves & grass", category: "wet", icon: "🍂",
    advice: "Compost them or use as mulch. Never burn dry leaves — the smoke pollutes the air.",
    keywords: ["patte", "leaves", "grass", "garden"] },

  /* ---------- DRY / RECYCLABLE ---------- */
  { name: "Newspaper", category: "dry", icon: "📰",
    advice: "Keep it dry and stack it. Sell or give to a kabadiwala or recycler.",
    keywords: ["akhbar", "paper", "raddi"] },
  { name: "Cardboard boxes", category: "dry", icon: "📦",
    advice: "Flatten the box, remove tape if possible, and keep it dry for recycling.",
    keywords: ["carton", "box", "packaging", "gatta"] },
  { name: "Clean office paper & notebooks", category: "dry", icon: "📄",
    advice: "Recyclable if clean and dry. Remove plastic covers and spiral bindings.",
    keywords: ["copy", "notebook", "kagaz", "paper", "a4"] },
  { name: "Metal cans", category: "dry", icon: "🥫",
    advice: "Rinse food or drink cans, let them dry, and send for recycling. Metals recycle again and again.",
    keywords: ["tin", "aluminium", "can", "soft drink"] },
  { name: "Glass bottles & jars", category: "dry", icon: "🫙",
    advice: "Rinse and keep unbroken. Wrap broken glass in thick paper and label it 'sharp'.",
    keywords: ["kaanch", "glass", "jar", "bottle"] },
  { name: "Milk & juice cartons", category: "dry", icon: "🧃",
    advice: "Rinse, flatten and dry. These multi-layer cartons need special recyclers, so keep them separate.",
    keywords: ["tetra pak", "juice", "carton"] },
  { name: "Old clothes & fabric", category: "dry", icon: "👕",
    advice: "Donate wearable clothes. Keep worn-out fabric clean and dry for textile recycling.",
    keywords: ["kapde", "clothes", "textile", "cloth"] },
  { name: "Clean aluminium foil", category: "dry", icon: "🪙",
    advice: "Wipe off food, scrunch into a ball and recycle with metals. Greasy foil goes in general waste.",
    keywords: ["foil", "silver paper"] },

  /* ---------- PLASTIC ---------- */
  { name: "Plastic water bottles", category: "plastic", icon: "🍶",
    advice: "Empty, crush and keep caps on or separate as per local rules. PET bottles are widely recycled.",
    keywords: ["pet", "bisleri", "bottle", "water"] },
  { name: "Plastic food containers", category: "plastic", icon: "🥡",
    advice: "Scrape out leftovers and rinse. Reuse them for storage before throwing away.",
    keywords: ["dabba", "takeaway", "box", "tiffin"] },
  { name: "Milk pouches", category: "plastic", icon: "🥛",
    advice: "Cut along one corner only, rinse, dry, and give for recycling. Many dairies collect them back.",
    keywords: ["doodh", "milk", "packet"] },
  { name: "Chips & snack wrappers", category: "plastic", icon: "🍟",
    advice: "Multi-layer packaging that is hard to recycle. Keep clean and dry and hand over with plastic waste.",
    keywords: ["namkeen", "biscuit", "wrapper", "packet", "kurkure"] },
  { name: "Plastic carry bags", category: "plastic", icon: "🛍️",
    advice: "Reuse them or collect them together for recycling. Carry a cloth bag to avoid them.",
    keywords: ["polythene", "panni", "bag", "thaili"] },
  { name: "Shampoo & detergent bottles", category: "plastic", icon: "🧴",
    advice: "Use up completely, rinse, and give for recycling with other hard plastics.",
    keywords: ["shampoo", "detergent", "soap", "lotion"] },
  { name: "Plastic bottle caps", category: "plastic", icon: "🔘",
    advice: "Collect them in a jar or keep them on the bottle, as your local collector prefers.",
    keywords: ["cap", "lid", "dhakkan"] },
  { name: "Bubble wrap & packing plastic", category: "plastic", icon: "🫧",
    advice: "Reuse for packing or storage. Otherwise keep clean and dry for plastic collection.",
    keywords: ["packing", "bubble", "thermocol", "courier"] },

  /* ---------- E-WASTE ---------- */
  { name: "Old mobile phones", category: "ewaste", icon: "📱",
    advice: "Erase your data first, then give to an authorised e-waste collector or a brand take-back programme.",
    keywords: ["phone", "mobile", "smartphone"] },
  { name: "Batteries (AA, AAA, button cells)", category: "ewaste", icon: "🔋",
    advice: "Never put batteries in household bins. Store in a box and drop at an e-waste collection point.",
    keywords: ["cell", "battery", "remote battery"] },
  { name: "Chargers & adapters", category: "ewaste", icon: "🔌",
    advice: "Reuse working chargers. Broken ones go to an authorised e-waste collection centre.",
    keywords: ["charger", "adapter", "plug"] },
  { name: "Cables & wires", category: "ewaste", icon: "🧵",
    advice: "Bundle them and give to e-waste collectors. Never burn wires to recover copper.",
    keywords: ["wire", "usb", "cable", "taar"] },
  { name: "Earphones & headphones", category: "ewaste", icon: "🎧",
    advice: "Contain small electronics and metals. Give to an e-waste collection point.",
    keywords: ["earphone", "headphone", "earbuds"] },
  { name: "CFL bulbs & tube lights", category: "ewaste", icon: "💡",
    advice: "Contain mercury — don't break them. Hand over intact to an e-waste collector.",
    keywords: ["bulb", "tubelight", "cfl", "light"] },
  { name: "Power banks", category: "ewaste", icon: "🔋",
    advice: "Lithium batteries can catch fire if crushed. Never put them in regular bins; drop at e-waste points.",
    keywords: ["power bank", "lithium", "battery"] },
  { name: "Old laptops, keyboards & mice", category: "ewaste", icon: "💻",
    advice: "Back up and erase data, then donate if working or give to an authorised e-waste recycler.",
    keywords: ["computer", "laptop", "keyboard", "mouse"] },

  /* ---------- DOMESTIC HAZARDOUS ---------- */
  { name: "Paint cans", category: "hazardous", icon: "🎨",
    advice: "Keep leftover paint sealed in its can. Hand over through authorised hazardous-waste collection.",
    keywords: ["paint", "varnish", "rang"] },
  { name: "Pesticides & insecticides", category: "hazardous", icon: "🪲",
    advice: "Keep in the original labelled container. Never pour down drains or into soil.",
    keywords: ["keetnashak", "spray", "pesticide", "insecticide"] },
  { name: "Toilet & drain cleaners", category: "hazardous", icon: "🧪",
    advice: "Use up completely where possible. Keep leftover chemicals sealed and separate from other waste.",
    keywords: ["acid", "harpic", "cleaner", "phenyl"] },
  { name: "Expired medicines", category: "hazardous", icon: "💊",
    advice: "Don't flush them. Return to a pharmacy take-back box if available, or follow local hazardous-waste rules.",
    keywords: ["dawai", "tablet", "medicine", "syrup"] },
  { name: "Mercury thermometers", category: "hazardous", icon: "🌡️",
    advice: "Mercury is highly toxic. Seal in a container and hand over to hazardous-waste collection.",
    keywords: ["thermometer", "mercury"] },
  { name: "Aerosol spray cans", category: "hazardous", icon: "🧯",
    advice: "Never puncture or burn — they can explode. Keep separate for hazardous collection.",
    keywords: ["deodorant", "room freshener", "spray"] },
  { name: "Used engine oil", category: "hazardous", icon: "🛢️",
    advice: "Store in a sealed container and give to a mechanic or authorised collector. Never pour into drains.",
    keywords: ["oil", "motor oil", "grease"] },
  { name: "Nail polish & removers", category: "hazardous", icon: "💅",
    advice: "Contain flammable solvents. Keep sealed and dispose of with domestic hazardous waste.",
    keywords: ["acetone", "nail paint", "solvent"] },

  /* ---------- SANITARY ---------- */
  { name: "Sanitary pads", category: "sanitary", icon: "🩸",
    advice: "Wrap securely in paper or the pouch provided, mark it with a red dot or as your municipality asks, and keep separate.",
    keywords: ["pad", "period", "menstrual"] },
  { name: "Diapers", category: "sanitary", icon: "👶",
    advice: "Empty solid waste into the toilet, roll up tightly, wrap in paper and hand over as sanitary waste.",
    keywords: ["diaper", "nappy", "pampers"] },
  { name: "Tampons", category: "sanitary", icon: "🩹",
    advice: "Never flush them. Wrap securely and dispose of with sanitary waste.",
    keywords: ["tampon", "period"] },
  { name: "Used bandages & cotton", category: "sanitary", icon: "🤕",
    advice: "Wrap blood-stained cotton and dressings in paper and keep with sanitary waste.",
    keywords: ["bandage", "cotton", "dressing", "patti"] },
  { name: "Used face masks", category: "sanitary", icon: "😷",
    advice: "Cut the ear loops, fold, wrap in paper and dispose of as sanitary waste.",
    keywords: ["mask", "n95"] },
  { name: "Used tissues & wet wipes", category: "sanitary", icon: "🧻",
    advice: "Wet wipes contain plastic and don't break down. Wrap and dispose with sanitary waste — never flush.",
    keywords: ["tissue", "wipes", "napkin"] },
  { name: "Condoms", category: "sanitary", icon: "🗑️",
    advice: "Wrap in paper and dispose of with sanitary waste. Never flush them.",
    keywords: ["condom"] },
  { name: "Disposable razors & blades", category: "sanitary", icon: "🪒",
    advice: "Wrap blades in thick paper or tape so they don't cut waste workers, and label as sharp.",
    keywords: ["razor", "blade", "shaving"] }
];
