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
            const card = document.createElement('div');
            card.className = 'option-card';
            
            // Logic to check if this specific index is selected
            // Inside your render method in QuestionRenderer.ts
            const isSelected = Array.isArray(currentAnswer) 
                ? currentAnswer.includes(index) 
                : currentAnswer === index;
            
            if (isSelected) card.classList.add('selected');

            // Added the radio input here
            card.innerHTML = `
                <div class="radio-wrapper">
                    <input type="radio" 
                           name="question-${question.id}" 
                           ${isSelected ? 'checked' : ''} 
                           class="option-radio">
                </div>
                <span class="option-label-letter">${String.fromCharCode(65 + index)}.</span>
                <span class="option-text">${option}</span>
            `;

            // Make the whole card clickable
            card.onclick = () => this.handleSelection(index, question.type);
            this.container.appendChild(card);
        });
    }

    private handleSelection(index: number, type: 'multiple-choice' | 'checkbox') {
        const event = new CustomEvent('answer-selected', { 
            detail: { index, type } 
        });
        window.dispatchEvent(event);
    }
}