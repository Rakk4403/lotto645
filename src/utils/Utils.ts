import Matter from "matter-js";
import { Config } from "../const/Config";

// (충돌 이벤트 핸들러 설정 함수는 useEffect 내에서 오버라이드됨)
// 기존에 생성된 세그먼트 집합을 특정 점 기준으로 회전
export function rotateWallSegments(
  walls: Matter.Body[],
  cx: number,
  cy: number,
  angle: number
) {
  walls.forEach((wall) => {
    const dx = wall.position.x - cx;
    const dy = wall.position.y - cy;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newX = cx + dx * cos - dy * sin;
    const newY = cy + dx * sin + dy * cos;
    Matter.Body.setPosition(wall, { x: newX, y: newY });
    Matter.Body.rotate(wall, angle);
  });
}

// 화면 진동 효과를 구현하는 함수
export function shakeScreen(
  element: HTMLElement,
  intensity: number = 5,
  duration: number = 500
): Promise<void> {
  return new Promise((resolve) => {
    const originalStyle = element.style.transform;
    const originalTransition = element.style.transition;

    // 애니메이션 시작 시간
    const startTime = Date.now();

    // 진동 애니메이션 프레임
    function animate() {
      const elapsed = Date.now() - startTime;

      if (elapsed < duration) {
        // 진동 강도를 시간이 지남에 따라 줄이기
        const currentIntensity = intensity * (1 - elapsed / duration);

        // 랜덤한 오프셋 생성
        const offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
        const offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

        // 요소 위치 이동
        element.style.transform = `${originalStyle} translate(${offsetX}px, ${offsetY}px)`;

        requestAnimationFrame(animate);
      } else {
        // 원래 위치로 복원
        element.style.transform = originalStyle;
        element.style.transition = originalTransition;
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

// 유틸리티 함수: 원 내부의 랜덤한 지점 생성
export function randomPointInCircle(cx: number, cy: number, radius: number) {
  const angle = Math.random() * 2 * Math.PI;
  const r = radius * Math.sqrt(Math.random());
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  return { x, y };
}
// 공통 원형벽 생성 유틸리티 함수
export function createCircularWallSegments({
  cx,
  cy,
  radius,
  count,
  segmentLength = 40,
  thickness = 20,
  excludeStart = -1, // 제외할 시작 각도 (기본값: 제외 없음)
  excludeEnd = -1, // 제외할 종료 각도 (기본값: 제외 없음)
  fillStyle = "transparent",
  strokeStyle = "#FF0000",
  lineWidth = 2,
  category = 0x0001,
  mask = 0x0001,
}: {
  cx: number;
  cy: number;
  radius: number;
  count: number;
  segmentLength?: number;
  thickness?: number;
  excludeStart?: number;
  excludeEnd?: number;
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
  category?: number;
  mask?: number;
}): Matter.Body[] {
  const angleStep = (2 * Math.PI) / count;
  const walls: Matter.Body[] = [];

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;

    // 제외 구간 확인 (excludeStart와 excludeEnd가 유효한 경우에만)
    if (excludeStart >= 0 && excludeEnd >= 0) {
      // 각도 정규화 (0 ~ 2π 범위로)
      const normalizedAngle = angle % (2 * Math.PI);
      const normalizedStart = excludeStart % (2 * Math.PI);
      const normalizedEnd = excludeEnd % (2 * Math.PI);

      // 구간 내에 있는지 확인 (시작이 종료보다 큰 경우도 처리)
      if (normalizedStart <= normalizedEnd) {
        if (
          normalizedAngle >= normalizedStart &&
          normalizedAngle <= normalizedEnd
        ) {
          continue; // 제외 구간에 있으면 건너뜀
        }
      } else {
        // 경계를 넘어가는 제외 구간 (예: 350도 ~ 10도)
        if (
          normalizedAngle >= normalizedStart ||
          normalizedAngle <= normalizedEnd
        ) {
          continue; // 제외 구간에 있으면 건너뜀
        }
      }
    }

    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const wall = Matter.Bodies.rectangle(x, y, segmentLength, thickness, {
      isStatic: true,
      angle: angle + Math.PI / 2,
      render: {
        fillStyle,
        strokeStyle,
        lineWidth,
      },
      collisionFilter: { category, mask },
    });
    walls.push(wall);
  }
  return walls;
}
// 원형 벽 생성 함수

export function createCircularWall(
  cx: number,
  cy: number,
  radius: number,
  count: number
): Matter.Body[] {
  const angleStep = (2 * Math.PI) / count;
  const chordLength = 2 * radius * Math.sin(angleStep / 2);
  const segmentLength = chordLength + 3;

  // 12시 5분 위치에 출구 생성 (제외 구간 설정)
  const exitAngle = Config.EXIT_ANGLE;
  const exitAngleHalfWidth = angleStep * 1.5; // 제외 구간 너비의 절반
  const excludeStart = exitAngle - exitAngleHalfWidth;
  const excludeEnd = exitAngle + exitAngleHalfWidth;

  return createCircularWallSegments({
    cx,
    cy,
    radius,
    count,
    segmentLength,
    thickness: 20,
    excludeStart,
    excludeEnd,
  });
} // 컨테이너 크기 계산 함수
export function calculateContainerSize(input: {
  width: number;
  height: number;
  minDimension: number;
}) {
  const { width, height, minDimension } = input;
  // 모바일 환경인지 확인
  const isMobile = width < 768;

  // 모바일에서는 화면 크기에 맞는 컨테이너 계산 방식 사용
  let ballContainerSize;
  if (isMobile) {
    // 모바일 화면 크기에 따라 다르게 계산
    if (width < 480) {
      // 작은 모바일 화면에서는 화면의 더 많은 부분을 사용
      const smallerDimension = Math.min(width, height * 0.95);
      ballContainerSize = smallerDimension * 0.8; // 80%까지 확대
    } else {
      // 일반 모바일 화면
      const smallerDimension = Math.min(width, height * 0.92);
      ballContainerSize = smallerDimension * 0.75; // 75%로 확대
    }
  } else {
    // 데스크탑에서는 기존 방식대로 계산
    ballContainerSize = minDimension * 0.65;
  }

  const ballContainerRadius = ballContainerSize / 2;
  const ballContainerX = width / 2;
  // 모바일에서는 화면 중앙에 배치
  const ballContainerY = height / 2;
  const ballRadius = Math.max(10, Math.min(20, minDimension / 40)); // Adjust ball size based on container
  const ringThickness = 10;
  const innerWallRadius = ballContainerRadius - ringThickness / 2;
  const spawnRadius = innerWallRadius - ballRadius;

  return {
    size: ballContainerSize,
    radius: ballContainerRadius,
    x: ballContainerX,
    y: ballContainerY,
    ballRadius,
    ringThickness,
    innerWallRadius,
    spawnRadius,
  };
}
