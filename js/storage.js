export function loadHighScore() {
	try {
		return parseInt(localStorage.getItem("outbreak_highscore") || "0", 10);
	} catch {
		return 0;
	}
}

export function saveHighScore(score) {
	try {
		localStorage.setItem("outbreak_highscore", String(score));
	} catch {
		console.log("saving high score failed");
	}
}
