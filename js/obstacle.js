export class Obstacle {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	draw(ctx) {
		ctx.fillStyle = "#3c3836";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.strokeStyle = "#282828";
		ctx.lineWidth = 3;
		ctx.strokeRect(this.x, this.y, this.width, this.height);

		ctx.strokeStyle = "rgba(40, 40, 40, 0.4)";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(this.x + this.width / 2, this.y);
		ctx.lineTo(this.x + this.width / 2, this.y + this.height);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(this.x, this.y + this.height / 2);
		ctx.lineTo(this.x + this.width, this.y + this.height / 2);
		ctx.stroke();
	}
}
