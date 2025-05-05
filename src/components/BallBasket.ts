import Matter from "matter-js";

/**
 * 출구 아래 바구니 형태를 구성합니다.
 */
export function createBasket(
  x: number,
  y: number,
  width: number = 100,
  height: number = 60
): Matter.Body[] {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const wallThickness = 10;

  const bottom = Matter.Bodies.rectangle(
    x,
    y + halfHeight,
    width,
    wallThickness,
    {
      isStatic: true,
      label: "basket-bottom",
    }
  );

  const left = Matter.Bodies.rectangle(
    x - halfWidth,
    y,
    wallThickness,
    height,
    {
      isStatic: true,
      label: "basket-left",
    }
  );

  const right = Matter.Bodies.rectangle(
    x + halfWidth,
    y,
    wallThickness,
    height,
    {
      isStatic: true,
      label: "basket-right",
    }
  );

  return [bottom, left, right];
}
