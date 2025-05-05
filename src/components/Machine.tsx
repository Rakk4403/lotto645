import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";
import { setupGuideWalls } from "./GuideWall";
import { setupOpenExitSensor } from "./ExitOpenSensor";
import { createContainer } from "./BallContainer";
import { calculateContainerSize } from "../utils/Utils";
import { setupExitAndSensor } from "./ExitCloseSensor";
import { createBalls } from "./Balls";
import { setupAntiStuck } from "./AntiStuck";
import { initPhysicsEngine, cleanupPhysicsEngine } from "./Engine";
import { setupWindEffect } from "./WindEffect";
import { useReplayTracking } from "../hooks/useReplayTracking";

export function Machine() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [insideBalls, setInsideBalls] = useState<string[]>([]);
  const [exitedBalls, setExitedBalls] = useState<string[]>([]);
  const ballBodiesRef = useRef<Matter.Body[]>([]);
  const exitBlockedRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 리플레이 관련 기능을 커스텀 hook으로 분리
  const {
    replayTarget,
    setReplayTarget,
    ballReplayMap,
    recordBallPositions,
    captureBallExit,
    getAvailableReplays,
    replayPath,
  } = useReplayTracking();

  const { innerWidth, innerHeight } = window;
  const width = Math.min(innerWidth, 1200); // Adding a maximum width of 1200px
  const height = Math.min(innerHeight, 800); // Adding a maximum height of 800px

  const minDimension = Math.min(width, height);

  // 리플레이 경로 렌더링을 위한 useEffect 추가
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);

    // 리플레이 경로가 없으면 렌더링하지 않음
    if (!replayPath) return;

    // 경로 렌더링
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
    ctx.lineWidth = 3;

    for (let i = 0; i < replayPath.length; i++) {
      const point = replayPath[i];
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }

    ctx.stroke();

    // 출발점과 종착점 강조
    if (replayPath.length > 0) {
      // 출발점
      ctx.beginPath();
      ctx.fillStyle = "blue";
      ctx.arc(replayPath[0].x, replayPath[0].y, 5, 0, Math.PI * 2);
      ctx.fill();

      // 종착점
      ctx.beginPath();
      ctx.fillStyle = "green";
      ctx.arc(
        replayPath[replayPath.length - 1].x,
        replayPath[replayPath.length - 1].y,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }, [replayPath]); // width, height 제거

  useEffect(() => {
    if (!sceneRef.current) return;
    const { engine, render, runner } = initPhysicsEngine({
      sceneElem: sceneRef.current,
      width,
      height,
    });
    const containerConfig = calculateContainerSize({
      width,
      height,
      minDimension,
    });

    createContainer(containerConfig, engine);

    ballBodiesRef.current = createBalls(containerConfig, engine);

    setInsideBalls(ballBodiesRef.current.map((b) => b.label));

    exitBlockedRef.current = false;

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    const stuckStartTimes: Record<string, number> = {};
    const nudgedBalls = new Set<string>();
    Matter.Events.on(engine, "beforeUpdate", () => {
      setupWindEffect(engine, containerConfig);
      // recordOnExit 대신 커스텀 훅의 메소드 사용
      recordBallPositions(ballBodiesRef.current, containerConfig);
      setupAntiStuck(
        ballBodiesRef,
        containerConfig,
        stuckStartTimes,
        nudgedBalls,
        ballReplayMap
      );
    });
    const exitConfig = setupExitAndSensor(containerConfig, engine);

    setupGuideWalls(containerConfig, exitConfig.exitAngle, engine);

    Matter.Events.on(engine, "collisionEnd", (event) => {
      if (!exitBlockedRef.current) {
        exitBlockedRef.current = handlePassExitCloseSensor(
          event,
          (ballBody) => {
            // 공이 출구를 통과했을 때 상태 업데이트
            setExitedBalls((prev) => [...prev, ballBody.label]);
            setInsideBalls((prev) =>
              prev.filter((label) => label !== ballBody.label)
            );
            // 리플레이 경로 캡처를 hook 메소드로 대체
            captureBallExit(ballBody.label);
          },
          engine,
          exitConfig
        );
      }
    });
    Matter.Events.on(engine, "collisionStart", (event) => {
      if (exitBlockedRef.current) {
        exitBlockedRef.current = handlePassExitOpenSensor(
          event,
          engine,
          exitConfig
        );
      }
    });

    // 출구 열기 센서 설정
    setupOpenExitSensor(containerConfig, engine);

    const handleResize = () => {
      // const { innerWidth, innerHeight } = window;
    };

    window.addEventListener("resize", handleResize);

    // 클린업 함수
    return () => {
      cleanupPhysicsEngine(render, runner);
      window.removeEventListener("resize", handleResize);
    };

    // --- end overrides
  }, [width, height, minDimension]);

  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div ref={sceneRef} />
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: width,
            height: height,
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      </div>
      {/* Replay selection UI */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "rgba(240,240,240,0.95)",
          padding: "8px",
          zIndex: 11,
        }}
      >
        <div>🎞️ 리플레이 보기:</div>
        <select
          value={replayTarget || ""}
          onChange={(e) => setReplayTarget(e.target.value || null)}
        >
          <option value="">-- 선택 --</option>
          {getAvailableReplays().map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {/* Ball status UI */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: "10px",
          fontSize: "14px",
          fontFamily: "monospace",
          zIndex: 10,
        }}
      >
        <div>
          <strong>🟢 내부 공</strong>: {insideBalls.join(", ")}
        </div>
        <div>
          <strong>🔴 탈출 공</strong>: {exitedBalls.join(", ")}
        </div>
      </div>
    </>
  );
}

