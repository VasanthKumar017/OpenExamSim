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

    // --- HELPER: SAVE TO LOCAL STORAGE (Now includes Timer) ---
    const saveProgress = (engine: ExamEngine, timer?: Timer | null) => {
        const state = engine.getState();
        const dataToSave = {
            engineState: state,
            timeLeft: timer ? timer.getTimeLeft() : null // Save the current seconds left
        };
        localStorage.setItem('exam_progress', JSON.stringify(dataToSave));
    };

    try {
        const questions = await fetchExamData();
        const engine = new ExamEngine(questions);
        const renderer = new QuestionRenderer();
        const resultsView = new ResultsRenderer();
        const submission = new SubmissionController(engine);
        const endTestBtn = document.getElementById('end-test-btn') as HTMLButtonElement;

        const finishExam = () => {
             if (examTimer) examTimer.stop();
             localStorage.removeItem('exam_progress'); // Clear saved state
            resultsView.render(engine.getQuestions(), engine.getState().answers);

        if (endTestBtn) endTestBtn.style.display = 'none';

      };

if (endTestBtn) {
    endTestBtn.addEventListener('click', () => {
        const confirmed = confirm("Are you sure you want to end the test? This will submit all current answers.");
        if (confirmed) {
            finishExam();
        }
    });
}

        let examTimer: Timer | null = null;
        let initialSeconds: number | undefined;

        // --- LOAD SESSION ON START --- 
        const saved = localStorage.getItem('exam_progress');
        if (saved) {
            const parsed = JSON.parse(saved);
            
            // Load Engine State
            if (parsed.engineState && typeof (engine as any).loadState === 'function') {
                (engine as any).loadState(parsed.engineState);
            }
            
            // Load Timer State
            initialSeconds = parsed.timeLeft;
            
            startScreen.classList.add('hidden');
        }

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

        // --- INITIALIZE TIMER (With potential saved time) ---
        if (useTimer) {
            examTimer = new Timer(exTime, () => {
                alert("Time is up!");
                localStorage.removeItem('exam_progress');
                resultsView.render(engine.getQuestions(), engine.getState().answers);
            }, initialSeconds); // The third argument uses the saved time
        }

        // --- NAVIGATION & SUBMISSION ---
        setupNavigation(engine, () => {
            updateUI();
            saveProgress(engine, examTimer); 
        }, () => {
            if (examTimer) examTimer.stop();
            localStorage.removeItem('exam_progress'); 
            resultsView.render(engine.getQuestions(), engine.getState().answers);
        });

        // --- HEARTBEAT: Save time every 5 seconds ---
        setInterval(() => {
            if (examTimer && !startScreen.classList.contains('hidden')) {
                saveProgress(engine, examTimer);
            }
        }, 5000);

        // --- START BUTTON LOGIC ---
        startBtn.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            if (useTimer && examTimer) examTimer.start();
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