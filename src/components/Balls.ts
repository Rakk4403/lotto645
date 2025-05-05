import Matter from "matter-js";
import { Config } from "../const/Config";
import { randomPointInCircle } from "../utils/Utils";

// --- createBalls override to update refs and state
export function createBalls(
  containerConfig: {
    size: number;
    radius: number;
    x: number;
    y: number;
    ballRadius: number;
    ringThickness: number;
    innerWallRadius: number;
    spawnRadius: number;
  },
  engine: Matter.Engine
) {
  const Bodies = Matter.Bodies;
  const Composite = Matter.Composite;
  const maxSpeed = 500; // 최고 속도를 500에서 300으로 낮춤
  const balls: any[] = [];

  // 전역 이벤트 핸들러 등록 (공마다 등록하지 않고 한 번만 등록)
  Matter.Events.on(engine, "beforeUpdate", () => {
    // 모든 공에 대해 속도 제한 적용
    for (const ball of balls) {
      const velocity = ball.velocity;
      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        Matter.Body.setVelocity(ball, {
          x: velocity.x * scale,
          y: velocity.y * scale,
        });
      }
    }
  });

  for (let i = 0; i < Config.BALL_COUNT; i++) {
    const { x, y } = randomPointInCircle(
      containerConfig.x,
      containerConfig.y,
      containerConfig.spawnRadius
    );

    const ball = Bodies.circle(x, y, containerConfig.ballRadius, {
      restitution: 0.9, // 0.9에서 0.8로 감소하여 튀는 강도 완화
      frictionAir: 0.03, // 0.03에서 0.05로 증가하여 더 빨리 감속되도록 함
      render: {
        fillStyle: "#3498db",
      },
      collisionFilter: {
        category: 0x0001,
        mask: 0x0001 | 0x0002,
      },
    });
    // Assign a unique label to each ball
    ball.label = `${i + 1}번 공`;

    Composite.add(engine.world, ball);
    // Push to ref and inside balls
    balls.push(ball);
  }
  return balls;
}
