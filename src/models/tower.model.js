const towers = {};

//유저의 타워 배열 생성
export const createTowers = (token) => {
  towers[token] = [];
  console.log(`createTowers`);
};

//유저 타워 정보 받아오기
export const getTowers = (token) => {
  console.log(`getTowers`);
  return towers[token];
};

//유저 타워 배열 첫 세팅
export const setTowers = (token, towersdata) => {
  console.log(`setStage`);
  return towers[token].push({ towersdata });
};

//유저 스테이지 비우기
export const clearTowers = (token) => {
  console.log(`clearTowers`);
  towers[token] = [];
};
