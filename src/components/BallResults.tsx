import React from "react";
import { getBallColor } from "../utils/BallUtils";

interface BallResultsProps {
  drawnBalls: string[];
}

export const BallResults: React.FC<BallResultsProps> = ({ drawnBalls }) => {
  // 정렬된 볼 (오름차순)
  const sortedBalls = [...drawnBalls].sort((a, b) => parseInt(a) - parseInt(b));

  // 화면 너비에 따라 스타일 조정
  const isMobile = window.innerWidth < 768;

  // 번호 복사 함수
  const copyNumbersToClipboard = () => {
    const numbersText = sortedBalls.join(", ");
    navigator.clipboard
      .writeText(numbersText)
      .then(() => {
        alert("번호가 클립보드에 복사되었습니다: " + numbersText);
      })
      .catch((error) => {
        console.error("클립보드 복사 실패:", error);
        alert("번호 복사에 실패했습니다. 다시 시도해주세요.");
      });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: isMobile ? 10 : 20, // 모바일과 데스크탑 모두 상단 위치 조정
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: isMobile ? "3px" : "10px",
        fontSize: isMobile ? "11px" : "18px",
        fontWeight: "bold",
        fontFamily: "monospace",
        zIndex: 12,
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        maxWidth: isMobile ? "95%" : "auto",
      }}
    >
      <div>
        🎱 번호 추첨 결과:&nbsp;
        {sortedBalls.map((label) => (
          <span
            key={label}
            style={{
              display: "inline-block",
              margin: window.innerWidth < 768 ? "0 2px" : "0 4px",
              padding: window.innerWidth < 768 ? "2px 6px" : "4px 8px",
              borderRadius: "50%",
              backgroundColor: getBallColor(label),
              color: "white",
              textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
              width: window.innerWidth < 768 ? "20px" : "24px",
              height: window.innerWidth < 768 ? "20px" : "24px",
              lineHeight: window.innerWidth < 768 ? "20px" : "24px",
              textAlign: "center",
              fontSize: window.innerWidth < 768 ? "12px" : "inherit",
            }}
          >
            {label}
          </span>
        ))}
        <button
          onClick={copyNumbersToClipboard}
          style={{
            marginLeft: "8px",
            padding: isMobile ? "2px 5px" : "3px 8px",
            backgroundColor: "#6c5ce7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: isMobile ? "10px" : "14px",
            cursor: "pointer",
            verticalAlign: "middle",
            opacity: 0.9,
            display: "inline-flex",
            alignItems: "center",
          }}
          title="번호 복사하기"
        >
          📋
        </button>
      </div>
    </div>
  );
};
