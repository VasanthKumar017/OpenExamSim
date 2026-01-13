/* empty css                                    */
import { ExamEngine } from './__federation_expose_Engine-hY-zmDDy.js';
import { e as eventBus, QuestionRenderer } from './__federation_expose_Renderer-03IUc_aq.js';

true&&(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
}());

async function fetchExamData() {
  try {
    const response = await fetch("/questions.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not fetch exam data:", error);
    throw error;
  }
}

class SessionManager {
  static STORAGE_KEY = "exam_progress";
  // Saves everything: Answers, current question index, and time left
  static save(engine, timer) {
    const state = engine.getState();
    const data = {
      engineState: state,
      timeLeft: timer ? timer.getTimeLeft() : null
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
  // Retrieves saved data
  static load() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  }
  // Wipes the data (called when the exam is finished)
  static clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  // Simple 5-second heartbeat to ensure time is saved even if user doesn't click anything
  static startHeartbeat(engine, timer) {
    setInterval(() => {
      if (timer) this.save(engine, timer);
    }, 5e3);
  }
}

const setupNavigation = (engine, onUpdate, onFinish) => {
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");
  prevBtn?.addEventListener("click", () => {
    engine.prev();
    onUpdate();
  });
  nextBtn?.addEventListener("click", () => {
    const state = engine.getState();
    if (state.currentIdx === state.total - 1) {
      onFinish();
    } else {
      engine.next();
      onUpdate();
    }
  });
};

class ResultsRenderer {
  container;
  constructor(container) {
    this.container = container;
  }
  // Helper to compare answers (handles both numbers and arrays of numbers)
  isCorrect(userAns, correctAns) {
    if (userAns === void 0) return false;
    if (Array.isArray(userAns) && Array.isArray(correctAns)) {
      return userAns.length === correctAns.length && userAns.every((val) => correctAns.includes(val));
    }
    return userAns === correctAns;
  }
  // Helper to format display text for the review list
  formatAnswer(ans, options) {
    if (ans === void 0 || Array.isArray(ans) && ans.length === 0) {
      return "<em>Skipped</em>";
    }
    if (Array.isArray(ans)) {
      return ans.map((i) => options[i]).join(", ");
    }
    return options[ans];
  }
  render(engine) {
    const { score, total, percentage } = engine.calculateScore();
    const questions = engine.getQuestions();
    const userAnswers = engine.getState().answers;
    this.container.innerHTML = `
            <div class="results-container">
                <div class="results-summary">
                    <h1>Performance Report</h1>
                    <div class="score-badge">${score} / ${total}</div>
                    <p class="percentage">${percentage}%</p>
                    <button id="restart-exam-btn" class="restart-btn">Try Again</button>
                </div>
                
                <div class="review-list">
                    ${questions.map((q, index) => {
      const userAns = userAnswers[index];
      const isCorrect = this.isCorrect(userAns, q.correctAnswer);
      return `
                            <div class="review-item ${isCorrect ? "correct" : "incorrect"}">
                                <div class="review-header">
                                    <strong>Question ${index + 1}</strong>
                                    <span class="status-icon">${isCorrect ? "✔" : "✘"}</span>
                                </div>
                                <p class="q-text">${q.text}</p>
                                <div class="ans-comparison">
                                    <div class="ans-box">
                                        <label>Your Choice</label>
                                        <p>${this.formatAnswer(userAns, q.options)}</p>
                                    </div>
                                    ${!isCorrect ? `
                                        <div class="ans-box correct">
                                            <label>Correct Answer</label>
                                            <p>${this.formatAnswer(q.correctAnswer, q.options)}</p>
                                        </div>
                                    ` : ""}
                                </div>
                            </div>
                        `;
    }).join("")}
                </div>
            </div>
        `;
    this.container.querySelector("#restart-exam-btn")?.addEventListener("click", () => {
      window.location.reload();
    });
  }
}

class Timer {
  timeLeft;
  timerId = null;
  displayElement;
  onTimeUp;
  constructor(duration, onTimeUp, initialSeconds, displayElement) {
    this.timeLeft = initialSeconds !== void 0 ? initialSeconds : duration;
    this.onTimeUp = onTimeUp;
    this.displayElement = displayElement;
    this.updateDisplay();
  }
  start() {
    if (this.timerId) return;
    this.timerId = window.setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      if (this.timeLeft <= 0) this.stop();
    }, 1e3);
  }
  stop() {
    if (this.timerId) clearInterval(this.timerId);
    if (this.timeLeft <= 0) this.onTimeUp();
  }
  getTimeLeft() {
    return this.timeLeft;
  }
  updateDisplay() {
    if (this.displayElement) {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      this.displayElement.innerText = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      if (this.timeLeft < 300) {
        this.displayElement.classList.add("timer-low");
        this.displayElement.classList.remove("timer-normal");
      } else {
        this.displayElement.classList.add("timer-normal");
        this.displayElement.classList.remove("timer-low");
      }
    }
  }
}

