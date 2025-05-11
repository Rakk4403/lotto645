import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";
import { setupGuideWalls } from "./GuideWall";
import { createContainer } from "./BallContainer";
import { calculateContainerSize, shakeScreen } from "../utils/Utils";
import { createBasketSensor, BasketSensorConfig } from "./BasketSensor";
import { createBalls } from "./Balls";
import { setupAntiStuck } from "./AntiStuck";
import { initPhysicsEngine, cleanupPhysicsEngine } from "./Engine";
import { useWindEffect } from "../hooks/useWindEffect";
import { createBasket } from "./BallBasket";
import { BallPopup } from "./BallPopup";
import { Config } from "../const/Config";
import { useBasketSensor } from "../hooks/useBasketSensor";
import {
  calculateRecommendationScore,
  getScoreRating,
} from "../utils/RecommendationScore";

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
  const basketSensorRef = useRef<Matter.Body | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  const { innerWidth, innerHeight } = window;
  const width = Math.min(innerWidth, 1200); // Adding a maximum width of 1200px
  const height = Math.min(innerHeight, 800); // Adding a maximum height of 800px

  const minDimension = Math.min(width, height);

  // Define drawnBalls
  const drawnBalls = [...exitedBalls.slice(0, 6)]; // 최대 6개 공만 표시
  // 정렬된 볼 (오름차순)
  const sortedBalls = [...drawnBalls].sort((a, b) => parseInt(a) - parseInt(b));

  // Wind effect hook - React 훅 규칙에 맞게 최상위에서 호출
  const windControl = useWindEffect(
    engineRef.current,
    containerConfigRef.current
  );
  const windControlRef = useRef(windControl);

  // 바구니 센서 훅 사용 - 센서 객체 참조를 전달
  const basketSensor = useBasketSensor(basketSensorRef.current);
  const basketSensorHandlerRef = useRef(basketSensor);

  // basketSensorHandlerRef를 항상 최신 상태로 유지 (새로운 useEffect로 분리)
  useEffect(() => {
    basketSensorHandlerRef.current = basketSensor;
  }, [basketSensor]);

  // windControlRef를 항상 최신 상태로 유지
  useEffect(() => {
    windControlRef.current = windControl;
  }, [windControl]);

  // 모든 공이 뽑혔을 때 팝업 표시 효과
  useEffect(() => {
    if (exitedBalls.length >= 6) {
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

  // 게임 초기화 함수
  const initializeGame = () => {
    if (!sceneRef.current) return;

    // 이전 물리 엔진 정리
    if (renderRef.current && runnerRef.current) {
      cleanupPhysicsEngine(renderRef.current, runnerRef.current);
    }

    // 새로운 물리 엔진 초기화
    const { engine, render, runner } = initPhysicsEngine({
      sceneElem: sceneRef.current,
      width,
      height,
    });

    // 참조 업데이트
    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    const containerConfig = calculateContainerSize({
      width,
      height,
      minDimension,
    });
    containerConfigRef.current = containerConfig;

    createContainer(containerConfig, engine);

    // 공 생성 및 상태 업데이트
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

    // 바구니 센서 생성 및 설정
    const sensorConfig: BasketSensorConfig = {
      x: containerConfig.x + containerConfig.radius,
      y: containerConfig.y + containerConfig.radius - 30,
      width: 200,
      height: 30,
    };

    // 센서 생성 및 참조 저장
    basketSensorRef.current = createBasketSensor(sensorConfig, engine);

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
      // 항상 최신 핸들러 참조를 사용
      basketSensorHandlerRef.current.handleCollision(event, (ballBody) => {
        // 공이 바구니에 들어갔을 때 처리
        setExitedBalls((prev) => [...prev, ballBody.label]);
        setInsideBalls((prev) =>
          prev.filter((label) => label !== ballBody.label)
        );
      });
    });

    // 바람 효과 초기화
    if (typeof windControlRef.current.startWind === "function") {
      windControlRef.current.startWind();
    }
  };

  // 게임 재시작 함수
  const restartGame = () => {
    // 상태 초기화
    setExitedBalls([]);
    setInsideBalls([]);
    setShowPopup(false);

    // 센서 핸들러 초기화
    basketSensorHandlerRef.current.reset();

    // 게임 초기화
    initializeGame();
  };

  useEffect(() => {
    initializeGame();

    const handleResize = () => {
      // const { innerWidth, innerHeight } = window;
    };

    window.addEventListener("resize", handleResize);

    // 클린업 함수
    return () => {
      if (renderRef.current && runnerRef.current) {
        cleanupPhysicsEngine(renderRef.current, runnerRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [width, height, minDimension]); // basketSensor 의존성 제거

  // Wind effect toggle based on exitedBalls
  useEffect(() => {
    if (
      typeof windControlRef.current.stopWind !== "function" ||
      typeof windControlRef.current.startWind !== "function"
    )
      return;
    if (exitedBalls.length >= 6) {
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
          {sortedBalls.map((label) => (
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
        </div>
      </div>

      {/* 다시 시작 버튼 - 추첨이 모두 완료되었을 때만 표시 */}
      {exitedBalls.length >= 6 && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
          }}
        >
          <button
            onClick={restartGame}
            style={{
              padding: "12px 24px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease",
            }}
          >
            다시 추첨하기
          </button>
        </div>
      )}

      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div ref={sceneRef} />
      </div>
      <BallPopup balls={drawnBalls} show={showPopup} onClose={closePopup} />
    </>
  );
}
