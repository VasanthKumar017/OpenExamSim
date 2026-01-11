import './styles/main.scss';
import { ExamEngine } from './core/engine';
import { QuestionRenderer } from './core/renderer';
import { fetchExamData } from './core/data-loader';
import { setupNavigation } from './components/Navigation';
import { ResultsRenderer } from './components/ResultsRenderer';
import { Timer } from './components/Timer'; // Import our new component

async function startApp() {
    const appContainer = document.querySelector<HTMLDivElement>('#app')!;
    const useTimer = true; 
    const exTime = 1 * 60; // 10 * 60 = 10 minutes in seconds

    try {
        const questions = await fetchExamData();
        const engine = new ExamEngine(questions);
        const renderer = new QuestionRenderer();
        const resultsView = new ResultsRenderer();
        
        let examTimer: Timer | null = null;

        const updateUI = () => {
            const state = engine.getState();
            const currentQ = engine.getCurrentQuestion();
            const currentAns = state.answers[state.currentIdx];

            renderer.render(currentQ, currentAns);

            const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
            const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;

            if (prevBtn && nextBtn) {
                prevBtn.disabled = state.currentIdx === 0;
                nextBtn.innerText = state.currentIdx === state.total - 1 ? "Finish Exam" : "Next";
            }
        };

        // --- TIMER INITIALIZATION ---

            if (useTimer) {
                examTimer = new Timer(exTime, () => { /* ... */ });
                examTimer.start();
            } else {
                // Optional: Hide the timer element if not being used
                const tElement = document.getElementById('timer');
                if (tElement) tElement.style.display = 'none';
            }

        // --- NAVIGATION & SUBMISSION ---
        setupNavigation(
            engine,
            updateUI,
            () => {
                // This runs when "Finish Exam" is clicked
                if (examTimer) examTimer.stop(); // Stop the clock
                
                const state = engine.getState();
                const questions = engine.getQuestions();
                resultsView.render(questions, state.answers);
            }
        );

        // --- EVENT LISTENERS ---
        window.addEventListener('answer-selected', (e: Event) => {
            const customEvent = e as CustomEvent;
            const { index } = customEvent.detail;
            engine.handleAnswer(index);
            updateUI();
        });

        // Initial render
        updateUI();

    } catch (error) {
        appContainer.innerHTML = `
            <div class="error">
                <h1>Error loading exam</h1>
                <p>Check public/questions.json</p>
            </div>`;
        console.error(error);
    }
}

startApp();