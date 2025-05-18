import React from "react";

interface RecordButtonProps {
  onClick: () => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ onClick }) => {
  const isMobile = window.innerWidth < 768;

  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        top: isMobile ? "10px" : "20px",
        right: isMobile ? "10px" : "20px",
        padding: isMobile ? "6px 12px" : "8px 16px",
        borderRadius: "8px",
        backgroundColor: "#6200ea",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontSize: isMobile ? "14px" : "16px",
        zIndex: 15,
        display: "flex",
        alignItems: "center",
        gap: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      <span style={{ fontSize: isMobile ? "14px" : "16px" }}>📋</span>
      기록보기
    </button>
  );
};
