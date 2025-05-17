import Matter from "matter-js";
import React from "react";
import { perfMode } from "./Engine";

// 프레임 카운터 (모든 프레임마다 검사하지 않기 위함)
let frameCounter = 0;

export function setupAntiStuck(
  ballBodiesRef: React.RefObject<Matter.Body[]>,
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
  stuckStartTimes: Record<string, number>,
  nudgedBalls: Set<string>
) {
  // 모바일에서는 매 프레임마다 검사하지 않고 주기적으로만 검사
  frameCounter++;

  // 저성능 모드에서는 5프레임마다 검사 (약 12fps)
  if (perfMode.isLowPerf && frameCounter % 5 !== 0) {
    return;
  }

  // 카운터 초기화
  if (frameCounter > 60) {
    frameCounter = 0;
  }

  const now = Date.now();

  // 성능 최적화: 모든 공을 매번 검사하는 것이 아니라 일부만 검사
  const ballsToCheck = perfMode.isLowPerf
    ? ballBodiesRef.current.filter((_, idx) => idx % 2 === frameCounter % 2) // 모바일: 절반만 검사
    : ballBodiesRef.current; // 데스크탑: 모두 검사

  for (const ball of ballsToCheck) {
    if (!ball.position || ball.isStatic) continue;

    const isAtTop =
      ball.position.y < containerConfig.y - containerConfig.radius + 100;

    if (isAtTop) {
      if (!stuckStartTimes[ball.label]) {
        stuckStartTimes[ball.label] = now;
      } else {
        const duration = now - stuckStartTimes[ball.label];
        // 모바일에서는 더 오래 기다림 (3초, 데스크탑은 2초)
        const stuckThreshold = perfMode.isLowPerf ? 3000 : 2000;

        if (duration > stuckThreshold && !nudgedBalls.has(ball.label)) {
          Matter.Body.applyForce(ball, ball.position, {
            x: 0.01,
            y: 0,
          });

          // Reset stuck time and mark as nudged
          stuckStartTimes[ball.label] = now;
          nudgedBalls.add(ball.label);
        }
      }
    } else {
      delete stuckStartTimes[ball.label];
      nudgedBalls.delete(ball.label);
    }
  }
}
