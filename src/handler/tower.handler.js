import { getData } from '../init/data.js';
import { getStages, addMoney, useMoney } from '../models/stage.model.js';
import { deleteTowers, getTowers, setTowers } from '../models/tower.model.js';
import { deleteCooldown, getCooldown, setCooldown } from '../models/towerCooldown.model.js';
import { baseTowerDelete } from './gold.handler.js';

/**
 * @desc 초기 타워 검증
 * @author 우종
 */

let startTower = 0;
export const towerHandler = (accountId, data) => {
  //클라이언트의 현재 타워 개수
  const currentTower = data.tower;
  // console.log('currentTower:', currentTower.length);
  //초기 타워 개수
  startTower = data.numOfInitialTowers;
  // console.log('startTower:', startTower);
  //타워 개수가 초기 개수와 일치하지 않을 경우
  if (currentTower.length !== startTower) {
    return { status: 'fail', message: 'Start Tower Over' };
  }
  //console.log('towerHandler: ', data.tower);

  //골드검증, 공격 쿨다운 검증
  for (let i = 0; i < startTower; i++) {
    setTowers(accountId, data.towerObj);
    setCooldown(accountId, time);
  }
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
  //getTower의 값이 undefined인 경우 에러처리
  // if (!Array.isArray(getTower) || getTower.length === 0) {
  //   return { status: 'fail', message: 'Tower is Not Found' };
  // }
  // console.log('getTower', getTower);
  if (data.currentTower.length - 1 !== getTower.length) {
    return { status: 'fail', message: 'The Number of Towers Is Strange.' };
  }
  //골드 검증을 위한 저장
  setTowers(accountId, data.towerObj);

  //타워 공격 cooldown 검증을 위한 시간 세팅
  const time = 0;
  setCooldown(accountId, time);

  useMoney(accountId, towerPrice);

  return { status: 'success', message: 'Tower Purchase Success' };
};

/**
 * @desc 타워 스텟 검증
 * @author 우종
 */

export const towerStatsHandler = (accountId, data) => {
  //현재 타워의 공격력 쿨타임 공격범위가 db의 값과 일치 하는가

  //db의 타워 데이터
  const { towers } = getData();
  const tower = data.tower;
  //db의 타워 데이터
  const dbTower = towers.find((a) => a.towerId === tower.towerId);

  //dbTower가 undefined인 경우
  if (!dbTower) {
    return { status: 'fail', message: 'Tower Not Found in Database' };
  }
  //클라이언트에서 가져온 타워 스텟
  const { attackPower, cooltime, range } = data.tower || {};

  //클라이언트의 타워 스텟이 정의되었는지 확인
  if (!attackPower || cooltime < 0 || !range) {
    return { status: 'fail', message: 'Tower Stats undefined' };
  }

  //타워 스텟 비교
  if (
    attackPower !== dbTower.towerAttack ||
    cooltime !== dbTower.towerSpeed ||
    range !== dbTower.towerRange
  ) {
    return { status: 'fail', message: 'Tower Stats Irregular' };
  }
  return { status: 'success', message: 'Tower Erection' };
};

/**
 * @desc 타워->몬스터 Attack 검즘
 * @author 재영
 */
export const towerAttackHandler = (accountId, data) => {
  //타워 db데이터
  const { towers } = getData();
  //모든 타워 이전 공격 시간
  const brforeTimearr = getCooldown(accountId);
  //타워 index
  const index = data.index;
  //현 타워의 이전 공격 시간
  const beforeTime = brforeTimearr[index];
  //현재 시간
  const nowTime = Date.now();
  //클라이언트의 타워
  const tower = data.tower;
  //클라이언트의 타워 id와 같은 db타워 검색
  const dbTower = towers.find((a) => a.towerId === tower.towerId);
  //공격받은 몬스터
  const monster = data.monster;
  //클라이언트의 타워와 공격받은 몬스터 거리
  const distance = Math.sqrt(Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2));
  //타워 공격 Cooldown검증
  //프레임을 밀리초로
  const oneframe = 1000 / 60;
  //db에 저장된 타워의 공격속도 프레임을 시간으로 환산
  const cooldown = dbTower.towerSpeed * oneframe;
  //현시간 - 이전시간이 cooldown보다 작을 경우 문제 있음
  if (nowTime - beforeTime < cooldown) {
    return { status: 'fail', message: 'attackCooldown' };
  }
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

//타워 판매
export const towerSellHandler = (accountId, data) => {
  //타워 db데이터
  const { towers } = getData();
  const gettowers = getTowers(accountId);
  //클라이언트의 타워
  const towerId = gettowers[data.selectedTowerIndex];
  //클라이언트의 타워 id와 같은 db타워 검색
  const dbTower = towers.find((a) => a.towerId === towerId);

  //선택 타워 제거
  deleteTowers(accountId, data.selectedTowerIndex);
  deleteCooldown(accountId, data.selectedTowerIndex);

  //유저 현재 골드 - 이전 보유 골드 = 타워금액
  if (data.userGold - data.beforeGold !== dbTower.towerCost) {
    return { status: 'fail', message: 'The selling price is strange' };
  }

  //골드 검증
  let isBaseTowerDelete = false;
  if (dbTower.towerId === 100) {
    isBaseTowerDelete = true;
  }

  addMoney(accountId, dbTower.towerCost);
  baseTowerDelete(isBaseTowerDelete);

  return { status: 'success', message: 'sellTowers' };
};
