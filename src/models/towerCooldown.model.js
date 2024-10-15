const cooldown = {};

//유저의 cooldown 배열 생성
export const createCooldown = (accountId) => {
  cooldown[accountId] = [];
  console.log(`createCooldown`);
};

//유저 cooldown 정보 받아오기
export const getCooldown = (accountId) => {
  console.log(`getCooldown`);
  return cooldown[accountId];
};

//유저 cooldown 배열 추가
export const setCooldown = (accountId, towersdata) => {
  console.log(`setCooldown`);
  // console.log(`towers: `, towers);
  return cooldown[accountId].push(towersdata);
};

//유저 특정 cooldown 업데이트
export const updateCooldown = (accountId, selectedTowerIndex, time) => {
  console.log(`updateCooldown`);
  return (cooldown[accountId][selectedTowerIndex] = time);
};

//유저 특정 타워 제거
export const deleteCooldown = (accountId, selectedTowerIndex) => {
  console.log(`deleteCooldown`);
  return cooldown[accountId].splice(selectedTowerIndex, 1);
};

//유저 타워 비우기
export const clearCooldown = (accountId) => {
  console.log(`clearCooldown`);
  cooldown[accountId] = [];
};
