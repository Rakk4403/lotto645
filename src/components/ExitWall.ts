import Matter from "matter-js";
import { Config } from "../const/Config";

// 출구 슬라이딩 벽 생성 함수
export function createExitWalls(
  cx: number,
  cy: number,
  radius: number
): Matter.Body[] {
  // 출구 위치 각도 (12시 5분 방향)
  const exitAngle = Config.EXIT_ANGLE;

  // 슬라이딩 도어의 크기 및 위치 계산
  const doorWidth = 40;
  const doorHeight = 20;
  const doorGap = 8; // 두 도어 사이 간격

  // 출구 위치 계산
  const exitX = cx + radius * Math.cos(exitAngle);
  const exitY = cy + radius * Math.sin(exitAngle);

  // 왼쪽 도어
  const leftDoorX = exitX - doorWidth / 2 - doorGap / 2;
  const leftDoorY = exitY;
  const leftDoor = Matter.Bodies.rectangle(
    leftDoorX,
    leftDoorY,
    doorWidth,
    doorHeight,
    {
      isStatic: true,
      render: {
        fillStyle: "#D3D3D3",
        strokeStyle: "#A9A9A9",
        lineWidth: 1,
      },
      label: "leftExitDoor",
      collisionFilter: { category: 0x0001, mask: 0x0001 },
    }
  );

  // 오른쪽 도어
  const rightDoorX = exitX + doorWidth / 2 + doorGap / 2;
  const rightDoorY = exitY;
  const rightDoor = Matter.Bodies.rectangle(
    rightDoorX,
    rightDoorY,
    doorWidth,
    doorHeight,
    {
      isStatic: true,
      render: {
        fillStyle: "#D3D3D3",
        strokeStyle: "#A9A9A9",
        lineWidth: 1,
      },
      label: "rightExitDoor",
      collisionFilter: { category: 0x0001, mask: 0x0001 },
    }
  );

  return [leftDoor, rightDoor];
}

// 출구 벽을 슬라이딩 방식으로 열기
export function openExitDoors(
  doors: Matter.Body[],
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const [leftDoor, rightDoor] = doors;
    const doorWidth = 40;
    const slideDistance = doorWidth + 5; // 충분히 열리도록 조금 더 이동

    const startTime = Date.now();

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // 이징 함수 적용 (부드러운 움직임)
      const easedProgress = easeOutQuad(progress);

      // 왼쪽은 왼쪽으로, 오른쪽은 오른쪽으로 미끄러지듯 이동
      const leftX = leftDoor.position.x - slideDistance * easedProgress;
      const rightX = rightDoor.position.x + slideDistance * easedProgress;

      Matter.Body.setPosition(leftDoor, { x: leftX, y: leftDoor.position.y });
      Matter.Body.setPosition(rightDoor, {
        x: rightX,
        y: rightDoor.position.y,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}

// 출구 벽을 슬라이딩 방식으로 닫기
export function closeExitDoors(
  doors: Matter.Body[],
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const [leftDoor, rightDoor] = doors;
    const doorWidth = 40;
    const slideDistance = doorWidth + 5;

    // 현재 위치 저장
    const leftStartX = leftDoor.position.x;
    const rightStartX = rightDoor.position.x;

    const startTime = Date.now();

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // 이징 함수 적용 (부드러운 움직임)
      const easedProgress = easeOutQuad(progress);

      // 원래 위치로 돌아오도록 이동
      const leftX = leftStartX + slideDistance * easedProgress;
      const rightX = rightStartX - slideDistance * easedProgress;

      Matter.Body.setPosition(leftDoor, { x: leftX, y: leftDoor.position.y });
      Matter.Body.setPosition(rightDoor, {
        x: rightX,
        y: rightDoor.position.y,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}

// 부드러운 움직임을 위한 이징 함수
function easeOutQuad(t: number): number {
  return t * (2 - t);
}
