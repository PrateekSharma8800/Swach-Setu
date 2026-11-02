/* =========================================================
   SwachSetu – Awareness Quiz script (js/quiz.js)
   ---------------------------------------------------------
   Needs (loaded before this file in quiz.html):
     • js/data/quiz-questions.js → QUIZ_QUESTIONS
     • js/storage.js             → Storage.save / Storage.load

   The page has three "screens" (only one is visible at a time):
     intro-screen  → start button + last saved result
     quiz-screen   → one question at a time
     result-screen → score, message and explanations

   The quiz state is just two variables:
     currentIndex → which question is showing (0 = first)
     answers      → the option index the user picked for each
                    question, or null if not answered yet
                    e.g. [1, 3, null, null, ...]
   ========================================================= */


/* ---------- Settings ---------- */
const STORAGE_KEY = "wasteWiseQuizResult";   // separate from the calculator's key
const TOTAL = QUIZ_QUESTIONS.length;          // 15
const LETTERS = ["A", "B", "C", "D"];

// Result categories, checked from the top. "min" = lowest score for that level.
const RESULT_LEVELS = [
  { min: 13, title: "Environmental Champion", icon: "🏆",
    message: "Outstanding! You have excellent knowledge of responsible waste management. Keep inspiring the people around you." },
  { min: 10, title: "Green Thinker", icon: "🌿",
    message: "Great job! You understand most good waste practices. Read the explanations below to fill the remaining gaps." },
  { min: 7,  title: "Eco Learner", icon: "🌱",
    message: "Good start! Go through the explanations below and explore the Segregation Guide to learn more." },
  { min: 0,  title: "Keep Learning!", icon: "📘",
    message: "Every expert starts somewhere. Read the explanations below, visit the Segregation Guide and try again." }
];


/* ---------- Quiz state ---------- */
let currentIndex = 0;
let answers = new Array(TOTAL).fill(null);


/* ---------- HTML elements ---------- */
const introScreen   = document.getElementById("intro-screen");
const quizScreen    = document.getElementById("quiz-screen");
const resultScreen  = document.getElementById("result-screen");
const questionText  = document.getElementById("question-text");
const questionTopic = document.getElementById("question-topic");
const optionsBox    = document.getElementById("options");
const counterText   = document.getElementById("question-counter");
const answeredText  = document.getElementById("answered-count");
const progressBar   = document.getElementById("progress");
const progressFill  = document.getElementById("progress-fill");
const messageBox    = document.getElementById("quiz-message");
const prevButton    = document.getElementById("prev-btn");
const nextButton    = document.getElementById("next-btn");
const dotsBox       = document.getElementById("question-dots");
const reviewList    = document.getElementById("review-list");
const onlyWrongBox  = document.getElementById("only-wrong");


/* ---------- Start ---------- */
showLastResult();
setupEvents();


/* =========================================================
   HELPERS
   ========================================================= */

// Shows one screen and hides the other two
function showScreen(screen) {
  [introScreen, quizScreen, resultScreen].forEach(function (s) {
    s.hidden = s !== screen;
  });
}

// How many questions have an answer
function countAnswered() {
  return answers.filter(function (a) { return a !== null; }).length;
}

// Index of the first unanswered question, or -1 if all are answered
function firstUnanswered() {
  return answers.indexOf(null);
}

// Picks the result level for a score, e.g. 11 → "Green Thinker"
function getResultLevel(score) {
  return RESULT_LEVELS.find(function (level) {
    return score >= level.min;
  });
}

function formatDate(isoText) {
  return new Date(isoText).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.hidden = false;
}

function hideMessage() {
  messageBox.hidden = true;
  messageBox.textContent = "";
}


/* =========================================================
   1. SHOW ONE QUESTION
   ========================================================= */
function renderQuestion() {
  const q = QUIZ_QUESTIONS[currentIndex];

  // Counter and progress
  counterText.textContent = "Question " + (currentIndex + 1) + " of " + TOTAL;
  answeredText.textContent = countAnswered() + " of " + TOTAL + " answered";
  progressFill.style.width = ((currentIndex + 1) / TOTAL) * 100 + "%";
  progressBar.setAttribute("aria-valuenow", currentIndex + 1);

  // Question
  questionTopic.textContent = q.topic;
  questionText.textContent = q.question;

  // Four options as radio buttons inside labels.
  // Radio buttons give free keyboard support: Tab to the group,
  // arrow keys to move between options.
  let html = "";
  q.options.forEach(function (option, i) {
    const checked = answers[currentIndex] === i;
    html += `
      <label class="option${checked ? " is-selected" : ""}">
        <input type="radio" name="option" value="${i}" ${checked ? "checked" : ""}>
        <span class="option__letter" aria-hidden="true">${LETTERS[i]}</span>
        <span class="option__text">${option}</span>
      </label>`;
  });
  optionsBox.innerHTML = html;

  // Buttons
  prevButton.disabled = currentIndex === 0;
  const isLast = currentIndex === TOTAL - 1;
  nextButton.innerHTML = isLast
    ? "Submit Quiz ✓"
    : 'Next <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
  nextButton.classList.toggle("is-submit", isLast);

  hideMessage();
  renderDots();
}

