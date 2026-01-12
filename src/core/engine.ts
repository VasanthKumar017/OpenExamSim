import { Question, ExamState } from '../types';

/**
 * The Brain of the MFE: Manages all exam logic and data state.
 * Keeping this logic here ensures the UI stays "skin-deep" and simple.
 */
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

    // --- STATE RECOVERY ---

    /**
     * Resumes the exam from a saved localStorage object.
     * Crucial for the "Free Tool" UX so users don't lose progress on refresh.
     */
    public loadState(savedState: ExamState): void {
        this.state = { ...savedState };
    }

    // --- DATA GETTERS ---

    /**
     * Returns the full list of questions.
     */
    public getQuestions(): Question[] {
        return this.questions;
    }

    /**
     * Returns the question currently being displayed.
     */
    public getCurrentQuestion(): Question {
        return this.questions[this.state.currentIdx];
    }

    /**
     * Returns a snapshot of the current exam progress.
     */
    public getState() {
        return {
            ...this.state,
            total: this.questions.length
        };
    }

    // --- NAVIGATION ---

    public next(): void {
        if (this.state.currentIdx < this.questions.length - 1) {
            this.state.currentIdx++;
        }
    }

    public prev(): void {
        if (this.state.currentIdx > 0) {
            this.state.currentIdx--;
        }
    }

    /**
     * Jump directly to a specific question (used by the Navigation sidebar).
     */
    public goToQuestion(index: number): void {
        if (index >= 0 && index < this.questions.length) {
            this.state.currentIdx = index;
        }
    }

    // --- ACTION HANDLERS ---

    /**
     * Saves the user's selection immediately.
     * Works with the Radio Button flow in main.ts.
     */
    public handleAnswer(answerIndex: number | number[]): void {
        this.state.answers[this.state.currentIdx] = answerIndex;
    }

    /**
     * Marks the exam as complete.
     */
    public submit(): void {
        this.state.isSubmitted = true;
    }

    // --- LOGIC & MATH ---

    /**
     * Centralized scoring logic. 
     * Move this here so both ResultsRenderer and Navigation use the same math.
     */
    public calculateScore() {
        let score = 0;
        this.questions.forEach((q, idx) => {
            const userAns = this.state.answers[idx];
            
            // Check if answer exists and matches the correct index
            if (userAns !== undefined && userAns === q.correctAnswer) {
                score++;
            }
        });

        return { 
            score, 
            total: this.questions.length,
            percentage: ((score / this.questions.length) * 100).toFixed(1)
        };
    }
}