import { towerHandler } from './tower.handler.js';

const handlerMappings = {
  // 1: gameStart 핸들러,
  // 2: gameEnd 핸들러,
  // 10: monster 관련 핸들러,
  // 20: stage 관련 핸들러,
  30: towerHandler,
};

export default handlerMappings;
