import { normalize } from "./vector.js";
import { moveWithCollision } from "./collision.js";
import { Bullet } from "./bullet.js";

const playerImg = new Image();
playerImg.src = "assets/player.png";

export class Player {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.radius = 26;
		this.speed = 6;
		this.angle = 0;
		this.hp = 100;
		this.maxHp = 100;
		this.ammo = 12;
		this.maxAmmo = 12;
		this.reserveAmmo = 48;
		this.isReloading = false;
		this.reloadTimer = 0;
		this.reloadDuration = 90;
		this.fireRate = 8;
		this.fireCooldown = 0;
		this.muzzleFlashTimer = 0;
		this.drawSize = 64;
	}

	update(input, mouse, obstacles, mapWidth, mapHeight, dt) {
		let dx = 0;
		let dy = 0;

		if (input.isKeyDown("KeyW") || input.isKeyDown("ArrowUp")) dy -= 1;
		if (input.isKeyDown("KeyS") || input.isKeyDown("ArrowDown")) dy += 1;
		if (input.isKeyDown("KeyA") || input.isKeyDown("ArrowLeft")) dx -= 1;
		if (input.isKeyDown("KeyD") || input.isKeyDown("ArrowRight")) dx += 1;

		if (dx !== 0 || dy !== 0) {
			const dir = normalize(dx, dy);
			moveWithCollision(this, dir.x * this.speed * dt, dir.y * this.speed * dt, obstacles);
		}

		this.x = Math.max(this.radius, Math.min(mapWidth - this.radius, this.x));
		this.y = Math.max(this.radius, Math.min(mapHeight - this.radius, this.y));

		this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);

		if (this.fireCooldown > 0) this.fireCooldown -= dt;
		if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer -= dt;

		if (this.isReloading) {
			this.reloadTimer -= dt;
			if (this.reloadTimer <= 0) this.finishReload();
		}
	}

	tryShoot() {
		if (this.ammo > 0 && this.fireCooldown <= 0 && !this.isReloading) {
			this.ammo--;
			this.fireCooldown = this.fireRate;
			this.muzzleFlashTimer = 4;
			const tipX = this.x + Math.cos(this.angle) * 32;
			const tipY = this.y + Math.sin(this.angle) * 32;
			return new Bullet(tipX, tipY, this.angle);
		}
		return null;
	}

	startReload() {
		if (this.isReloading || this.ammo === this.maxAmmo || this.reserveAmmo <= 0) return;
		this.isReloading = true;
		this.reloadTimer = this.reloadDuration;
	}

	finishReload() {
		const needed = this.maxAmmo - this.ammo;
		const transfer = Math.min(needed, this.reserveAmmo);
		this.ammo += transfer;
		this.reserveAmmo -= transfer;
		this.isReloading = false;
		this.reloadTimer = 0;
	}

	takeDamage(amount, screenShake) {
		this.hp = Math.max(0, this.hp - amount);
		screenShake.trigger(12, 15);
	}

	draw(ctx) {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);

		const s = this.drawSize;
		if (playerImg.complete && playerImg.naturalWidth > 0) {
			ctx.drawImage(playerImg, -s / 2, -s / 2, s, s);
		} else {
			ctx.fillStyle = "#83a598";
			ctx.beginPath();
			ctx.moveTo(28, 0);
			ctx.lineTo(-16, -16);
			ctx.lineTo(-10, 0);
			ctx.lineTo(-16, 16);
			ctx.closePath();
			ctx.fill();
		}

		if (this.muzzleFlashTimer > 0) {
			const alpha = this.muzzleFlashTimer / 4;
			ctx.globalAlpha = alpha;
			ctx.fillStyle = "#fe8019";
			ctx.beginPath();
			ctx.moveTo(s / 2 + 6, 0);
			ctx.lineTo(s / 2, -7);
			ctx.lineTo(s / 2 + 20, 0);
			ctx.lineTo(s / 2, 7);
			ctx.closePath();
			ctx.fill();
			ctx.globalAlpha = 1;
		}

		ctx.restore();
	}
}
