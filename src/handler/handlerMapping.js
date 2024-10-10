import { towerHandler } from './tower.handler.js';
import { monsterKill } from './monster.handler.js';
const handlerMappings = {
  // 1: gameStart 핸들러,
  // 2: gameEnd 핸들러,
  // 10: monster 관련 핸들러,
  // 20: stage 관련 핸들러,
  11: monsterKill,
  30: towerHandler,
};

export default handlerMappings;
