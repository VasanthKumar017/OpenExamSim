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
      const button = document.createElement("div");
      button.className = "option-card";
      const isSelected = Array.isArray(currentAnswer) ? currentAnswer.includes(index) : currentAnswer === index;
      if (isSelected) button.classList.add("selected");
      button.innerHTML = `
                <span class="option-label">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            `;
      button.onclick = () => this.handleSelection(index, question.type);
      this.container.appendChild(button);
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
