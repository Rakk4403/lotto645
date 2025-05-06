import Matter from "matter-js";
import { createExitWalls } from "./ExitWall";
import { Config } from "../const/Config";

// 출구 및 센서 설정 함수
export function setupExitAndSensor(
  containerConfig: {
    x: number;
    y: number;
    radius: number;
    ballRadius: number;
  },
  engine: Matter.Engine
) {
  const exitAngle = Config.EXIT_ANGLE;

  const exitCenterX =
    containerConfig.x + containerConfig.radius * Math.cos(exitAngle);

  // 출구 센서 생성
  const sensorZone = Matter.Bodies.rectangle(
    exitCenterX,
    containerConfig.y - containerConfig.radius + 10,
    60, // 출구 너비보다 약간 넓게
    30, // 얇은 센서
    {
      label: "exitSensor",
      isSensor: true,
      isStatic: true,
      render: {
        fillStyle: "rgba(255,0,0,0.2)",
      },
      collisionFilter: {
        category: 0x0002,
        mask: 0x0001, // 공하고만 감지
      },
    }
  );

  Matter.Composite.add(engine.world, sensorZone);

  // 출구 벽 생성
  const exitWalls: Matter.Body[] = createExitWalls(
    containerConfig.x,
    containerConfig.y,
    containerConfig.radius
  );

  return { exitAngle, exitWalls };
}
