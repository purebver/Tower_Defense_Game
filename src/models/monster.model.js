const monsters = {};
const killBoss = {};

//유저가 잡은 몬스터 기록 배열 생성
export const createMonsters = (accountId) => {
  monsters[accountId] = [];
  killBoss[accountId] = 0;
  console.log(`createMonsters`);
};

//몬스터 기록 받아오기
export const getMonsters = (accountId) => {
  return monsters[accountId];
};

//몬스터 세팅
export const setMonsters = (accountId, monstersdata) => {
  return monsters[accountId].push(monstersdata);
};

export const getKillBosses = (accountId) => {
  return killBoss[accountId];
};

export const addKillBoss = (accountId) => {
  killBoss[accountId]++;
};

//몬스터 배열 비우기
export const clearMonsters = (accountId) => {
  console.log(`clearMonsters`);
  monsters[accountId] = [];
};
