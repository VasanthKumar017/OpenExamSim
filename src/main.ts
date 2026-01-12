import './styles/main.scss';
import { ExamEngine } from './core/engine';
import { QuestionRenderer } from './core/renderer';
import { fetchExamData } from './core/data-loader';
import { SessionManager } from './core/session-manager';
import { setupNavigation } from './components/Navigation';
import { ResultsRenderer } from './components/ResultsRenderer';
import { Timer } from './components/Timer';

async function startApp() {
    const appContainer = document.querySelector<HTMLDivElement>('#app')!;
    const startScreen = document.getElementById('start-screen')!;
    const startBtn = document.getElementById('start-btn')!;
    const endTestBtn = document.getElementById('end-test-btn') as HTMLButtonElement;

    try {
        // 1. Setup Core
        const questions = await fetchExamData();
        const engine = new ExamEngine(questions);
        const renderer = new QuestionRenderer();
        const resultsView = new ResultsRenderer();
        
        // 2. Load Session
        const saved = SessionManager.load();
        if (saved) {
            if (saved.engineState) engine.loadState(saved.engineState);
            startScreen.classList.add('hidden');
        }

        // 3. Setup Timer
        const examTimer = new Timer(3600, () => finishExam(), saved?.timeLeft);

        // 4. Centralized UI Updater
        const updateUI = () => {
            const state = engine.getState();
            renderer.render(engine.getCurrentQuestion(), state.answers[state.currentIdx]);
            
            const counter = document.getElementById('q-counter');
            if (counter) counter.innerText = `Question ${state.currentIdx + 1} of ${state.total}`;
            
            window.dispatchEvent(new Event('refresh-nav'));
        };

        // 5. Define Finish Logic
        const finishExam = () => {
            examTimer.stop();
            SessionManager.clear();
            resultsView.render(engine);
            
            // UI Clean up
            if (endTestBtn) endTestBtn.style.display = 'none';
            const controls = document.querySelector('.controls') as HTMLElement;
            if (controls) controls.style.display = 'none';
        };

        // --- THE MISSING FIX: Attach the event listener ---
        if (endTestBtn) {
            endTestBtn.addEventListener('click', () => {
                if (confirm("Are you sure you want to end the test and see your results?")) {
                    finishExam();
                }
            });
        }

        // 6. Connect Events
        startBtn.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            if (endTestBtn) endTestBtn.style.display = 'block'; // Show button on start
            examTimer.start();
            updateUI();
            SessionManager.startHeartbeat(engine, examTimer);
        });

        window.addEventListener('answer-selected', (e: Event) => {
            engine.handleAnswer((e as CustomEvent).detail.index);
            updateUI();
            SessionManager.save(engine, examTimer);
        });

        setupNavigation(engine, () => {
            updateUI();
            SessionManager.save(engine, examTimer);
        }, finishExam);

        // Bootstrap if resuming
        if (saved) {
            if (endTestBtn) endTestBtn.style.display = 'block'; // Show button on resume
            examTimer.start();
            updateUI();
            SessionManager.startHeartbeat(engine, examTimer);
        }

    } catch (error) {
        appContainer.innerHTML = `<div class="error"><h1>Error loading exam</h1></div>`;
    }
}

startApp();