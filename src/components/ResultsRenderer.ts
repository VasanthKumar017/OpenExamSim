import { ExamEngine } from '../core/engine';

export class ResultsRenderer {
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public render(engine: ExamEngine) {
        const { score, total, percentage } = engine.calculateScore();
        const questions = engine.getQuestions();
        const userAnswers = engine.getState().answers;

        this.container.innerHTML = `
            <div class="results-container">
                <div class="results-summary">
                    <h1>Performance Report</h1>
                    <div class="score-badge">${score} / ${total}</div>
                    <p class="percentage">${percentage}%</p>
                    <button id="restart-exam-btn" class="restart-btn">Try Again</button>
                </div>
                
                <div class="review-list">
                    ${questions.map((q, index) => {
                        const userAnsIndex = userAnswers[index];
                        const isCorrect = userAnsIndex === q.correctAnswer;

                        return `
                            <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                                <div class="review-header">
                                    <strong>Question ${index + 1}</strong>
                                    <span class="status-icon">${isCorrect ? '✔' : '✘'}</span>
                                </div>
                                <p class="q-text">${q.text}</p>
                                <div class="ans-comparison">
                                    <div class="ans-box">
                                        <label>Your Choice</label>
                                        <p>${userAnsIndex !== undefined ? q.options[userAnsIndex as number] : '<em>Skipped</em>'}</p>
                                    </div>
                                    ${!isCorrect ? `
                                        <div class="ans-box correct">
                                            <label>Correct Answer</label>
                                            <p>${q.options[q.correctAnswer]}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.container.querySelector('#restart-exam-btn')?.addEventListener('click', () => {
            window.location.reload();
        });
    }
}