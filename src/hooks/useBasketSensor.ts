import Matter from "matter-js";
import { useRef } from "react";

/**
 * 바구니 센서의 이벤트와 상태를 관리하는 훅
 * 센서 객체 자체는 생성하지 않고, 외부에서 생성된 센서 객체를 받아서 관리합니다.
 */
export function useBasketSensor(sensor: Matter.Body | null) {
  // 처리된 공 추적을 위한 Set
  const processedBallsRef = useRef<Set<string>>(new Set());

  /**
   * 특정 충돌 이벤트에서 바구니 센서와 공의 충돌을 감지하고 처리하는 함수
   * @param event 충돌 이벤트
   * @param onBallInBasket 바구니에 공이 들어왔을 때 실행할 콜백 함수
   * @returns 처리 여부
   */
  const handleCollision = (
    event: Matter.IEventCollision<Matter.Engine>,
    onBallInBasket: (ballBody: Matter.Body) => void
  ) => {
    // 센서가 없으면 처리 불가
    if (!sensor) return false;

    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair;

      // 센서 객체를 ID와 label로 식별 (더 안정적인 방식)
      const sensorBody =
        bodyA.id === sensor.id || bodyA.label === "basketSensor"
          ? bodyA
          : bodyB.id === sensor.id || bodyB.label === "basketSensor"
          ? bodyB
          : null;

      // 센서가 감지되면 충돌한 다른 물체를 공으로 간주
      const ballBody = sensorBody
        ? sensorBody === bodyA
          ? bodyB
          : bodyA
        : null;

      if (sensorBody && ballBody && !ballBody.isStatic) {
        // 이미 처리된 공인지 확인
        if (processedBallsRef.current.has(ballBody.label)) {
          continue;
        }

        // 공이 바구니에 들어왔을 때만 처리 (위에서 아래로 떨어지는 방향)
        if (ballBody.velocity.y > 0) {
          console.log(`${ballBody.label} 공이 바구니에 들어왔습니다.`);

          // 공을 처리된 것으로 표시
          processedBallsRef.current.add(ballBody.label);

          // 공을 선택된 목록에 추가
          onBallInBasket(ballBody);
          return true;
        }
      }
    }

    return false;
  };

  // 이벤트 핸들러와 상태 관리 기능만 반환
  return {
    processedBalls: processedBallsRef.current,
    handleCollision,
    reset: () => {
      processedBallsRef.current.clear();
    },
  };
}
