import React from "react";
import { getBallColor } from "../utils/BallUtils";

interface BallResultsProps {
  drawnBalls: string[];
}

export const BallResults: React.FC<BallResultsProps> = ({ drawnBalls }) => {
  // 정렬된 볼 (오름차순)
  const sortedBalls = [...drawnBalls].sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: "10px",
        fontSize: "18px",
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
              margin: "0 4px",
              padding: "4px 8px",
              borderRadius: "50%",
              backgroundColor: getBallColor(label),
              color: "white",
              textShadow: "1px 1px 1px rgba(0,0,0,0.5)",
              width: "24px",
              height: "24px",
              lineHeight: "24px",
              textAlign: "center",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
