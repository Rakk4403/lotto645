import React from "react";

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
          {balls.slice(0, 6).map((ball, index) => (
            <div
              key={`popup-${ball}`}
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                backgroundColor: "#f2f2f2",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "24px",
                fontWeight: "bold",
                border: "3px solid #888",
                boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                animation: `popIn 0.5s ease-out ${index * 0.3}s both`,
              }}
            >
              {ball}
            </div>
          ))}
        </div>

        {balls.length > 6 && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "20px", marginRight: "10px" }}>
              보너스:
            </span>
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                backgroundColor: "#e8f4ff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "24px",
                fontWeight: "bold",
                border: "3px solid #2a7aef",
                boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                animation: "popIn 0.5s ease-out 2s both",
              }}
            >
              {balls[6]}
            </div>
          </div>
        )}

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
        `}
      </style>
    </div>
  );
};
