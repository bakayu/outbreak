const SCORE_HISTORY_KEY = "outbreak_score_history";

export function loadScores() {
	try {
		const savedScores = localStorage.getItem(SCORE_HISTORY_KEY);
		if (!savedScores) return [];

		const scores = JSON.parse(savedScores);
		return Array.isArray(scores) ? scores : [];
	} catch {
		return [];
	}
}

export function saveScore(score, difficulty) {
	try {
		const scores = loadScores();

		scores.push({
			score: score,
			difficulty: difficulty.label,
			playedAt: new Date().toISOString(),
		});

		scores.sort((a, b) => {
			if (a.score !== b.score) {
				return b.score - a.score
			}
			return b.weight - a.weight;
		});

		const scoresUpdated = scores.slice(0, 50);

		console.log(JSON.stringify(scoresUpdated));
		localStorage.setItem(
			SCORE_HISTORY_KEY,
			JSON.stringify(scoresUpdated),
		);
	} catch (e) {
		console.error("saving score to localStorage failed:", e);
	}
}

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
	} catch (e) {
		console.error("saving high score failed:", e);
	}
}
