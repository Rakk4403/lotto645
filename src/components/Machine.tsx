import { useState, useEffect } from "react";
import { useLotteryMachine } from "../hooks/useLotteryMachine";
import { BallPopup } from "./BallPopup";
import { BallResults } from "./BallResults";
import { RestartButton } from "./RestartButton";
import { getRenderScale } from "../utils/BallUtils";

const DEFAULT_WIDTH = 1200; // 데스크탑 환경에서 더 크게 보이도록 1200으로 조정
const DEFAULT_HEIGHT = 1200;

export function Machine() {
  // 창 크기 상태 관리
  const [dimensions, setDimensions] = useState({
    width: Math.min(window.innerWidth, DEFAULT_WIDTH),
    height: Math.min(window.innerHeight, DEFAULT_HEIGHT),
  });

  // 모바일 환경 감지
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 렌더링 스케일 계산 (물리 엔진 사용을 위해 필요)
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
                  window.innerWidth * 0.99, // 0.98에서 0.99로 여백 더 감소
                  window.innerHeight * 0.98 // 0.95에서 0.98로 여백 더 감소
                )}px` // 모바일: 화면을 최대한 채우기
              : `${Math.min(
                  window.innerWidth * 0.9, // 0.85에서 0.9로 여백 감소
                  window.innerHeight * 0.9, // 0.85에서 0.9로 여백 감소
                  1300 // 1200에서 1300으로 최대 크기 증가
                )}px`, // 데스크탑: 최대 1300px까지 제한
            height: isMobile
              ? `${Math.min(
                  window.innerWidth * 0.99, // 0.98에서 0.99로 여백 더 감소
                  window.innerHeight * 0.98 // 0.95에서 0.98로 여백 더 감소
                )}px` // 정사각형 비율 유지
              : `${Math.min(
                  window.innerWidth * 0.9, // 0.85에서 0.9로 여백 감소
                  window.innerHeight * 0.9, // 0.85에서 0.9로 여백 감소
                  1300 // 1200에서 1300으로 최대 크기 증가
                )}px`, // 데스크탑: 최대 1300px까지 제한
            position: "relative",
            maxWidth: "100%", // 최대 너비 제한 추가
            transform: isMobile
              ? window.innerWidth < 480
                ? "scale(1.1)" // 모바일: 1.05에서 1.1로 스케일 증가
                : "scale(1.08)" // 큰 모바일: 새로운 중간 스케일 추가
              : "scale(1.08)", // 데스크탑: 1.05에서 1.08로 스케일 증가
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
