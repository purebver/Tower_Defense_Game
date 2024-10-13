import fs from 'fs';
import csv from 'csv-parser';
import { prisma } from '../src/utils/prisma/prisma.client.js';

// CSV 파일을 읽어서 JSON 형식으로 변환하는 함수
async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// CSV 파일 읽기 (stage와 tower 데이터)
const stageDataJson = await readCSV('./data_DB/csv_file/stage_data.csv');
const towerDataJson = await readCSV('./data_DB/csv_file/tower_data.csv');
const monsterDataJson = await readCSV('./data_DB/csv_file/monster_data.csv');

// Stage 데이터 처리
const excelStageId = stageDataJson.map((item) => parseInt(item['stageId'], 10));
const dbStageData = await prisma.stage.findMany({
  select: { stageId: true, stageStartScore: true },
});
const dbStageId = dbStageData.map((item) => item.stageId);

// CSV에 없는 스테이지가 DB에 있는지 확인하고 삭제 처리
const deleteStage = dbStageId.filter((stageId) => !excelStageId.includes(stageId));
if (0 < deleteStage.length) {
  console.log('삭제할 스테이지 ID 목록: ' + deleteStage.join(', '));
  await prisma.stage.deleteMany({
    where: {
      stageId: { in: deleteStage },
    },
  });
} else {
  console.log('삭제할 스테이지가 없습니다.');
}

const promiseAllStages = [];
for (let i = 0; i < stageDataJson.length; i++) {
  const currentStage = stageDataJson[i];
  const stageIdInt = parseInt(currentStage['stageId'], 10);
  const stageStartScoreInt = parseInt(currentStage['stageStartScore'], 10);
  const isStageInDb = dbStageData.find((stage) => stage.stageId === stageIdInt);

  if (isStageInDb) {
    if (isStageInDb.stageStartScore !== stageStartScoreInt) {
      console.log(`스테이지 ${stageIdInt} 업데이트!!!!`);
      const promise = prisma.stage.update({
        data: { stageStartScore: stageStartScoreInt },
        where: { stageId: stageIdInt },
      });
      promiseAllStages.push(promise);
    }
  } else {
    console.log(`${stageIdInt} 삽입`);
    const promise = prisma.stage.create({
      data: {
        stageId: stageIdInt,
        stageStartScore: stageStartScoreInt,
      },
    });
    promiseAllStages.push(promise);
  }
}

// Tower 데이터 처리
const excelTowerId = towerDataJson.map((item) => parseInt(item['towerId'], 10));
const dbTowerData = await prisma.tower.findMany({
  select: {
    towerId: true,
    towerCost: true,
    towerAttack: true,
    towerSpeed: true,
    towerRange: true,
    img: true,
  },
});
const dbTowerId = dbTowerData.map((item) => item.towerId);

// CSV에 없는 타워가 DB에 있는지 확인하고 삭제 처리
const deleteTower = dbTowerId.filter((towerId) => !excelTowerId.includes(towerId));
if (0 < deleteTower.length) {
  console.log('삭제할 타워 ID 목록: ' + deleteTower.join(', '));
  await prisma.tower.deleteMany({
    where: {
      towerId: { in: deleteTower },
    },
  });
} else {
  console.log('삭제할 타워가 없습니다.');
}

const promiseAllTowers = [];
for (let i = 0; i < towerDataJson.length; i++) {
  const currentTower = towerDataJson[i];
  const towerIdInt = parseInt(currentTower['towerId'], 10);
  const towerCostInt = parseInt(currentTower['towerCost'], 10);
  const towerAttackInt = parseInt(currentTower['towerAttack'], 10);
  const towerSpeedInt = parseInt(currentTower['towerSpeed'], 10);
  const towerRangeInt = parseInt(currentTower['towerRange'], 10);

  const isTowerInDb = dbTowerData.find((tower) => tower.towerId === towerIdInt);

  if (isTowerInDb) {
    if (
      isTowerInDb.towerCost !== towerCostInt ||
      isTowerInDb.towerAttack !== towerAttackInt ||
      isTowerInDb.towerSpeed !== towerSpeedInt ||
      isTowerInDb.towerRange !== towerRangeInt ||
      isTowerInDb.img !== currentTower['img']
    ) {
      console.log(`타워 ${towerIdInt} 업데이트!!!!`);
      const promise = prisma.tower.update({
        data: {
          towerCost: towerCostInt,
          towerAttack: towerAttackInt,
          towerSpeed: towerSpeedInt,
          towerRange: towerRangeInt,
          img: currentTower['img'],
        },
        where: { towerId: towerIdInt },
      });
      promiseAllTowers.push(promise);
    }
  } else {
    console.log(`${towerIdInt} 삽입`);
    const promise = prisma.tower.create({
      data: {
        towerId: towerIdInt,
        towerCost: towerCostInt,
        towerAttack: towerAttackInt,
        towerSpeed: towerSpeedInt,
        towerRange: towerRangeInt,
        img: currentTower['img'],
      },
    });
    promiseAllTowers.push(promise);
  }
}

