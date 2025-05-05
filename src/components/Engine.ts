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
  engine.positionIterations = 12; // 기본 6 → 더 정밀한 위치 계산
  engine.velocityIterations = 8; // 기본 4 → 충돌 후 반응 개선

  // Matter.Engine.update(engine, 1000 / 60); // 초기 업데이트
  const runner = Runner.create({
    delta: 1000 / 120,
  });

  const render = Render.create({
    element: sceneElem,
    engine,
    options: getRenderOptions({ width, height }),
  });

  return { engine, render, runner };
}
