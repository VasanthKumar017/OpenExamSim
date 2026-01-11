import './styles/main.scss';
import { ExamEngine } from './core/engine';
import { QuestionRenderer } from './core/renderer';
import { fetchExamData } from './core/data-loader';
import { setupNavigation } from './components/Navigation';
import { ResultsRenderer } from './components/ResultsRenderer';
import { Timer } from './components/Timer';
import { SubmissionController } from './components/Submission';

async function startApp() {
    const appContainer = document.querySelector<HTMLDivElement>('#app')!;
    const startScreen = document.getElementById('start-screen')!;
    const startBtn = document.getElementById('start-btn')!;
    
    const useTimer = true;
    const exTime = 60 * 60; // 60 minutes

    try {
        const questions = await fetchExamData();
        const engine = new ExamEngine(questions);
        const renderer = new QuestionRenderer();
        const resultsView = new ResultsRenderer();
        const submission = new SubmissionController(engine);

        let examTimer: Timer | null = null;

        // Helper to refresh the nav-grid dots
        const updateNavigationUI = () => {
            window.dispatchEvent(new Event('refresh-nav'));
        };

        const updateUI = () => {
            const state = engine.getState();
            const currentQ = engine.getCurrentQuestion();
            const currentAns = state.answers[state.currentIdx];
            const counterElement = document.getElementById('q-counter');

            if (counterElement) {
                counterElement.innerText = `Question ${state.currentIdx + 1} of ${state.total}`;
            }

            renderer.render(currentQ, currentAns);
            submission.clear();

            const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
            const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;

            if (prevBtn && nextBtn) {
                prevBtn.disabled = state.currentIdx === 0;
                nextBtn.innerText = state.currentIdx === state.total - 1 ? "Finish Exam" : "Next";
            }
        };

        // --- PREPARE TIMER (But don't start yet) ---
        if (useTimer) {
            examTimer = new Timer(exTime, () => {
                alert("Time is up!");
                resultsView.render(engine.getQuestions(), engine.getState().answers);
            });
        } else {
            const tElement = document.getElementById('timer');
            if (tElement) tElement.style.display = 'none';
        }

        // --- NAVIGATION & SUBMISSION ---
        setupNavigation(engine, updateUI, () => {
            if (examTimer) examTimer.stop();
            resultsView.render(engine.getQuestions(), engine.getState().answers);
        });

        // --- START BUTTON LOGIC ---
        startBtn.addEventListener('click', () => {
            // Hide the overlay
            startScreen.classList.add('hidden');
            
            // Start the timer
            if (useTimer && examTimer) {
                examTimer.start();
            }

            // Show the first question
            updateUI();
        });

        // --- EVENT LISTENERS ---
        window.addEventListener('answer-selected', (e: Event) => {
            const { index } = (e as CustomEvent).detail;

            const allOptions = document.querySelectorAll('.option-card');
            allOptions.forEach(card => card.classList.remove('selected'));

            const selectedCard = allOptions[index] as HTMLElement;
            if (selectedCard) {
                selectedCard.classList.add('selected');
                const radio = selectedCard.querySelector('input') as HTMLInputElement;
                if (radio) radio.checked = true;
            }

            submission.renderLockBtn(index, () => {
                updateNavigationUI();
            });
        });

    } catch (error) {
        appContainer.innerHTML = `<div class="error"><h1>Error loading exam</h1></div>`;
        console.error(error);
    }
}

startApp();