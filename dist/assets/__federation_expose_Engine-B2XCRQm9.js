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
  /**
   * Returns the full list of questions. 
   * Essential for the Results component to calculate the score.
   */
  getQuestions() {
    return this.questions;
  }
  /**
   * Returns the question the user is currently looking at.
   */
  getCurrentQuestion() {
    return this.questions[this.state.currentIdx];
  }
  /**
   * Returns the current progress and all selected answers.
   */
  getState() {
    return {
      ...this.state,
      total: this.questions.length
    };
  }
  /**
   * Moves to the next question if available.
   */
  next() {
    if (this.state.currentIdx < this.questions.length - 1) {
      this.state.currentIdx++;
    }
  }
  /**
   * Moves to the previous question if available.
   */
  prev() {
    if (this.state.currentIdx > 0) {
      this.state.currentIdx--;
    }
  }
  /**
   * Saves the user's selection for the current question.
   * @param answerIndex The index of the selected option (0, 1, 2, or 3).
   */
  handleAnswer(answerIndex) {
    this.state.answers[this.state.currentIdx] = answerIndex;
  }
  /**
   * Marks the exam as submitted.
   */
  submit() {
    this.state.isSubmitted = true;
  }
  // Add this method to allow the engine to resume from a saved state
  loadState(savedState) {
    this.state = savedState;
  }
}

export { ExamEngine };
