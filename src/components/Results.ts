export const renderResults = (container: HTMLElement, score: number, total: number) => {
    container.innerHTML = `
        <div class="results-card">
            <h1>Exam Completed!</h1>
            <p>You scored <strong>${score}</strong> out of <strong>${total}</strong></p>
            <button onclick="window.location.reload()" class="restart-btn">
                Restart Exam
            </button>
        </div>
    `;
};