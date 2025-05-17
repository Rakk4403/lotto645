// MatterJS 타입 확장
import Matter from "matter-js";

// Matter.js 엔진 타입 확장
declare module "matter-js" {
  interface Engine {
    // 타이밍 관련 속성
    timing?: {
      lastElapsed: number;
      timeScale: number;
    };

    // 수면 모드 관련 속성
    sleeping?: {
      motionThreshold: number; // 활성화 임계값
      timeToSleep: number; // 수면까지 걸리는 시간
    };

    // 충돌 감지 관련 속성
    detector?: {
      slop: number; // 충돌 허용 오차
      tolerance: number; // 충돌 감지 공차
    };
  }

  // 추가적인 Body 프로퍼티
  interface Body {
    slop?: number; // 충돌 허용 오차
    frictionStatic?: number; // 정적 마찰
  }
}
