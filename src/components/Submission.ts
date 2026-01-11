import { ExamEngine } from '../core/engine';

export class SubmissionController {
    private container: HTMLElement;
    private engine: ExamEngine;

    constructor(engine: ExamEngine) {
        this.engine = engine;
        // This MUST match the ID in your index.html
        this.container = document.getElementById('submission-slot')!;
        this.container.classList.add('submission-bar');
    }

    // This is the method the error is complaining about
    public renderLockBtn(selectedIndex: number, onConfirm: () => void) {
        this.container.innerHTML = `
            <button id="lock-btn" class="lock-btn">Confirm Answer</button>
        `;

        const btn = document.getElementById('lock-btn') as HTMLButtonElement;
        
        btn.onclick = () => {
            // Save the answer to the engine only when clicked
            this.engine.handleAnswer(selectedIndex);
            
            // Visual feedback
            btn.innerText = "Locked ✓";
            btn.classList.add('locked');
            btn.disabled = true;

            // Run the callback to update the rest of the app
            onConfirm();
        };
    }

    public clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}