// Saves the user's choice for the current question
function selectOption(optionIndex) {
  answers[currentIndex] = optionIndex;

  optionsBox.querySelectorAll(".option").forEach(function (label, i) {
    label.classList.toggle("is-selected", i === optionIndex);
    label.querySelector("input").checked = i === optionIndex;
  });

  answeredText.textContent = countAnswered() + " of " + TOTAL + " answered";
  hideMessage();
  renderDots();
}


/* =========================================================
   2. QUESTION NUMBER BUTTONS ("dots")
   You can jump to any answered question, or to the first
   unanswered one – but never skip ahead past unanswered ones.
   ========================================================= */
function canVisit(index) {
  const limit = firstUnanswered() === -1 ? TOTAL - 1 : firstUnanswered();
  return index <= limit;
}

function renderDots() {
  let html = "";
  for (let i = 0; i < TOTAL; i++) {
    const classes = ["dot"];
    if (answers[i] !== null) classes.push("is-answered");
    if (i === currentIndex) classes.push("is-current");

    const status = answers[i] !== null ? "answered" : "not answered";
    html += `<button type="button" class="${classes.join(" ")}" data-index="${i}"
               ${canVisit(i) ? "" : "disabled"}
               ${i === currentIndex ? 'aria-current="step"' : ""}
               aria-label="Question ${i + 1}, ${status}">${i + 1}</button>`;
  }
  dotsBox.innerHTML = html;
}

function goToQuestion(index) {
  currentIndex = index;
  renderQuestion();
  // Move keyboard/screen-reader focus to the new question
  questionText.focus({ preventScroll: true });
  // On small screens, bring the card back into view
  if (quizScreen.getBoundingClientRect().top < 0) {
    quizScreen.scrollIntoView({ behavior: "smooth" });
  }
}


/* =========================================================
   3. NEXT / PREVIOUS / SUBMIT
   ========================================================= */
function goNext() {
  // Rule: you can't move forward without choosing an answer
  if (answers[currentIndex] === null) {
    showMessage("Please select an answer before continuing.");
    return;
  }

  if (currentIndex < TOTAL - 1) {
    goToQuestion(currentIndex + 1);
  } else {
    submitQuiz();
  }
}

function goPrevious() {
  if (currentIndex > 0) {
    goToQuestion(currentIndex - 1);
  }
}

function submitQuiz() {
  // Safety check: every question must be answered
  const missing = [];
  answers.forEach(function (a, i) {
    if (a === null) missing.push(i + 1);
  });

  if (missing.length > 0) {
    goToQuestion(missing[0] - 1);
    showMessage("Please answer all questions before submitting. Unanswered: Question " + missing.join(", "));
    return;
  }

  const result = calculateResult();
  saveResult(result);
  renderResults(result);
}


/* =========================================================
   4. SCORING
   ---------------------------------------------------------
   For each question: if the chosen option index equals the
   correct "answer" index → +1 mark.
   percentage = (score ÷ 15) × 100
   ========================================================= */
function calculateResult() {
  let score = 0;

  QUIZ_QUESTIONS.forEach(function (q, i) {
    if (answers[i] === q.answer) {
      score = score + 1;
    }
  });

  const percentage = Math.round((score / TOTAL) * 100 * 100) / 100;   // 2 decimals
  const level = getResultLevel(score);

  return {
    completedAt: new Date().toISOString(),
    score: score,
    total: TOTAL,
    percentage: percentage,
    correct: score,
    incorrect: TOTAL - score,
    category: level.title,
    answers: answers.slice()          // copy of the chosen option indexes
  };
}


/* =========================================================
   5. RESULT SCREEN
   ========================================================= */
function renderResults(result) {
  const level = getResultLevel(result.score);

  // Score ring – same SVG trick as the analytics donut:
  // circumference is 100, so the coloured part = percentage
  document.getElementById("score-ring").innerHTML = `
    <svg viewBox="0 0 42 42" role="img" aria-label="Score ${result.score} out of ${result.total}">
      <circle class="score-ring__track" cx="21" cy="21" r="15.915" fill="none" stroke-width="4"></circle>
      ${result.score > 0 ? `
      <circle class="score-ring__fill" cx="21" cy="21" r="15.915" fill="none" stroke-width="4"
              stroke-dasharray="${result.percentage} ${100 - result.percentage}" stroke-dashoffset="25"
              stroke-linecap="round"></circle>` : ""}
      <text x="21" y="21" class="score-ring__score">${result.score}/${result.total}</text>
      <text x="21" y="26.5" class="score-ring__label">score</text>
    </svg>`;

  document.getElementById("result-badge").textContent = level.icon + " " + level.title;
  document.getElementById("result-title").textContent = "You scored " + result.score + " out of " + result.total;
  document.getElementById("result-message").textContent = level.message;

  document.getElementById("stat-score").textContent = result.score + " / " + result.total;
  document.getElementById("stat-percent").textContent = result.percentage.toFixed(1) + "%";
  document.getElementById("stat-correct").textContent = result.correct;
  document.getElementById("stat-incorrect").textContent = result.incorrect;

  renderReview(result.answers);
  onlyWrongBox.checked = false;
  reviewList.classList.remove("only-wrong");

  showScreen(resultScreen);
  resultScreen.scrollIntoView({ behavior: "smooth" });
  document.getElementById("result-title").focus({ preventScroll: true });
}

