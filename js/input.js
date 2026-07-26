export class InputManager {
	constructor(canvas) {
		this.canvas = canvas;
		this.keys = {};
		this.mouse = { x: 0, y: 0 };
		this.isMouseDown = false;

		this.initListeners();
	}

	initListeners() {
		window.addEventListener("keydown", (e) => {
			this.keys[e.code] = true;
		});

		window.addEventListener("keyup", (e) => {
			this.keys[e.code] = false;
		});

		this.canvas.addEventListener("mousemove", (e) => {
			const rect = this.canvas.getBoundingClientRect();
			const scaleX = this.canvas.width / rect.width;
			const scaleY = this.canvas.height / rect.height;

			this.mouse.x = (e.clientX - rect.left) * scaleX;
			this.mouse.y = (e.clientY - rect.top) * scaleY;
		});

		this.canvas.addEventListener("mousedown", (e) => {
			if (e.button === 0) {
				this.isMouseDown = true;
			}
		});

		window.addEventListener("mouseup", (e) => {
			if (e.button === 0) {
				this.isMouseDown = false;
			}
		});
	}

	isKeyDown(code) {
		return !!this.keys[code];
	}
}
