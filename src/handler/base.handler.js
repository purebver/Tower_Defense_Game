import { getData } from '../init/data.js';
import { deleteBase, getBases, setBases } from '../models/base.model.js';

/**
 * @desc 기지 강화 검증
 * @author 우종
 */

export const baseUpgradeHandler = (accountId, data, socket) => {
  const getBase = getBases(accountId);
  if (getBase.length === 0) {
    setBases(accountId, data);
    return { status: 'success', message: 'Base Seting' };
  }
  //db에 기지 정보
  const { bases } = getData();
  // 강화를 시도할때 돈이 있었는가
  const { currentUpgradeIndex, currentGold, base } = data;
  console.log('111111111', currentUpgradeIndex, '123213', currentGold, '333333333333', base);
  //   console.log(currentUpgradeIndex, currentGold, base.maxHp);
  if (
    currentUpgradeIndex !== getBase[getBase.length - 1].currentUpgradeIndex ||
    currentGold < bases[currentUpgradeIndex].upgradeCost ||
    base.maxHp !== getBase[getBase.length - 1].base.maxHp
  ) {
    return { status: 'fail', message: '너 강화못해' };
  }

  const index = currentUpgradeIndex + 1;
  const gold = currentGold - bases[currentUpgradeIndex].upgradeCost;
  const hp = base.maxHp + bases[currentUpgradeIndex].baseHp;

  deleteBase(accountId, 0);
  socket.emit('base', {
    index,
    gold,
    hp,
  });
  return { status: 'success', message: '강화성공' };
};
