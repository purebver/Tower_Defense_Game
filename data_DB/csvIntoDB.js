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

// 데이터 삽입/업데이트/삭제를 처리하는 일반 함수
// dbData: DB에서 읽어온 데이터
// csvData: CSV 파일에서 읽은 데이터
// idField: 각 모델의 고유 식별자 속성
// modelName: Prisma에서 사용할 모델 이름
// fieldsToUpdate: 업데이트할 속성 목록
async function upsertData({ dbData, csvData, idField, modelName, fieldsToUpdate }) {
  // CSV에서 가져온 데이터의 고유 ID 저장
  const csvIds = csvData.map((item) => parseInt(item[idField], 10));
  // DB에서 가져온 데이터의 고유 ID 저장
  const dbIds = dbData.map((item) => item[idField]);

  // CSV에 없는 DB 데이터를 삭제
  const deleteIds = dbIds.filter((id) => !csvIds.includes(id));
  if (0 < deleteIds.length) {
    console.log(`삭제할 ${modelName} ID 목록: ${deleteIds.join(', ')}`);
    await prisma[modelName].deleteMany({
      where: {
        [idField]: { in: deleteIds },
      },
    });
  } else {
    console.log(`삭제할 ${modelName} 데이터가 없습니다.`);
  }

  // CSV 데이터를 처리
  const promiseAll = [];
  for (let i = 0; i < csvData.length; i++) {
    const currentData = csvData[i];
    const currentId = parseInt(currentData[idField], 10); // 현재 데이터의 ID
    const dbRecord = dbData.find((item) => item[idField] === currentId); // DB에서 같은 ID 찾기

    const updateData = {};
    fieldsToUpdate.forEach((field) => {
      if (typeof currentData[field] === 'string' && field !== 'img') {
        updateData[field] = parseInt(currentData[field], 10); // String을 Int로 변환
      } else {
        updateData[field] = currentData[field]; // 문자열 데이터는 그대로 유지
      }
    });

    if (dbRecord) {
      // 업데이트할 필요가 있는지 확인
      let needsUpdate = false;
      for (const field of fieldsToUpdate) {
        if (dbRecord[field] !== updateData[field]) {
          needsUpdate = true;
          break;
        }
      }

      if (needsUpdate) {
        console.log(`${modelName} ${currentId} 업데이트!!!!`);
        const promise = prisma[modelName].update({
          data: updateData,
          where: { [idField]: currentId },
        });
        promiseAll.push(promise);
      }
    } else {
      // DB에 없으면 새로 삽입
      console.log(`${currentId} 삽입`);
      const promise = prisma[modelName].create({
        data: {
          [idField]: currentId,
          ...updateData,
        },
      });
      promiseAll.push(promise);
    }
  }

  // 모든 DB 작업 실행
  await Promise.all(promiseAll);
}

// CSV 파일 읽기
const stageDataJson = await readCSV('./data_DB/csv_file/stage_data.csv');
const towerDataJson = await readCSV('./data_DB/csv_file/tower_data.csv');
const monsterDataJson = await readCSV('./data_DB/csv_file/monster_data.csv');

// Stage 데이터 처리
const dbStageData = await prisma.stage.findMany({
  select: { stageId: true, stageStartScore: true },
});
await upsertData({
  dbData: dbStageData,
  csvData: stageDataJson,
  idField: 'stageId',
  modelName: 'stage',
  fieldsToUpdate: ['stageStartScore'],
});

// Tower 데이터 처리
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
await upsertData({
  dbData: dbTowerData,
  csvData: towerDataJson,
  idField: 'towerId',
  modelName: 'tower',
  fieldsToUpdate: ['towerCost', 'towerAttack', 'towerSpeed', 'towerRange', 'img'],
});

// Monster 데이터 처리
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
await upsertData({
  dbData: dbMonsterData,
  csvData: monsterDataJson,
  idField: 'monsterId',
  modelName: 'monster',
  fieldsToUpdate: [
    'level',
    'monsterHp',
    'monsterAttack',
    'spawnTime',
    'monsterGold',
    'monsterScore',
    'monsterMoveSpeed',
    'img',
  ],
});

// 모든 Promise 완료 처리
console.log('모든 데이터 처리가 완료되었습니다.');
