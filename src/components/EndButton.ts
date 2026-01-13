export class EndButton {
    private button: HTMLButtonElement | null;
    private onFinish: () => void;

    constructor(buttonElement: HTMLButtonElement | null, onFinish: () => void) {
        this.button = buttonElement;
        this.onFinish = onFinish;
        this.init();
    }

    private init() {
        if (!this.button) return;

        this.button.addEventListener('click', () => {
            if (confirm("Are you sure you want to end the test and see your results?")) {
                this.onFinish();
            }
        });
    }

    show() {
        if (this.button) {
            this.button.style.display = 'block';
        }
    }

    hide() {
        if (this.button) {
            this.button.style.display = 'none';
        }
    }
}
