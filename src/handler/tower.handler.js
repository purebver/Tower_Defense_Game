import { setTowers } from '../models/tower.model.js';

export const towerHandler = (accountId, data) => {
  //준비중
  setTowers(accountId, data);
  return { status: 'success', message: 'setTowers' };
};
