/**
 * 추천 점수 계산을 위한 유틸리티 함수
 * 오행(五行) 속성 기반 추천 시스템
 */

// 오행 속성 타입 정의
type FiveElement = "수" | "화" | "목" | "금" | "토";

// 숫자의 일의 자리에 따른 오행 속성 매핑
const getElementByLastDigit = (number: number): FiveElement => {
  const lastDigit = number % 10;

  if (lastDigit === 1 || lastDigit === 6) return "수"; // Water
  if (lastDigit === 2 || lastDigit === 7) return "화"; // Fire
  if (lastDigit === 3 || lastDigit === 8) return "목"; // Wood
  if (lastDigit === 4 || lastDigit === 9) return "금"; // Metal
  return "토"; // Earth (0, 5)
};

// 각 속성에 해당하는 이모티콘
const elementEmojis: Record<FiveElement, string> = {
  수: "💧",
  화: "🔥",
  목: "🌳",
  금: "⚙️",
  토: "🌍",
};

/**
 * 추첨된 볼의 오행 속성 분포를 계산
 * @param drawnBalls 추첨된 볼 번호들의 배열
 * @returns 각 오행 속성의 개수
 */
export const calculateElementDistribution = (
  drawnBalls: string[]
): Record<FiveElement, number> => {
  const distribution: Record<FiveElement, number> = {
    수: 0,
    화: 0,
    목: 0,
    금: 0,
    토: 0,
  };

  drawnBalls.forEach((ball) => {
    const ballNumber = parseInt(ball, 10);
    const element = getElementByLastDigit(ballNumber);
    distribution[element]++;
  });

  return distribution;
};

/**
 * 오행 속성 분포에 따라 추천 점수를 계산
 * 목>화>=(수,금,토) 조건에 따라 점수 계산
 * @param drawnBalls 추첨된 볼 번호들의 배열
 * @returns 0-100 사이의 추천 점수
 */
export const calculateRecommendationScore = (drawnBalls: string[]): number => {
  const distribution = calculateElementDistribution(drawnBalls);

  // 목(Wood) > 화(Fire) >= (수(Water), 금(Metal), 토(Earth)) 조건 확인
  const wood = distribution["목"];
  const fire = distribution["화"];
  const water = distribution["수"];
  const metal = distribution["금"];
  const earth = distribution["토"];

  // 조건 검증
  const isWoodGreaterThanFire = wood > fire;
  const isFireGreaterOrEqualToOthers =
    fire >= water && fire >= metal && fire >= earth;

  // 두 조건이 모두 만족하면 높은 점수, 하나만 만족하면 중간 점수, 모두 만족하지 않으면 낮은 점수
  if (isWoodGreaterThanFire && isFireGreaterOrEqualToOthers) {
    // 얼마나 많이 목>화 조건이 충족되는지에 따라 점수 조정 (최대 100점)
    const woodFireDiff = wood - fire; // 목과 화의 차이
    return Math.min(100, 70 + woodFireDiff * 10);
  } else if (isWoodGreaterThanFire || isFireGreaterOrEqualToOthers) {
    // 하나의 조건만 만족하는 경우 (30~69점)
    if (isWoodGreaterThanFire) {
      return 30 + (wood - fire) * 5;
    } else {
      const minOthers = Math.min(water, metal, earth);
      return 30 + (fire - minOthers) * 5;
    }
  }

  // 조건 불만족 (0~29점)
  const maxElement = Math.max(wood, fire, water, metal, earth);
  return Math.min(29, maxElement * 5);
};

/**
 * 오행 속성 분포에 대한 설명을 반환
 * @param distribution 오행 속성 분포
 * @returns 분포 설명 문자열
 */
export const getElementDistributionText = (
  distribution: Record<FiveElement, number>
): string => {
  return Object.entries(distribution)
    .map(
      ([element, count]) =>
        `${element}${elementEmojis[element as FiveElement]}: ${count}개`
    )
    .join(" | ");
};

/**
 * 추천 점수에 따른 평가 등급과 메시지를 반환
 * @param score 추천 점수 (0-100)
 * @param distribution 오행 속성 분포
 * @returns 등급과 메시지가 포함된 객체
 */
export const getScoreRating = (
  score: number
): { rating: string; message: string } => {
  // 목(Wood) > 화(Fire) >= (수(Water), 금(Metal), 토(Earth)) 조건을 확인

  if (score >= 90) {
    return {
      rating: "S",
      message: "행운이 가득한 조합이에요! ✨✨✨",
    };
  } else if (score >= 70) {
    return {
      rating: "A",
      message: "긍정적인 기운이 느껴지는 조합이에요! ✨✨",
    };
  } else if (score >= 50) {
    return {
      rating: "B",
      message: "밝은 에너지가 담긴 조합이에요! ✨",
    };
  } else if (score >= 30) {
    return {
      rating: "C",
      message: "잔잔한 기운이 느껴지는 조합이에요.",
    };
  } else if (score >= 10) {
    return {
      rating: "D",
      message: "미묘한 파동이 있는 조합이에요.",
    };
  } else {
    return {
      rating: "F",
      message: "변화의 기운이 담긴 조합이에요.",
    };
  }
};
