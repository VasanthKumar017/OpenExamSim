class ExamEngine {
  questions;
  state;
  constructor(questions) {
    this.questions = questions;
    this.state = {
      currentIdx: 0,
      answers: new Array(questions.length).fill(void 0),
      isSubmitted: false,
      // Track which questions the user has actually seen
      visited: new Array(questions.length).fill(false)
    };
    this.state.visited[0] = true;
  }
  // --- STATE RECOVERY ---
  loadState(savedState) {
    this.state = {
      ...savedState,
      visited: savedState.visited || new Array(this.questions.length).fill(false)
    };
  }
  // --- DATA GETTERS ---
  getQuestions() {
    return this.questions;
  }
  getCurrentQuestion() {
    return this.questions[this.state.currentIdx];
  }
  getState() {
    return {
      ...this.state,
      total: this.questions.length
    };
  }
  // --- NAVIGATION ---
  next() {
    if (this.state.currentIdx < this.questions.length - 1) {
      this.state.currentIdx++;
      this.markVisited(this.state.currentIdx);
    }
  }
  prev() {
    if (this.state.currentIdx > 0) {
      this.state.currentIdx--;
      this.markVisited(this.state.currentIdx);
    }
  }
  goToQuestion(index) {
    if (index >= 0 && index < this.questions.length) {
      this.state.currentIdx = index;
      this.markVisited(index);
    }
  }
  markVisited(index) {
    if (this.state.visited) {
      this.state.visited[index] = true;
    }
  }
  // --- ACTION HANDLERS ---
  handleAnswer(index) {
    const question = this.getCurrentQuestion();
    const currentAnswers = this.state.answers[this.state.currentIdx];
    if (question.type === "checkbox") {
      let newAnswers = Array.isArray(currentAnswers) ? [...currentAnswers] : [];
      if (newAnswers.includes(index)) {
        newAnswers = newAnswers.filter((i) => i !== index);
      } else {
        newAnswers.push(index);
      }
      this.state.answers[this.state.currentIdx] = newAnswers;
    } else {
      this.state.answers[this.state.currentIdx] = index;
    }
  }
  submit() {
    this.state.isSubmitted = true;
  }
  // --- LOGIC & MATH ---
  /**
   * Helper to compare single or multiple answers safely.
   */
  isCorrect(userAns, correctAns) {
    if (userAns === void 0) return false;
    if (Array.isArray(userAns) && Array.isArray(correctAns)) {
      return userAns.length === correctAns.length && userAns.every((val) => correctAns.includes(val));
    }
    return userAns === correctAns;
  }
  /**
   * Centralized scoring logic. 
   * Now uses the robust isCorrect helper to prevent breakage with checkbox types.
   */
  calculateScore() {
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
      percentage: (score / this.questions.length * 100).toFixed(1)
    };
  }
}

export { ExamEngine };
