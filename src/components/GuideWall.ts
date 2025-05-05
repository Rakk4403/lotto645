import Matter from "matter-js";

import { rotateWallSegments } from "../utils/Utils";

// 가이드 벽 생성 함수
export function createGuideWalls(
  cx: number,
  cy: number,
  containerRadius: number,
  ballRadius: number,
  exitAngle: number
): Matter.Body[] {
  const guideWalls: Matter.Body[] = [];
  const guideOffset = ballRadius * 3; // offset slightly outside the container
  const stepCount = 20; // number of guide segments
  const stepAngle = (Math.PI / 2 - Math.PI / 18) / stepCount; // cover from exit to 6 o'clock
  let currentAngle = exitAngle + Math.PI / 12 + stepAngle; // start from 12 o'clock

  // 반원형 가이드 벽 추가 (12시 방향)
  const semicircleRadius = 100; // 반원의 반지름
  const semicircleSegments = 12; // 반원을 구성하는 선분 수
  const semicircleStep = Math.PI / semicircleSegments; // 반원은 180도(π 라디안)

  // 반원 가이드 벽 생성 (왼쪽에서 오른쪽으로)
  for (let i = 0; i <= semicircleSegments; i++) {
    const arcAngle = Math.PI + i * semicircleStep; // π(왼쪽) ~ 2π(오른쪽)
    const guideX = cx + semicircleRadius * Math.cos(arcAngle);
    const guideY =
      cy -
      containerRadius -
      guideOffset +
      semicircleRadius * Math.sin(arcAngle);

    const guideWall = Matter.Bodies.rectangle(
      guideX,
      guideY,
      30, // guide segment length
      10, // guide segment thickness
      {
        isStatic: true,
        angle: arcAngle + Math.PI / 2,
        render: {
          fillStyle: "#888",
        },
        collisionFilter: {
          category: 0x0001,
          mask: 0x0001,
        },
      }
    );

    guideWalls.push(guideWall);
  }

  // 기존 가이드 벽 생성
  for (let i = 0; i < stepCount; i++) {
    const guideX =
      cx + (containerRadius + guideOffset) * Math.cos(currentAngle);
    const guideY =
      cy + (containerRadius + guideOffset) * Math.sin(currentAngle);

    const guideWall = Matter.Bodies.rectangle(
      guideX,
      guideY,
      30, // guide segment length
      10, // guide segment thickness
      {
        isStatic: true,
        angle: currentAngle + Math.PI / 2,
        render: {
          fillStyle: "#888",
        },
        collisionFilter: {
          category: 0x0001,
          mask: 0x0001,
        },
      }
    );

    guideWalls.push(guideWall);
    currentAngle += stepAngle;
  }

  return guideWalls;
} // 가이드 벽 설정 함수
export function setupGuideWalls(
  containerConfig: {
    x: number;
    y: number;
    radius: number;
    ballRadius: number;
  },
  exitAngle: number,
  engine: Matter.Engine
) {
  // 가이드 벽 생성
  const guideWalls = createGuideWalls(
    containerConfig.x,
    containerConfig.y,
    containerConfig.radius,
    containerConfig.ballRadius,
    (Math.PI / 2) * 3
  );

  rotateWallSegments(
    guideWalls,
    containerConfig.x,
    containerConfig.y,
    Math.PI / 12
  );

  Matter.Composite.add(engine.world, guideWalls);

  // 왼쪽 차단벽 생성
  const leftBlockWall = Matter.Bodies.rectangle(
    containerConfig.x +
      (containerConfig.radius - 10) * Math.cos((3 * Math.PI) / 2),
    containerConfig.y +
      (containerConfig.radius + 20) * Math.sin((3 * Math.PI) / 2),
    10, // width of wall
    60, // height of wall
    {
      isStatic: true,
      angle: (3 * Math.PI) / 2 + Math.PI / 2, // vertical wall
      render: {
        fillStyle: "#555",
      },
      collisionFilter: {
        category: 0x0001,
        mask: 0x0001,
      },
    }
  );

  Matter.Composite.add(engine.world, leftBlockWall);
}
