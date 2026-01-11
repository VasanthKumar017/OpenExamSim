import { Question, ExamState } from '../types';

export class ExamEngine {
    private questions: Question[];
    private state: ExamState;

    constructor(questions: Question[]) {
        this.questions = questions;
        this.state = {
            currentIdx: 0,
            answers: {},
            isSubmitted: false
        };
    }

    /**
     * Returns the full list of questions. 
     * Essential for the Results component to calculate the score.
     */
    public getQuestions(): Question[] {
        return this.questions;
    }

    /**
     * Returns the question the user is currently looking at.
     */
    public getCurrentQuestion(): Question {
        return this.questions[this.state.currentIdx];
    }

    /**
     * Returns the current progress and all selected answers.
     */
    public getState() {
        return {
            ...this.state,
            total: this.questions.length
        };
    }

    /**
     * Moves to the next question if available.
     */
    public next(): void {
        if (this.state.currentIdx < this.questions.length - 1) {
            this.state.currentIdx++;
        }
    }

    /**
     * Moves to the previous question if available.
     */
    public prev(): void {
        if (this.state.currentIdx > 0) {
            this.state.currentIdx--;
        }
    }

    /**
     * Saves the user's selection for the current question.
     * @param answerIndex The index of the selected option (0, 1, 2, or 3).
     */
    public handleAnswer(answerIndex: number | number[]): void {
        this.state.answers[this.state.currentIdx] = answerIndex;
    }
}