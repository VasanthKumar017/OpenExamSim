export class Timer {
    private timeLeft: number;
    private totalTime: number;
    private intervalId: number | null = null;
    private element: HTMLElement | null = null;
    private onTimeUp: () => void;

    // Corrected: Only ONE constructor implementation
    constructor(durationSeconds: number, onTimeUp: () => void, startTime?: number) {
        this.totalTime = durationSeconds;
        // Uses startTime from localStorage if it exists, otherwise starts from the beginning
        this.timeLeft = startTime !== undefined ? startTime : durationSeconds;
        this.onTimeUp = onTimeUp;
        this.element = document.getElementById('timer');
        
        // Update display immediately so the user doesn't see "00:00" while waiting
        this.updateDisplay();
    }

    public start() {
        if (!this.element) return;
        if (this.intervalId) return; // Prevent multiple timers from running at once
        
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
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    public getTimeLeft(): number {
        return this.timeLeft;
    }

    private updateDisplay() {
        if (!this.element) return;

        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
        this.element.innerText = `Time Remaining: ${timeString}`;

        const threshold = this.totalTime * 0.1;

        if (this.timeLeft <= threshold) {
            this.element.classList.remove('timer-normal');
            this.element.classList.add('timer-low');
        }
    }
}