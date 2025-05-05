import Matter from "matter-js";
import { Config } from "../const/Config";
import { createCircularWall } from "../utils/Utils";

// 원형 컨테이너 생성 함수
export function createContainer(
  containerConfig: {
    x: number;
    y: number;
    radius: number;
  },
  engine: Matter.Engine
) {
  const walls = createCircularWall(
    containerConfig.x,
    containerConfig.y,
    containerConfig.radius,
    Config.WALL_SEGMENTS
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

  Matter.Composite.add(engine.world, compoundWall);

  return { compoundWall };
}
