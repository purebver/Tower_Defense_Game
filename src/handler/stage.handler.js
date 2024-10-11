import { getData } from '../init/data.js';
import { getStages } from '../models/stage.model.js';

export const moveStageHandler = async (accountId, payload) => {
  try {
    // 점수를 검증해야 하는데
    const stageInfo = getData().stages;
    const { nowLevel, nextLevel } = payload;
    const userInfo = getStages(accountId);
    // console.log('stageInfo: ', stageInfo);
    console.log('userInfo: ', userInfo);

    if (userInfo.score < stageInfo[userInfo.level + 1].stageStartScore)
      return { status: 'fail', message: 'level not match' };

    /*
    유저의 점수를 구해
    */
    const response = { status: 'success', message: 'level up' };
    return response;
  } catch (e) {
    console.error(e);
  }
};
