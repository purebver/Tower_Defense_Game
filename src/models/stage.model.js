const stages = {};

export const createStages = (accountId) => {
  stages[accountId] = {
    level: 0,
    money: 0, // 처음 돈은 어떻게 결정할 예정?
    score: 0,
  };
};

export const getStages = (accountId) => {
  return stages[accountId];
};

export const addMoney = (accountId, money) => {
  stages[accountId].money += money;
};

export const useMoney = (accountId, money) => {
  if (money > stages[accountId].money) return;
  stages[accountId].money -= money;
};

export const addScore = (accountId, score) => {
  stages[accountId].score += score;
};
