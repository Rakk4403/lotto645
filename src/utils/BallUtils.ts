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

  // 모바일 환경일 경우, 화면 비율을 유지하면서 적절히 조정
  if (width < 768) {
    // 너비와 높이 중 더 작은 비율 사용 (화면 비율 유지)
    // 가로 여백을 줄이되, 세로로 늘어나지 않도록 조정
    const scale = Math.min(widthRatio, heightRatio);

    // 화면 크기에 따라 다른 스케일 적용 (더 작은 화면에서는 더 큰 확대)
    if (width < 480) {
      return scale * 1.35; // 작은 모바일 화면에서 더 크게 확대
    }
    return scale * 1.25; // 일반 모바일 화면에서는 중간 정도 확대
  }

  // 일반 환경에서는 기존 방식대로 더 작은 비율을 렌더링 스케일로 사용
  return Math.min(widthRatio, heightRatio);
};
