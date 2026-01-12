import { ExamEngine } from '../core/engine';

export class ResultsRenderer {
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    // Helper to compare answers (handles both numbers and arrays of numbers)
    private isCorrect(userAns: number | number[] | undefined, correctAns: number | number[]): boolean {
        if (userAns === undefined) return false;
        
        if (Array.isArray(userAns) && Array.isArray(correctAns)) {
            return userAns.length === correctAns.length && 
                   userAns.every(val => correctAns.includes(val));
        }
        
        return userAns === correctAns;
    }

    // Helper to format display text for the review list
    private formatAnswer(ans: number | number[] | undefined, options: string[]): string {
        if (ans === undefined || (Array.isArray(ans) && ans.length === 0)) {
            return '<em>Skipped</em>';
        }
        if (Array.isArray(ans)) {
            return ans.map(i => options[i]).join(', ');
        }
        return options[ans];
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
                        const userAns = userAnswers[index];
                        const isCorrect = this.isCorrect(userAns, q.correctAnswer);

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
                                        <p>${this.formatAnswer(userAns, q.options)}</p>
                                    </div>
                                    ${!isCorrect ? `
                                        <div class="ans-box correct">
                                            <label>Correct Answer</label>
                                            <p>${this.formatAnswer(q.correctAnswer, q.options)}</p>
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