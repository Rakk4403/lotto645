import Matter from "matter-js";

// 바구니 센서 설정을 위한 인터페이스 정의
export interface BasketSensorConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 바구니 센서 생성 함수 - 센서 역할만 담당하도록 수정
export function createBasketSensor(
  config: BasketSensorConfig,
  engine: Matter.Engine
): Matter.Body {
  const basketX = config.x;
  const basketY = config.y + 20;

  // 바구니 센서 생성 - 감지 역할만 함
  const basketSensor = Matter.Bodies.rectangle(
    basketX,
    basketY,
    config.width,
    config.height, // 바구니 높이
    {
      id: 999, // 고정 ID 사용 (무작위 ID 대신)
      label: "basketSensor",
      isSensor: true,
      isStatic: true,
      render: {
        fillStyle: "rgba(0,255,0,0.2)", // 녹색으로 변경
      },
      collisionFilter: {
        category: 0x0002,
        mask: 0x0001, // 공하고만 감지
      },
    }
  );

  Matter.Composite.add(engine.world, basketSensor);

  return basketSensor;
}
