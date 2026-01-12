import { Question } from '../types';
import { eventBus } from '../utils/EventBus';

export class QuestionRenderer {
    private container: HTMLElement;
    private textElement: HTMLElement;

    constructor(container: HTMLElement, textElement: HTMLElement) {
        this.container = container;
        this.textElement = textElement;
    }

    public render(question: Question, currentAnswer?: number | number[]) {
        this.textElement.innerText = question.text;
        this.container.innerHTML = ''; 

        question.options.forEach((option, index) => {
            const card = document.createElement('div');
            
            // Checks if index is selected (works for both single number and array)
            const isSelected = Array.isArray(currentAnswer) 
                ? currentAnswer.includes(index) 
                : currentAnswer === index;
            
            card.className = `option-card ${isSelected ? 'selected' : ''}`;

            // FIX: Use dynamic input type (checkbox vs radio)
            const inputType = question.type === 'checkbox' ? 'checkbox' : 'radio';

            card.innerHTML = `
                <div class="radio-wrapper">
                    <input type="${inputType}" 
                           name="question-${question.id}" 
                           ${isSelected ? 'checked' : ''} 
                           class="option-radio">
                </div>
                <span class="option-label-letter">${String.fromCharCode(65 + index)}.</span>
                <span class="option-text">${option}</span>
            `;

            card.onclick = () => this.handleSelection(index, question.type);
            this.container.appendChild(card);
        });
    }

    private handleSelection(index: number, type: 'multiple-choice' | 'checkbox') {
        // We emit the type so the Engine knows whether to toggle or replace
        eventBus.emit('answer-selected', { index, type });
    }
}