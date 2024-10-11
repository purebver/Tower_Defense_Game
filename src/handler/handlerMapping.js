import {
  towerAttackHandler,
  towerHandler,
  towerBuyHandler,
  towerStatsHandler,
  towerSellHandler,
} from './tower.handler.js';
import { moveStageHandler } from './stage.handler.js';
import { monsterSpawn, monsterKill } from './monster.handler.js';
import { gameStartHandler, gameEndHandler } from './game.handler.js';

const handlerMappings = {
  1: gameStartHandler,
  2: gameEndHandler,
  10: monsterSpawn,
  11: monsterKill,
  21: moveStageHandler,
  30: towerHandler,
  31: towerAttackHandler,
  32: towerBuyHandler,
  33: towerStatsHandler,
  34: towerSellHandler,
};

export default handlerMappings;
