import { getData } from '../init/data.js';

const goldCalculate = async() => {
    const towerInfo = getData().towers;
    const monsterInfo = getData().monsters;
    const stageInfo = getData().stages;

    console.log('타워: ', towerInfo);
    console.log('몬스터: ', monsterInfo);
    console.log('스테이지: ', stageInfo);
}

export default goldCalculate;