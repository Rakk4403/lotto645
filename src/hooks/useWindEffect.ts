import { useEffect, useRef } from "react";
import Matter from "matter-js";
import { perfMode } from "../components/Engine";

export function useWindEffect(
  engine: Matter.Engine | null,
  containerConfig: {
    size: number;
    radius: number;
    x: number;
    y: number;
    ballRadius: number;
    ringThickness: number;
    innerWallRadius: number;
    spawnRadius: number;
  } | null
) {
  const activeRef = useRef(false);
  const frameCounterRef = useRef(0);
  const strongWindCounterRef = useRef(0);

  useEffect(() => {
    if (!engine || !containerConfig) return;

    const Composite = Matter.Composite;

    const applyWind = () => {
      frameCounterRef.current++;

      if (perfMode.isLowPerf && frameCounterRef.current % 2 !== 0) {
        return;
      }

      if (frameCounterRef.current > 60) {
        frameCounterRef.current = 0;
      }

      strongWindCounterRef.current++;

      const isStrongWind =
        strongWindCounterRef.current > 0 &&
        strongWindCounterRef.current % (perfMode.isLowPerf ? 45 : 90) < 20;

      if (strongWindCounterRef.current > 1000) {
        strongWindCounterRef.current = 0;
      }

      const bodies = Composite.allBodies(engine.world);
      // 데스크탑에서 바람 강도 더 감소 (0.2 → 0.15)
      const forceMagnitudeBase = perfMode.isLowPerf ? 0.15 : 0.15;

      for (const body of bodies) {
        if (body.isStatic) continue;

        const centerX = containerConfig.x;
        const centerY = containerConfig.y;
        const relativeX = body.position.x - centerX;
        const relativeY = body.position.y - centerY;

        // 6시 위치부터 중심까지 세로로 긴 사각형 영역인지 확인
        const isInVerticalRectangle =
          Math.abs(relativeX) < containerConfig.radius * 0.15 && // 좌우 15% 이내
          relativeY > 0 && // 중심보다 아래에 있음
          relativeY < containerConfig.radius; // 6시 방향쪽 가장자리보다는 안쪽에 있음

        // 사각형 영역 안에 있지 않으면 바람 효과 무시
        if (!isInVerticalRectangle) continue;

        // 바람 강도 계산 - 6시 방향(아래쪽)에서 중심으로 갈수록 약해짐
        const verticalPosition = relativeY / containerConfig.radius;
        const strength = Math.max(0.2, verticalPosition);

        // 최종 바람 강도
        const forceMagnitude =
          forceMagnitudeBase * strength * (isStrongWind ? 2.0 : 1.0); // 강한 바람 강도도 감소 (2.5 → 2.0)

        // 바람은 항상 아래에서 위로 향함 (6시에서 중심 방향)
        let forceX = 0;
        const forceY = -forceMagnitude;

        // 약간의 중앙 수직선으로 모이는 효과 추가
        if (Math.abs(relativeX) > containerConfig.radius * 0.05) {
          forceX = -Math.sign(relativeX) * forceMagnitude * 0.4;
        } else {
          forceX = (Math.random() * 0.2 - 0.1) * forceMagnitude;
        }

        Matter.Body.applyForce(body, body.position, {
          x: forceX,
          y: forceY,
        });
      }
    };

    const tick = () => {
      if (activeRef.current) {
        applyWind();
      }
    };

    Matter.Events.on(engine, "beforeUpdate", tick);
    return () => {
      Matter.Events.off(engine, "beforeUpdate", tick);
    };
  }, [engine, containerConfig]);

  return {
    startWind: () => {
      activeRef.current = true;
    },
    stopWind: () => {
      activeRef.current = false;
    },
  };
}
