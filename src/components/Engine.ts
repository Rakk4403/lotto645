import Matter from "matter-js";

// 기기 성능 감지 함수
function detectLowPerfDevice(): boolean {
  // 모바일 기기 감지
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // iOS 기기 감지 (iOS에서는 성능 이슈가 더 두드러짐)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return isMobile || isIOS;
}

// 현재 성능 모드 (전역 상태)
export const perfMode = {
  isLowPerf: detectLowPerfDevice(),
};

function getRenderOptions(opt: {
  width?: number;
  height?: number;
}): Matter.IRendererOptions {
  // 저성능 모드일 경우 픽셀 비율 낮춤
  const pixelRatio = perfMode.isLowPerf
    ? Math.min(1.0, window.devicePixelRatio || 1) // 모바일에서는 최대 1.0
    : window.devicePixelRatio || 1; // 데스크탑에서는 원래 값 유지

  return {
    width: opt.width || window.innerWidth,
    height: opt.height || window.innerHeight,
    wireframes: false,
    background: "#ffffff",
    showAxes: false,
    showCollisions: false,
    showPositions: false,
    showBounds: false,
    pixelRatio: pixelRatio,
  };
}
// 클린업 함수
export function cleanupPhysicsEngine(
  render: Matter.Render,
  runner: Matter.Runner
) {
  Matter.Render.stop(render);
  Matter.Runner.stop(runner);
  render.canvas.remove();
  render.textures = {};
}
// 물리 엔진 초기화 함수
export function initPhysicsEngine({
  sceneElem,
  width,
  height,
}: {
  sceneElem: HTMLDivElement;
  width: number;
  height: number;
}) {
  const Engine = Matter.Engine;
  const Render = Matter.Render;
  const Runner = Matter.Runner;

  const engine = Engine.create({
    // 충돌 감지 품질과 관련된 추가 엔진 옵션
    enableSleeping: false, // 수면 모드 비활성화 (모든 객체가 항상 활성 상태)
    constraintIterations: perfMode.isLowPerf ? 4 : 6, // 제약 조건 반복 횟수 (충돌 안정성 향상)
    // 벽 통과 문제 해결을 위한 속성
    positionCorrection: true, // 위치 보정 활성화 (기본값: true, 충돌 후 객체가 서로 겹치지 않도록 위치 보정)
  });

  // 기기 성능에 따라 물리 계산 정밀도 조정
  if (perfMode.isLowPerf) {
    // 모바일 기기: 충돌 감지 정확도 확보를 위해 반복 값 조정
    engine.positionIterations = 8; // 기본값 6에서 약간 증가 (충돌 감지 정확도 향상)
    engine.velocityIterations = 6; // 기본값 4에서 약간 증가 (충돌 후 속도 처리 개선)
  } else {
    // 데스크톱: 더 정밀한 계산
    engine.positionIterations = 12; // 정밀한 위치 계산
    engine.velocityIterations = 8; // 향상된 충돌 처리

    // 데스크탑에서도 속도를 제한하여 너무 빠른 움직임 방지
    engine.timing = {
      ...engine.timing,
      timeScale: 0.9, // 데스크탑에서 더 느린 시뮬레이션 (안정성 향상)
    };
  }

  // 더 안정적인 계산을 위해 고정된 타임스텝 사용
  const runner = Runner.create({
    delta: perfMode.isLowPerf ? 1000 / 60 : 1000 / 120, // 모바일에서는 60FPS, 데스크탑에서는 120FPS
    isFixed: true, // 고정 타임스텝 사용
  });

  const render = Render.create({
    element: sceneElem,
    engine,
    options: getRenderOptions({ width, height }),
  });

  // 렌더러가 생성되면 캔버스 CSS 크기 조정
  if (render.canvas) {
    render.canvas.style.width = "100%";
    render.canvas.style.height = "100%";
  }

  // 모바일에서 충돌 감지 민감도를 높이기 위한 추가 설정
  if (perfMode.isLowPerf) {
    // 충돌 해상도의 속도 보정을 위한 설정
    engine.timing = {
      ...engine.timing,
      timeScale: 0.9, // 모바일에서 약간 느린 물리 시뮬레이션 (충돌 안정성 향상)
    };
  }

  return { engine, render, runner };
}