function handlePassExitOpenSensor(
  event: Matter.IEventCollision<Matter.Engine>,
  engine: Matter.Engine,
  exitConfig: {
    exitAngle: number;
    exitWalls: Matter.Body[];
  }
) {
  let exitBlocked = true;
  for (const pair of event.pairs) {
    const { bodyA, bodyB } = pair;
    const sensorBody =
      bodyA.label === "exitOpenSensor"
        ? bodyA
        : bodyB.label === "exitOpenSensor"
        ? bodyB
        : null;
    const ballBody = sensorBody ? (sensorBody === bodyA ? bodyB : bodyA) : null;
    if (sensorBody && ballBody && !ballBody.isStatic) {
      console.log(`${ballBody.label}: 출구 통과 감지: 출구를 열 수 있습니다.`);
      Matter.Composite.remove(engine.world, exitConfig.exitWalls);
      exitBlocked = false;
      break;
    }
  }
  return exitBlocked;
}

function handlePassExitCloseSensor(
  event: Matter.IEventCollision<Matter.Engine>,
  onPassedBall: (ballBody: Matter.Body) => void,
  engine: Matter.Engine,
  exitConfig: {
    exitAngle: number;
    exitWalls: Matter.Body[];
  }
) {
  let exitBlocked = false;
  for (const pair of event.pairs) {
    const { bodyA, bodyB } = pair;
    const sensorBody =
      bodyA.label === "exitSensor"
        ? bodyA
        : bodyB.label === "exitSensor"
        ? bodyB
        : null;
    const ballBody = sensorBody ? (sensorBody === bodyA ? bodyB : bodyA) : null;

    if (sensorBody && ballBody && !ballBody.isStatic) {
      // 여기에서 공의 이동 방향을 확인
      // 공이 센서의 윗면을 통과할 때에만 출구를 막음
      const isOverUpperSide = ballBody.position.y < sensorBody.position.y - 10;
      if (isOverUpperSide && ballBody.velocity.y < -1) {
        // Ball exited: update states
        onPassedBall(ballBody);
        console.log(`${ballBody.label}: 출구 통과 감지: 출구를 막습니다.`);

        Matter.Composite.add(engine.world, exitConfig.exitWalls);
        exitBlocked = true;
        break;
      } else {
        console.log(`${ballBody.label} 공이 아래로 떨어져서 무시합니다.`);
      }
    }
  }
  return exitBlocked;
}
