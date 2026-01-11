import { Question } from '../types';

export class ResultsRenderer {
    private container: HTMLElement;

    constructor() {
        // Targets the main 'app' div to clear the exam UI and show results
        this.container = document.getElementById('app')!;
    }

    public render(questions: Question[], userAnswers: Record<number, number | number[]>) {
        let score = 0;

        // Calculate score
        questions.forEach((q, index) => {
            if ((userAnswers[index] as number) === (q.correctAnswer as number)) {
                score++;
            }
        });

        this.container.innerHTML = `
            <div class="results-container">
                <div class="results-summary">
                    <h1>Performance Report</h1>
                    <div class="score-badge">${score} / ${questions.length}</div>
                    <p class="percentage">${((score / questions.length) * 100).toFixed(1)}%</p>
                    <button onclick="window.location.reload()" class="restart-btn">Try Again</button>
                </div>

                <div class="review-list">
                    ${questions.map((q, index) => {
                        const userAnsIndex = userAnswers[index];
                        const isCorrect = (userAnsIndex as number) === (q.correctAnswer as number);

                        return `
                            <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                                <div class="review-header">
                                    <strong>Question ${index + 1}</strong>
                                    <span class="status-icon">${isCorrect ? '✔' : '✘'}</span>
                                </div>
                                
                                <p class="q-text">${q.text}</p>
                                
                                <div class="ans-comparison">
                                    <div class="ans-box your-ans-box ${!isCorrect ? 'wrong' : ''}">
                                        <label>Your Choice</label>
                                        <p>
                                            ${userAnsIndex !== undefined 
                                                ? q.options[userAnsIndex as number] 
                                                : 'Skipped'}
                                        </p>
                                    </div>
                                    
                                    ${!isCorrect ? `
                                        <div class="ans-box correct-ans-box">
                                            <label>Correct Answer</label>
                                            <p>${q.options[q.correctAnswer as number]}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
}