import { towerAttackHandler, towerHandler } from './tower.handler.js';
import { monsterKill } from './monster.handler.js';
import { gameStartHandler, gameEndHandler } from './game.handler.js';
const handlerMappings = {
  1: gameStartHandler,
  2: gameEndHandler,
  // 10: monster 관련 핸들러,
  // 20: stage 관련 핸들러,
  11: monsterKill,
  30: towerHandler,
  31: towerAttackHandler,
};

export default handlerMappings;
