import { useState, useEffect } from "react";
import { useLotteryMachine } from "../hooks/useLotteryMachine";
import { BallPopup } from "./BallPopup";
import { BallResults } from "./BallResults";
import { RestartButton } from "./RestartButton";
import { RecordButton } from "./RecordButton";
import { RecordDialog } from "./RecordDialog";
// import { getRenderScale } from "../utils/BallUtils";

// 우주 메시지를 위한 폰트 스타일 정의
const cosmicMessageStyle = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500&family=Quicksand:wght@300;400;500&display=swap');

@keyframes cosmicPulse {
  0% {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 0 20px rgba(123, 31, 162, 0.3);
  }
  100% {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), 0 0 30px rgba(33, 150, 243, 0.6);
  }
}
`;

// 스타일 요소 생성 및 삽입
const styleElement = document.createElement("style");
styleElement.innerHTML = cosmicMessageStyle;
document.head.appendChild(styleElement);

// 콘솔 모니터링용 로그
console.log("Cosmic message font and animation loaded");

const DEFAULT_WIDTH = 1200; // 데스크탑 환경에서 더 크게 보이도록 1200으로 조정
const DEFAULT_HEIGHT = 1200;

export function Machine() {
  // 모바일 환경 감지
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // 기록 대화상자 표시 상태 관리
  const [showRecordDialog, setShowRecordDialog] = useState(false);

  // 창 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
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
      {/* 다시 시작 버튼 */}
      <RestartButton onRestart={restartGame} show={exitedBalls.length >= 6} />

      {/* 기록 보기 버튼 */}
      <RecordButton onClick={() => setShowRecordDialog(true)} />

      {/* 우주의 기운을 담은 메시지 */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? "5%" : "7%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          width: isMobile ? "90%" : "80%",
          maxWidth: "800px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Quicksand', 'Noto Sans KR', sans-serif",
            fontSize: isMobile ? "16px" : "20px",
            fontWeight: 400,
            color: "#fff",
            background:
              "linear-gradient(135deg, rgba(33, 150, 243, 0.8), rgba(156, 39, 176, 0.8))",
            padding: isMobile ? "10px 15px" : "12px 20px",
            borderRadius: "20px",
            boxShadow:
              "0 4px 15px rgba(0, 0, 0, 0.2), 0 0 20px rgba(123, 31, 162, 0.5)",
            backdropFilter: "blur(5px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
            animation: "cosmicPulse 3s infinite alternate ease-in-out",
          }}
        >
          ✨ 우주의 별빛과 행운의 기운을 담아 당신만을 위한 번호를 선물합니다 ✨
        </div>
      </div>

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
          padding: isMobile ? "0" : "40px 0 0 0", // 데스크탑에서 상단 여백 추가
          margin: "0 auto", // 가로 방향 자동 마진으로 중앙 정렬 강화
        }}
      >
        {/* 추첨 결과 표시 */}
        <BallResults drawnBalls={drawnBalls} />
        <div
          style={{
            width: isMobile
              ? `${Math.min(
                  window.innerWidth * 0.99, // 0.98에서 0.99로 여백 더 감소
                  window.innerHeight * 0.98 // 0.95에서 0.98로 여백 더 감소
                )}px` // 모바일: 화면을 최대한 채우기
              : `${Math.min(
                  window.innerWidth * 0.8, // 0.85에서 0.9로 여백 감소
                  window.innerHeight * 0.8, // 0.85에서 0.9로 여백 감소
                  1300 // 1200에서 1300으로 최대 크기 증가
                )}px`, // 데스크탑: 최대 1300px까지 제한
            height: isMobile
              ? `${Math.min(
                  window.innerWidth * 0.99, // 0.98에서 0.99로 여백 더 감소
                  window.innerHeight * 0.98 // 0.95에서 0.98로 여백 더 감소
                )}px` // 정사각형 비율 유지
              : `${Math.min(
                  window.innerWidth * 0.8, // 0.85에서 0.9로 여백 감소
                  window.innerHeight * 0.8, // 0.85에서 0.9로 여백 감소
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
            margin: "0 auto", // 수평 중앙 정렬을 확실하게
          }}
        >
          <div
            ref={sceneRef}
            style={{
              width: "100%",
              height: "100%",
              transformOrigin: "center center" /* 원점을 중앙으로 설정 */,
              position: "absolute",
              top: isMobile ? "50%" : "53%", // 데스크탑에서 약간 아래로 이동하여 상단이 짤리지 않도록
              left: "50%",
              transform: isMobile
                ? "translate(-50%, -50%)"
                : "translate(-50%, -53%)" /* 데스크탑에서 위치 조정 */,
            }}
          />
        </div>
      </div>

      {/* 공 추첨 완료 팝업 */}
      <BallPopup balls={drawnBalls} show={showPopup} onClose={closePopup} />

      {/* 기록 조회 대화상자 */}
      <RecordDialog
        show={showRecordDialog}
        onClose={() => setShowRecordDialog(false)}
      />

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
