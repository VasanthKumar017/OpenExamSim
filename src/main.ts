import './styles/main.scss';
import { ExamEngine } from './core/engine';
import { QuestionRenderer } from './core/renderer';
import { fetchExamData } from './core/data-loader';
import { setupNavigation } from './components/Navigation';
import { renderResults } from './components/Results';

async function startApp() {
    const appContainer = document.querySelector<HTMLDivElement>('#app')!;
    
    try {
        const questions = await fetchExamData();
        const engine = new ExamEngine(questions);
        const renderer = new QuestionRenderer();

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

        // Initialize our new Component logic
        setupNavigation(
            engine, 
            updateUI, 
            (score) => renderResults(appContainer, score, questions.length)
        );

        // Handle answer selection (stays in main for communication between Renderer and Engine)
        window.addEventListener('answer-selected', (e: Event) => {
            const customEvent = e as CustomEvent;
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