export class Timer {
    private timeLeft: number;
    private intervalId: number | null = null;
    private element: HTMLElement | null = null;
    private onTimeUp: () => void;

    constructor(durationSeconds: number, onTimeUp: () => void) {
        this.timeLeft = durationSeconds;
        this.onTimeUp = onTimeUp;
        this.element = document.getElementById('timer');
    }

    public start() {
        if (!this.element) return;

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
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private updateDisplay() {
        if (this.element) {
            const mins = Math.floor(this.timeLeft / 60);
            const secs = this.timeLeft % 60;
            const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
            
            // Updates the text while keeping your prefix
            this.element.innerText = `Time Remaining: ${timeString}`;

            // Visual cue: turn red if less than 5 minutes left
            if (this.timeLeft < 300) {
                this.element.classList.add('timer-low');
            }
        }
    }
}