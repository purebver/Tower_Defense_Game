import { getData } from '../init/data.js';
import { getStages, useMoney } from '../models/stage.model.js';
import { getTowers, setTowers } from '../models/tower.model.js';

/**
 * @desc 초기 타워 검증
 * @author 우종
 */
export const towerHandler = (accountId, data) => {
  //클라이언트의 현재 타워 개수
  const currentTower = data.tower;
  // console.log('currentTower:', currentTower.length);
  //초기 타워 개수
  const startTower = data.numOfInitialTowers;
  // console.log('startTower:', startTower);

  if (currentTower.length !== startTower) {
    return { status: 'fail', message: 'Start Tower Over' };
  }
  setTowers(accountId, data.tower);
  // console.log('tower', data.tower);

  return { status: 'success', message: 'Correct Number of Towers' };
};
/**
 * @desc 타워 구매시 유저 골드 차감
 * @author 우종
 */
export const towerBuyHandler = (accountId, data) => {
  //db의 타워
  const { towers } = getData();
  const stageInfo = getStages(accountId);

  //클라이언트의 타워
  const tower = data.currentTower[data.currentTower.length - 1];
  const towerPrice = towers.find((a) => a.towerId === tower.towerId).towerCost;

  // 골드 검증
  console.log('towerPrice: ', towerPrice);
  if (stageInfo.money < towerPrice) {
    console.log('돈부족');
    return { status: 'fail', message: 'lack of money' };
  }

  //타워구매시 골드 차감됬는지 검증
  if (data.currentGold - towerPrice !== data.afterGold) {
    return { status: 'fail', message: 'It s not your money' };
  }
  //타워 구매시 타워가 구매한 만큼만 추가되었는지 검증
  const getTower = getTowers(accountId);
  // console.log('getTower', getTower);
  if (data.currentTower.length - 1 !== getTower[getTower.length - 1].length) {
    return { status: 'fail', message: 'The Number of Towers Is Strange.' };
  }

  useMoney(accountId, towerPrice);
  setTowers(accountId, data.currentTower);
  return { status: 'success', message: 'Tower Purchase Success' };
};

/**
 * @desc 타워->몬스터 Attack 검즘
 * @author 재영
 */
export const towerAttackHandler = (accountId, data) => {
  //타워 db데이터
  const { towers } = getData();
  //클라이언트의 타워
  const tower = data.tower;
  //클라이언트의 타워 id와 같은 db타워 검색
  const dbTower = towers.find((a) => a.towerId === tower.towerId);
  //공격받은 몬스터
  const monster = data.monster;
  //클라이언트의 타워와 공격받은 몬스터 거리
  const distance = Math.sqrt(Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2));
  //클라이언트의 타워 공격사거리와 db타워의 사거리와 비교 검증
  if (distance > dbTower.towerRange) {
    return { status: 'fail', message: 'attackTowers' };
  }
  //몬스터가 공격받고 잃어버린 체력
  const lostHp = data.beforeHp - monster.hp;
  //타워 공격력 검증n
  if (tower.attackPower !== dbTower.towerAttack) {
    return { status: 'fail', message: 'attackpower' };
  }
  //몬스터 잃어버린체력 = 타워공격력
  if (lostHp !== dbTower.towerAttack) {
    return { status: 'fail', message: 'monster lost Hp' };
  }
  return { status: 'success', message: 'attackTowers' };
};
