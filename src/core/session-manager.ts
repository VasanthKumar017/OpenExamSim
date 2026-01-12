import { ExamEngine } from './engine';
import { Timer } from '../components/Timer';

export class SessionManager {
    private static STORAGE_KEY = 'exam_progress';

    // Saves everything: Answers, current question index, and time left
    public static save(engine: ExamEngine, timer?: Timer | null): void {
        const state = engine.getState();
        const data = {
            engineState: state,
            timeLeft: timer ? timer.getTimeLeft() : null
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }

    // Retrieves saved data
    public static load(): any {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    }

    // Wipes the data (called when the exam is finished)
    public static clear(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    // Simple 5-second heartbeat to ensure time is saved even if user doesn't click anything
    public static startHeartbeat(engine: ExamEngine, timer: Timer | null): void {
        setInterval(() => {
            if (timer) this.save(engine, timer);
        }, 5000);
    }
}