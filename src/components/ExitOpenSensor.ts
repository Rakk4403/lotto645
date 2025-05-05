import Matter from "matter-js";

export function setupOpenExitSensor(
  containerConfig: {
    x: number;
    y: number;
    radius: number;
  },
  engine: Matter.Engine
) {
  const exitAngle = (Math.PI / 2) * 3 + Math.PI / 6; // 12시 5분 위치
  const exitCenterX =
    containerConfig.x + containerConfig.radius * Math.cos(exitAngle);
  const exitCenterY =
    containerConfig.y + containerConfig.radius * Math.sin(exitAngle);

  const sensorZone = Matter.Bodies.rectangle(
    exitCenterX + 60,
    exitCenterY,
    60, // 출구 너비보다 약간 넓게
    10, // 얇은 센서
    {
      label: "exitOpenSensor",
      isSensor: true,
      isStatic: true,
      render: {
        fillStyle: "rgba(255,0,255,0.2)",
      },
      collisionFilter: {
        category: 0x0002,
        mask: 0x0001, // 공하고만 감지
      },
    }
  );
  Matter.Composite.add(engine.world, sensorZone);
  return { exitAngle };
}
