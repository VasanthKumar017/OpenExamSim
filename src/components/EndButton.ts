import { ExamEngine } from '../core/engine';

export class EndButton {
    private button: HTMLButtonElement | null;
    private onFinish: () => void;
    private engine: ExamEngine;

    constructor(buttonElement: HTMLButtonElement | null, engine: ExamEngine, onFinish: () => void) {
        this.button = buttonElement;
        this.engine = engine;
        this.onFinish = onFinish;
        this.init();
    }

    private init() {
    if (!this.button) return;

    this.button.addEventListener('click', () => {
        const state = this.engine.getState();
        const totalCount = this.engine.getQuestions().length;
        
        // Filter out undefined answers and empty arrays (unanswered checkboxes)
        const answeredCount = (state.answers as any[]).filter(a => 
            a !== undefined && !(Array.isArray(a) && a.length === 0)
        ).length;
        const remainingCount = totalCount - answeredCount;

        // Build the message
        let message = `Are you sure you want to end the test and see your results?\n\n`;
        message += `✅ Answered: ${answeredCount} / ${totalCount}\n`;
        
        if (remainingCount > 0) {
            message += `⚠️ Unanswered: ${remainingCount}\n\n`;
            message += `Warning: You have skipped questions. Submit anyway?`;
        } else {
            message += `All questions completed!`;
        }

        if (confirm(message)) {
            this.onFinish();
        }
    });
}

    show() {
        if (this.button) {
            this.button.style.display = 'block';
        }
    }

    hide() {
        if (this.button) {
            this.button.style.display = 'none';
        }
    }
}