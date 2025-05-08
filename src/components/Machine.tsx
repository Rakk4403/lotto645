import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";
import { setupGuideWalls } from "./GuideWall";
import { createContainer } from "./BallContainer";
import { calculateContainerSize, shakeScreen } from "../utils/Utils";
import { setupBasketSensor } from "./BasketSensor";
import { createBalls } from "./Balls";
import { setupAntiStuck } from "./AntiStuck";
import { initPhysicsEngine, cleanupPhysicsEngine } from "./Engine";
import { useWindEffect } from "../hooks/useWindEffect";
import { createBasket } from "./BallBasket";
import { BallPopup } from "./BallPopup";
import { Config } from "../const/Config";

/**
 * 공 번호에 따라 색상을 생성하는 함수
 */
const getBallColor = (ballNumber: string) => {
  const number = parseInt(ballNumber, 10);
  const hue = (number * 8) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

export function Machine() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [insideBalls, setInsideBalls] = useState<string[]>([]);
  const [exitedBalls, setExitedBalls] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const ballBodiesRef = useRef<Matter.Body[]>([]);
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
  const isShakingRef = useRef<boolean>(false);

  const { innerWidth, innerHeight } = window;
  const width = Math.min(innerWidth, 1200); // Adding a maximum width of 1200px
  const height = Math.min(innerHeight, 800); // Adding a maximum height of 800px

  const minDimension = Math.min(width, height);

  // Define drawnBalls, mainBalls, bonusBall
  const drawnBalls = [...exitedBalls];
  // 정렬된 메인 볼 (보너스 번호 제외)
  const mainBalls = [...drawnBalls.slice(0, 6)].sort(
    (a, b) => parseInt(a) - parseInt(b)
  );
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

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    const stuckStartTimes: Record<string, number> = {};
    const nudgedBalls = new Set<string>();

    Matter.Events.on(engine, "beforeUpdate", () => {
      // 안티스턱 로직만 유지
      setupAntiStuck(
        ballBodiesRef,
        containerConfig,
        stuckStartTimes,
        nudgedBalls
      );
    });

    // 바구니 및 센서 설정
    setupBasketSensor(
      {
        x: containerConfig.x + containerConfig.radius,
        y: containerConfig.y + containerConfig.radius - 30,
        width: 200,
        height: 30,
      },
      engine
    );

    // 가이드 벽 설정
    setupGuideWalls(containerConfig, Config.EXIT_ANGLE, engine);

    // 바구니 생성
    const basketWidth = 200;
    const basketHeight = 30;
    const basketX = containerConfig.x + containerConfig.radius;
    const basketY = containerConfig.y + containerConfig.radius;
    const basket = createBasket(basketX, basketY, basketWidth, basketHeight);
    Matter.Composite.add(engine.world, basket);

    // 바구니 충돌 감지 설정
    Matter.Events.on(engine, "collisionStart", (event) => {
      handlePassBasketSensor(
        event,
        engine,
        (ballBody) => {
          // 공이 바구니에 들어갔을 때 처리
          setExitedBalls((prev) => [...prev, ballBody.label]);
          setInsideBalls((prev) =>
            prev.filter((label) => label !== ballBody.label)
          );
        },
        exitedBalls
      );
    });

    const handleResize = () => {
      // const { innerWidth, innerHeight } = window;
    };

    window.addEventListener("resize", handleResize);

    // 클린업 함수
    return () => {
      cleanupPhysicsEngine(render, runner);
      window.removeEventListener("resize", handleResize);
    };
  }, [width, height, minDimension]);

  // Wind effect toggle based on exitedBalls
  useEffect(() => {
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

  useEffect(() => {
    // 키보드 이벤트 핸들러
    const handleKeyDown = (event: KeyboardEvent) => {
      // 스페이스바를 누르면 화면 진동 효과 실행
      if (event.code === "Space" && !isShakingRef.current) {
        isShakingRef.current = true;

        // 전체 화면 진동 (container가 포함된 scene 요소)
        if (sceneRef.current) {
          // 진동 강도를 8에서 4로 줄이고 지속 시간도 300ms에서 150ms로 줄임
          shakeScreen(sceneRef.current, 2, 150).then(() => {
            isShakingRef.current = false;
          });

          // 공들에게도 힘을 가해 흔들리는 효과 추가 (선택적)
          if (engineRef.current && ballBodiesRef.current.length > 0) {
            ballBodiesRef.current.forEach((ball) => {
              // 공에 가해지는 힘도 줄임 (0.03에서 0.015로)
              const forceMagnitude = 0.015 * ball.mass;
              const forceX = (Math.random() - 0.5) * forceMagnitude;
              const forceY = (Math.random() - 0.5) * forceMagnitude;

              Matter.Body.applyForce(ball, ball.position, {
                x: forceX,
                y: forceY,
              });
            });
          }
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트/언마운트 시에만 실행

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
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        <div>
          🎱 번호 추첨 결과:&nbsp;
          {mainBalls.map((label) => (
            <span
              key={label}
              style={{
                display: "inline-block",
                margin: "0 4px",
                padding: "4px 8px",
                borderRadius: "50%",
                backgroundColor: getBallColor(label),
                color: "white",
                textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
                width: "24px",
                height: "24px",
                lineHeight: "24px",
                textAlign: "center",
              }}
            >
              {label}
            </span>
          ))}
          {bonusBall && (
            <span style={{ marginLeft: "10px" }}>
              +{" "}
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "50%",
                  backgroundColor: getBallColor(bonusBall),
                  color: "white",
                  textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
                  width: "24px",
                  height: "24px",
                  lineHeight: "24px",
                  textAlign: "center",
                }}
              >
                {bonusBall}
              </span>{" "}
              (보너스)
            </span>
          )}
        </div>
      </div>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div ref={sceneRef} />
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
          borderRadius: "8px",
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

function handlePassBasketSensor(
  event: Matter.IEventCollision<Matter.Engine>,
  engine: Matter.Engine,
  onBallInBasket: (ballBody: Matter.Body) => void,
  exitedBalls: string[]
) {
  for (const pair of event.pairs) {
    const { bodyA, bodyB } = pair;
    const sensorBody =
      bodyA.label === "basketSensor"
        ? bodyA
        : bodyB.label === "basketSensor"
        ? bodyB
        : null;
    const ballBody = sensorBody ? (sensorBody === bodyA ? bodyB : bodyA) : null;

    if (sensorBody && ballBody && !ballBody.isStatic) {
      // 이미 처리된 공 스킵
      if (exitedBalls.includes(ballBody.label)) continue;

      // 공이 바구니에 들어왔을 때만 처리 (위에서 아래로 떨어지는 방향)
      if (ballBody.velocity.y > 0) {
        console.log(`${ballBody.label} 공이 바구니에 들어왔습니다.`);

        // 공을 선택된 목록에 추가
        onBallInBasket(ballBody);
        return true;
      }
    }
  }
  return false;
}
