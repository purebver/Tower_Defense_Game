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

export const goldCalculate = (currentTower, monsterGold, baseUpgradeArr) => {
  let totalGold = 0;
  // 구매한 타워 총 가격
  let totalTowerGold = 0;

  for (let i = numOfInitialTowers; i < currentTower.length; i++) {
    const towerInfo = getData().towers.find((a) => a.towerId === currentTower[i]);
    totalTowerGold += towerInfo.towerCost;
  }

  // 기지 업그레이드 가격
  let totalBaseGole = 0;
  for (let i = 1; i < baseUpgradeArr.length; i++) {
    const baseInfo = getData().bases.find((a) => a.baselevel === baseUpgradeArr[i]);
    totalBaseGole += baseInfo.baseUpgradeCost;
  }

  totalGold = moneyBase + monsterGold - totalTowerGold + baseTowerCost - totalBaseGole;

  return totalGold;
};
