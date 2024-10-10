const monsters = {};

//유저의 몬스터 배열 생성
export const createMonsters = (accountId) => {
  monsters[accountId] = [];
  console.log(`createMonsters`);
};

//몬스터 정보 받아오기
export const getMonsters = (accountId) => {
  return monsters[accountId];
};

//몬스터 초기 세팅
export const setMonsters = (accountId, monstersdata) => {
  console.log(`setMonster`);
  return monsters[accountId].push({ monstersdata });
};

//몬스터 배열 비우기
export const clearMonsters = (accountId) => {
  console.log(`clearMonsters`);
  monsters[accountId] = [];
};
