import Matter from "matter-js";
import React from "react";
import { RecordMap } from "../types/RecordMap";

export function recordOnExit(
  ballBodiesRef: React.RefObject<Matter.Body[]>,
  ballReplayMap: React.RefObject<RecordMap>,
  containerConfig: {
    size: number;
    radius: number;
    x: number;
    y: number;
    ballRadius: number;
    ringThickness: number;
    innerWallRadius: number;
    spawnRadius: number;
  }
) {
  const now = Date.now();
  for (const ball of ballBodiesRef.current) {
    if (!ballReplayMap.current[ball.label]) {
      ballReplayMap.current[ball.label] = [];
    }
    const isNearExit =
      Math.abs(ball.position.x - containerConfig.x) < 80 &&
      Math.abs(ball.position.y - (containerConfig.y - containerConfig.radius)) <
        80;

    if (isNearExit) {
      ballReplayMap.current[ball.label].push({
        x: ball.position.x,
        y: ball.position.y,
        time: now,
      });
    }
  }
  return;
}
