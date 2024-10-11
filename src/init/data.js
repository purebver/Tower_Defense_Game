import { prisma } from '../utils/prisma/prisma.client.js';

let gameData = {};

export const readData = async () => {
  const [towers, monsters, stages] = await Promise.all([
    prisma.tower.findMany(),
    prisma.monster.findMany(),
    prisma.stage.findMany(),
  ]);
  gameData = { towers, monsters, stages };
  return gameData;
};

export const getData = () => {
  return gameData;
};
