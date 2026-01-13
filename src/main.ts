import './styles/main.scss';
import { ExamEngine } from './core/engine';
import { QuestionRenderer } from './core/renderer';
import { fetchExamData } from './core/data-loader';
import { SessionManager } from './core/session-manager';
import { setupNavigation } from './components/Navigation';
import { ResultsRenderer } from './components/ResultsRenderer';
import { Timer } from './components/Timer';
import { eventBus } from './utils/EventBus';
import { QuestionNavigation } from './components/QuestionNavigation';
import { EndButton } from './components/EndButton';

async function startApp() {
    const appContainer = document.querySelector<HTMLDivElement>('#app')!;
    const startScreen = document.getElementById('start-screen')!;
    const startBtn = document.getElementById('start-btn')!;
    const endTestBtn = document.getElementById('end-test-btn') as HTMLButtonElement;
    const timerDisplay = document.getElementById('timer-display');
    const qCounter = document.getElementById('q-counter');
    const optionsContainer = document.getElementById('options-container')!;
    const qTextElement = document.getElementById('q-text')!;
    const navContainer = document.getElementById('nav-container')!; 


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

        let finishExam: () => void;
        
        const examTimer = new Timer(
            3600, 
            () => finishExam(), 
            saved?.timeLeft, 
            timerDisplay
        );

        const endButton = new EndButton(endTestBtn, engine, () => {
            finishExam();
        });

        finishExam = () => {
            examTimer.stop();
            SessionManager.clear();
            resultsView.render(engine);
            endButton.hide();
            
            const controls = document.querySelector('.controls') as HTMLElement;
            if (controls) controls.style.display = 'none';
        };

        const updateUI = () => {
            const state = engine.getState();
            renderer.render(engine.getCurrentQuestion(), state.answers[state.currentIdx]);
            
            if (qCounter) {
                qCounter.innerText = `Question ${state.currentIdx + 1} of ${state.total}`;
            }
            
            eventBus.emit('refresh-nav');
        };

        // Listen for clicks from the Sidebar Navigation
        eventBus.on('nav-jump', () => {
            updateUI();
            SessionManager.save(engine, examTimer);
        });

        startBtn.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            // FIX: Ensure button is visible when exam starts
            endButton.show();
            examTimer.start();
            updateUI();
            navTracker.render(); // Render tracker once the exam starts
            SessionManager.startHeartbeat(engine, examTimer);
        });

        eventBus.on('answer-selected', (e: CustomEvent) => {
            engine.handleAnswer(e.detail.index);
            updateUI(); 
            SessionManager.save(engine, examTimer);
        });

        setupNavigation(engine, () => {
            updateUI();
            SessionManager.save(engine, examTimer);
        }, finishExam);

        if (saved) {
            startScreen.classList.add('hidden');
            // FIX: Ensure button is visible when resuming
            endButton.show();
            examTimer.start();
            updateUI();
            navTracker.render(); // Ensure tracker shows up when resuming
            SessionManager.startHeartbeat(engine, examTimer);
        }

    } catch (error) {
        appContainer.innerHTML = `<div class="error"><h1>Error loading exam</h1></div>`;
        console.error(error);
    }
}

startApp();