import React from "react";
import {
  calculateRecommendationScore,
  getScoreRating,
} from "../utils/RecommendationScore";
import { getBallColorWithBorder } from "../utils/BallUtils";

interface BallPopupProps {
  balls: string[];
  show: boolean;
  onClose: () => void;
}

/**
 * 뽑힌 공을 팝업으로 보여주는 컴포넌트
 */
export const BallPopup: React.FC<BallPopupProps> = ({
  balls,
  show,
  onClose,
}) => {
  if (!show) return null;

  // 공 정렬 (숫자 기준 오름차순)
  const sortedBalls = [...balls].sort((a, b) => parseInt(a) - parseInt(b));

  // 추천 점수 계산
  const score = calculateRecommendationScore(sortedBalls);
  const { rating, message } = getScoreRating(score);

  // 점수에 따른 배경색 설정
  const getScoreBackgroundColor = (score: number) => {
    if (score >= 90) return "#FFD700"; // 금색
    if (score >= 70) return "#62D2A2"; // 녹색 계열
    if (score >= 50) return "#9ED9CC"; // 청록색 계열
    if (score >= 30) return "#B8C0FF"; // 옅은 보라색
    if (score >= 10) return "#FFB6B9"; // 옅은 분홍색
    return "#D3D3D3"; // 회색
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)", // 투명도를 0.7에서 0.5로 줄임
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 90, // 90으로 낮춰서 RecordDialog(100)보다 뒤에 표시
        pointerEvents: "auto", // 클릭 이벤트 처리
      }}
      onClick={(e) => {
        // 클릭 이벤트가 팝업 외부에서 발생한 경우만 닫기
        if (e.target === e.currentTarget) {
          onClose();
        }
        // 이벤트 버블링 중지하지 않음 - 다른 요소들도 클릭할 수 있음
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          textAlign: "center",
          maxWidth: "90%",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지
      >
        <h2 style={{ marginBottom: "30px", fontSize: "28px" }}>
          🎉 추첨 결과 🎉
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          {sortedBalls.map((ball, index) => {
            const ballColor = getBallColorWithBorder(ball);
            return (
              <div
                key={`popup-${ball}`}
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  backgroundColor: ballColor.backgroundColor,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "24px",
                  fontWeight: "bold",
                  border: `3px solid ${ballColor.borderColor}`,
                  boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                  animation: `popIn 0.5s ease-out ${index * 0.3}s both`,
                  color: "#FFFFFF",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  position: "relative",
                }}
              >
                {ball}
              </div>
            );
          })}
        </div>
        {/* 추천 점수 표시 영역 */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "10px",
            backgroundColor: getScoreBackgroundColor(score),
            animation: "fadeIn 1s ease-out 2.5s both",
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", fontSize: "22px" }}>
            추천 점수: {score} / 100 ({rating}등급)
          </h3>
          <p style={{ margin: "0", fontSize: "18px", fontWeight: "500" }}>
            {message}
          </p>
        </div>

        <p style={{ marginTop: "30px", fontSize: "18px", color: "#555" }}>
          화면을 클릭하면 닫힙니다
        </p>
      </div>
      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};
