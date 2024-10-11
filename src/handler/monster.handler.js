import { getData } from '../init/data.js';
import { getMonsters, setMonsters } from '../models/monster.model.js';
// 몬스터 스폰 검증
export const monsterSpawn = (accountId, data) => {
  const { monsters } = getData();
  // 클라이언트에서 스폰되는 몬스터 데이터
  const monster = data.monster;
  //몬스터 DB 데이터
  const dbMonster = monsters.find((a) => a.monsterId === monster.monsterId);

  if (!dbMonster) {
    return { status: 'fail', message: 'monster not found' };
  }
  // 몬스터 체력 검증
  if (monster.monsterHp !== dbMonster.monsterHp) {
    return { status: 'fail', message: 'monsterHp Is Strange' };
  }
  // 몬스터 스폰 시간 검증
  if (monster.spawnTime !== dbMonster.spawnTime) {
    return { status: 'fail', message: 'spawnTime Is Strange' };
  }

  return { status: 'success', message: 'Monster Spawn Success' };
};

// 몬스터 사망시 검증
export const monsterKill = (accountId, data) => {
  //몬스터 DB 데이터
  const { monsters } = getData();
  //클라이언트에서 스폰되는 몬스터 데이터
  const monster = data.monster;
  const dbMonster = monsters.find((a) => a.monsterId === monster.monsterId);

  //죽인 몬스터 배열
  const monsterArr = getMonsters(accountId);
  console.log('hi:' + dbMonster.monsterScore);
  // 몬스터 스코어 검증
  if (monster.monsterScore !== dbMonster.monsterScore) {
    return { status: 'fail', message: 'monsterScore Is Strange' };
  }

  if (!monsterArr) {
    return { status: 'fail', message: 'monster not found' };
  }

  setMonsters(accountId, data);
  return { status: 'success', message: 'monster killed' };
};