class QuestionNavigation {
  container;
  engine;
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    eventBus.on("refresh-nav", () => this.render());
  }
  render() {
    const state = this.engine.getState();
    const questions = this.engine.getQuestions();
    this.container.innerHTML = `
            <div class="nav-sidebar">
                <h3>QUESTIONS</h3>
                <div class="question-grid">
                    ${questions.map((_, index) => {
      const isCurrent = state.currentIdx === index;
      const answer = state.answers[index];
      const isAnswered = answer !== void 0 && answer !== null;
      const isVisited = state.visited && state.visited[index];
      let statusClass = "";
      if (isCurrent) {
        statusClass = "current";
      } else if (isAnswered) {
        statusClass = "answered";
      } else if (isVisited && !isAnswered) {
        statusClass = "skipped";
      }
      return `
                            <button class="nav-item ${statusClass}" data-index="${index}">
                                Q${index + 1}
                            </button>
                        `;
    }).join("")}
                </div>

                <div class="nav-legend">
                    <div class="legend-item"><span class="dot orange"></span> Current</div>
                    <div class="legend-item"><span class="dot green"></span> Answered</div>
                    <div class="legend-item"><span class="dot yellow"></span> Skipped</div>
                </div>
            </div>
        `;
    this.container.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.engine.goToQuestion(index);
        eventBus.emit("refresh-nav");
        eventBus.emit("nav-jump");
      });
    });
  }
}

async function startApp() {
  const appContainer = document.querySelector("#app");
  const startScreen = document.getElementById("start-screen");
  const startBtn = document.getElementById("start-btn");
  const endTestBtn = document.getElementById("end-test-btn");
  const timerDisplay = document.getElementById("timer-display");
  const qCounter = document.getElementById("q-counter");
  const optionsContainer = document.getElementById("options-container");
  const qTextElement = document.getElementById("q-text");
  const navContainer = document.getElementById("nav-container");
  try {
    const questions = await fetchExamData();
    const engine = new ExamEngine(questions);
    const renderer = new QuestionRenderer(optionsContainer, qTextElement);
    const resultsView = new ResultsRenderer(appContainer);
    const navTracker = new QuestionNavigation(navContainer, engine);
    const saved = SessionManager.load();
    if (saved && saved.engineState) {
      engine.loadState(saved.engineState);
    }
    const examTimer = new Timer(
      3600,
      () => finishExam(),
      saved?.timeLeft,
      timerDisplay
    );
    const updateUI = () => {
      const state = engine.getState();
      renderer.render(engine.getCurrentQuestion(), state.answers[state.currentIdx]);
      if (qCounter) {
        qCounter.innerText = `Question ${state.currentIdx + 1} of ${state.total}`;
      }
      eventBus.emit("refresh-nav");
    };
    eventBus.on("nav-jump", () => {
      updateUI();
      SessionManager.save(engine, examTimer);
    });
    const finishExam = () => {
      examTimer.stop();
      SessionManager.clear();
      resultsView.render(engine);
      if (endTestBtn) endTestBtn.style.display = "none";
      const controls = document.querySelector(".controls");
      if (controls) controls.style.display = "none";
    };
    if (endTestBtn) {
      endTestBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to end the test and see your results?")) {
          finishExam();
        }
      });
    }
    startBtn.addEventListener("click", () => {
      startScreen.classList.add("hidden");
      if (endTestBtn) endTestBtn.style.display = "block";
      examTimer.start();
      updateUI();
      navTracker.render();
      SessionManager.startHeartbeat(engine, examTimer);
    });
    eventBus.on("answer-selected", (e) => {
      engine.handleAnswer(e.detail.index);
      updateUI();
      SessionManager.save(engine, examTimer);
    });
    setupNavigation(engine, () => {
      updateUI();
      SessionManager.save(engine, examTimer);
    }, finishExam);
    if (saved) {
      startScreen.classList.add("hidden");
      if (endTestBtn) endTestBtn.style.display = "block";
      examTimer.start();
      updateUI();
      navTracker.render();
      SessionManager.startHeartbeat(engine, examTimer);
    }
  } catch (error) {
    appContainer.innerHTML = `<div class="error"><h1>Error loading exam</h1></div>`;
    console.error(error);
  }
}
startApp();
