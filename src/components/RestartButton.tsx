import React from "react";

interface RestartButtonProps {
  onRestart: () => void;
  show: boolean;
}

export const RestartButton: React.FC<RestartButtonProps> = ({
  onRestart,
  show,
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
      }}
    >
      <button
        onClick={onRestart}
        style={{
          padding: "12px 24px",
          fontSize: "18px",
          fontWeight: "bold",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          transition: "all 0.2s ease",
        }}
      >
        다시 추첨하기
      </button>
    </div>
  );
};
