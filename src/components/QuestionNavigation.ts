import { ExamEngine } from '../core/engine';
import { eventBus } from '../utils/EventBus';

export class QuestionNavigation {
    private container: HTMLElement;
    private engine: ExamEngine;

    constructor(container: HTMLElement, engine: ExamEngine) {
        this.container = container;
        this.engine = engine;

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

                        const answer = state.answers[index];
                        const isAnswered = answer !== undefined && answer !== null;

                        const isVisited = state.visited && state.visited[index];
                        // const isSkipped = !isAnswered && index < state.currentIdx;
                        
                        let statusClass = '';
                        if (isCurrent) {
                                statusClass = 'current';
                            } else if (isAnswered) {
                                statusClass = 'answered';
                            } else if (isVisited && !isAnswered) {
                                statusClass = 'skipped';
                            }

                        return `
                            <button class="nav-item ${statusClass}" data-index="${index}">
                                Q${index + 1}
                            </button>
                        `;
                    }).join('')}
                </div>

                <div class="nav-legend">
                    <div class="legend-item"><span class="dot orange"></span> Current</div>
                    <div class="legend-item"><span class="dot green"></span> Answered</div>
                    <div class="legend-item"><span class="dot yellow"></span> Skipped</div>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.currentTarget as HTMLElement).dataset.index!);
                this.engine.goToQuestion(index);
                eventBus.emit('refresh-nav'); 
                eventBus.emit('nav-jump');
            });
        });
    }
}