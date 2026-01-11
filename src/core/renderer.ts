import { Question } from '../types';

export class QuestionRenderer {
    private container: HTMLElement;
    private textElement: HTMLElement;

    constructor() {
        this.container = document.getElementById('options-container')!;
        this.textElement = document.getElementById('q-text')!;
    }

    public render(question: Question, currentAnswer?: number | number[]) {
        this.textElement.innerText = question.text;
        this.container.innerHTML = ''; // Clear previous options

        question.options.forEach((option, index) => {
            const button = document.createElement('div');
            button.className = 'option-card';
            
            // Check if this option was previously selected
            const isSelected = Array.isArray(currentAnswer) 
                ? currentAnswer.includes(index) 
                : currentAnswer === index;

            if (isSelected) button.classList.add('selected');

            button.innerHTML = `
                <span class="option-label">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            `;

            button.onclick = () => this.handleSelection(index, question.type);
            this.container.appendChild(button);
        });
    }

    private handleSelection(index: number, type: 'multiple-choice' | 'checkbox') {
        // We will emit an event or call a callback to update the Engine state
        const event = new CustomEvent('answer-selected', { 
            detail: { index, type } 
        });
        window.dispatchEvent(event);
    }
}