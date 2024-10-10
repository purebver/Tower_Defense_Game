import { getData } from '../init/data.js';
import { getTowers, setTowers } from '../models/tower.model.js';

/**
 * @desc 초기 타워 검증
 * @author 우종
 */
export const towerHandler = (accountId, data) => {
  //클라이언트의 현재 타워 개수
  const currentTower = data.tower;
  console.log('currentTower:', currentTower);
  //초기 타워 개수
  const startTower = data.numOfInitialTowers;
  console.log('startTower:', startTower);

  if (currentTower.lenght !== startTower) {
    return { status: 'fail', message: 'Start Tower Over' };
  }
  setTowers(accountId, data.tower);
  console.log('tower', data.tower);

  return { status: 'success', message: 'setTowers' };
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
  //타워 공격력 검증
  if (tower.attackPower !== dbTower.towerAttack) {
    return { status: 'fail', message: 'attackpower' };
  }
  //몬스터 잃어버린체력 = 타워공격력
  if (lostHp !== dbTower.towerAttack) {
    return { status: 'fail', message: 'monster lost Hp' };
  }
  return { status: 'success', message: 'attackTowers' };
};
