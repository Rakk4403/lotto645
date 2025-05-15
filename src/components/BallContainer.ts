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

  // 각 벽 세그먼트에 더 진한 회색으로 일괄 적용하여 가시성 개선
  walls.forEach((wall) => {
    wall.render.strokeStyle = "#BBBBBB"; // 더 진한 회색 테두리
    wall.render.fillStyle = "#F0F0F0"; // 약간 진한 회색 채움
    wall.render.opacity = 0.8; // 불투명도 증가
    wall.render.lineWidth = 2.0; // 세그먼트별 라인 두께 증가
  });

  const compoundWall = Matter.Body.create({
    parts: walls,
    isStatic: true,
    collisionFilter: { category: 0x0001, mask: 0x0001 },
    render: {
      fillStyle: "transparent",
      lineWidth: 2.5, // 테두리 두께 1.5에서 2.5로 증가
    },
  });

  Matter.Composite.add(engine.world, compoundWall);

  return { compoundWall };
}
