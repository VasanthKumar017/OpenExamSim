/* empty css                                    */
import { ExamEngine } from './__federation_expose_Engine-C9wQYdgl.js';
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

const renderResults = (container, score, total) => {
  container.innerHTML = `
        <div class="results-card">
            <h1>Exam Completed!</h1>
            <p>You scored <strong>${score}</strong> out of <strong>${total}</strong></p>
            <button onclick="window.location.reload()" class="restart-btn">
                Restart Exam
            </button>
        </div>
    `;
};

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
    setupNavigation(
      engine,
      updateUI,
      (score) => renderResults(appContainer, score, questions.length)
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
