import { getData } from '../init/data.js';
import { addKillBoss, getKillBosses, getMonsters, setMonsters } from '../models/monster.model.js';
import { addMoney, addScore } from '../models/stage.model.js';
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
  if (monster.monsterId === 500) {
    // 보스 몬스터일 경우 따로 검증
    const killBossCount = getKillBosses(accountId);
    if (monster.monsterHp !== dbMonster.monsterHp * Math.pow(2, killBossCount)) {
      return { status: 'fail', message: 'monsterHp Is Strange' };
    }
  } else {
    // 일반 몬스터 검증
    if (monster.monsterHp !== dbMonster.monsterHp) {
      return { status: 'fail', message: 'monsterHp Is Strange' };
    }
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

  // 몬스터 스코어 검증
  if (monster.monsterScore !== dbMonster.monsterScore) {
    return { status: 'fail', message: 'monsterScore Is Strange' };
  }

  if (!monsterArr) {
    return { status: 'fail', message: 'monster not found' };
  }

  if (!dbMonster) {
    return { status: 'fail', message: 'invalid monster id' };
  }

  // 보스를 처치했을 경우 카운트 증가
  if (monster.monsterId === 500) {
    addKillBoss(accountId);
  }

  // 몬스터의 gold와 score를 추가
  setMonsters(accountId, data.monster);
  addScore(accountId, dbMonster.monsterScore);
  addMoney(accountId, dbMonster.monsterGold);
  return { status: 'success', message: 'monster killed' };
};
