import { getMonsters, setMonsters } from '../models/monster.model.js';
// 몬스터 소환 검증

// 몬스터 사망시 검증
export const monsterKill = (accountId, data) => {
  const monsters = getMonsters(accountId);

  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  setMonsters(accountId, data);
  return { status: 'success', message: 'Monster killed' };
};
