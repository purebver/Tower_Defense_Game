import { prisma } from '../utils/prisma/prisma.client.js';
import { clearTowers } from '../models/tower.model.js';
import { clearMonsters, getMonsters } from '../models/monster.model.js';
import { clearStage, getStages } from '../models/stage.model.js';
import { getData } from '../init/data.js';

export const gameStartHandler = (accountId, data) => {
  clearTowers(accountId);
  clearMonsters(accountId);
  clearStage(accountId);

  return { status: 'success', message: 'Game Start' };
};

export const gameEndHandler = async (accountId, payload) => {
  try {
    // monster 처치 목록
    const stageInfo = getStages(accountId);
    const monsters = getMonsters(accountId);
    const dbMonsterData = getData().monsters;

    // 처치한 몬스터 목록에서 몬스터의 id만 저장
    const uniqueMonsterIds = [...new Set(monsters.map((monster) => monster.monsterId))];
    console.log('uniqueMonsterIds: ', uniqueMonsterIds);
    let totalScore = 0;

    // 몬스터 처치 목록으로 score 계산
    uniqueMonsterIds.forEach((monsterId) => {
      // 각 몬스터의 id별로 따로 찾아서 count
      const monsterCount = monsters.filter((monster) => monster.monsterId === monsterId).length;
      const monsterData = dbMonsterData.find((dbMonster) => dbMonster.monsterId === monsterId);
      if (monsterData) {
        totalScore += monsterData.monsterScore * monsterCount;
      }
    });

    // 점수 검증
    console.log('totalScore: ', totalScore);
    if (totalScore !== payload.score) {
      return { status: 'failed', message: 'Score unmatched' };
    }

    console.log('게임이 종료됩니다.');

    // 유저 정보 검색
    const userInfo = await prisma.user.findUnique({
      where: { id: accountId },
    });

    // 게임 로그 db에 저장
    await prisma.gameScore.create({
      data: {
        userId: userInfo.id,
        level: stageInfo.level, // 임시
        score: totalScore,
        endTime: new Date(),
      },
    });

    // 응답 생성
    const response = { status: 'success', message: '게임 종료', score: totalScore };

    // 유저 개인 최고 기록 갱신
    if (userInfo.highScore < totalScore) {
      await prisma.user.update({
        where: { id: accountId },
        data: {
          highScore: totalScore,
        },
      });
      // 응답에 newHighScore 추가
      response.newHighScore = 'highScore!';
    }

    return response;
  } catch (err) {
    console.error(err);
  }
};
