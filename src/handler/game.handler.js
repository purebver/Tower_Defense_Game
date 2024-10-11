import { prisma } from '../utils/prisma/prisma.client.js';
import { clearTowers } from '../models/tower.model.js';
import { clearMonsters, getMonsters } from '../models/monster.model.js';
import { clearStage } from '../models/stage.model.js';
import { getData } from '../init/data.js';

export const gameStartHandler = (accountId, data) => {
  clearTowers(accountId);
  clearMonsters(accountId);
  clearStage(accountId);

  return { status: 'success', message: 'Game Start' };
};

export const gameEndHandler = async (accountId, payload) => {
  try {
    // monster 처치 목록으로 유저의 점수 구하기
    const monsters = getMonsters(accountId);
    const dbMonsterData = getData().monsters;

    const uniqueMonsterIds = [...new Set(monsters.map((monster) => monster.monsterId))];
    console.log('uniqueMonsterIds: ', uniqueMonsterIds);
    let totalScore = 0;

    uniqueMonsterIds.forEach((monsterId) => {
      const monsterCount = monsters.filter((monster) => monster.monsterId === monsterId).length;
      const monsterData = dbMonsterData.find((dbMonster) => dbMonster.monsterId === monsterId);
      if (monsterData) {
        totalScore += monsterData.monsterScore * monsterCount;
      }
    });

    console.log('totalScore: ', totalScore);
    console.log('게임이 종료됩니다.');

    // 점수 검증
    if (totalScore !== payload.score) {
      return { status: 'failed', message: 'Score unmatched' };
    }

    // 유저 정보 검색
    const userInfo = await prisma.user.findUnique({
      where: { id: accountId },
    });

    // 게임 로그 db에 저장
    await prisma.gameScore.create({
      data: {
        userId: userInfo.id,
        level: 1, // 임시
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
