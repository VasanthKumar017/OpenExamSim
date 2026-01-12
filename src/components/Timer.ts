export class Timer {
    private timeLeft: number;
    private timerId: number | null = null;
    private displayElement: HTMLElement | null | undefined; 
    private onTimeUp: () => void;

    constructor(
        duration: number, 
        onTimeUp: () => void, 
        initialSeconds?: number, 
        displayElement?: HTMLElement | null 
    ) {
        this.timeLeft = initialSeconds !== undefined ? initialSeconds : duration;
        this.onTimeUp = onTimeUp;
        this.displayElement = displayElement;
        this.updateDisplay();
    }

    public start() {
        if (this.timerId) return;
        this.timerId = window.setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            if (this.timeLeft <= 0) this.stop();
        }, 1000);
    }

    public stop() {
        if (this.timerId) clearInterval(this.timerId);
        if (this.timeLeft <= 0) this.onTimeUp();
    }

    public getTimeLeft() { return this.timeLeft; }

    private updateDisplay() {
        if (this.displayElement) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            
            // Only update the numbers
            this.displayElement.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Handle warning states based on your professional SCSS classes
            if (this.timeLeft < 300) { // Less than 5 minutes
                this.displayElement.classList.add('timer-low');
                this.displayElement.classList.remove('timer-normal');
            } else {
                this.displayElement.classList.add('timer-normal');
                this.displayElement.classList.remove('timer-low');
            }
        }
    }
}