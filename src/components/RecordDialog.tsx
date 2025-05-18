import React, { useState, useEffect, useRef } from "react";
import {
  getAllRecords,
  deleteRecord,
  formatDate,
  LotteryRecord,
} from "../utils/RecordStorage";
import { getBallColorWithBorder } from "../utils/BallUtils";
import {
  getScoreRating,
  calculateRecommendationScore,
} from "../utils/RecommendationScore";

interface RecordDialogProps {
  show: boolean;
  onClose: () => void;
}

export const RecordDialog: React.FC<RecordDialogProps> = ({
  show,
  onClose,
}) => {
  const [records, setRecords] = useState<LotteryRecord[]>([]);
  const [hoverRecordId, setHoverRecordId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // 기록 로드
  useEffect(() => {
    if (show) {
      setRecords(getAllRecords());
    }
  }, [show]);

  // 마우스 위치 추적
  useEffect(() => {
    if (!show) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [show]);

  // 기록이 없으면 표시하지 않음
  if (!show) return null;

  // 기록 삭제 처리
  const handleDelete = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentMousePos = mousePosition;
    deleteRecord(recordId);
    setRecords(getAllRecords());

    // 삭제 후 마우스 위치 유지
    if (currentMousePos) {
      setTimeout(() => {
        // DOM이 업데이트된 후 마우스 위치에 있는 요소 찾기
        if (containerRef.current) {
          const recordItems =
            containerRef.current.querySelectorAll("[data-record-id]");
          recordItems.forEach((item) => {
            const rect = item.getBoundingClientRect();
            if (
              currentMousePos.x >= rect.left &&
              currentMousePos.x <= rect.right &&
              currentMousePos.y >= rect.top &&
              currentMousePos.y <= rect.bottom
            ) {
              const newRecordId = item.getAttribute("data-record-id");
              if (newRecordId) {
                setHoverRecordId(newRecordId);
              }
            }
          });
        }
      }, 10);
    }
  };

  const isMobile = window.innerWidth < 768;

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
          maxWidth: isMobile ? "90%" : "80%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          width: isMobile ? "95%" : "700px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: isMobile ? "22px" : "28px",
          }}
        >
          📋 로또 추첨 기록
        </h2>

        {records.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            저장된 기록이 없습니다.
          </div>
        ) : (
          <div style={{ marginTop: "20px" }} ref={containerRef}>
            {records.map((record) => {
              const score = calculateRecommendationScore(record.numbers);
              const { rating } = getScoreRating(score);

              return (
                <div
                  key={record.id}
                  data-record-id={record.id}
                  style={{
                    padding: "15px",
                    borderRadius: "10px",
                    marginBottom: "15px",
                    border: "1px solid #eee",
                    position: "relative",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    backgroundColor:
                      hoverRecordId === record.id ? "#f9f9f9" : "white",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={() => setHoverRecordId(record.id)}
                  onMouseLeave={() => setHoverRecordId(null)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: isMobile ? "14px" : "16px",
                        color: "#666",
                        marginRight: "10px",
                      }}
                    >
                      {formatDate(record.date)}
                    </div>
                    <div
                      style={{
                        backgroundColor:
                          rating === "S"
                            ? "#FFD700"
                            : rating === "A"
                            ? "#62D2A2"
                            : rating === "B"
                            ? "#9ED9CC"
                            : rating === "C"
                            ? "#B8C0FF"
                            : rating === "D"
                            ? "#FFB6B9"
                            : "#D3D3D3",
                        padding: "3px 8px",
                        borderRadius: "10px",
                        fontSize: isMobile ? "12px" : "14px",
                        fontWeight: "bold",
                        color: rating === "S" ? "#7B5800" : "#333",
                        marginLeft: "5px",
                      }}
                    >
                      {rating}등급
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    {record.numbers.map((number) => {
                      const ballColor = getBallColorWithBorder(number);
                      return (
                        <div
                          key={`${record.id}-${number}`}
                          style={{
                            width: isMobile ? "36px" : "45px",
                            height: isMobile ? "36px" : "45px",
                            borderRadius: "50%",
                            backgroundColor: ballColor.backgroundColor,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: isMobile ? "14px" : "18px",
                            fontWeight: "bold",
                            color: "white",
                            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                            border: `2px solid ${ballColor.borderColor}`,
                          }}
                        >
                          {number}
                        </div>
                      );
                    })}
                  </div>

                  {/* 번호 복사 버튼 */}
                  <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const numbersText = record.numbers.join(", ");
                        navigator.clipboard
                          .writeText(numbersText)
                          .then(() => {
                            alert(
                              "번호가 클립보드에 복사되었습니다: " + numbersText
                            );
                          })
                          .catch((error) => {
                            console.error("클립보드 복사 실패:", error);
                            alert(
                              "번호 복사에 실패했습니다. 다시 시도해주세요."
                            );
                          });
                      }}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#6c5ce7",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        fontSize: isMobile ? "12px" : "14px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.9,
                        transition: "all 0.2s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.opacity = "0.9";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      📋 번호 복사
                    </button>
                  </div>

                  {/* 삭제 버튼 (호버 시에만 표시) */}
                  {hoverRecordId === record.id && (
                    <button
                      onClick={(e) => handleDelete(record.id, e)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "#ff5555",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        opacity: 0.8,
                        transition: "opacity 0.2s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.opacity = "0.8";
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
