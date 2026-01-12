/* empty css                                    */
import { ExamEngine } from './__federation_expose_Engine-B2XCRQm9.js';
import { QuestionRenderer } from './__federation_expose_Renderer-Dqk9uT_7.js';

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

const setupNavigation = (engine, onUpdate, onFinish) => {
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");
  prevBtn?.addEventListener("click", () => {
    engine.prev();
    onUpdate();
  });
  nextBtn?.addEventListener("click", () => {
    const state = engine.getState();
    const questions = engine.getQuestions();
    if (state.currentIdx === questions.length - 1) {
      let score = 0;
      questions.forEach((q, idx) => {
        if (state.answers[idx] === q.correctAnswer) score++;
      });
      onFinish(score);
    } else {
      engine.next();
      onUpdate();
    }
  });
};

class ResultsRenderer {
  container;
  constructor() {
    this.container = document.getElementById("app");
  }
  render(questions, userAnswers) {
    let score = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        score++;
      }
    });
    this.container.innerHTML = `
            <div class="results-container">
                <div class="results-summary">
                    <h1>Performance Report</h1>
                    <div class="score-badge">${score} / ${questions.length}</div>
                    <p class="percentage">${(score / questions.length * 100).toFixed(1)}%</p>
                    <button onclick="window.location.reload()" class="restart-btn">Try Again</button>
                </div>

                <div class="review-list">
                    ${questions.map((q, index) => {
      const userAnsIndex = userAnswers[index];
      const isCorrect = userAnsIndex === q.correctAnswer;
      return `
                            <div class="review-item ${isCorrect ? "correct" : "incorrect"}">
                                <div class="review-header">
                                    <strong>Question ${index + 1}</strong>
                                    <span class="status-icon">${isCorrect ? "✔" : "✘"}</span>
                                </div>
                                
                                <p class="q-text">${q.text}</p>
                                
                                <div class="ans-comparison">
                                    <div class="ans-box your-ans-box ${!isCorrect ? "wrong" : ""}">
                                        <label>Your Choice</label>
                                        <p>
                                            ${userAnsIndex !== void 0 ? q.options[userAnsIndex] : "Skipped"}
                                        </p>
                                    </div>
                                    
                                    ${!isCorrect ? `
                                        <div class="ans-box correct-ans-box">
                                            <label>Correct Answer</label>
                                            <p>${q.options[q.correctAnswer]}</p>
                                        </div>
                                    ` : ""}
                                </div>
                            </div>
                        `;
    }).join("")}
                </div>
            </div>
        `;
  }
}

class Timer {
  timeLeft;
  totalTime;
  intervalId = null;
  element = null;
  onTimeUp;
  // Corrected: Only ONE constructor implementation
  constructor(durationSeconds, onTimeUp, startTime) {
    this.totalTime = durationSeconds;
    this.timeLeft = startTime !== void 0 ? startTime : durationSeconds;
    this.onTimeUp = onTimeUp;
    this.element = document.getElementById("timer");
    this.updateDisplay();
  }
  start() {
    if (!this.element) return;
    if (this.intervalId) return;
    this.element.classList.add("timer-normal");
    this.updateDisplay();
    this.intervalId = window.setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      if (this.timeLeft <= 0) {
        this.stop();
        this.onTimeUp();
      }
    }, 1e3);
  }
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  getTimeLeft() {
    return this.timeLeft;
  }
  updateDisplay() {
    if (!this.element) return;
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    const timeString = `${mins}:${secs.toString().padStart(2, "0")}`;
    this.element.innerText = `Time Remaining: ${timeString}`;
    const threshold = this.totalTime * 0.1;
    if (this.timeLeft <= threshold) {
      this.element.classList.remove("timer-normal");
      this.element.classList.add("timer-low");
    }
  }
}

