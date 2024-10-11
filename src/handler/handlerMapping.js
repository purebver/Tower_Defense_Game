import { towerAttackHandler, towerHandler, towerBuyHandler } from './tower.handler.js';
import { moveStageHandler } from './stage.handler.js';
import { monsterSpawn, monsterKill } from './monster.handler.js';
import { gameStartHandler, gameEndHandler } from './game.handler.js';

const handlerMappings = {
  1: gameStartHandler,
  2: gameEndHandler,
  21: moveStageHandler,
  10: monsterSpawn,
  11: monsterKill,
  21: moveStageHandler,
  // 20: stage 관련 핸들러,
  30: towerHandler,
  31: towerAttackHandler,
  32: towerBuyHandler,
};

export default handlerMappings;
