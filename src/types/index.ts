export interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number // Number for single choice, Array for checkboxes
    type: 'multiple-choice' | 'checkbox';
}

export interface ExamState {
    currentIdx: number;
    answers: Record<number, number | number[]>;
    isSubmitted: boolean;
    visited: boolean[];
}