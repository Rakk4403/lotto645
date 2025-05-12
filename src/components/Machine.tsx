import { useLotteryMachine } from "../hooks/useLotteryMachine";
import { BallPopup } from "./BallPopup";
import { BallResults } from "./BallResults";
import { RestartButton } from "./RestartButton";

export function Machine() {
  // 창 크기 계산
  const { innerWidth, innerHeight } = window;
  const width = Math.min(innerWidth, 1200);
  const height = Math.min(innerHeight, 800);

  // 로또 머신 훅 사용
  const {
    exitedBalls,
    showPopup,
    closePopup,
    restartGame,
    sceneRef,
    handleShake,
  } = useLotteryMachine(width, height);

  // 최대 6개 공만 표시
  const drawnBalls = [...exitedBalls.slice(0, 6)];

  return (
    <>
      {/* 추첨 결과 표시 */}
      <BallResults drawnBalls={drawnBalls} />

      {/* 다시 시작 버튼 */}
      <RestartButton onRestart={restartGame} show={exitedBalls.length >= 6} />

      {/* 물리 엔진 렌더링 영역 */}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div ref={sceneRef} />
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
