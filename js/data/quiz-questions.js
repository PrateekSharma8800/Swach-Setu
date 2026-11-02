/* =========================================================
   WasteWise – Quiz questions (js/data/quiz-questions.js)
   ---------------------------------------------------------
   Used by js/quiz.js. Kept separate so questions can be
   added or edited without touching the quiz logic.

   Each question has:
     topic        → small label shown above the question
     question     → the question text
     options      → exactly four answer choices
     answer       → INDEX of the correct option
                    (0 = first, 1 = second, 2 = third, 3 = fourth)
     explanation  → why that answer is correct (shown after submitting)

   To add a question, copy one block, change the values and
   make sure "answer" points to the right option.
   ========================================================= */

const QUIZ_QUESTIONS = [
  {
    topic: "Wet & dry segregation",
    question: "Which of these items should go into the wet waste bin?",
    options: ["Banana peel", "Newspaper", "Glass bottle", "Used battery"],
    answer: 0,
    explanation: "A banana peel is kitchen waste that breaks down naturally, so it belongs with wet waste. Newspaper and glass are dry recyclables, and batteries need special e-waste collection."
  },
  {
    topic: "Biodegradable waste",
    question: "What does the word \"biodegradable\" mean?",
    options: [
      "It can be melted and moulded again",
      "It is made only from plastic",
      "It can be broken down naturally by microorganisms",
      "It must always be burnt to dispose of it"
    ],
    answer: 2,
    explanation: "Biodegradable materials, such as food scraps and leaves, are broken down by bacteria, fungi and other microorganisms into simpler natural substances."
  },
  {
    topic: "Wet & dry segregation",
    question: "Why is it important to separate wet and dry waste at home?",
    options: [
      "It makes the dustbin heavier",
      "It keeps recyclables clean and lets wet waste be composted",
      "It is only done for decoration",
      "It increases the amount of waste sent to landfills"
    ],
    answer: 1,
    explanation: "When wet waste mixes with paper or plastic, the dry items get dirty and are hard to recycle. Separated wet waste can be composted, so less waste goes to landfills."
  },
  {
    topic: "Plastic recycling",
    question: "What should you ideally do before giving a used plastic bottle for recycling?",
    options: [
      "Fill it with leftover food",
      "Burn it to make it smaller",
      "Empty it, rinse it and let it dry",
      "Mix it with wet kitchen waste"
    ],
    answer: 2,
    explanation: "Clean, dry plastic is much easier to recycle. Leftover food and liquids contaminate recyclables, and burning plastic releases harmful smoke."
  },
  {
    topic: "E-waste disposal",
    question: "What is the correct way to dispose of an old mobile phone that no longer works?",
    options: [
      "Throw it in the household dustbin",
      "Burn it to recover the metal",
      "Bury it in the garden",
      "Give it to an authorised e-waste collector or a take-back programme"
    ],
    answer: 3,
    explanation: "Phones contain toxic substances as well as valuable metals. Authorised e-waste collectors and brand take-back programmes recycle them safely."
  },
  {
    topic: "E-waste disposal",
    question: "CFL bulbs and fluorescent tube lights should be handled carefully because they contain a small amount of which toxic substance?",
    options: ["Mercury", "Oxygen", "Calcium", "Sugar"],
    answer: 0,
    explanation: "CFLs and tube lights contain mercury, which is toxic. They should not be broken and should be handed over intact for proper e-waste disposal."
  },
  {
    topic: "Household hazardous waste",
    question: "Which of these is an example of domestic hazardous waste?",
    options: ["Used tea leaves", "Cardboard box", "Cotton cloth", "Leftover paint and pesticide containers"],
    answer: 3,
    explanation: "Paints, pesticides and strong chemical cleaners can be toxic or flammable. They should be kept separate and handed over through authorised collection."
  },
  {
    topic: "Sanitary waste",
    question: "How should used sanitary pads and diapers be disposed of?",
    options: [
      "Flushed down the toilet",
      "Mixed with wet kitchen waste for composting",
      "Wrapped securely in paper and disposed of separately as per municipal rules",
      "Thrown in an open drain"
    ],
    answer: 2,
    explanation: "Wrapping sanitary waste protects waste workers from infection. Flushing it blocks drains and sewers, and it must not be mixed with compostable waste."
  },
  {
    topic: "Composting",
    question: "Which of these should NOT be put into a home compost bin?",
    options: ["Vegetable peels", "Dry leaves", "Used tea leaves", "Plastic wrappers"],
    answer: 3,
    explanation: "Plastic does not break down in compost. Peels, tea leaves and dry leaves are organic materials that microorganisms turn into compost."
  },
  {
    topic: "Recycling & reuse",
    question: "Which of these is an example of REUSE rather than recycling?",
    options: [
      "Using an empty glass jar to store spices",
      "Melting old cans to make new cans",
      "Pulping old newspaper to make new paper",
      "Shredding plastic to make new products"
    ],
    answer: 0,
    explanation: "Reuse means using an item again in the same or a new way without processing it. Melting, pulping and shredding are recycling processes."
  },
  {
    topic: "Environmental pollution",
    question: "When wet waste rots in a landfill without enough oxygen, which greenhouse gas does it mainly produce?",
    options: ["Methane", "Oxygen", "Nitrogen", "Helium"],
    answer: 0,
    explanation: "Organic waste breaking down without oxygen produces methane, a powerful greenhouse gas. Composting wet waste instead helps reduce this."
  },
  {
    topic: "Environmental pollution",
    question: "What is the main harmful effect of burning garbage in the open?",
    options: [
      "It makes the soil more fertile",
      "It cleans the air around it",
      "It has no effect on health",
      "It releases harmful smoke and gases that pollute the air"
    ],
    answer: 3,
    explanation: "Open burning, especially of plastic, releases smoke and toxic gases that pollute the air and can harm people's lungs and health."
  },
  {
    topic: "Sustainable habits",
    question: "Among the 3Rs (Reduce, Reuse, Recycle), which is the most preferred way to manage waste?",
    options: ["Recycle", "Reuse", "Reduce", "All are equally preferred"],
    answer: 2,
    explanation: "Reducing waste comes first because waste that is never created needs no collection, processing or disposal. Reuse comes next, then recycling."
  },
  {
    topic: "Waste management in Indore",
    question: "Indore (Madhya Pradesh) is widely known in India for which achievement?",
    options: [
      "Being India's most populated city",
      "Being ranked India's cleanest city in the Swachh Survekshan survey for several consecutive years",
      "Producing no waste at all",
      "Banning all vehicles from the city"
    ],
    answer: 1,
    explanation: "Indore has been ranked the cleanest city in India's national Swachh Survekshan cleanliness survey for several years in a row, through door-to-door collection, segregation at source and strong citizen participation."
  },
  {
    topic: "Waste management in Indore",
    question: "Indore's large Bio-CNG plant produces fuel mainly from which type of waste?",
    options: ["E-waste", "Wet (organic) waste", "Plastic waste", "Construction debris"],
    answer: 1,
    explanation: "A Bio-CNG plant breaks down wet organic waste without oxygen to produce biogas, which is purified into Bio-CNG fuel. This is why segregating wet waste matters."
  }
];
