import { ExamEngine } from '../core/engine';

export const setupNavigation = (engine: ExamEngine, onUpdate: () => void, onFinish: () => void) => {
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');

    prevBtn?.addEventListener('click', () => {
        engine.prev();
        onUpdate();
    });

    nextBtn?.addEventListener('click', () => {
        const state = engine.getState();

        // Check if we are on the very last question
        if (state.currentIdx === state.total - 1) {
            // No math here! Just trigger the finish callback.
            onFinish();
        } else {
            engine.next();
            onUpdate();
        }
    });
};