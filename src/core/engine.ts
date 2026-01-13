import { Question, ExamState } from '../types';

/**
 * The Brain of the MFE: Manages all exam logic and data state.
 * Updated to handle robust type checking for multiple-choice and checkboxes.
 */
export class ExamEngine {
    private questions: Question[];
    private state: ExamState;

    constructor(questions: Question[]) {
        this.questions = questions;
        this.state = {
            currentIdx: 0,
            answers: new Array(questions.length).fill(undefined),
            isSubmitted: false,
            // Track which questions the user has actually seen
            visited: new Array(questions.length).fill(false) 
        };
        // Mark the very first question as visited immediately
        this.state.visited[0] = true;
    }

    // --- STATE RECOVERY ---
    public loadState(savedState: ExamState): void {
        // Ensure visited exists if loading from an older save
        this.state = { 
            ...savedState,
            visited: savedState.visited || new Array(this.questions.length).fill(false)
        };
    }

    // --- DATA GETTERS ---
    public getQuestions(): Question[] {
        return this.questions;
    }

    public getCurrentQuestion(): Question {
        return this.questions[this.state.currentIdx];
    }

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
            this.markVisited(this.state.currentIdx);
        }
    }

    public prev(): void {
        if (this.state.currentIdx > 0) {
            this.state.currentIdx--;
            this.markVisited(this.state.currentIdx);
        }
    }

    public goToQuestion(index: number): void {
        if (index >= 0 && index < this.questions.length) {
            this.state.currentIdx = index;
            this.markVisited(index);
        }
    }

    private markVisited(index: number): void {
        if (this.state.visited) {
            this.state.visited[index] = true;
        }
    }

    // --- ACTION HANDLERS ---
    handleAnswer(index: number) {
        const question = this.getCurrentQuestion();
        const currentAnswers = this.state.answers[this.state.currentIdx];
    
        if (question.type === 'checkbox') {
            let newAnswers = Array.isArray(currentAnswers) ? [...currentAnswers] : [];
            
            if (newAnswers.includes(index)) {
                newAnswers = newAnswers.filter(i => i !== index);
            } else {
                newAnswers.push(index);
            }
            this.state.answers[this.state.currentIdx] = newAnswers;
        } else {
            this.state.answers[this.state.currentIdx] = index;
        }
    }

    public submit(): void {
        this.state.isSubmitted = true;
    }

    // --- LOGIC & MATH ---

    /**
     * Helper to compare single or multiple answers safely.
     */
    private isCorrect(userAns: any, correctAns: any): boolean {
        if (userAns === undefined) return false;

        // Robust check for Checkbox (Array) types
        if (Array.isArray(userAns) && Array.isArray(correctAns)) {
            return userAns.length === correctAns.length && 
                   userAns.every(val => correctAns.includes(val));
        }
        
        // Simple check for Multiple Choice (Number) types
        return userAns === correctAns;
    }

    /**
     * Centralized scoring logic. 
     * Now uses the robust isCorrect helper to prevent breakage with checkbox types.
     */
    public calculateScore() {
        let score = 0;
        this.questions.forEach((q, idx) => {
            const userAns = this.state.answers[idx];
            
            if (this.isCorrect(userAns, q.correctAnswer)) {
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