// List of all questions with the user's answer, the correct answer and why
function renderReview(chosen) {
  let html = "";

  QUIZ_QUESTIONS.forEach(function (q, i) {
    const isCorrect = chosen[i] === q.answer;
    const yourAnswer = LETTERS[chosen[i]] + ". " + q.options[chosen[i]];
    const rightAnswer = LETTERS[q.answer] + ". " + q.options[q.answer];

    html += `
      <li class="review-item ${isCorrect ? "is-correct" : "is-wrong"}">
        <div class="review-item__head">
          <span class="review-item__status" aria-hidden="true">${isCorrect ? "✓" : "✕"}</span>
          <p class="review-item__question"><strong>Q${i + 1}.</strong> ${q.question}</p>
        </div>
        <p class="review-item__line">
          <span class="visually-hidden">${isCorrect ? "Correct." : "Incorrect."}</span>
          Your answer: <strong>${yourAnswer}</strong>
        </p>
        ${isCorrect ? "" : `<p class="review-item__line review-item__line--right">Correct answer: <strong>${rightAnswer}</strong></p>`}
        <p class="review-item__why">💡 ${q.explanation}</p>
      </li>`;
  });

  reviewList.innerHTML = html;
}


/* =========================================================
   6. SAVING THE RESULT (localStorage)
   Key: "wasteWiseQuizResult" – the calculator uses a different
   key, so its data is never touched.
   ========================================================= */
function saveResult(result) {
  const previous = Storage.load(STORAGE_KEY, null);
  const previousBest = previous && typeof previous.bestScore === "number" ? previous.bestScore : 0;

  Storage.save(STORAGE_KEY, Object.assign({ version: 1 }, result, {
    bestScore: Math.max(previousBest, result.score)
  }));
}

// On the intro screen, show the last saved result (if any)
function showLastResult() {
  const saved = Storage.load(STORAGE_KEY, null);
  const box = document.getElementById("last-result");

  if (!saved || typeof saved.score !== "number" || !saved.completedAt) {
    box.hidden = true;
    return;
  }

  box.innerHTML = `Your last result: <strong>${saved.score}/${saved.total}</strong>
    (${saved.category}) on ${formatDate(saved.completedAt)} · Best: <strong>${saved.bestScore}/${saved.total}</strong>`;
  box.hidden = false;
}


/* =========================================================
   7. START AND RETAKE
   ========================================================= */
function startQuiz() {
  currentIndex = 0;
  answers = new Array(TOTAL).fill(null);   // forget all previous answers
  showScreen(quizScreen);
  renderQuestion();
  quizScreen.scrollIntoView({ behavior: "smooth" });
  questionText.focus({ preventScroll: true });
}


/* =========================================================
   EVENTS
   ========================================================= */
function setupEvents() {
  document.getElementById("start-btn").addEventListener("click", startQuiz);
  document.getElementById("retake-btn").addEventListener("click", startQuiz);

  nextButton.addEventListener("click", goNext);
  prevButton.addEventListener("click", goPrevious);

  // Choosing an option (mouse, touch or keyboard all fire "change")
  optionsBox.addEventListener("change", function (event) {
    if (event.target.name === "option") {
      selectOption(Number(event.target.value));
    }
  });

  // Question number buttons
  dotsBox.addEventListener("click", function (event) {
    const dot = event.target.closest(".dot");
    if (dot && !dot.disabled) {
      goToQuestion(Number(dot.dataset.index));
    }
  });

  // "Show only incorrect answers" checkbox on the result screen
  onlyWrongBox.addEventListener("change", function () {
    reviewList.classList.toggle("only-wrong", onlyWrongBox.checked);
  });

  // Keyboard shortcuts while the quiz screen is visible:
  //   1–4 → choose option A–D,  Enter → next / submit
  document.addEventListener("keydown", function (event) {
    if (quizScreen.hidden) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (["1", "2", "3", "4"].includes(event.key)) {
      selectOption(Number(event.key) - 1);
      return;
    }

    // Enter on a button already "clicks" it, so ignore it there
    if (event.key === "Enter" && event.target.tagName !== "BUTTON" && event.target.tagName !== "A") {
      event.preventDefault();
      goNext();
    }
  });
}
