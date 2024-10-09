import { setTowers } from '../models/tower.model.js';

export const towerHandler = (token, data) => {
  //준비중
  setTowers(token, data);
};
