export class ScreenShake {
	constructor() {
		this.intensity = 0;
		this.duration = 0;
	}

	trigger(intensity = 8, duration = 12) {
		this.intensity = intensity;
		this.duration = duration;
	}

	update() {
		if (this.duration > 0) {
			this.duration--;
			this.intensity *= 0.9;
		} else {
			this.intensity = 0;
		}
	}

	getOffset() {
		if (this.intensity <= 0.5) return { x: 0, y: 0 };
		return {
			x: (Math.random() - 0.5) * this.intensity,
			y: (Math.random() - 0.5) * this.intensity,
		};
	}
}
