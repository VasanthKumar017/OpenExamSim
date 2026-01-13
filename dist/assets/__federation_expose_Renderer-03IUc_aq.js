class EventBus extends EventTarget {
  static instance;
  constructor() {
    super();
  }
  static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  // Typed wrapper for emitting events
  emit(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
  // Typed wrapper for listening
  on(eventName, callback) {
    this.addEventListener(eventName, callback);
  }
  // Typed wrapper for removing listeners
  off(eventName, callback) {
    this.removeEventListener(eventName, callback);
  }
}
const eventBus = EventBus.getInstance();

class QuestionRenderer {
  container;
  textElement;
  constructor(container, textElement) {
    this.container = container;
    this.textElement = textElement;
  }
  render(question, currentAnswer) {
    this.textElement.innerText = question.text;
    this.container.innerHTML = "";
    question.options.forEach((option, index) => {
      const card = document.createElement("div");
      const isSelected = Array.isArray(currentAnswer) ? currentAnswer.includes(index) : currentAnswer === index;
      card.className = `option-card ${isSelected ? "selected" : ""}`;
      const inputType = question.type === "checkbox" ? "checkbox" : "radio";
      card.innerHTML = `
                <div class="radio-wrapper">
                    <input type="${inputType}" 
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
    eventBus.emit("answer-selected", { index, type });
  }
}

export { QuestionRenderer, eventBus as e };
