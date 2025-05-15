import { useState, useEffect } from "react";
import { useLotteryMachine } from "../hooks/useLotteryMachine";
import { BallPopup } from "./BallPopup";
import { BallResults } from "./BallResults";
import { RestartButton } from "./RestartButton";
import { getRenderScale } from "../utils/BallUtils";

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;

export function Machine() {
  // 창 크기 상태 관리
  const [dimensions, setDimensions] = useState({
    width: Math.min(window.innerWidth, DEFAULT_WIDTH),
    height: Math.min(window.innerHeight, DEFAULT_HEIGHT),
  });

  // 렌더링 스케일 계산
  const renderScale = getRenderScale(dimensions.width, dimensions.height);

  // 창 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: Math.min(window.innerWidth, DEFAULT_WIDTH),
        height: Math.min(window.innerHeight, DEFAULT_HEIGHT),
      });
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
        }}
      >
        <div
          style={{
            width: `${DEFAULT_WIDTH * renderScale}px` /* 렌더링 스케일 적용 */,
            height: `${
              DEFAULT_HEIGHT * renderScale
            }px` /* 렌더링 스케일 적용 */,
            position: "relative",
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
          bottom: exitedBalls.length >= 6 ? "80px" : "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 15,
        }}
      >
        <button
          onClick={handleShake}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
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
