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
