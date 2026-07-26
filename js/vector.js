export function normalize(dx, dy) {
	const len = Math.hypot(dx, dy);
	if (len === 0) return { x: 0, y: 0 };
	return { x: dx / len, y: dy / len };
}
