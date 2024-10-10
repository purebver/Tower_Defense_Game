import { prisma } from '../utils/prisma/prisma.client.js';

export const gameEndHandler = async (uuid, payload) => {
  try {
    // todo: 임의로 지정한 score, 추후 monster 처치로 인한 score가 구현 되면 추가
    let score = 100;

    // 점수 검증
    if (score !== payload.score) {
      return { status: 'failed', message: 'Score unmatched' };
    }

    // 유저 정보 검색
    const userInfo = await prisma.user.findUnique({
      where: { id: uuid },
    });

    // 게임 로그 db에 저장
    await prisma.gameScore.create({
      uuid,
      level: 1, // 임시
      score,
      endTime: Date.now(),
    });

    // 응답 생성
    const response = { status: 'success', message: '게임 종료', score: score };

    // 유저 개인 최고 기록 갱신
    if (userInfo.highScore < score) {
      await prisma.user.update({
        where: { id: uuid },
        data: {
          highScore: score,
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
