import { prisma } from '../utils/prisma/prisma.client.js';

let gameData = {};

//db데이터 로드
export const readData = async () => {
  const [towers, monsters, stages, bases] = await Promise.all([
    prisma.tower.findMany(),
    prisma.monster.findMany(),
    prisma.stage.findMany(),
    prisma.base.findMany(),
  ]);

  gameData = { towers, monsters, stages, bases };
  return gameData;
};

export const getData = () => {
  return gameData;
};
