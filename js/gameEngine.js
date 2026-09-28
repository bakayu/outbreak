import { InputManager } from "./input.js";
import { Player } from "./player.js";
import { Zombie } from "./zombie.js";
import { Pickup } from "./pickup.js";
import { Obstacle } from "./obstacle.js";
import { ScreenShake } from "./screenShake.js";
import { circleCollision } from "./collision.js";
import { loadHighScore, saveHighScore, saveScore } from "./storage.js";
import { DIFFICULTY, DROP_CHANCE } from "./config.js";

export class GameEngine {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.container = document.getElementById("game-container");
		this.state = "MENU";
		this.input = new InputManager(canvas);
		this.screenShake = new ScreenShake();

		this.player = null;
		this.entities = { zombies: [], bullets: [], pickups: [] };
		this.obstacles = [];

		this.score = 0;
		this.highScore = loadHighScore();
		this.difficulty = DIFFICULTY.medium;
		this.spawnTimer = 0;

		this.lastTime = 0;
		this.reloadKeyHeld = false;
		this.pauseKeyHeld = false;

		this.initUI();
	}

	get mapW() {
		return this.canvas.width;
	}
	get mapH() {
		return this.canvas.height;
	}

	buildObstacles() {
		const w = this.mapW;
		const h = this.mapH;
		const layouts = [
			[
				new Obstacle(w * 0.1, h * 0.12, 140, 140),
				new Obstacle(w * 0.78, h * 0.12, 140, 140),
				new Obstacle(w * 0.1, h * 0.72, 140, 140),
				new Obstacle(w * 0.78, h * 0.72, 140, 140),
				new Obstacle(w * 0.35, h * 0.08, 110, 110),
				new Obstacle(w * 0.55, h * 0.8, 110, 110),
				new Obstacle(w * 0.2, h * 0.4, 120, 140),
				new Obstacle(w * 0.7, h * 0.4, 120, 140),
			],
			[
				new Obstacle(w * 0.08, h * 0.12, 130, 120),
				new Obstacle(w * 0.78, h * 0.08, 130, 120),
				new Obstacle(w * 0.12, h * 0.72, 150, 110),
				new Obstacle(w * 0.75, h * 0.70, 150, 120),
				new Obstacle(w * 0.33, h * 0.24, 100, 100),
				new Obstacle(w * 0.56, h * 0.66, 100, 100),
				new Obstacle(w * 0.18, h * 0.42, 110, 130),
				new Obstacle(w * 0.68, h * 0.38, 110, 130),

			],
			[
				new Obstacle(w * 0.06, h * 0.08, 160, 100),
				new Obstacle(w * 0.78, h * 0.16, 120, 150),
				new Obstacle(w * 0.08, h * 0.74, 130, 110),
				new Obstacle(w * 0.76, h * 0.72, 160, 100),
				new Obstacle(w * 0.36, h * 0.28, 110, 90),
				new Obstacle(w * 0.52, h * 0.61, 110, 90),
				new Obstacle(w * 0.22, h * 0.45, 110, 120),
				new Obstacle(w * 0.67, h * 0.43, 110, 120),

			],
		];

		const randomIndex = Math.floor(Math.random() * 3);
		return layouts[randomIndex];
	}

	initUI() {
		this.menuOverlay = document.getElementById("menu-overlay");
		this.hudOverlay = document.getElementById("hud");
		this.pauseOverlay = document.getElementById("pause-overlay");
		this.gameoverOverlay = document.getElementById("gameover-overlay");

		this.hpBar = document.getElementById("hp-bar");
		this.ammoCount = document.getElementById("ammo-count");
		this.scoreCount = document.getElementById("score-count");
		this.pauseScore = document.getElementById("pause-score");
		this.pauseDifficulty = document.getElementById("pause-difficulty");
		this.pauseHighScore = document.getElementById("pause-high-score");
		this.finalScore = document.getElementById("final-score");
		this.highScoreEl = document.getElementById("high-score");
		this.newHighScoreEl = document.getElementById("new-highscore-label");

		document.getElementById("start-button").addEventListener("click", () => this.start());
		document.getElementById("restart-button").addEventListener("click", () => this.start());
		document.getElementById("menu-button").addEventListener("click", () => this.goToMenu());
		document.getElementById("pause-close").addEventListener("click", () => this.resume());

		const diffButtons = document.querySelectorAll(".diff-btn");
		diffButtons.forEach((btn) => {
			btn.addEventListener("click", () => {
				diffButtons.forEach((b) => b.classList.remove("active"));
				btn.classList.add("active");
				this.difficulty = DIFFICULTY[btn.dataset.diff];
			});
		});
	}

	start() {
		this.state = "PLAYING";
		this.obstacles = this.buildObstacles();
		this.player = new Player(this.mapW / 2, this.mapH / 2);
		this.entities = { zombies: [], bullets: [], pickups: [] };
		this.score = 0;
		this.spawnTimer = 0;
		this.screenShake = new ScreenShake();
		this.pauseKeyHeld = false;

		this.menuOverlay.classList.add("hidden");
		this.pauseOverlay.classList.add("hidden");
		this.gameoverOverlay.classList.add("hidden");
		this.hudOverlay.classList.remove("hidden");
		this.container.classList.add("playing");
		this.container.classList.remove("paused");
	}

	goToMenu() {
		this.state = "MENU";
		this.hudOverlay.classList.add("hidden");
		this.pauseOverlay.classList.add("hidden");
		this.gameoverOverlay.classList.add("hidden");
		this.menuOverlay.classList.remove("hidden");
		this.container.classList.remove("playing");
		this.container.classList.remove("paused");
	}

	pause() {
		if (this.state !== "PLAYING" || !this.player) return;

		this.state = "PAUSED";
		this.pauseScore.textContent = this.score;
		this.pauseDifficulty.textContent = this.difficulty.label;
		this.pauseHighScore.textContent = Math.max(this.highScore, this.score);
		this.pauseOverlay.classList.remove("hidden");
		this.container.classList.add("paused");
	}

	resume() {
		if (this.state !== "PAUSED") return;

		this.state = "PLAYING";
		this.pauseOverlay.classList.add("hidden");
		this.container.classList.remove("paused");
	}

	togglePause() {
		if (this.state === "PLAYING") this.pause();
		else if (this.state === "PAUSED") this.resume();
	}

	gameOver() {
		this.state = "GAMEOVER";
		this.hudOverlay.classList.add("hidden");
		this.pauseOverlay.classList.add("hidden");
		this.gameoverOverlay.classList.remove("hidden");
		this.container.classList.remove("playing");
		this.container.classList.remove("paused");

		this.finalScore.textContent = this.score;
		this.highScoreEl.textContent = this.highScore;

		saveScore(this.score, this.difficulty);
		if (this.score > this.highScore) {
			this.highScore = this.score;
			saveHighScore(this.score);
			this.highScoreEl.textContent = this.highScore;
			this.newHighScoreEl.classList.remove("hidden");
		} else {
			this.newHighScoreEl.classList.add("hidden");
		}
	}

	spawnZombie() {
		const edge = Math.floor(Math.random() * 4);
		let x, y;
		if (edge === 0) {
			x = Math.random() * this.mapW;
			y = -30;
		} else if (edge === 1) {
			x = Math.random() * this.mapW;
			y = this.mapH + 30;
		} else if (edge === 2) {
			x = -30;
			y = Math.random() * this.mapH;
		} else {
			x = this.mapW + 30;
			y = Math.random() * this.mapH;
		}
		this.entities.zombies.push(new Zombie(x, y, this.difficulty));
	}

	update(dt) {
		const escapeDown = this.input.isKeyDown("Escape");
		if ((this.state === "PLAYING" || this.state === "PAUSED") && escapeDown && !this.pauseKeyHeld) {
			this.togglePause();
		}
		this.pauseKeyHeld = escapeDown;

		if (this.state !== "PLAYING") return;

		if (this.input.isKeyDown("KeyR") && !this.reloadKeyHeld) {
			this.player.startReload();
		}
		this.reloadKeyHeld = this.input.isKeyDown("KeyR");

		this.player.update(this.input, this.input.mouse, this.obstacles, this.mapW, this.mapH, dt);

		if (this.player.ammo === 0 && !this.player.isReloading) {
			this.player.startReload();
		}

		if (this.input.isMouseDown) {
			const shot = this.player.tryShoot();
			if (shot) this.entities.bullets.push(shot);
		}

		this.spawnTimer += dt;
		const spawnThreshold = this.difficulty.spawnInterval - Math.min(this.score * 0.5, 50);
		if (this.spawnTimer >= spawnThreshold) {
			this.spawnZombie();
			this.spawnTimer = 0;
		}

		for (const zombie of this.entities.zombies) {
			zombie.update(this.player, this.obstacles, dt);
		}

		for (const bullet of this.entities.bullets) {
			bullet.update(dt);
		}

		for (const pickup of this.entities.pickups) {
			if (circleCollision(pickup, this.player)) {
				pickup.apply(this.player);
				pickup.collected = true;
			}
		}

		const deadZombies = [];

		this.entities.bullets = this.entities.bullets.filter((bullet) => {
			if (!bullet.alive) return false;
			if (bullet.isOffscreen(this.mapW, this.mapH)) return false;
			for (const obs of this.obstacles) {
				if (
					bullet.x >= obs.x &&
					bullet.x <= obs.x + obs.width &&
					bullet.y >= obs.y &&
					bullet.y <= obs.y + obs.height
				) {
					return false;
				}
			}
			for (const zombie of this.entities.zombies) {
				if (zombie.alive !== false && circleCollision(bullet, zombie)) {
					const died = zombie.takeDamage(bullet.damage);
					bullet.alive = false;
					if (died) {
						zombie.alive = false;
						deadZombies.push(zombie);
					}
					return false;
				}
			}
			return true;
		});

		for (const zombie of deadZombies) {
			this.score += 10;
			if (Math.random() < DROP_CHANCE) {
				const type = Math.random() < 0.5 ? "health" : "ammo";
				this.entities.pickups.push(new Pickup(zombie.x, zombie.y, type));
			}
		}

		this.entities.zombies = this.entities.zombies.filter((z) => z.alive !== false);

		for (const zombie of this.entities.zombies) {
			if (zombie.attackCooldown <= 0 && circleCollision(zombie, this.player)) {
				this.player.takeDamage(zombie.damage, this.screenShake);
				zombie.attackCooldown = zombie.attackCooldownMax;
			}
		}

		this.entities.pickups = this.entities.pickups.filter((p) => !p.collected && !p.isExpired());

		this.screenShake.update();

		if (this.player.hp <= 0) {
			this.gameOver();
		}

		this.updateHUD();
	}

	updateHUD() {
		if (!this.player) return;
		const hpPercent = (this.player.hp / this.player.maxHp) * 100;
		this.hpBar.style.width = `${hpPercent}%`;
		if (hpPercent < 30) this.hpBar.style.backgroundColor = "#fb4934";
		else if (hpPercent < 60) this.hpBar.style.backgroundColor = "#fabd2f";
		else this.hpBar.style.backgroundColor = "#b8bb26";

		if (this.player.isReloading) {
			this.ammoCount.textContent = "RELOADING...";
		} else {
			this.ammoCount.textContent = `${this.player.ammo} / ${this.player.reserveAmmo}`;
		}

		this.scoreCount.textContent = `${this.score}`;
	}

	render() {
		if (this.state === "PAUSED") return;

		const ctx = this.ctx;
		ctx.fillStyle = "#504945";
		ctx.fillRect(0, 0, this.mapW, this.mapH);

		if (this.state !== "PLAYING") return;

		const shake = this.screenShake.getOffset();
		ctx.save();
		ctx.translate(shake.x, shake.y);

		this.drawFloor(ctx);

		for (const obs of this.obstacles) obs.draw(ctx);
		for (const pickup of this.entities.pickups) pickup.draw(ctx);
		for (const zombie of this.entities.zombies) zombie.draw(ctx);
		for (const bullet of this.entities.bullets) bullet.draw(ctx);

		if (this.player) this.player.draw(ctx);

		ctx.restore();

		this.drawCrosshair(ctx);
	}

	drawFloor(ctx) {
		ctx.strokeStyle = "rgba(102, 92, 84, 0.5)";
		ctx.lineWidth = 1.5;
		const gridSize = 80;
		for (let x = 0; x < this.mapW; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, this.mapH);
			ctx.stroke();
		}
		for (let y = 0; y < this.mapH; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(this.mapW, y);
			ctx.stroke();
		}
	}

	drawCrosshair(ctx) {
		if (this.state !== "PLAYING") return;
		const { x, y } = this.input.mouse;
		const size = 14;
		const gap = 5;

		ctx.save();
		ctx.strokeStyle = "#ebdbb2";
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.moveTo(x - size - gap, y);
		ctx.lineTo(x - gap, y);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(x + gap, y);
		ctx.lineTo(x + size + gap, y);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(x, y - size - gap);
		ctx.lineTo(x, y - gap);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(x, y + gap);
		ctx.lineTo(x, y + size + gap);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(x, y, 2.5, 0, Math.PI * 2);
		ctx.fillStyle = "#fb4934";
		ctx.fill();

		this.drawReloadIndicator(ctx, x, y);

		ctx.restore();
	}

	drawReloadIndicator(ctx, x, y) {
		if (!this.player?.isReloading) return;

		const duration = Math.max(this.player.reloadDuration, 1);
		const remaining = Math.max(this.player.reloadTimer, 0);
		const progress = Math.min(1, Math.max(0, 1 - remaining / duration));

		ctx.save();

		ctx.lineWidth = 3;
		ctx.strokeStyle = "rgba(235, 219, 178, 0.25)";
		ctx.beginPath();
		ctx.arc(x, y, 24, 0, Math.PI * 2);
		ctx.stroke();

		ctx.strokeStyle = "#fabd2f";
		ctx.beginPath();
		ctx.arc(
			x,
			y,
			24,
			-Math.PI / 2,
			-Math.PI / 2 + progress * Math.PI * 2,
		);
		ctx.stroke();

		ctx.restore();
	}

	loop(timestamp) {
		if (!this.lastTime) this.lastTime = timestamp;
		const dt = Math.min((timestamp - this.lastTime) / (1000 / 60), 3);
		this.lastTime = timestamp;

		this.update(dt);
		this.render();

		requestAnimationFrame(this.loop.bind(this));
	}
}
