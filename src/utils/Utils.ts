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
  // 모바일에서 성능 최적화를 위한 수정 판단
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // 모바일 기기에서는 진동 강도와 지속 시간 감소
  if (isMobile) {
    intensity = Math.max(2, intensity * 0.6); // 강도 40% 감소, 최소 2
    duration = Math.min(200, duration * 0.8); // 지속 시간 20% 감소, 최대 200ms
  }

  return new Promise((resolve) => {
    const originalStyle = element.style.transform;
    const originalTransition = element.style.transition;

    // 애니메이션 시작 시간
    const startTime = Date.now();

    // 모바일 기기에서는 프레임 간격 조절 (더 적은 수의 프레임으로 애니메이션)
    const frameInterval = isMobile ? 32 : 16; // 모바일: 약 30fps, 데스크톱: 약 60fps
    let lastFrameTime = 0;

    // 진동 애니메이션 프레임
    function animate() {
      const elapsed = Date.now() - startTime;
      const now = Date.now();

      // 현재 시간이 마지막 프레임 시간 + 간격보다 작으면 프레임 스킵 (모바일 최적화)
      if (now - lastFrameTime < frameInterval && elapsed < duration) {
        requestAnimationFrame(animate);
        return;
      }

      lastFrameTime = now;

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

  // 모바일에서는 더 두꺼운 벽과 더 큰 마찰 계수로 충돌 안정성 향상
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const wallThickness = isMobile ? 30 : 24; // 모바일에서 더 두꺼운 벽

  return createCircularWallSegments({
    cx,
    cy,
    radius,
    count,
    segmentLength: segmentLength * 1.0, // 세그먼트 길이를 더 작게 조정하여 겹침 감소
    thickness: wallThickness,
    excludeStart,
    excludeEnd,
    // 추가 물리 속성 (충돌 안정성 향상)
    restitution: 0.5, // 탄성 계수 (0-1, 높을수록 더 많이 튕김)
    friction: 0.3, // 마찰 계수 (0-1, 높을수록 마찰력 증가)
  });
} // 컨테이너 크기 계산 함수
export function calculateContainerSize(input: {
  width: number;
  height: number;
  minDimension: number;
}) {
  const { width, height, minDimension } = input;
  // 모바일 환경인지 확인
  const isMobile = width < 768; // 기준이 되는 고정 크기 설정 (더 큰 값으로 조정하여 전체 요소 확대)
  const BASE_SIZE = 900; // 기본 크기를 800에서 900으로 증가

  // 기본 컨테이너 크기는 고정값의 비율로 설정 (비율도 증가시켜 더 많은 공간 활용)
  let ballContainerSize;

  if (isMobile) {
    // 모바일 화면 크기에 따라 다르게 계산, 여백을 줄이고 더 많은 화면 활용
    if (width < 480) {
      ballContainerSize = BASE_SIZE * 0.8; // 작은 모바일 화면에서 비율 증가
    } else {
      ballContainerSize = BASE_SIZE * 0.8; // 일반 모바일 화면에서도 비율 증가
    }
  } else {
    // 데스크탑에서는 더 큰 값으로 설정
    ballContainerSize = BASE_SIZE * 0.85; // 데스크탑 화면에서 비율 증가
  }

  const ballContainerRadius = ballContainerSize / 2;
  const ballContainerX = width / 2; // 가로 중앙 위치
  // 데스크탑에서는 상단 여백 확보를 위해 약간 아래로 조정
  const yOffset = isMobile ? 0 : height * 0.03; // 데스크탑에서 3% 아래로 조정
  const ballContainerY = height / 2 + yOffset; // 세로 위치 조정

  const ballRadius = Math.max(10, Math.min(20, minDimension / 40)); // 컨테이너에 따라 공 크기 조정
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
