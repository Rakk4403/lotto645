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

  // 각 벽 세그먼트에 유리 느낌의 하늘색 테두리로 적용, 겹침 해결을 위해 투명도 조정
  walls.forEach((wall) => {
    wall.render.strokeStyle = "#5DADE2"; // 하늘색 테두리
    wall.render.fillStyle = "rgba(212, 240, 255, 0.08)"; // 매우 연한 하늘색, 더 투명한 채움으로 겹침 효과 감소
    wall.render.opacity = 0.8; // 불투명도 약간 감소로 겹침 효과 완화
    wall.render.lineWidth = 1.8; // 라인 두께 약간 감소로 더 매끄러운 테두리
  });

  const compoundWall = Matter.Body.create({
    parts: walls,
    isStatic: true,
    collisionFilter: { category: 0x0001, mask: 0x0001 },
    render: {
      fillStyle: "transparent",
      lineWidth: 2.0, // 테두리 두께 약간 감소로 더 매끄러운 표현
      strokeStyle: "rgba(52, 152, 219, 0.7)", // 반투명 하늘색으로 매끄러운 테두리 효과
    },
  });

  Matter.Composite.add(engine.world, compoundWall);

  return { compoundWall };
}
