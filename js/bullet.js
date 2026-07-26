export class Bullet {
	constructor(x, y, angle, speed = 16, damage = 15) {
		this.x = x;
		this.y = y;
		this.vx = Math.cos(angle) * speed;
		this.vy = Math.sin(angle) * speed;
		this.radius = 5;
		this.damage = damage;
		this.alive = true;
		this.trail = [];
		this.maxTrail = 8;
	}

	update(dt) {
		this.trail.push({ x: this.x, y: this.y });
		if (this.trail.length > this.maxTrail) {
			this.trail.shift();
		}
		this.x += this.vx * dt;
		this.y += this.vy * dt;
	}

	isOffscreen(mapWidth, mapHeight) {
		return this.x < 0 || this.x > mapWidth || this.y < 0 || this.y > mapHeight;
	}

	draw(ctx) {
		for (let i = 0; i < this.trail.length; i++) {
			const t = i / this.trail.length;
			ctx.globalAlpha = t * 0.5;
			ctx.strokeStyle = "#fe8019";
			ctx.lineWidth = 3.5 * t;

			const from = this.trail[i];
			const to = this.trail[i + 1] || { x: this.x, y: this.y };
			ctx.beginPath();
			ctx.moveTo(from.x, from.y);
			ctx.lineTo(to.x, to.y);
			ctx.stroke();
		}

		ctx.globalAlpha = 0.9;
		ctx.strokeStyle = "#fabd2f";
		ctx.lineWidth = 4;
		const last =
			this.trail.length > 0 ? this.trail[this.trail.length - 1] : { x: this.x, y: this.y };
		ctx.beginPath();
		ctx.moveTo(last.x, last.y);
		ctx.lineTo(this.x, this.y);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
		ctx.fillStyle = "#fbf1c7";
		ctx.fill();

		ctx.globalAlpha = 1;
	}
}
