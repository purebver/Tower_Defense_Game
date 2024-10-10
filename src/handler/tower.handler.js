import { getData } from '../init/data.js';
import { setTowers } from '../models/tower.model.js';

export const towerHandler = (accountId, data) => {
  //준비중
  setTowers(accountId, data);
  return { status: 'success', message: 'setTowers' };
};

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
