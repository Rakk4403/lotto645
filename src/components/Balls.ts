import Matter from "matter-js";
import { Config } from "../const/Config";
import { randomPointInCircle } from "../utils/Utils";

// --- createBalls override to update refs and state
export function createBalls(
  containerConfig: {
    size: number;
    radius: number;
    x: number;
    y: number;
    ballRadius: number;
    ringThickness: number;
    innerWallRadius: number;
    spawnRadius: number;
  },
  engine: Matter.Engine
) {
  const Bodies = Matter.Bodies;
  const Composite = Matter.Composite;
  const maxSpeed = 500;
  const balls: Matter.Body[] = [];

  // 전역 이벤트 핸들러 등록 (공마다 등록하지 않고 한 번만 등록)
  Matter.Events.on(engine, "beforeUpdate", () => {
    // 모든 공에 대해 속도 제한 적용
    for (const ball of balls) {
      const velocity = ball.velocity;
      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        Matter.Body.setVelocity(ball, {
          x: velocity.x * scale,
          y: velocity.y * scale,
        });
      }
    }
  });

  // 기존 이벤트 제거 (중복 실행 방지)
  Matter.Events.off(engine, "afterRender");

  // 렌더링 후 공 위에 텍스트를 직접 그리는 이벤트 핸들러 추가
  Matter.Events.on(engine, "afterRender", (event) => {
    const engine = event.source;
    const context = engine.render.context;

    if (!context) {
      console.warn("렌더링 컨텍스트가 없습니다.");
      return;
    }

    // 디버깅용 로그는 필요 시에만 활성화
    // console.log(`렌더링 이벤트 발생, 공 ${balls.length}개 처리`);

    // 화면 크기에 맞게 텍스트 크기 조정을 위한 스케일 계산
    const canvas = engine.render.canvas;
    const scaleX = canvas.width / (engine.render.options.width || 1200);
    const scaleY = canvas.height / (engine.render.options.height || 800);
    const renderScale = Math.min(scaleX, scaleY);

    // 모든 공에 대해 번호 텍스트 렌더링
    for (const ball of balls) {
      if (!ball || !ball.position) continue; // 잘못된 공 객체 필터링

      const pos = ball.position;
      const ballNumber = ball.label;

      // 현재 변환을 저장
      context.save();

      // 텍스트 크기를 화면 크기와 공 크기에 맞게 조정
      // 최소 크기 제한을 두어 작은 화면에서도 읽을 수 있게 함
      const fontSize = Math.max(
        Math.floor(containerConfig.ballRadius * 0.8),
        Math.min(14, containerConfig.ballRadius * 0.7)
      );

      context.font = `bold ${fontSize}px Arial, sans-serif`;

      // 텍스트 테두리 그리기 (검은색)
      context.strokeStyle = "#000000";
      context.lineWidth = Math.max(2, 3 * renderScale); // 최소 두께 보장
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.strokeText(ballNumber, pos.x, pos.y);

      // 텍스트 내용 그리기 (흰색)
      context.fillStyle = "#FFFFFF";
      context.fillText(ballNumber, pos.x, pos.y);

      // 변환 복원
      context.restore();
    }
  });

  // 공 생성
  for (let i = 0; i < Config.BALL_COUNT; i++) {
    const { x, y } = randomPointInCircle(
      containerConfig.x,
      containerConfig.y,
      containerConfig.spawnRadius
    );

    const hue = (i * 8) % 360;
    const ballColor = `hsl(${hue}, 70%, 50%)`;

    const ball = Bodies.circle(x, y, containerConfig.ballRadius, {
      restitution: 0.9,
      frictionAir: 0.03,
      render: {
        fillStyle: ballColor,
        sprite: {
          texture: createBallTexture(i + 1, containerConfig.ballRadius * 2),
          xScale: 1,
          yScale: 1,
        },
      },
      collisionFilter: {
        category: 0x0001,
        mask: 0x0001 | 0x0002,
      },
    });

    // 각 공에 번호 할당
    const ballNumber = i + 1;
    ball.label = `${ballNumber}`;

    Composite.add(engine.world, ball);
    balls.push(ball);
  }
  return balls;
}

// 공 텍스처를 생성하는 함수 (텍스트 포함된 이미지)
function createBallTexture(number: number, size: number): string {
  // 캔버스 생성
  const canvas = document.createElement("canvas");

  // 선명한 텍스처를 위해 디바이스 픽셀 비율 고려
  const pixelRatio = window.devicePixelRatio / 2 || 1;
  const adjustedSize = size * pixelRatio;

  canvas.width = adjustedSize;
  canvas.height = adjustedSize;
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  // 배경 원 그리기
  const radius = adjustedSize / 2;
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.closePath();

  // 번호에 따른 색상 변경
  const hue = (number * 8) % 360;
  ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
  ctx.fill();

  // 테두리 추가 - 약간 얇게 조정
  // ctx.strokeStyle = `hsl(${hue}, 80%, 30%)`;
  // ctx.lineWidth = 1;
  // ctx.stroke();

  // 텍스트 그리기 - 디바이스 픽셀 비율 고려하고 크기 조정
  ctx.font = `bold ${Math.max(
    adjustedSize / 2.5,
    16 * pixelRatio
  )}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 텍스트 외곽선 - 두께 미세 조정
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3 * pixelRatio;
  ctx.strokeText(number.toString(), radius, radius);

  // 텍스트 내용
  ctx.fillStyle = "#ffffff";
  ctx.fillText(number.toString(), radius, radius);

  return canvas.toDataURL();
}
