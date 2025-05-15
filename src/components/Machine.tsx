import { useState, useEffect } from "react";
import { useLotteryMachine } from "../hooks/useLotteryMachine";
import { BallPopup } from "./BallPopup";
import { BallResults } from "./BallResults";
import { RestartButton } from "./RestartButton";
import { getRenderScale } from "../utils/BallUtils";

const DEFAULT_WIDTH = 800; // 1200에서 900으로 기본 너비 감소 (가로 여백 감소 목적)
const DEFAULT_HEIGHT = 800;

export function Machine() {
  // 창 크기 상태 관리
  const [dimensions, setDimensions] = useState({
    width: Math.min(window.innerWidth, DEFAULT_WIDTH),
    height: Math.min(window.innerHeight, DEFAULT_HEIGHT),
  });

  // 모바일 환경 감지
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 렌더링 스케일 계산
  const renderScale = getRenderScale(dimensions.width, dimensions.height);

  // 창 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      const newWidth = Math.min(window.innerWidth, DEFAULT_WIDTH);
      const newHeight = Math.min(window.innerHeight, DEFAULT_HEIGHT);

      setDimensions({
        width: newWidth,
        height: newHeight,
      });
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 로또 머신 훅 사용 (물리 엔진 차원에서의 크기는 고정)
  const {
    exitedBalls,
    showPopup,
    closePopup,
    restartGame,
    sceneRef,
    handleShake,
  } = useLotteryMachine(DEFAULT_WIDTH, DEFAULT_HEIGHT); // 물리 계산은 항상 고정 사이즈로

  // 최대 6개 공만 표시
  const drawnBalls = [...exitedBalls.slice(0, 6)];

  return (
    <>
      {/* 추첨 결과 표시 */}
      <BallResults drawnBalls={drawnBalls} />

      {/* 다시 시작 버튼 */}
      <RestartButton onRestart={restartGame} show={exitedBalls.length >= 6} />

      {/* 물리 엔진 렌더링 영역 - 시각적 스케일링만 적용 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          padding: "0", // 모든 환경에서 패딩 제거
        }}
      >
        <div
          style={{
            width: isMobile
              ? `${Math.min(
                  window.innerWidth * 0.98,
                  window.innerHeight * 0.95
                )}px` // 모바일: 화면을 최대한 채우기
              : `${DEFAULT_WIDTH * renderScale}px`,
            height: isMobile
              ? `${Math.min(
                  window.innerWidth * 0.98,
                  window.innerHeight * 0.95
                )}px` // 정사각형 비율 유지
              : `${DEFAULT_HEIGHT * renderScale}px`,
            position: "relative",
            maxWidth: "100%", // 최대 너비 제한 추가
            transform: isMobile ? "scale(1.05)" : "none", // 모바일에서 약간 더 확대 (여백 최소화)
            transformOrigin: "center center",
          }}
        >
          <div
            ref={sceneRef}
            style={{
              width: "100%",
              height: "100%",
              transformOrigin: "center center" /* 원점을 중앙으로 설정 */,
            }}
          />
        </div>
      </div>

      {/* 공 추첨 완료 팝업 */}
      <BallPopup balls={drawnBalls} show={showPopup} onClose={closePopup} />

      {/* 흔들기 버튼 (모바일용) */}
      <div
        style={{
          position: "absolute",
          bottom: isMobile
            ? exitedBalls.length >= 6
              ? "45px"
              : "5px"
            : exitedBalls.length >= 6
            ? "80px"
            : "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 15,
        }}
      >
        <button
          onClick={handleShake}
          style={{
            padding: isMobile ? "10px 20px" : "10px 20px",
            fontSize: isMobile ? "16px" : "16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          흔들기 (Space)
        </button>
      </div>
    </>
  );
}
