const towers = {};

//유저의 타워 배열 생성
export const createTowers = (accountId) => {
  towers[accountId] = [];
  console.log(`createTowers`);
};

//유저 타워 정보 받아오기
export const getTowers = (accountId) => {
  console.log(`getTowers`);
  return towers[accountId];
};

//유저 타워 배열
export const setTowers = (accountId, towersdata) => {
  console.log(`setTowers`);
  // console.log(`towers: `, towers);
  return towers[accountId].push(towersdata);
};

//유저 특정 타워 제거
export const deleteTowers = (accountId, selectedTowerIndex) => {
  console.log(`deleteTowers`);
  return towers[accountId].splice(selectedTowerIndex, 1);
};

//유저 타워 비우기
export const clearTowers = (accountId) => {
  console.log(`clearTowers`);
  towers[accountId] = [];
};
