import Matter from "matter-js";

// 바구니 센서 설정 함수
export function setupBasketSensor(
  config: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  engine: Matter.Engine
) {
  const basketX = config.x;
  const basketY = config.y + 20;

  // 바구니 센서 생성
  const basketSensor = Matter.Bodies.rectangle(
    basketX,
    basketY,
    config.width,
    config.height, // 바구니 높이
    {
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

  return { basketSensor };
}
