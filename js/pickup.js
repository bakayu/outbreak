const healthImg = new Image();
healthImg.src = "assets/pickup_health.png";

const ammoImg = new Image();
ammoImg.src = "assets/pickup_ammo.png";

export class Pickup {
	constructor(x, y, type) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.radius = 16;
		this.spawnTime = performance.now();
		this.lifespan = 10000;
		this.drawSize = 36;
	}

	isExpired() {
		return performance.now() - this.spawnTime > this.lifespan;
	}

	apply(player) {
		if (this.type === "health") {
			player.hp = Math.min(player.maxHp, player.hp + 30);
		} else if (this.type === "ammo") {
			player.reserveAmmo += 24;
		}
	}

	draw(ctx) {
		const age = performance.now() - this.spawnTime;
		const remaining = this.lifespan - age;
		let alpha = 1;
		if (remaining < 2000) {
			alpha = 0.3 + 0.7 * (remaining / 2000) * (0.5 + 0.5 * Math.sin(age / 100));
		}

		ctx.save();
		ctx.globalAlpha = alpha;

		const s = this.drawSize;
		const img = this.type === "health" ? healthImg : ammoImg;

		if (img.complete && img.naturalWidth > 0) {
			ctx.drawImage(img, this.x - s / 2, this.y - s / 2, s, s);
		} else {
			if (this.type === "health") {
				ctx.fillStyle = "#fb4934";
				ctx.fillRect(this.x - 12, this.y - 4, 24, 8);
				ctx.fillRect(this.x - 4, this.y - 12, 8, 24);
			} else {
				ctx.fillStyle = "#fabd2f";
				ctx.fillRect(this.x - 12, this.y - 7, 24, 14);
				ctx.strokeStyle = "#d79921";
				ctx.lineWidth = 1.5;
				ctx.strokeRect(this.x - 12, this.y - 7, 24, 14);
			}
		}

		ctx.restore();
	}
}
