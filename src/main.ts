import './styles/main.scss';
import { ExamEngine } from './core/engine';
import { QuestionRenderer } from './core/renderer';
import { fetchExamData } from './core/data-loader';
import { SessionManager } from './core/session-manager';
import { setupNavigation } from './components/Navigation';
import { ResultsRenderer } from './components/ResultsRenderer';
import { Timer } from './components/Timer';

async function startApp() {
    // 1. SELECT DOM ELEMENTS (Dependency Gathering)
    const appContainer = document.querySelector<HTMLDivElement>('#app')!;
    const startScreen = document.getElementById('start-screen')!;
    const startBtn = document.getElementById('start-btn')!;
    const endTestBtn = document.getElementById('end-test-btn') as HTMLButtonElement;
    const timerDisplay = document.getElementById('timer-display');
    const qCounter = document.getElementById('q-counter');
    const optionsContainer = document.getElementById('options-container')!;
    const qTextElement = document.getElementById('q-text')!;

    try {
        // 2. INITIALIZE CORE
        const questions = await fetchExamData();
        const engine = new ExamEngine(questions);
        const renderer = new QuestionRenderer(optionsContainer, qTextElement);
        
        // 3. INJECT DEPENDENCIES
        const resultsView = new ResultsRenderer(appContainer);
        
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

        // 4. UI ORCHESTRATION (Declarative Syncing)
        const updateUI = () => {
            const state = engine.getState();
            renderer.render(engine.getCurrentQuestion(), state.answers[state.currentIdx]);
            
            if (qCounter) {
                qCounter.innerText = `Question ${state.currentIdx + 1} of ${state.total}`;
            }
            
            window.dispatchEvent(new Event('refresh-nav'));
        };

        const finishExam = () => {
            examTimer.stop();
            SessionManager.clear();
            resultsView.render(engine);
            
            if (endTestBtn) endTestBtn.style.display = 'none';
            const controls = document.querySelector('.controls') as HTMLElement;
            if (controls) controls.style.display = 'none';
        };

        // 5. EVENT WIRING
        if (endTestBtn) {
            endTestBtn.addEventListener('click', () => {
                if (confirm("Are you sure you want to end the test and see your results?")) {
                    finishExam();
                }
            });
        }

        startBtn.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            if (endTestBtn) endTestBtn.style.display = 'block';
            examTimer.start();
            updateUI();
            SessionManager.startHeartbeat(engine, examTimer);
        });

        window.addEventListener('answer-selected', (e: Event) => {
            engine.handleAnswer((e as CustomEvent).detail.index);
            updateUI(); // This re-renders everything in a fresh state
            SessionManager.save(engine, examTimer);
        });

        setupNavigation(engine, () => {
            updateUI();
            SessionManager.save(engine, examTimer);
        }, finishExam);

        // 6. BOOTSTRAP (If Resuming)
        if (saved) {
            startScreen.classList.add('hidden');
            if (endTestBtn) endTestBtn.style.display = 'block';
            examTimer.start();
            updateUI();
            SessionManager.startHeartbeat(engine, examTimer);
        }

    } catch (error) {
        appContainer.innerHTML = `<div class="error"><h1>Error loading exam</h1></div>`;
        console.error(error);
    }
}

startApp();