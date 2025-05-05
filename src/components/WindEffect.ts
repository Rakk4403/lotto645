import Matter from "matter-js";

export function setupWindEffect(
  engine: Matter.Engine,
  containerConfig: {
    size: number;
    radius: number;
    x: number;
    y: number;
    ballRadius: number;
    ringThickness: number;
    innerWallRadius: number;
    spawnRadius: number;
  }
) {
  const Composite = Matter.Composite;
  const bodies = Composite.allBodies(engine.world);
  const windOrigin = {
    x: containerConfig.x,
    y: containerConfig.y + containerConfig.radius,
  };
  const maxDistance = containerConfig.radius;

  for (const body of bodies) {
    if (body.isStatic) continue;

    const within6Clock =
      body.position.x >= containerConfig.x - containerConfig.size * 0.1 &&
      body.position.x <= containerConfig.x + containerConfig.size * 0.1 &&
      body.position.y >= containerConfig.y + containerConfig.radius - 40 &&
      body.position.y <= containerConfig.y + containerConfig.radius;

    const dx = body.position.x - windOrigin.x;
    const dy = body.position.y - windOrigin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < maxDistance && within6Clock) {
      const strength = 1 - distance / maxDistance;
      const forceMagnitude = strength * 0.5; // 힘의 세기 조절

      Matter.Body.applyForce(body, body.position, {
        x: Math.random() * forceMagnitude - forceMagnitude / 2,
        y: -forceMagnitude,
      });
    }
  }
}