// Monster 데이터 처리
const excelMonsterId = monsterDataJson.map((item) => parseInt(item['monsterId'], 10));
const dbMonsterData = await prisma.monster.findMany({
  select: {
    monsterId: true,
    level: true,
    monsterHp: true,
    monsterAttack: true,
    spawnTime: true,
    img: true,
    monsterGold: true,
    monsterScore: true,
    monsterMoveSpeed: true,
  },
});
const dbMonsterId = dbMonsterData.map((item) => item.monsterId);

// CSV에 없는 몬스터가 DB에 있는지 확인하고 삭제 처리
const deleteMonster = dbMonsterId.filter((monsterId) => !excelMonsterId.includes(monsterId));
if (0 < deleteMonster.length) {
  console.log('삭제할 몬스터 ID 목록: ' + deleteMonster.join(', '));
  await prisma.monster.deleteMany({
    where: {
      monsterId: { in: deleteMonster },
    },
  });
} else {
  console.log('삭제할 몬스터가 없습니다.');
}

const promiseAllMonster = [];
for (let i = 0; i < monsterDataJson.length; i++) {
  const currentMonster = monsterDataJson[i];
  const monsterIdInt = parseInt(currentMonster['monsterId'], 10);
  const monsterLevelInt = parseInt(currentMonster['level'], 10);
  const monsterHpInt = parseInt(currentMonster['monsterHp'], 10);
  const monsterAttackInt = parseInt(currentMonster['monsterAttack'], 10);
  const monsterSpawnTimeInt = parseInt(currentMonster['spawnTime'], 10);
  const monsterGoldInt = parseInt(currentMonster['monsterGold'], 10);
  const monsterScoreInt = parseInt(currentMonster['monsterScore'], 10);
  const monsterMoveSpeednt = parseInt(currentMonster['monsterMoveSpeed'], 10);

  const isMonsterInDb = dbMonsterData.find((monster) => monster.monsterId === monsterIdInt);
  if (isMonsterInDb) {
    if (
      isMonsterInDb.level !== monsterLevelInt ||
      isMonsterInDb.monsterHp !== monsterHpInt ||
      isMonsterInDb.monsterAttack !== monsterAttackInt ||
      isMonsterInDb.spawnTime !== monsterSpawnTimeInt ||
      isMonsterInDb.monsterGold !== monsterGoldInt ||
      isMonsterInDb.monsterScore !== monsterScoreInt ||
      isMonsterInDb.monsterMoveSpeed !== monsterMoveSpeednt ||
      isMonsterInDb.img !== currentMonster['img']
    ) {
      console.log(`몬스터 ${monsterIdInt} 업데이트!!!`);
      const promise = prisma.monster.update({
        data: {
          level: monsterLevelInt,
          monsterHp: monsterHpInt,
          monsterAttack: monsterAttackInt,
          spawnTime: monsterSpawnTimeInt,
          monsterGold: monsterGoldInt,
          monsterScore: monsterScoreInt,
          monsterMoveSpeed: monsterMoveSpeednt,
          img: currentMonster['img'],
        },
        where: { monsterId: monsterIdInt },
      });
      promiseAllMonster.push(promise);
    }
  } else {
    console.log(`${monsterIdInt} 삽입`);
    const promise = prisma.monster.create({
      data: {
        monsterId: monsterIdInt,
        level: monsterLevelInt,
        monsterHp: monsterHpInt,
        monsterAttack: monsterAttackInt,
        spawnTime: monsterSpawnTimeInt,
        monsterGold: monsterGoldInt,
        monsterScore: monsterScoreInt,
        monsterMoveSpeed: monsterMoveSpeednt,
        img: currentMonster['img'],
      },
    });
    promiseAllMonster.push(promise);
  }
}

// 모든 Promise 완료 처리
const results = await Promise.allSettled([
  ...promiseAllStages,
  ...promiseAllTowers,
  ...promiseAllMonster,
]);

results.forEach((result, index) => {
  if (result.status === 'rejected') {
    console.log(`작업 ${index}: 실패`, result.reason);
  }
});
