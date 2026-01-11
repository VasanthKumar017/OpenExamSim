import { ExamEngine } from '../core/engine';

export const setupNavigation = (engine: ExamEngine, onUpdate: () => void, onFinish: (score: number) => void) => {
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');

    prevBtn?.addEventListener('click', () => {
        engine.prev();
        onUpdate();
    });

    nextBtn?.addEventListener('click', () => {
        const state = engine.getState();
        const questions = engine.getQuestions();

        // Logic to determine if we are Finishing or going Next
        if (state.currentIdx === questions.length - 1) {
            // Calculate Score
            let score = 0;
            questions.forEach((q, idx) => {
                if (state.answers[idx] === q.correctAnswer) score++;
            });
            onFinish(score);
        } else {
            engine.next();
            onUpdate();
        }
    });
};