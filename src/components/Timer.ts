export class Timer {
    private timeLeft: number;
    private totalTime: number;
    private intervalId: number | null = null;
    private element: HTMLElement | null = null;
    private onTimeUp: () => void;

    constructor(durationSeconds: number, onTimeUp: () => void) {
        this.totalTime = durationSeconds;
        this.timeLeft = durationSeconds;
        this.onTimeUp = onTimeUp;
        this.element = document.getElementById('timer');
    }

    public start() {
        if (!this.element) return;
        
        // Initial color state
        this.element.classList.add('timer-normal');
        this.updateDisplay();

        this.intervalId = window.setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.stop();
                this.onTimeUp();
            }
        }, 1000);
    }

    public stop() {
        if (this.intervalId) clearInterval(this.intervalId);
    }

    private updateDisplay() {
        if (!this.element) return;

        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
        this.element.innerText = `Time Remaining: ${timeString}`;

        // Calculate 10% threshold
        const threshold = this.totalTime * 0.1;

        if (this.timeLeft <= threshold) {
            this.element.classList.remove('timer-normal');
            this.element.classList.add('timer-low');
        }
    }
}