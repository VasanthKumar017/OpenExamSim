import { ExamEngine } from '../core/engine';

export class ResultsRenderer {
    private container: HTMLElement;
    private wrongQuestionIndices: number[] = [];
    private currentWrongQuestionIndex: number = 0;

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

    private setupWrongQuestionNavigation() {
        const prevBtn = this.container.querySelector('#prev-wrong-btn') as HTMLButtonElement;
        const nextBtn = this.container.querySelector('#next-wrong-btn') as HTMLButtonElement;

        if (!prevBtn || !nextBtn) return;

        const scrollToQuestion = (index: number) => {
            const reviewItems = this.container.querySelectorAll('.review-item');
            if (reviewItems[this.wrongQuestionIndices[index]]) {
                reviewItems[this.wrongQuestionIndices[index]].scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.currentWrongQuestionIndex = index;
                this.updateNavigationButtons();
            }
        };

        prevBtn.addEventListener('click', () => {
            if (this.currentWrongQuestionIndex > 0) {
                scrollToQuestion(this.currentWrongQuestionIndex - 1);
            }
        });

        nextBtn.addEventListener('click', () => {
            if (this.currentWrongQuestionIndex < this.wrongQuestionIndices.length - 1) {
                scrollToQuestion(this.currentWrongQuestionIndex + 1);
            }
        });

        this.updateNavigationButtons();
    }

    private updateNavigationButtons() {
        const prevBtn = this.container.querySelector('#prev-wrong-btn') as HTMLButtonElement;
        const nextBtn = this.container.querySelector('#next-wrong-btn') as HTMLButtonElement;
        const counter = this.container.querySelector('#wrong-counter') as HTMLElement;

        if (!prevBtn || !nextBtn) return;

        prevBtn.disabled = this.currentWrongQuestionIndex === 0;
        nextBtn.disabled = this.currentWrongQuestionIndex === this.wrongQuestionIndices.length - 1;

        if (counter) {
            counter.textContent = `${this.currentWrongQuestionIndex + 1} / ${this.wrongQuestionIndices.length}`;
        }
    }

    public render(engine: ExamEngine) {
        const { score, total, percentage } = engine.calculateScore();
        const questions = engine.getQuestions();
        const userAnswers = engine.getState().answers;

        // Find all wrong questions
        this.wrongQuestionIndices = [];
        questions.forEach((q, index) => {
            const userAns = userAnswers[index];
            if (!this.isCorrect(userAns, q.correctAnswer)) {
                this.wrongQuestionIndices.push(index);
            }
        });

        this.container.innerHTML = `
            <div class="results-container">
                <div class="results-summary">
                    <h1>Performance Report</h1>
                    <div class="score-badge">${score} / ${total}</div>
                    <p class="percentage">${percentage}%</p>
                    <button id="restart-exam-btn" class="restart-btn">Try Again</button>
                </div>

                ${this.wrongQuestionIndices.length > 0 ? `
                    <div class="wrong-questions-nav">
                        <div class="nav-controls">
                            <button id="prev-wrong-btn" class="nav-btn nav-btn-prev">◄</button>
                            <span id="wrong-counter" class="nav-counter">1 / ${this.wrongQuestionIndices.length}</span>
                            <button id="next-wrong-btn" class="nav-btn nav-btn-next">►</button>
                        </div>
                        <p class="nav-label">Navigate through wrong answers</p>
                    </div>
                ` : ''}
                
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

        if (this.wrongQuestionIndices.length > 0) {
            this.setupWrongQuestionNavigation();
        }
    }
}