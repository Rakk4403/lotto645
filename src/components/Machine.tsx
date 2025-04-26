import Matter from "matter-js";
import { useEffect, useRef } from "react";

function randomPointInCircle(cx: number, cy: number, radius: number) {
  const angle = Math.random() * 2 * Math.PI;
  const r = radius * Math.sqrt(Math.random());
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  return { x, y };
}

function createCircularWall(
  cx: number,
  cy: number,
  radius: number,
  count: number
): Matter.Body[] {
  const thickness = 20; // wall thickness
  const angleStep = (2 * Math.PI) / count;
  const chordLength = 2 * radius * Math.sin(angleStep / 2);
  const segmentLength = chordLength + 3;
  const exitAngle = (3 * Math.PI) / 2 + Math.PI / 18; // 12 o'clock shifted 5 degrees clockwise (12시 5분)
  const skipAngle = angleStep * 1.5; // width of gap (~1.5 segments)
  const walls: Matter.Body[] = [];

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    if (Math.abs(angle - exitAngle) < skipAngle) {
      continue; // skip this segment to create a gap at 12 o'clock
    }
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const wall = Matter.Bodies.rectangle(x, y, segmentLength, thickness, {
      isStatic: true,
      angle: angle + Math.PI / 2,
      render: {
        fillStyle: "transparent",
        strokeStyle: "#FF0000",
        lineWidth: 2,
      },
      collisionFilter: { category: 0x0001, mask: 0x0001 },
    });
    walls.push(wall);
  }
  return walls;
}

export function Machine() {
  const sceneRef = useRef<HTMLDivElement>(null);

  const { innerWidth, innerHeight } = window;
  const width = Math.min(innerWidth, 1200); // Adding a maximum width of 1200px
  const height = Math.min(innerHeight, 800); // Adding a maximum height of 800px

  // Use the smaller dimension to ensure the container fits within the window
  const minDimension = Math.min(width, height);

  useEffect(() => {
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Runner = Matter.Runner;
    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;

    const engine = Engine.create();
    engine.positionIterations = 12; // 기본 6 → 더 정밀한 위치 계산
    engine.velocityIterations = 8; // 기본 4 → 충돌 후 반응 개선

    const runner = Runner.create();

    const render = Render.create({
      element: sceneRef.current!,
      engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: "#ffffff",
        showAxes: true,
        showCollisions: true,
        showPositions: true,
        showBounds: true,
      },
    });

    // Calculate container size based on the smaller dimension with some padding
    const ballContainerSize = minDimension * 0.85; // Using 85% of the smaller dimension
    const ballContainerRadius = ballContainerSize / 2;
    const ballContainerX = width / 2;
    const ballContainerY = height / 2;

    const walls = createCircularWall(
      ballContainerX,
      ballContainerY,
      ballContainerRadius,
      64
    );
    const compoundWall = Matter.Body.create({
      parts: walls,
      isStatic: true,
      collisionFilter: { category: 0x0001, mask: 0x0001 },
      render: {
        fillStyle: "transparent",
        strokeStyle: "#FF0000",
        lineWidth: 2,
      },
    });

    Composite.add(engine.world, compoundWall);

    console.log(walls.length);
    console.log(walls.flatMap((wall) => wall.vertices));
    const ballRadius = Math.max(10, Math.min(20, minDimension / 40)); // Adjust ball size based on container
    const ringThickness = 10;
    const innerWallRadius = ballContainerRadius - ringThickness / 2;
    const spawnRadius = innerWallRadius - ballRadius;
    for (let i = 0; i < 45; i++) {
      const { x, y } = randomPointInCircle(
        ballContainerX,
        ballContainerY,
        spawnRadius
      );
      const ball = Bodies.circle(x, y, ballRadius, {
        restitution: 0.9,
        frictionAir: 0.02, // 공기 저항 → 최고 속도 제한
        render: {
          fillStyle: "#3498db",
        },
        collisionFilter: {
          // group: -1,
          category: 0x0001,
          mask: 0x0001,
        },
      });
      Composite.add(engine.world, ball);
    }

    Render.run(render);
    Runner.run(runner, engine);

    // Add wind force from bottom center (6 o'clock direction)
    Matter.Events.on(engine, "beforeUpdate", () => {
      const Composite = Matter.Composite;
      const bodies = Composite.allBodies(engine.world);
      const windOrigin = {
        x: ballContainerX,
        y: ballContainerY + ballContainerRadius,
      };
      const maxDistance = ballContainerRadius; // Maximum distance for wind effect
      for (const body of bodies) {
        // Skip static bodies like walls and container
        if (body.isStatic) continue;

        const within6Clock =
          body.position.x >= ballContainerX - ballContainerSize * 0.1 &&
          body.position.x <= ballContainerX + ballContainerSize * 0.1 &&
          body.position.y >= ballContainerY + ballContainerRadius - 40 &&
          body.position.y <= ballContainerY + ballContainerRadius;

        const dx = body.position.x - windOrigin.x;
        const dy = body.position.y - windOrigin.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance && within6Clock) {
          const strength = 1 - distance / maxDistance;
          const forceMagnitude = strength * 0.22; // Adjust the force magnitude

          Matter.Body.applyForce(body, body.position, {
            x: Math.random() * forceMagnitude - forceMagnitude / 2, // random horizontal force
            y: -forceMagnitude, // upward force
          });
        }
      }
    });

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      render.canvas.remove();
      render.textures = {};
    };
  }, [width, height, minDimension]);

  return <div ref={sceneRef} />;
}
