import { GameEngine } from "./gameEngine.js";

const canvas = document.getElementById("gameCanvas");

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const engine = new GameEngine(canvas);
requestAnimationFrame(engine.loop.bind(engine));
