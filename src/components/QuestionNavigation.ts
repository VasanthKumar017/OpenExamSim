// src/components/QuestionNavigation.ts
import { ExamEngine } from '../core/engine';
import { eventBus } from '../utils/EventBus';

export class QuestionNavigation {
    private container: HTMLElement;
    private engine: ExamEngine;

    constructor(container: HTMLElement, engine: ExamEngine) {
        this.container = container;
        this.engine = engine;

        // Listen for UI updates to refresh the grid
        eventBus.on('refresh-nav', () => this.render());
    }

    public render() {
        const state = this.engine.getState();
        const questions = this.engine.getQuestions();
        
        this.container.innerHTML = `
            <div class="nav-sidebar">
                <h3>QUESTIONS</h3>
                <div class="question-grid">
                    ${questions.map((_, index) => {
                        const isCurrent = state.currentIdx === index;
                        const isAnswered = state.answers[index] !== undefined;
                        
                        let statusClass = '';
                        if (isCurrent) statusClass = 'current';
                        else if (isAnswered) statusClass = 'answered';

                        return `
                            <button class="nav-item ${statusClass}" data-index="${index}">
                                Q${index + 1}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add click listeners to jump to questions
        this.container.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.currentTarget as HTMLElement).dataset.index!);
                this.engine.goToQuestion(index);
                
                // Emit event to update the main question display
                eventBus.emit('refresh-nav'); 
                // We use a custom event or a direct callback in main.ts to trigger updateUI
                eventBus.emit('nav-jump');
            });
        });
    }
}