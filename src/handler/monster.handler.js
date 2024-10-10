import { getData } from '../init/data.js';
import { getMonsters, setMonsters } from '../models/monster.model.js';
// 몬스터 소환 검증
export const monsterSpawn = (accountId, data) => {
  const { DBData } = getData();

  const { monsterDBData } = DBData.monsters;
  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  setMonsters(accountId, data);
  return { status: 'success', message: 'Monster killed' };
};

// 몬스터 사망시 검증
export const monsterKill = (accountId, data) => {
  const monsters = getMonsters(accountId);
  console.log('ddddd');

  if (!monsters) {
    return { status: 'fail', message: 'Monsters not found' };
  }

  setMonsters(accountId, data);
  return { status: 'success', message: 'Monster killed' };
};
