export function circleCollision(a, b) {
	const dist = Math.hypot(a.x - b.x, a.y - b.y);
	return dist < a.radius + b.radius;
}

export function circleRectCollision(circle, rect) {
	const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
	const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

	const dx = circle.x - closestX;
	const dy = circle.y - closestY;
	const distSq = dx * dx + dy * dy;

	return distSq < circle.radius * circle.radius;
}

export function moveWithCollision(entity, dx, dy, obstacles) {
	entity.x += dx;
	for (const obs of obstacles) {
		if (circleRectCollision(entity, obs)) {
			entity.x -= dx;
			break;
		}
	}

	entity.y += dy;
	for (const obs of obstacles) {
		if (circleRectCollision(entity, obs)) {
			entity.y -= dy;
			break;
		}
	}
}
