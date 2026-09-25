import { loadScores, loadHighScore } from "./storage.js";

const highScoreElement = document.getElementById("high-score");
const scoreList = document.getElementById("score-list");

const scores = loadScores();

const historyHighScore = scores.reduce((highest, record) => Math.max(highest, record.score), 0);

const highScore = Math.max(loadHighScore(), historyHighScore);

highScoreElement.textContent = highScore;

if (scores.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No game history.";
    scoreList.appendChild(emptyMessage);
} else {
    scores.forEach((record, index) => {
        const listItem = document.createElement("li");

        const scoreText = document.createElement("span");
        scoreText.textContent = `${record.score} points`;

        const difficultyText = document.createElement("span");
        difficultyText.textContent = record.difficulty;

        const dateText = document.createElement("span");
        dateText.textContent = new Date(record.playedAt).toLocaleString();

        listItem.append(scoreText, difficultyText, dateText);

        if (record.score === highScore) {
            listItem.classList.add("highest-score");
        }

        scoreList.appendChild(listItem);
    });
}
