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

  // 각 벽 세그먼트에 옅은 회색 일괄 적용
  walls.forEach((wall) => {
    wall.render.strokeStyle = "#D3D3D3"; // 옅은 회색 테두리
    wall.render.fillStyle = "#F5F5F5"; // 매우 옅은 회색 채움
    wall.render.opacity = 0.7; // 적당한 불투명도
  });

  const compoundWall = Matter.Body.create({
    parts: walls,
    isStatic: true,
    collisionFilter: { category: 0x0001, mask: 0x0001 },
    render: {
      fillStyle: "transparent",
      lineWidth: 1.5, // 얇은 테두리
    },
  });

  Matter.Composite.add(engine.world, compoundWall);

  return { compoundWall };
}
