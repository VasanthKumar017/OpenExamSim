import { Question } from '../types';

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
            
            // Fix: Logic is now declared here, not in main.ts
            const isSelected = Array.isArray(currentAnswer) 
                ? currentAnswer.includes(index) 
                : currentAnswer === index;
            
            card.className = `option-card ${isSelected ? 'selected' : ''}`;

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

            card.onclick = () => this.handleSelection(index, question.type);
            this.container.appendChild(card);
        });
    }

    private handleSelection(index: number, type: 'multiple-choice' | 'checkbox') {
        window.dispatchEvent(new CustomEvent('answer-selected', { 
            detail: { index, type } 
        }));
    }
}