/* empty css                                    */
import { ExamEngine } from './__federation_expose_Engine-BTkBYK_r.js';
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

async function startApp() {
  const appContainer = document.querySelector("#app");
  try {
    const questions = await fetchExamData();
    const engine = new ExamEngine(questions);
    const renderer = new QuestionRenderer();
    const updateUI = () => {
      const state = engine.getState();
      const currentQ = engine.getCurrentQuestion();
      const currentAns = state.answers[state.currentIdx];
      renderer.render(currentQ, currentAns);
      const nextBtn = document.getElementById("next-btn");
      const prevBtn = document.getElementById("prev-btn");
      if (prevBtn && nextBtn) {
        prevBtn.disabled = state.currentIdx === 0;
        nextBtn.innerText = state.currentIdx === state.total - 1 ? "Finish Exam" : "Next";
      }
    };
    const resultsView = new ResultsRenderer();
    setupNavigation(
      engine,
      updateUI,
      () => {
        const state = engine.getState();
        const questions2 = engine.getQuestions();
        resultsView.render(questions2, state.answers);
      }
    );
    window.addEventListener("answer-selected", (e) => {
      const customEvent = e;
      const { index } = customEvent.detail;
      engine.handleAnswer(index);
      updateUI();
    });
    updateUI();
  } catch (error) {
    appContainer.innerHTML = `<div class="error"><h1>Error loading exam</h1><p>Check public/questions.json</p></div>`;
    console.error(error);
  }
}
startApp();
