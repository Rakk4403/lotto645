import Matter from "matter-js";
import { createCircularWallSegments } from "../utils/Utils";

// 출구 벽 생성 함수
export function createExitWalls(
  cx: number,
  cy: number,
  radius: number,
  count: number
): Matter.Body[] {
  return createCircularWallSegments({
    cx,
    cy,
    radius,
    count,
    segmentLength: 40,
    thickness: 20,
  });
}
