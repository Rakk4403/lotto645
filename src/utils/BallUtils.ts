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
  referenceHeight = 1200 // 데스크탑 환경 기준값도 1200x1200로 변경
): number => {
  // 기준 크기와 현재 화면 크기의 비율을 계산
  const widthRatio = width / referenceWidth;
  const heightRatio = height / referenceHeight; // 모바일 환경일 경우, 화면 비율을 유지하면서 적절히 조정
  if (width < 768) {
    // 너비와 높이 중 더 작은 비율 사용 (화면 비율 유지)
    // 가로 여백을 줄이되, 세로로 늘어나지 않도록 조정
    const scale = Math.min(widthRatio, heightRatio);

    // 화면 크기에 따라 다른 스케일 적용 (더 작은 화면에서는 더 큰 확대)
    if (width < 480) {
      return scale * 1.45; // 작은 모바일 화면에서 더 크게 확대 (1.35에서 1.45로)
    } else if (width < 600) {
      return scale * 1.35; // 중간 크기 모바일에 새로운 중간 스케일 추가
    }
    return scale * 1.3; // 일반 모바일 화면에서 확대율 증가 (1.25에서 1.3으로)
  }

  // 데스크탑 환경에서는 화면 크기에 따른 확대 적용
  const desktopScale = Math.min(widthRatio, heightRatio);

  // 화면 크기별로 차등 스케일 적용
  if (width > 1440) {
    return desktopScale * 1.15; // 대형 화면에서 15% 확대
  } else if (width > 1024) {
    return desktopScale * 1.2; // 중간 크기 화면에서 20% 확대
  }
  return desktopScale * 1.25; // 작은 데스크탑 화면에서 25% 확대
};
