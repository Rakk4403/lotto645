import Matter from "matter-js";
import React from "react";
import { RecordMap } from "../types/RecordMap";

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
  nudgedBalls: Set<string>,
  ballReplayMap: React.RefObject<RecordMap>
) {
  const now = Date.now();
  for (const ball of ballBodiesRef.current) {
    if (!ball.position || ball.isStatic) continue;
    const isAtTop =
      ball.position.y < containerConfig.y - containerConfig.radius + 100;
    if (isAtTop) {
      if (!stuckStartTimes[ball.label]) {
        stuckStartTimes[ball.label] = now;
      } else {
        const duration = now - stuckStartTimes[ball.label];
        if (duration > 2000 && !nudgedBalls.has(ball.label)) {
          Matter.Body.applyForce(ball, ball.position, {
            x: 0.01,
            y: 0,
          });
          console.log(
            `${ball.label} 공이 너무 오랫동안 정지 상태입니다. 힘을 가합니다.`
          );

          // --- Capture replay path
          ballReplayMap.current[ball.label].push({
            x: ball.position.x,
            y: ball.position.y,
            time: now,
          });
          // ---
          // Mark as nudged
          stuckStartTimes[ball.label] = now; // Reset stuck time
          nudgedBalls.add(ball.label);
        }
      }
    } else {
      delete stuckStartTimes[ball.label];
      nudgedBalls.delete(ball.label);
    }
  }
}
