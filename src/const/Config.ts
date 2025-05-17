// 공통 상수 정의
import { perfMode } from "../components/Engine";

export const Config = {
  EXIT_ANGLE: (3 * Math.PI) / 2 + Math.PI / 18, // 12시 5분 위치
  BALL_COUNT: 46,
  WALL_SEGMENTS: perfMode.isLowPerf ? 64 : 96, // 모바일에서는 세그먼트 수 감소
};
