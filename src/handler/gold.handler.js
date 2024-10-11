import { getData } from '../init/data.js';

const goldCalculate = async(currentTower) => {
    // 구매한 타워 총 가격
    let totalTowerGold = 0;
    let numOfInitialTowers = 3; // 초기 타워 개수

    //console.log('----------------------');
    for(let i=numOfInitialTowers; i<currentTower.length; i++) {
        const towerInfo = getData().towers.find((a) => a.towerId === currentTower[i]);
        //console.log('id: ', towerInfo.towerId, ' cost: ', towerInfo.towerCost);
        totalTowerGold += towerInfo.towerCost;
    }
    // console.log('구매한 타워 총 가격: ', totalTowerGold);
}

export default goldCalculate;