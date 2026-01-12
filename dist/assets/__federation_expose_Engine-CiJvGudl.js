class ExamEngine {
  questions;
  state;
  constructor(questions) {
    this.questions = questions;
    this.state = {
      currentIdx: 0,
      answers: {},
      isSubmitted: false
    };
  }
  // --- STATE RECOVERY ---
  /**
   * Resumes the exam from a saved localStorage object.
   * Crucial for the "Free Tool" UX so users don't lose progress on refresh.
   */
  loadState(savedState) {
    this.state = { ...savedState };
  }
  // --- DATA GETTERS ---
  /**
   * Returns the full list of questions.
   */
  getQuestions() {
    return this.questions;
  }
  /**
   * Returns the question currently being displayed.
   */
  getCurrentQuestion() {
    return this.questions[this.state.currentIdx];
  }
  /**
   * Returns a snapshot of the current exam progress.
   */
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
    }
  }
  prev() {
    if (this.state.currentIdx > 0) {
      this.state.currentIdx--;
    }
  }
  /**
   * Jump directly to a specific question (used by the Navigation sidebar).
   */
  goToQuestion(index) {
    if (index >= 0 && index < this.questions.length) {
      this.state.currentIdx = index;
    }
  }
  // --- ACTION HANDLERS ---
  /**
   * Saves the user's selection immediately.
   * Works with the Radio Button flow in main.ts.
   */
  handleAnswer(answerIndex) {
    this.state.answers[this.state.currentIdx] = answerIndex;
  }
  /**
   * Marks the exam as complete.
   */
  submit() {
    this.state.isSubmitted = true;
  }
  // --- LOGIC & MATH ---
  /**
   * Centralized scoring logic. 
   * Move this here so both ResultsRenderer and Navigation use the same math.
   */
  calculateScore() {
    let score = 0;
    this.questions.forEach((q, idx) => {
      const userAns = this.state.answers[idx];
      if (userAns !== void 0 && userAns === q.correctAnswer) {
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
