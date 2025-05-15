import Matter from "matter-js";

import { rotateWallSegments } from "../utils/Utils";

const guideWallConfig = {
  wallLength: 40, // 가이드 벽 길이 30에서 40으로 증가
  wallThickness: 15, // 가이드 벽 두께 10에서 15로 증가
  wallColor: "rgba(200, 200, 200, 1)", // 가이드 벽 색상
  wallOpacity: 0.6, // 가이드 벽 불투명도 약간 증가
  wallCategory: 0x0001, // 가이드 벽 카테고리
  wallMask: 0x0001, // 가이드 벽 마스크
};

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
  const stepAngle = (Math.PI / 2 - Math.PI / 18) / stepCount;
  let currentAngle = exitAngle + Math.PI / 11 + stepAngle;

  // 반원형 가이드 벽 추가 (12시 방향)
  const semicircleRadius = 140; // 반원 반지름을 100에서 140으로 40% 증가
  // 반원 각도를 증가시켜서 더 넓게 커버 (180도보다 더 넓은 각도로 확장)
  const semicircleSegments = 20; // 세그먼트 수를 16에서 20으로 증가하여 더 매끄러운 곡선
  // 약 200도 정도로 반원을 확장 (π + π*0.1)
  const semicircleAngleRange = Math.PI + Math.PI * 0.1;
  const semicircleStep = semicircleAngleRange / semicircleSegments;
  const semicircleRotation = Math.PI * 0.08;

  const semicircleCenterX = cx;
  // y 위치를 조금 높여서 컨테이너와 닿게 함
  const semicircleCenterY = cy - containerRadius - guideOffset + 10;

  // 반원 가이드 벽 생성 (왼쪽에서 오른쪽으로)
  for (let i = 0; i <= semicircleSegments; i++) {
    // 시작 각도를 π - 0.2π로 설정하여 왼쪽으로 더 확장
    const arcAngle = Math.PI - Math.PI * 0.2 + i * semicircleStep;

    // 반원 중심점을 기준으로 회전된 좌표 계산
    const baseX = semicircleRadius * Math.cos(arcAngle);
    const baseY = semicircleRadius * Math.sin(arcAngle);

    // 회전 변환 적용
    const rotatedX =
      baseX * Math.cos(semicircleRotation) -
      baseY * Math.sin(semicircleRotation);
    const rotatedY =
      baseX * Math.sin(semicircleRotation) +
      baseY * Math.cos(semicircleRotation);

    const guideX = semicircleCenterX + rotatedX;
    const guideY = semicircleCenterY + rotatedY;

    const guideWall = Matter.Bodies.rectangle(
      guideX,
      guideY,
      guideWallConfig.wallLength, // guide segment length
      guideWallConfig.wallThickness, // guide segment thickness
      {
        isStatic: true,
        angle: arcAngle + semicircleRotation + Math.PI / 2, // 각도 보정
        render: {
          fillStyle: guideWallConfig.wallColor,
        },
        collisionFilter: {
          category: guideWallConfig.wallCategory, // updated to use config
          mask: guideWallConfig.wallMask, // updated to use config
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
      guideWallConfig.wallLength,
      guideWallConfig.wallThickness,
      {
        isStatic: true,
        angle: currentAngle + Math.PI / 2,
        render: {
          fillStyle: guideWallConfig.wallColor,
        },
        collisionFilter: {
          category: guideWallConfig.wallCategory,
          mask: guideWallConfig.wallMask,
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
    ringThickness: number;
  },
  exitAngle: number,
  engine: Matter.Engine
) {
  // 가이드 벽 생성
  const guideWalls = createGuideWalls(
    containerConfig.x,
    containerConfig.y,
    containerConfig.radius + containerConfig.ringThickness,
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
}
