const stages = {};

export const createStages = (accountId) => {
  stages[accountId] = [];
};

export const getStages = (accountId) => {
  return stages[accountId];
};