class SubmissionController {
  container;
  engine;
  constructor(engine) {
    this.engine = engine;
    this.container = document.getElementById("submission-slot");
    this.container.classList.add("submission-bar");
  }
  // This is the method the error is complaining about
  renderLockBtn(selectedIndex, onConfirm) {
    this.container.innerHTML = `
            <button id="lock-btn" class="lock-btn">Confirm Answer</button>
        `;
    const btn = document.getElementById("lock-btn");
    btn.onclick = () => {
      this.engine.handleAnswer(selectedIndex);
      btn.innerText = "Locked ✓";
      btn.classList.add("locked");
      btn.disabled = true;
      onConfirm();
    };
  }
  clear() {
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
}

async function startApp() {
  const appContainer = document.querySelector("#app");
  const startScreen = document.getElementById("start-screen");
  const startBtn = document.getElementById("start-btn");
  const useTimer = true;
  const exTime = 60 * 60;
  const saveProgress = (engine, timer) => {
    const state = engine.getState();
    const dataToSave = {
      engineState: state,
      timeLeft: timer ? timer.getTimeLeft() : null
      // Save the current seconds left
    };
    localStorage.setItem("exam_progress", JSON.stringify(dataToSave));
  };
  try {
    const questions = await fetchExamData();
    const engine = new ExamEngine(questions);
    const renderer = new QuestionRenderer();
    const resultsView = new ResultsRenderer();
    const submission = new SubmissionController(engine);
    const endTestBtn = document.getElementById("end-test-btn");
    const finishExam = () => {
      if (examTimer) examTimer.stop();
      localStorage.removeItem("exam_progress");
      resultsView.render(engine.getQuestions(), engine.getState().answers);
      if (endTestBtn) endTestBtn.style.display = "none";
    };
    if (endTestBtn) {
      endTestBtn.addEventListener("click", () => {
        const confirmed = confirm("Are you sure you want to end the test? This will submit all current answers.");
        if (confirmed) {
          finishExam();
        }
      });
    }
    let examTimer = null;
    let initialSeconds;
    const saved = localStorage.getItem("exam_progress");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.engineState && typeof engine.loadState === "function") {
        engine.loadState(parsed.engineState);
      }
      initialSeconds = parsed.timeLeft;
      startScreen.classList.add("hidden");
    }
    const updateNavigationUI = () => {
      window.dispatchEvent(new Event("refresh-nav"));
    };
    const updateUI = () => {
      const state = engine.getState();
      const currentQ = engine.getCurrentQuestion();
      const currentAns = state.answers[state.currentIdx];
      const counterElement = document.getElementById("q-counter");
      if (counterElement) {
        counterElement.innerText = `Question ${state.currentIdx + 1} of ${state.total}`;
      }
      renderer.render(currentQ, currentAns);
      submission.clear();
      const nextBtn = document.getElementById("next-btn");
      const prevBtn = document.getElementById("prev-btn");
      if (prevBtn && nextBtn) {
        prevBtn.disabled = state.currentIdx === 0;
        nextBtn.innerText = state.currentIdx === state.total - 1 ? "Finish Exam" : "Next";
      }
    };
    if (useTimer) {
      examTimer = new Timer(exTime, () => {
        alert("Time is up!");
        localStorage.removeItem("exam_progress");
        resultsView.render(engine.getQuestions(), engine.getState().answers);
      }, initialSeconds);
    }
    setupNavigation(engine, () => {
      updateUI();
      saveProgress(engine, examTimer);
    }, () => {
      if (examTimer) examTimer.stop();
      localStorage.removeItem("exam_progress");
      resultsView.render(engine.getQuestions(), engine.getState().answers);
    });
    setInterval(() => {
      if (examTimer && !startScreen.classList.contains("hidden")) {
        saveProgress(engine, examTimer);
      }
    }, 5e3);
    startBtn.addEventListener("click", () => {
      startScreen.classList.add("hidden");
      if (useTimer && examTimer) examTimer.start();
      updateUI();
    });
    window.addEventListener("answer-selected", (e) => {
      const { index } = e.detail;
      const allOptions = document.querySelectorAll(".option-card");
      allOptions.forEach((card) => card.classList.remove("selected"));
      const selectedCard = allOptions[index];
      if (selectedCard) {
        selectedCard.classList.add("selected");
        const radio = selectedCard.querySelector("input");
        if (radio) radio.checked = true;
      }
      submission.renderLockBtn(index, () => {
        updateNavigationUI();
        saveProgress(engine, examTimer);
      });
    });
    if (saved) {
      if (useTimer && examTimer) examTimer.start();
      updateUI();
    }
  } catch (error) {
    appContainer.innerHTML = `<div class="error"><h1>Error loading exam</h1></div>`;
    console.error(error);
  }
}
startApp();
