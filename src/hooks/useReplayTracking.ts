import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { RecordMap } from "../types/RecordMap";

export interface ReplayTracking {
  replayTarget: string | null;
  setReplayTarget: (target: string | null) => void;
  replaysRef: React.RefObject<RecordMap>;
  ballReplayMap: React.RefObject<RecordMap>;
  recordBallPositions: (
    ballBodies: Matter.Body[],
    containerConfig: {
      x: number;
      y: number;
      radius: number;
      size: number;
      ballRadius: number;
      ringThickness: number;
      innerWallRadius: number;
      spawnRadius: number;
    }
  ) => void;

  captureBallExit: (ballLabel: string) => void;
  getAvailableReplays: () => string[];
  replayPath: { x: number; y: number; time: number }[] | null;
}

/**
 * 볼 이동 경로를 추적하고 리플레이 기능을 제공하는 훅
 */
export function useReplayTracking(): ReplayTracking {
  // 리플레이 관련 상태
  const [replayTarget, setReplayTarget] = useState<string | null>(null);
  const replaysRef = useRef<RecordMap>({});
  const ballReplayMap = useRef<RecordMap>({});

  // 현재 리플레이 경로 상태
  const [replayPath, setReplayPath] = useState<
    { x: number; y: number; time: number }[] | null
  >(null);

  // replayTarget이 변경될 때 경로 업데이트
  useEffect(() => {
    if (!replayTarget) {
      setReplayPath(null);
      return;
    }

    const path = replaysRef.current[replayTarget];
    setReplayPath(path || null);
  }, [replayTarget]);

  /**
   * 공의 위치를 기록하는 함수 (특히 출구 근처에서)
   */
  const recordBallPositions = (
    ballBodies: Matter.Body[],
    containerConfig: {
      x: number;
      y: number;
      radius: number;
      size: number;
      ballRadius: number;
      ringThickness: number;
      innerWallRadius: number;
      spawnRadius: number;
    }
  ) => {
    const now = Date.now();
    for (const ball of ballBodies) {
      if (!ballReplayMap.current[ball.label]) {
        ballReplayMap.current[ball.label] = [];
      }
      const isNearExit =
        Math.abs(ball.position.x - containerConfig.x) < 80 &&
        Math.abs(
          ball.position.y - (containerConfig.y - containerConfig.radius)
        ) < 80;

      if (isNearExit) {
        ballReplayMap.current[ball.label].push({
          x: ball.position.x,
          y: ball.position.y,
          time: now,
        });
      }
    }
  };

  /**
   * 공이 출구를 통과했을 때 전체 경로를 저장
   */
  const captureBallExit = (ballLabel: string) => {
    replaysRef.current[ballLabel] = [
      ...(ballReplayMap.current[ballLabel] || []),
    ];
    delete ballReplayMap.current[ballLabel];
  };

  /**
   * 리플레이 가능한 공들의 목록 반환
   */
  const getAvailableReplays = () => Object.keys(replaysRef.current);

  return {
    replayTarget,
    setReplayTarget,
    replaysRef,
    ballReplayMap,
    recordBallPositions,
    captureBallExit,
    getAvailableReplays,
    replayPath,
  };
}
