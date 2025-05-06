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
import { useWindEffect } from "../hooks/useWindEffect";
import { useReplayTracking } from "../hooks/useReplayTracking";
import { createBasket } from "./BallBasket";
import { BallPopup } from "./BallPopup";

export function Machine() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [insideBalls, setInsideBalls] = useState<string[]>([]);
  const [exitedBalls, setExitedBalls] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const ballBodiesRef = useRef<Matter.Body[]>([]);
  const exitBlockedRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const containerConfigRef = useRef<{
    size: number;
    radius: number;
    x: number;
    y: number;
    ballRadius: number;
    ringThickness: number;
    innerWallRadius: number;
    spawnRadius: number;
  } | null>(null);

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

  // Define drawnBalls, mainBalls, bonusBall
  const drawnBalls = [...exitedBalls];
  const mainBalls = drawnBalls.slice(0, 6);
  const bonusBall = drawnBalls.length > 6 ? drawnBalls[6] : null;

  // Wind effect hook - React 훅 규칙에 맞게 최상위에서 호출
  const windControl = useWindEffect(
    engineRef.current,
    containerConfigRef.current
  );
  const windControlRef = useRef(windControl);

  // windControlRef를 항상 최신 상태로 유지
  useEffect(() => {
    windControlRef.current = windControl;
  }, [windControl]);

  // 모든 공이 뽑혔을 때 팝업 표시 효과
  useEffect(() => {
    if (exitedBalls.length === 7) {
      // 모든 공이 뽑힌 후 약간의 딜레이를 두고 팝업 표시
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [exitedBalls.length]);

  // 팝업 닫기 기능
  const closePopup = () => {
    setShowPopup(false);
  };

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
    engineRef.current = engine;
    const containerConfig = calculateContainerSize({
      width,
      height,
      minDimension,
    });
    containerConfigRef.current = containerConfig;

    createContainer(containerConfig, engine);

    ballBodiesRef.current = createBalls(containerConfig, engine);

    setInsideBalls(ballBodiesRef.current.map((b) => b.label));

    exitBlockedRef.current = false;

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    const stuckStartTimes: Record<string, number> = {};
    const nudgedBalls = new Set<string>();

    Matter.Events.on(engine, "beforeUpdate", () => {
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

    const basket = createBasket(width / 2, height - 30, 660, 60);
    Matter.Composite.add(engine.world, basket);

    Matter.Events.on(engine, "collisionEnd", (event) => {
      if (!exitBlockedRef.current) {
        exitBlockedRef.current = handlePassExitCloseSensor(
          event,
          // Removed onPassedBall call here
          engine,
          exitConfig,
          exitedBalls
        );
      }
    });
    Matter.Events.on(engine, "collisionStart", (event) => {
      if (exitBlockedRef.current) {
        exitBlockedRef.current = handlePassExitOpenSensor(
          event,
          (ballBody) => {
            setExitedBalls((prev) => [...prev, ballBody.label]);
            setInsideBalls((prev) =>
              prev.filter((label) => label !== ballBody.label)
            );
            captureBallExit(ballBody.label);
          },
          engine,
          exitConfig,
          exitedBalls
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

  // Wind effect toggle based on exitedBalls
  useEffect(() => {
    // The following assumes startWind/stopWind are in scope from the above effect
    if (
      typeof windControlRef.current.stopWind !== "function" ||
      typeof windControlRef.current.startWind !== "function"
    )
      return;
    if (exitedBalls.length >= 7) {
      windControlRef.current.stopWind();
    } else {
      windControlRef.current.startWind();
    }
  }, [exitedBalls]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: "10px",
          fontSize: "18px",
          fontWeight: "bold",
          fontFamily: "monospace",
          zIndex: 12,
        }}
      >
        <div>
          🎱 번호 추첨 결과:&nbsp;
          {mainBalls.map((label) => (
            <span key={label} style={{ marginRight: 8 }}>
              {label}
            </span>
          ))}
          {bonusBall && (
            <span style={{ color: "blue" }}>+ {bonusBall} (보너스)</span>
          )}
        </div>
      </div>
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
      {/* Ball Popup */}
      <BallPopup balls={drawnBalls} show={showPopup} onClose={closePopup} />
    </>
  );
}

function handlePassExitOpenSensor(
  event: Matter.IEventCollision<Matter.Engine>,
  onPassedBall: (ballBody: Matter.Body) => void,
  engine: Matter.Engine,
  exitConfig: {
    exitAngle: number;
    exitWalls: Matter.Body[];
  },
  exitedBalls: string[]
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
      if (!exitedBalls.includes(ballBody.label)) {
        onPassedBall(ballBody);
      }
      exitBlocked = false;
      break;
    }
  }
  return exitBlocked;
}

function handlePassExitCloseSensor(
  event: Matter.IEventCollision<Matter.Engine>,
  engine: Matter.Engine,
  exitConfig: {
    exitAngle: number;
    exitWalls: Matter.Body[];
  },
  exitedBalls: string[]
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
        if (exitedBalls.length >= 7) return false;
        // Ball exited: update states
        // onPassedBall removed here
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
