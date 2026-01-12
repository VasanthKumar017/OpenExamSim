import './styles/main.scss';
import { ExamEngine } from './core/engine';
import { QuestionRenderer } from './core/renderer';
import { fetchExamData } from './core/data-loader';
import { setupNavigation } from './components/Navigation';
import { ResultsRenderer } from './components/ResultsRenderer';
import { Timer } from './components/Timer';

async function startApp() {
    const appContainer = document.querySelector<HTMLDivElement>('#app')!;
    const startScreen = document.getElementById('start-screen')!;
    const startBtn = document.getElementById('start-btn')!;
    const endTestBtn = document.getElementById('end-test-btn') as HTMLButtonElement;
    
    const EXAM_DURATION = 60 * 60; // 60 minutes
    const useTimer = true;

    // --- HELPER: PERSISTENCE ---
    // Saves current state and timer to localStorage to prevent data loss on refresh
    const saveProgress = (engine: ExamEngine, timer?: Timer | null) => {
        const state = engine.getState();
        const dataToSave = {
            engineState: state,
            timeLeft: timer ? timer.getTimeLeft() : null
        };
        localStorage.setItem('exam_progress', JSON.stringify(dataToSave));
    };

    try {
        // --- INITIALIZATION ---
        const questions = await fetchExamData();
        const engine = new ExamEngine(questions);
        const renderer = new QuestionRenderer();
        const resultsView = new ResultsRenderer();

        let examTimer: Timer | null = null;
        let savedTime: number | undefined;

        // --- UI ORCHESTRATORS ---
        // Updates the main question area and the radio button states
        const updateUI = () => {
            const state = engine.getState();
            const currentQ = engine.getCurrentQuestion();
            const currentAns = state.answers[state.currentIdx];
            
            // Update Question Counter
            const counter = document.getElementById('q-counter');
            if (counter) counter.innerText = `Question ${state.currentIdx + 1} of ${state.total}`;

            // Render current question and options
            renderer.render(currentQ, currentAns);

            // Update Next/Prev button labels
            const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
            const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
            if (prevBtn && nextBtn) {
                prevBtn.disabled = state.currentIdx === 0;
                nextBtn.innerText = state.currentIdx === state.total - 1 ? "Finish Exam" : "Next";
            }
        };

        const updateNavigationUI = () => {
            window.dispatchEvent(new Event('refresh-nav'));
        };

        const finishExam = () => {
            if (examTimer) examTimer.stop();
            localStorage.removeItem('exam_progress');
            resultsView.render(engine.getQuestions(), engine.getState().answers);
            if (endTestBtn) endTestBtn.style.display = 'none';
        };

        // --- SESSION RECOVERY ---
        // Check if user has an existing session in localStorage
        const savedData = localStorage.getItem('exam_progress');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            
            // Fix: Engine needs to be updated with saved answers/index
            // (Ensure you add public loadState(state) { this.state = state } to engine.ts)
            if (parsed.engineState && typeof (engine as any).loadState === 'function') {
                (engine as any).loadState(parsed.engineState);
            }
            
            savedTime = parsed.timeLeft;
            startScreen.classList.add('hidden');
        }

        // --- TIMER SETUP ---
        if (useTimer) {
            examTimer = new Timer(EXAM_DURATION, () => {
                alert("Time is up!");
                finishExam();
            }, savedTime);
        }

        // --- INTERACTION LISTENERS ---
        
        // Handle direct selection (Auto-save mode)
        window.addEventListener('answer-selected', (e: Event) => {
            const { index } = (e as CustomEvent).detail;
            
            // Save to Engine immediately (Radio button logic)
            engine.handleAnswer(index); 
            
            // Update Visuals and Persistence
            updateUI(); 
            saveProgress(engine, examTimer); 
            updateNavigationUI(); 
        });

        // Navigation (Prev/Next/Finish)
        setupNavigation(engine, () => {
            updateUI();
            saveProgress(engine, examTimer); 
        }, () => {
            finishExam();
        });

        // Manual End Test Button
        if (endTestBtn) {
            endTestBtn.addEventListener('click', () => {
                if (confirm("End the test and submit all answers?")) finishExam();
            });
        }

        // Start Screen Logic
        startBtn.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            if (examTimer) examTimer.start();
            updateUI();
        });

        // --- BACKGROUND SYNC ---
        // Heartbeat: save timer every 5 seconds in case of crash
        setInterval(() => {
            if (examTimer && startScreen.classList.contains('hidden')) {
                saveProgress(engine, examTimer);
            }
        }, 5000);

        // --- FINAL BOOTSTRAP ---
        // If we recovered a session, start the app immediately
        if (savedData) {
            if (examTimer) examTimer.start();
            updateUI();
        }

    } catch (error) {
        appContainer.innerHTML = `<div class="error"><h1>Error Loading Exam</h1></div>`;
        console.error("Critical MFE Error:", error);
    }
}

startApp();