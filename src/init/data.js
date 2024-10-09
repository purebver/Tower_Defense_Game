import { prisma } from '../utils/prisma/prisma.client.js';

let gameData = {};

export const readData = async () => {
  const [towers, monsters, stages] = await Promise.all([
    prisma.Tower.findMany(),
    prisma.Monster.findMany(),
    prisma.Stage.findMany(),
  ]);
  gameData = { towers, monsters, stages };
  return gameData;
};

export const getData = () => {
  return gameData;
};
