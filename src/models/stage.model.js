const stages = {};

export const moneyBase = 5000;

export const createStages = (accountId) => {
  stages[accountId] = {
    level: 0,
    money: moneyBase, // 처음 돈은 어떻게 결정할 예정?
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

export const addLevel = (accountId, level) => {
  stages[accountId].level = level;
};

export const clearStage = (accountId) => {
  stages[accountId] = {
    level: 0,
    money: moneyBase, // 처음 돈은 어떻게 결정할 예정?
    score: 0,
  };
};
