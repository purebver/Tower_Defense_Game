const bases = {};

//유저의 기지 기록 배열 생성
export const createBase = (accountId) => {
  bases[accountId] = [];
  console.log(`createbase`);
};

//기지 기록 받아오기
export const getBases = (accountId) => {
  return bases[accountId];
};

//기지 세팅
export const setBases = (accountId, basesdata) => {
  return bases[accountId].push(basesdata);
};

//유저 특정 기지 제거
export const deleteBase = (accountId, selectedBaseIndex) => {
  console.log(`deleteBase`);
  return bases[accountId].splice(selectedBaseIndex, 1);
};

//기지 배열 비우기
export const clearBases = (accountId) => {
  console.log(`clearBases`);
  bases[accountId] = [];
};
