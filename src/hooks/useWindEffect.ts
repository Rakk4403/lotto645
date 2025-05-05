import { useEffect, useRef } from "react";
import Matter from "matter-js";

export function useWindEffect(
  engine: Matter.Engine | null,
  containerConfig: {
    size: number;
    radius: number;
    x: number;
    y: number;
    ballRadius: number;
    ringThickness: number;
    innerWallRadius: number;
    spawnRadius: number;
  } | null
) {
  const activeRef = useRef(false);

  useEffect(() => {
    // engine이나 containerConfig가 null인 경우 아무것도 하지 않음
    if (!engine || !containerConfig) return;

    const Composite = Matter.Composite;
    const windOrigin = {
      x: containerConfig.x,
      y: containerConfig.y + containerConfig.radius,
    };
    const maxDistance = containerConfig.radius;

    const applyWind = () => {
      const bodies = Composite.allBodies(engine.world);

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
          const forceMagnitude = strength * 0.5;

          Matter.Body.applyForce(body, body.position, {
            x: Math.random() * forceMagnitude - forceMagnitude / 2,
            y: -forceMagnitude,
          });
        }
      }
    };

    const tick = () => {
      if (activeRef.current) {
        applyWind();
      }
    };

    Matter.Events.on(engine, "beforeUpdate", tick);
    return () => {
      Matter.Events.off(engine, "beforeUpdate", tick);
    };
  }, [engine, containerConfig]);

  return {
    startWind: () => {
      activeRef.current = true;
    },
    stopWind: () => {
      activeRef.current = false;
    },
  };
}
