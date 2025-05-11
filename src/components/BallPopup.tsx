import React from "react";
import {
  calculateRecommendationScore,
  getScoreRating,
  calculateElementDistribution,
} from "../utils/RecommendationScore";

interface BallPopupProps {
  balls: string[];
  show: boolean;
  onClose: () => void;
}

/**
 * 공 번호에 따라 색상을 생성하는 함수
 */
const getBallColor = (ballNumber: string) => {
  const number = parseInt(ballNumber, 10);
  const hue = (number * 8) % 360;
  return {
    backgroundColor: `hsl(${hue}, 70%, 50%)`,
    borderColor: `hsl(${hue}, 80%, 30%)`,
  };
};

/**
 * 일의 자리 숫자에 따라 오행 속성을 반환하는 함수
 */
const getElementByNumber = (ballNumber: string): string => {
  const number = parseInt(ballNumber, 10);
  const lastDigit = number % 10;

  if (lastDigit === 1 || lastDigit === 6) return "수(水)";
  if (lastDigit === 2 || lastDigit === 7) return "화(火)";
  if (lastDigit === 3 || lastDigit === 8) return "목(木)";
  if (lastDigit === 4 || lastDigit === 9) return "금(金)";
  return "토(土)";
};

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

  // 오행 속성 분포 계산
  const elementDistribution = calculateElementDistribution(sortedBalls);

  // 추천 점수 계산
  const score = calculateRecommendationScore(sortedBalls);
  const { rating, message } = getScoreRating(score, elementDistribution);

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
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
      }}
      onClick={onClose}
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
            const ballColor = getBallColor(ball);
            const element = getElementByNumber(ball);
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
                <span
                  style={{
                    position: "absolute",
                    bottom: "-20px",
                    fontSize: "12px",
                    fontWeight: "normal",
                    color: "#333",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    padding: "1px 4px",
                    borderRadius: "4px",
                  }}
                >
                  {element}
                </span>
              </div>
            );
          })}
        </div>

        {/* 오행 분포 표시 영역 */}
        <div
          style={{
            marginTop: "40px",
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: "#f0f0f0",
            animation: "fadeIn 1s ease-out 2.2s both",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "100%",
              marginBottom: "10px",
              fontWeight: "bold",
              textAlign: "left",
            }}
          >
            🔮 오행(五行) 분포
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                backgroundColor: "#E3F2FD",
                fontWeight: elementDistribution["수"] > 0 ? "bold" : "normal",
              }}
            >
              수(水) 💧: {elementDistribution["수"]}개
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                backgroundColor: "#FFEBEE",
                fontWeight: elementDistribution["화"] > 0 ? "bold" : "normal",
              }}
            >
              화(火) 🔥: {elementDistribution["화"]}개
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                backgroundColor: "#E8F5E9",
                fontWeight: elementDistribution["목"] > 0 ? "bold" : "normal",
              }}
            >
              목(木) 🌳: {elementDistribution["목"]}개
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                backgroundColor: "#FFFDE7",
                fontWeight: elementDistribution["금"] > 0 ? "bold" : "normal",
              }}
            >
              금(金) ⚙️: {elementDistribution["금"]}개
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: "5px",
                backgroundColor: "#EFEBE9",
                fontWeight: elementDistribution["토"] > 0 ? "bold" : "normal",
              }}
            >
              토(土) 🌍: {elementDistribution["토"]}개
            </span>
          </div>
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
          <div style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
            * 조건: 목(木) &gt; 화(火) &gt;= (수(水), 금(金), 토(土))
          </div>
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
