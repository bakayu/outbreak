import { normalize } from "./vector.js";
import { moveWithCollision } from "./collision.js";

const zombieImg = new Image();
zombieImg.src = "assets/zombie.png";

export class Zombie {
	constructor(x, y, difficultyConfig) {
		this.x = x;
		this.y = y;
		this.radius = 20;
		this.speed = difficultyConfig.zombieSpeed;
		this.hp = difficultyConfig.zombieHp;
		this.maxHp = this.hp;
		this.damage = 10;
		this.attackCooldown = 0;
		this.attackCooldownMax = 40;
		this.drawSize = 50;
		this.angle = 0;
	}

	update(player, obstacles, dt) {
		const dx = player.x - this.x;
		const dy = player.y - this.y;
		this.angle = Math.atan2(dy, dx);
		const dir = normalize(dx, dy);
		moveWithCollision(this, dir.x * this.speed * dt, dir.y * this.speed * dt, obstacles);

		if (this.attackCooldown > 0) {
			this.attackCooldown -= dt;
		}
	}

	takeDamage(amount) {
		this.hp -= amount;
		return this.hp <= 0;
	}

	draw(ctx) {
		ctx.save();
		ctx.translate(this.x, this.y);

		const s = this.drawSize;
		if (zombieImg.complete && zombieImg.naturalWidth > 0) {
			ctx.rotate(this.angle);
			ctx.drawImage(zombieImg, -s / 2, -s / 2, s, s);
			ctx.rotate(-this.angle);
		} else {
			ctx.fillStyle = "#98971a";
			ctx.beginPath();
			ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
			ctx.fill();
		}

		const hpRatio = this.hp / this.maxHp;
		if (hpRatio < 1) {
			const barW = 36;
			const barH = 4;
			ctx.fillStyle = "#3c3836";
			ctx.fillRect(-barW / 2, -this.radius - 12, barW, barH);
			ctx.fillStyle = hpRatio > 0.5 ? "#b8bb26" : hpRatio > 0.25 ? "#fabd2f" : "#fb4934";
			ctx.fillRect(-barW / 2, -this.radius - 12, barW * hpRatio, barH);
		}

		ctx.restore();
	}
}
