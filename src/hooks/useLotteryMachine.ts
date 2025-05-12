import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { setupGuideWalls } from "../components/GuideWall";
import { createContainer } from "../components/BallContainer";
import { calculateContainerSize, shakeScreen } from "../utils/Utils";
import {
  createBasketSensor,
  BasketSensorConfig,
} from "../components/BasketSensor";
import { createBalls } from "../components/Balls";
import { setupAntiStuck } from "../components/AntiStuck";
import { initPhysicsEngine, cleanupPhysicsEngine } from "../components/Engine";
import { useWindEffect } from "./useWindEffect";
import { createBasket } from "../components/BallBasket";
import { Config } from "../const/Config";
import { useBasketSensor } from "./useBasketSensor";

export interface ContainerConfig {
  size: number;
  radius: number;
  x: number;
  y: number;
  ballRadius: number;
  ringThickness: number;
  innerWallRadius: number;
  spawnRadius: number;
}

export interface LotteryMachine {
  exitedBalls: string[];
  showPopup: boolean;
  closePopup: () => void;
  restartGame: () => void;
  sceneRef: React.RefObject<HTMLDivElement>;
  handleShake: () => Promise<void>;
}

export function useLotteryMachine(
  width: number,
  height: number
): LotteryMachine {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [exitedBalls, setExitedBalls] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const ballBodiesRef = useRef<Matter.Body[]>([]);
  const engineRef = useRef<Matter.Engine | null>(null);
  const containerConfigRef = useRef<ContainerConfig | null>(null);
  const isShakingRef = useRef<boolean>(false);
  const basketSensorRef = useRef<Matter.Body | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  const minDimension = Math.min(width, height);

  // Wind effect hook
  const windControl = useWindEffect(
    engineRef.current,
    containerConfigRef.current
  );
  const windControlRef = useRef(windControl);

  // 바구니 센서 훅 사용
  const basketSensor = useBasketSensor(basketSensorRef.current);
  const basketSensorHandlerRef = useRef(basketSensor);

  // basketSensorHandlerRef를 항상 최신 상태로 유지
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
      });
    });

    // 바람 효과 초기화
    if (typeof windControlRef.current.startWind === "function") {
      windControlRef.current.startWind();
    }

    setExitedBalls([]); // 게임 시작 시 공 초기화
  };

  // 게임 재시작 함수
  const restartGame = () => {
    // 상태 초기화
    setExitedBalls([]);
    setShowPopup(false);

    // 센서 핸들러 초기화
    basketSensorHandlerRef.current.reset();

    // 게임 초기화
    initializeGame();
  };

  // 화면 흔들기 함수
  const handleShake = async () => {
    if (isShakingRef.current) return Promise.resolve();

    isShakingRef.current = true;

    // 전체 화면 진동
    if (sceneRef.current) {
      try {
        // 진동 강도와 지속 시간 줄임
        await shakeScreen(sceneRef.current, 2, 150);

        // 공들에게 힘을 가해 흔들리는 효과 추가
        if (engineRef.current && ballBodiesRef.current.length > 0) {
          ballBodiesRef.current.forEach((ball) => {
            const forceMagnitude = 0.015 * ball.mass;
            const forceX = (Math.random() - 0.5) * forceMagnitude;
            const forceY = (Math.random() - 0.5) * forceMagnitude;

            Matter.Body.applyForce(ball, ball.position, {
              x: forceX,
              y: forceY,
            });
          });
        }
      } finally {
        isShakingRef.current = false;
      }
    }

    return Promise.resolve();
  };

  useEffect(() => {
    initializeGame();

    const handleResize = () => {
      // 리사이즈 처리 로직은 추후 추가
    };

    window.addEventListener("resize", handleResize);

    // 클린업 함수
    return () => {
      if (renderRef.current && runnerRef.current) {
        cleanupPhysicsEngine(renderRef.current, runnerRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [width, height, minDimension]); // width, height, minDimension 의존성 추가

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
    const handleKeyDown = async (event: KeyboardEvent) => {
      // 스페이스바를 누르면 화면 진동 효과 실행
      if (event.code === "Space" && !isShakingRef.current) {
        await handleShake();
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return {
    exitedBalls,
    showPopup,
    closePopup,
    restartGame,
    sceneRef,
    handleShake,
  };
}
