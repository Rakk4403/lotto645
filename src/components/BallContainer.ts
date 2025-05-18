import Matter from "matter-js";
import { Config } from "../const/Config";
import { createCircularWall } from "../utils/Utils";
import { perfMode } from "./Engine";

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

  // 각 벽 세그먼트에 강화된 물리 속성 적용
  walls.forEach((wall) => {
    // 시각적 스타일
    wall.render.strokeStyle = "#5DADE2"; // 하늘색 테두리
    wall.render.fillStyle = "#5DADE2"; // 테두리 색상으로 채움 (하늘색)
    wall.render.opacity = 1.0; // 완전 불투명하게 설정
    wall.render.lineWidth = 1.8; // 라인 두께 약간 감소로 더 매끄러운 테두리

    // 물리적 속성 강화 (모바일에서는 더 강한 설정)
    if (perfMode.isLowPerf) {
      // 모바일 환경에서 충돌 안정성 강화
      wall.friction = 0.3; // 마찰 증가
      wall.frictionAir = 0.01; // 공기 마찰
      wall.restitution = 0.5; // 탄성 감소 (덜 튕김)
      wall.slop = 0.3; // 충돌 허용 오차 증가 (벽 통과 방지)
    } else {
      // 데스크탑 환경 - 기본 물리 특성
      wall.friction = 0.1;
      wall.frictionAir = 0.005;
      wall.restitution = 0.7;
      wall.slop = 0.05;
    }
  });

  // 컴파운드 바디로 만들어 전체 벽을 단일 물리 객체로 관리
  const compoundWall = Matter.Body.create({
    parts: walls,
    isStatic: true,
    collisionFilter: {
      category: 0x0001,
      mask: 0x0001,
    },
    render: {
      fillStyle: "#5DADE2", // 테두리 색상과 동일하게 채움
      lineWidth: 2.0,
      strokeStyle: "#5DADE2",
      opacity: 1.0, // 완전 불투명하게 설정
    },
  });

  // 컴파운드 벽에 전체 속성도 적용 (중복 적용이지만 확실한 적용을 위해)
  if (perfMode.isLowPerf) {
    Matter.Body.set(compoundWall, {
      friction: 0.3,
      frictionStatic: 0.5,
      restitution: 0.4,
      slop: 0.3,
    });
  }

  Matter.Composite.add(engine.world, compoundWall);

  return { compoundWall };
}
