const stages = {};

export const moneyBase = 5000; // 처음 유저에게 제공할 돈

export const createStages = (accountId) => {
  stages[accountId] = {
    level: 0,
    money: moneyBase,
    score: 0,
  };
};

// 유저 스테이지 정보 받아오기
export const getStages = (accountId) => {
  return stages[accountId];
};

// 돈 추가
export const addMoney = (accountId, money) => {
  stages[accountId].money += money;
};

// 돈 사용
export const useMoney = (accountId, money) => {
  if (money > stages[accountId].money) return;
  stages[accountId].money -= money;
};

// 점수 추가
export const addScore = (accountId, score) => {
  stages[accountId].score += score;
};

// 몬스터 레벨 변경
export const setLevel = (accountId, level) => {
  stages[accountId].level = level;
};

// 스테이지 정보 초기화
export const clearStage = (accountId) => {
  stages[accountId] = {
    level: 0,
    money: moneyBase,
    score: 0,
  };
};
