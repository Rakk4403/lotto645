/**
 * 로또 결과 기록을 위한 유틸리티
 */

// 로또 기록 타입 정의
export interface LotteryRecord {
  id: string;
  date: string;
  numbers: string[];
}

const STORAGE_KEY = "lottery_records";

/**
 * 모든 로또 기록을 가져오는 함수
 */
export const getAllRecords = (): LotteryRecord[] => {
  try {
    const records = localStorage.getItem(STORAGE_KEY);
    return records ? JSON.parse(records) : [];
  } catch (error) {
    console.error("로또 기록을 불러오는데 실패했습니다:", error);
    return [];
  }
};

/**
 * 새로운 로또 기록을 저장하는 함수
 */
export const saveRecord = (numbers: string[]): void => {
  try {
    const records = getAllRecords();
    const newRecord: LotteryRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      numbers: numbers.sort((a, b) => parseInt(a) - parseInt(b)),
    };

    // 맨 앞에 추가 (최신 기록이 맨 위로)
    records.unshift(newRecord);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("로또 기록을 저장하는데 실패했습니다:", error);
  }
};

/**
 * 특정 로또 기록을 삭제하는 함수
 */
export const deleteRecord = (recordId: string): void => {
  try {
    const records = getAllRecords();
    const updatedRecords = records.filter((record) => record.id !== recordId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error("로또 기록을 삭제하는데 실패했습니다:", error);
  }
};

/**
 * 날짜를 포맷팅하는 함수
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};
