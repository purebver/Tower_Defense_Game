import { towerAttackHandler, towerHandler, towerBuyHandler } from './tower.handler.js';
import { monsterKill } from './monster.handler.js';
import { moveStageHandler } from './stage.handler.js';
import { gameStartHandler, gameEndHandler } from './game.handler.js';

const handlerMappings = {
  1: gameStartHandler,
  2: gameEndHandler,
  // 10: monster 관련 핸들러,
  // 20: stage 관련 핸들러,
  21: moveStageHandler,
  11: monsterKill,
  30: towerHandler,
  31: towerAttackHandler,
  32: towerBuyHandler,
};

export default handlerMappings;
