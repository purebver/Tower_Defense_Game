import { getData } from '../init/data.js';
import {
  deleteBase,
  getBases,
  getBaseUpgrade,
  setBases,
  setBaseUpgrade,
} from '../models/base.model.js';
import { getStages, useMoney } from '../models/stage.model.js';

/**
 * @desc 기지 강화 검증
 * @author 우종
 */

export const baseUpgradeHandler = (accountId, data, socket) => {
  //현재 수치와 검증하지위한 처음 생성된 기지 데이터
  const { currentUpgradeIndex, currentGold, base } = data;
  const getBase = getBases(accountId);
  const getUpgrade = getBaseUpgrade(accountId);
  const userInfo = getStages(accountId);

  //게임 시작시 인덱스 초기화 검증
  if (getUpgrade.length === 0) {
    setBaseUpgrade(accountId, currentUpgradeIndex);
  }
  if (getBase.length === 0) {
    setBases(accountId, data);
    return { status: 'success', message: 'Base Seting' };
  }
  //db에 기지 정보
  const { bases } = getData();
  // 강화를 시도할때 조건 충족여부 검증
  //   console.log('currentUpgradeIndex', currentUpgradeIndex, 'currentGold', currentGold, 'base', base);
  //   console.log(currentUpgradeIndex, currentGold, base.maxHp);
  if (
    currentUpgradeIndex !== getBase[getBase.length - 1].currentUpgradeIndex ||
    currentGold < bases[currentUpgradeIndex].baseUpgradeCost ||
    base.maxHp !== getBase[getBase.length - 1].base.maxHp ||
    userInfo.money < bases[currentUpgradeIndex].baseUpgradeCost
  ) {
    return { status: 'fail', message: 'Upgrade Fail' };
  }
  // 소켓으로 쏴줄 데이터 미리 계산하는 부분
  const index = currentUpgradeIndex + 1;
  const gold = currentGold - bases[currentUpgradeIndex].baseUpgradeCost;
  const hp = base.maxHp + bases[currentUpgradeIndex].baseHp;
  setBaseUpgrade(accountId, index);

  //골드검증을 위한 부분
  console.log(getBaseUpgrade(accountId)); // 이거 가져다 골드 검증하면됨
  deleteBase(accountId, 0);
  useMoney(accountId, bases[currentUpgradeIndex].baseUpgradeCost);
  console.log(
    'bases[currentUpgradeIndex].baseUpgradeCost: ',
    bases[currentUpgradeIndex].baseUpgradeCost,
  );
  console.log('getStages(accountId): ', getStages(accountId));

  //클라이언트에 소켓으로 쏴주는 부분
  socket.emit('base', {
    index,
    gold,
    hp,
  });
  return { status: 'success', message: 'Upgrade Success' };
};
