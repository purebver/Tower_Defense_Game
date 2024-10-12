import { getData } from '../init/data.js';
import { getMonsters } from '../models/monster.model.js';
import { setLevel, getStages } from '../models/stage.model.js';
import { getTowers } from '../models/tower.model.js';
import { goldCalculate } from './gold.handler.js';
import { getBaseUpgrade } from '../models/base.model.js';

export const moveStageHandler = async (accountId, payload) => {
  try {
    const stageInfo = getData().stages;
    const dbMonsterData = getData().monsters;
    let monsters = getMonsters(accountId);

    const { nowLevel, nextLevel } = payload;
    const userInfo = getStages(accountId);

    if (userInfo.level !== nowLevel) {
      return { status: 'fail', message: 'level not match' };
    }

    if (userInfo.score < stageInfo[userInfo.level + 1].stageStartScore) {
      return { status: 'fail', message: 'level up score not match' };
    }

    // monster 처치 목록으로 유저의 점수 구하기
    const uniqueMonsterIds = [...new Set(monsters.map((monster) => monster.monsterId))];
    console.log('uniqueMonsterIds: ', uniqueMonsterIds);
    let totalScore = 0;
    let totalGold = 0;

    uniqueMonsterIds.forEach((monsterId) => {
      const monsterCount = monsters.filter((monster) => monster.monsterId === monsterId).length;
      const monsterData = dbMonsterData.find((dbMonster) => dbMonster.monsterId === monsterId);
      if (monsterData) {
        totalScore += monsterData.monsterScore * monsterCount;
        totalGold += monsterData.monsterGold * monsterCount;
      }
    });

    const clientGold = payload.clientUserGold;
    const baseUpgrade = getBaseUpgrade(accountId);
    const serverGold = goldCalculate(getTowers(accountId), totalGold, baseUpgrade);
    console.log('clientGold: ', clientGold);
    console.log('serverGold: ', serverGold);
    if (clientGold !== serverGold) {
      return { status: 'fail', message: 'Gold on the client and server is different.' };
    }

    // 유저의 총 점수가 다음 스테이지 점수에 도달하지 못했다면
    if (totalScore < stageInfo[userInfo.level + 1].stageStartScore) {
      return { status: 'fail', message: 'lack of score' };
    }

    setLevel(accountId, nextLevel);
    console.log('accountId: ', accountId, 'level up to', nextLevel);
    const response = { status: 'success', message: 'level up!!!!!!!!!!!!!!!!!!!!!!!!!!!!!' };
    return response;
  } catch (e) {
    console.error(e);
  }
};
