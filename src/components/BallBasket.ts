import Matter from "matter-js";
import { createCircularWallSegments } from "../utils/Utils";

/**
 * 출구 아래 바구니 형태를 구성합니다.
 * 200도 각도의 반원형 바구니를 생성합니다.
 * 기존 createCircularWallSegments 함수를 랩핑하여 200도 호를 생성합니다.
 */
export function createBasket(
  x: number,
  y: number,
  width: number = 70,
  height: number = 40
): Matter.Body[] {
  const radius = width / 2;
  const wallThickness = 8;
  const segmentCount = 32; // 전체 원을 32개 세그먼트로 나눔

  // 200도 호를 위한 제외 각도 계산
  // 전체 원은 360도이고, 200도 호를 만들려면 160도(360-200)를 제외
  const excludeDegrees = 360 - 200;

  // 제외할 구간의 시작 각도 계산 - 바구니가 아래쪽으로 열리도록 배치
  // 제외 구간을 화면 상단에 위치시키기 위해 90도(Math.PI/2)에서
  // 제외할 각도의 절반을 더하고 π만큼 이동 (바구니가 아래로 열리도록)
  const excludeStart = Math.PI / 2 + (excludeDegrees / 2) * (Math.PI / 180);
  const excludeEnd = excludeStart + excludeDegrees * (Math.PI / 180);

  // 기존 createCircularWallSegments 함수 사용, 제외 구간 설정
  const basketSegments = createCircularWallSegments({
    cx: x,
    cy: y,
    radius: radius,
    count: segmentCount,
    segmentLength: ((2 * Math.PI * radius) / segmentCount) * 1.05, // 5% 중첩으로 매끄럽게
    thickness: wallThickness,
    excludeStart: excludeStart,
    excludeEnd: excludeEnd,
    fillStyle: "#D3D3D3", // 옅은 회색 바구니
    strokeStyle: "#A9A9A9", // 테두리 색상
    lineWidth: 1,
  });

  // 각 세그먼트에 바구니 라벨 추가
  basketSegments.forEach((segment, i) => {
    segment.label = `basket-segment-${i}`;
  });

  return basketSegments;
}
