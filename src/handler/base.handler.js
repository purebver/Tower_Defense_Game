import { getData } from '../init/data.js';
import {
  deleteBase,
  getBases,
  getBaseUpgrade,
  setBases,
  setBaseUpgrade,
} from '../models/base.model.js';

/**
 * @desc 기지 강화 검증
 * @author 우종
 */

export const baseUpgradeHandler = (accountId, data, socket) => {
  const { currentUpgradeIndex, currentGold, base } = data;
  const getBase = getBases(accountId);
  const getUpgrade = getBaseUpgrade(accountId);
  if (getUpgrade.length === 0) {
    setBaseUpgrade(accountId, currentUpgradeIndex);
  }
  if (getBase.length === 0) {
    setBases(accountId, data);
    return { status: 'success', message: 'Base Seting' };
  }
  //db에 기지 정보
  const { bases } = getData();
  // 강화를 시도할때 돈이 있었는가
  //   console.log('currentUpgradeIndex', currentUpgradeIndex, 'currentGold', currentGold, 'base', base);
  //   console.log(currentUpgradeIndex, currentGold, base.maxHp);
  if (
    currentUpgradeIndex !== getBase[getBase.length - 1].currentUpgradeIndex ||
    currentGold < bases[currentUpgradeIndex].baseUpgradeCost ||
    base.maxHp !== getBase[getBase.length - 1].base.maxHp
  ) {
    return { status: 'fail', message: 'Upgrade Fail' };
  }

  const index = currentUpgradeIndex + 1;
  const gold = currentGold - bases[currentUpgradeIndex].baseUpgradeCost;
  const hp = base.maxHp + bases[currentUpgradeIndex].baseHp;
  setBaseUpgrade(accountId, index);

  console.log(getBaseUpgrade(accountId)); // 이거 가져다 골드 검증하면됨
  deleteBase(accountId, 0);
  socket.emit('base', {
    index,
    gold,
    hp,
  });
  return { status: 'success', message: 'Upgrade Success' };
};
