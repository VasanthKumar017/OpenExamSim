export class FullscreenExamManager {
    private warningCount: number = 0;
    private maxWarnings: number = 3;
    private onExamEnd: () => void;
    private handleBeforeUnloadFn: (e: BeforeUnloadEvent) => string | undefined;
    private handleVisibilityChangeFn: () => void;
    private handleKeyDownFn: (e: KeyboardEvent) => void;
    private wasHidden: boolean = false;

    constructor(onExamEnd: () => void) {
        this.onExamEnd = onExamEnd;
        this.setupHandlers();
    }

    private setupHandlers() {
        this.handleBeforeUnloadFn = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            this.warningCount++;

            if (this.warningCount >= this.maxWarnings + 1) {
                this.onExamEnd();
                return;
            }

            const remainingWarnings = this.maxWarnings - this.warningCount + 1;
            const message = `Warning ${this.warningCount}/${this.maxWarnings + 1}: You have ${remainingWarnings} warnings left before your exam ends!`;
            e.returnValue = message;
            return message;
        };

        this.handleVisibilityChangeFn = () => {
            if (document.hidden && !this.wasHidden) {
                this.wasHidden = true;
                this.warningCount++;

                if (this.warningCount >= this.maxWarnings + 1) {
                    this.onExamEnd();
                    return;
                }

                const remainingWarnings = this.maxWarnings - this.warningCount + 1;
                alert(`Warning ${this.warningCount}/${this.maxWarnings + 1}: You left the exam window! You have ${remainingWarnings} warnings left before your exam ends.`);
            } else if (!document.hidden) {
                this.wasHidden = false;
            }
        };

        this.handleKeyDownFn = (e: KeyboardEvent) => {
            // Windows key has keyCode 91 (left) or 92 (right), or metaKey property
            if (e.key === 'Meta' || e.keyCode === 91 || e.keyCode === 92) {
                e.preventDefault();
                this.warningCount++;

                if (this.warningCount >= this.maxWarnings + 1) {
                    this.onExamEnd();
                    return;
                }

                const remainingWarnings = this.maxWarnings - this.warningCount + 1;
                alert(`Warning ${this.warningCount}/${this.maxWarnings + 1}: Windows key is disabled! You have ${remainingWarnings} warnings left before your exam ends.`);
            }
        };
    }

    public startExam() {
        // Enter fullscreen
        const appElement = document.documentElement;
        if (appElement.requestFullscreen) {
            appElement.requestFullscreen().catch(err => {
                console.warn('Fullscreen request failed:', err);
            });
        }

        // Add event listeners
        window.addEventListener('beforeunload', this.handleBeforeUnloadFn);
        window.addEventListener('visibilitychange', this.handleVisibilityChangeFn);
        window.addEventListener('keydown', this.handleKeyDownFn);

        // Reset warning count and visibility state
        this.warningCount = 0;
        this.wasHidden = false;
    }

    public endExam() {
        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        // Remove event listeners
        window.removeEventListener('beforeunload', this.handleBeforeUnloadFn);
        window.removeEventListener('visibilitychange', this.handleVisibilityChangeFn);
        window.removeEventListener('keydown', this.handleKeyDownFn);

        // Reset warning count
        this.warningCount = 0;
        this.wasHidden = false;
    }

    public getWarningCount(): number {
        return this.warningCount;
    }

    public resetWarnings() {
        this.warningCount = 0;
    }
}
