class QuestionRenderer {
  container;
  textElement;
  constructor() {
    this.container = document.getElementById("options-container");
    this.textElement = document.getElementById("q-text");
  }
  render(question, currentAnswer) {
    this.textElement.innerText = question.text;
    this.container.innerHTML = "";
    question.options.forEach((option, index) => {
      const card = document.createElement("div");
      card.className = "option-card";
      const isSelected = Array.isArray(currentAnswer) ? currentAnswer.includes(index) : currentAnswer === index;
      if (isSelected) card.classList.add("selected");
      card.innerHTML = `
                <div class="radio-wrapper">
                    <input type="radio" 
                           name="question-${question.id}" 
                           ${isSelected ? "checked" : ""} 
                           class="option-radio">
                </div>
                <span class="option-label-letter">${String.fromCharCode(65 + index)}.</span>
                <span class="option-text">${option}</span>
            `;
      card.onclick = () => this.handleSelection(index, question.type);
      this.container.appendChild(card);
    });
  }
  handleSelection(index, type) {
    const event = new CustomEvent("answer-selected", {
      detail: { index, type }
    });
    window.dispatchEvent(event);
  }
}

export { QuestionRenderer };
