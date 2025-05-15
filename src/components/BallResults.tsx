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

  return (
    <div
      style={{
        position: "absolute",
        top: isMobile ? 30 : 60,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: isMobile ? "6px" : "10px",
        fontSize: isMobile ? "14px" : "18px",
        fontWeight: "bold",
        fontFamily: "monospace",
        zIndex: 12,
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
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
      </div>
    </div>
  );
};
