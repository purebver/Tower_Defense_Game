import { getData } from '../init/data.js';
import { moneyBase } from '../models/stage.model.js';

let numOfInitialTowers = 3; // 초기 타워 개수
let baseTowerCost = 0;

export const baseTowerDelete = async (isDelete) => {
  if (isDelete && numOfInitialTowers !== 0) {
    numOfInitialTowers--;
    baseTowerCost += 1000;
  }
};

export const goldCalculate = (currentTower, monsterGold) => {
  let totalGold = 0;
  // 구매한 타워 총 가격
  let totalTowerGold = 0;

  //console.log('----------------------');
  for (let i = numOfInitialTowers; i < currentTower.length; i++) {
    const towerInfo = getData().towers.find((a) => a.towerId === currentTower[i]);
    //console.log('id: ', towerInfo.towerId, ' cost: ', towerInfo.towerCost);
    totalTowerGold += towerInfo.towerCost;
  }

  totalGold = moneyBase + monsterGold - totalTowerGold + baseTowerCost;

  return totalGold;
};
