/**
 * 공 번호에 따라 색상을 생성하는 함수
 */
export const getBallColor = (ballNumber: string) => {
  const number = parseInt(ballNumber, 10);
  const hue = (number * 8) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * 공 번호에 따라 색상과 테두리 색상을 반환
 */
export const getBallColorWithBorder = (ballNumber: string) => {
  const number = parseInt(ballNumber, 10);
  const hue = (number * 8) % 360;
  return {
    backgroundColor: `hsl(${hue}, 70%, 50%)`,
    borderColor: `hsl(${hue}, 80%, 30%)`,
  };
};

/**
 * 화면 크기에 따른 렌더링 비율 계산
 * 물리 엔진은 그대로 두고 시각적 표현만 조정
 */
export const getRenderScale = (
  width: number,
  height: number,
  referenceWidth = 1200,
  referenceHeight = 800
): number => {
  // 기준 크기와 현재 화면 크기의 비율을 계산
  const widthRatio = width / referenceWidth;
  const heightRatio = height / referenceHeight;

  // 더 작은 비율을 렌더링 스케일로 사용
  return Math.min(widthRatio, heightRatio);
};
