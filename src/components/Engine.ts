import Matter from "matter-js";

function getRenderOptions(opt: {
  width?: number;
  height?: number;
}): Matter.IRendererOptions {
  return {
    width: opt.width || window.innerWidth,
    height: opt.height || window.innerHeight,
    wireframes: false,
    background: "#ffffff",
    showAxes: false, // 디버깅 옵션 비활성화
    showCollisions: false, // 디버깅 옵션 비활성화
    showPositions: false, // 디버깅 옵션 비활성화
    showBounds: false, // 디버깅 옵션 비활성화
    pixelRatio: window.devicePixelRatio || 1, // 디바이스 픽셀 비율 적용하여 선명하게 렌더링
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

  const engine = Engine.create({});
  // 작은 화면에서도 충돌 감지가 잘 되도록 계산 반복 수 고정
  engine.positionIterations = 12; // 기본 6 → 더 정밀한 위치 계산
  engine.velocityIterations = 8; // 기본 4 → 충돌 후 반응 개선

  // 더 안정적인 계산을 위해 고정된 타임스텝 사용
  const runner = Runner.create({
    delta: 1000 / 120, // 120 FPS로 고정 (충돌 안정성 향상)
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

  return { engine, render, runner };
}
