import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';

/* 
  어딘가에 엑세스 토큰이 저장이 안되어 있다면 로그인을 유도하는 코드를 여기에 추가해주세요!
*/

let serverSocket; // 서버 웹소켓 객체
let animationId;
let interval;
let isPaused = false;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// const NUM_OF_MONSTERS = 5; // 몬스터 개수
const MIN_MONSTER_ID = 300; // 가장 작은 몬스터 id
let lastSpawnedMonsterId = MIN_MONSTER_ID; // 마지막에 소환된 몬스터 id

//강화시 체력 / 기본 체력/ 강화비용
let upgradeIndex = 0; //기지 강화 수치 초기값

let userGold = 5000; // 유저 골드
let base; // 기지 객체
let firstHp = 1000; // 시작시 초기 체력
let baseHp = firstHp; // 기지 체력

let towerData = [];
let monsterData = [];
let stageData = [];
let baseData = [];

let selectedTowerIndex = null; //선택된 타워 index

let towerCost = 0; // 타워 구입 비용
let numOfInitialTowers = 3; // 초기 타워 개수
let monsterLevel = 0; // 몬스터 레벨
let monsterSpawnInterval = 2000; // 몬스터 생성 주기

/* 보스 몬스터 */
const BOSS_SPAWN_PERIOD = 5000;
const BOSS_MONSTER_ID = 500;
let isBossSpawned = false;
let bossSpawnScore = 5000;
let bossMultiplier = 1;
let bossMonsterInfo = null;

const monsters = [];
const towers = [];

let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수
let isInitGame = false;

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';

// const baseImage = new Image();
// baseImage.src = 'images/base.png';

const pathImage = new Image();
pathImage.src = 'images/path.png';

// const monsterImages = [];
// for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
//   const img = new Image();
//   img.src = `images/monster${i}.png`;
//   monsterImages.push(img);
// }

let monsterPath;

function generateRandomMonsterPath() {
  const path = [];
  let currentX = 0;
  let currentY = Math.floor(Math.random() * 21) + 500; // 500 ~ 520 범위의 y 시작 (캔버스 y축 중간쯤에서 시작할 수 있도록 유도)

  path.push({ x: currentX, y: currentY });

  while (currentX < canvas.width) {
    currentX += Math.floor(Math.random() * 100) + 50; // 50 ~ 150 범위의 x 증가
    // x 좌표에 대한 clamp 처리
    if (currentX > canvas.width) {
      currentX = canvas.width;
    }

    currentY += Math.floor(Math.random() * 200) - 100; // -100 ~ 100 범위의 y 변경
    // y 좌표에 대한 clamp 처리
    if (currentY < 0) {
      currentY = 0;
    }
    if (currentY > canvas.height) {
      currentY = canvas.height;
    }

    path.push({ x: currentX, y: currentY });
  }

  return path;
}

function initMap() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 그리기
  drawPath();
}

/**
 * @desc 기지 강화 로직
 * @author 우종
 * @abstract 기지 강화 버튼을 누르면 upgradeIndex를 +1 해줌 upgradeIndex를 타워랑 공유하여 기지 레벨이 오르면 타워 레벨도 ++
 */

function baseUpgrade() {
  //[0,1000,2000,4000,8000]
  let baseMaxHp = baseData[upgradeIndex].baseHp; //기지 최대 체력
  // console.log('기지ID', baseMaxHp);
  //업그레이드 가능 여부 체크

  //조건이 만족할경우 서버로 데이터를 쏴주는 부분
  if (userGold >= baseData[upgradeIndex].baseUpgradeCost) {
    if (upgradeIndex < baseData.length - 1) {
      serverSocket.emit('event', {
        handlerId: 35,
        currentUpgradeIndex: upgradeIndex, //현재 강화 단계
        currentGold: userGold, //현재 골드

        base: base,
      });

      console.log('기지 강화 성공');
      // placeBase();
    } else {
      console.log('최대치임');
    }
  } else {
    console.log('돈없음');
  }
}

function drawPath() {
  const segmentLength = 20; // 몬스터 경로 세그먼트 길이
  const imageWidth = 60; // 몬스터 경로 이미지 너비
  const imageHeight = 60; // 몬스터 경로 이미지 높이
  const gap = 5; // 몬스터 경로 이미지 겹침 방지를 위한 간격

  for (let i = 0; i < monsterPath.length - 1; i++) {
    const startX = monsterPath[i].x;
    const startY = monsterPath[i].y;
    const endX = monsterPath[i + 1].x;
    const endY = monsterPath[i + 1].y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 피타고라스 정리로 두 점 사이의 거리를 구함 (유클리드 거리)
    const angle = Math.atan2(deltaY, deltaX); // 두 점 사이의 각도는 tan-1(y/x)로 구해야 함 (자세한 것은 역삼각함수 참고): 삼각함수는 변의 비율! 역삼각함수는 각도를 구하는 것!

    for (let j = gap; j < distance - gap; j += segmentLength) {
      // 사실 이거는 삼각함수에 대한 기본적인 이해도가 있으면 충분히 이해하실 수 있습니다.
      // 자세한 것은 https://thirdspacelearning.com/gcse-maths/geometry-and-measure/sin-cos-tan-graphs/ 참고 부탁해요!
      const x = startX + Math.cos(angle) * j; // 다음 이미지 x좌표 계산(각도의 코사인 값은 x축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 x축 좌표를 구함)
      const y = startY + Math.sin(angle) * j; // 다음 이미지 y좌표 계산(각도의 사인 값은 y축 방향의 단위 벡터 * j를 곱하여 경로를 따라 이동한 y축 좌표를 구함)
      drawRotatedImage(pathImage, x, y, imageWidth, imageHeight, angle);
    }
  }
}

function drawRotatedImage(image, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function getRandomPositionNearPath(maxDistance) {
  // 타워 배치를 위한 몬스터가 지나가는 경로 상에서 maxDistance 범위 내에서 랜덤한 위치를 반환하는 함수!
  const segmentIndex = Math.floor(Math.random() * (monsterPath.length - 1));
  const startX = monsterPath[segmentIndex].x;
  const startY = monsterPath[segmentIndex].y;
  const endX = monsterPath[segmentIndex + 1].x;
  const endY = monsterPath[segmentIndex + 1].y;

  const t = Math.random();
  const posX = startX + t * (endX - startX);
  const posY = startY + t * (endY - startY);

  const offsetX = (Math.random() - 0.5) * 2 * maxDistance;
  const offsetY = (Math.random() - 0.5) * 2 * maxDistance;

  return {
    x: posX + offsetX,
    y: posY + offsetY,
  };
}

function placeInitialTowers() {
  const towerInfo = towerData.find((a) => a.towerId === 100);

  let tower;
  for (let i = 0; i < numOfInitialTowers; i++) {
    const { x, y } = getRandomPositionNearPath(0);
    tower = new Tower(
      x,
      y,
      towerInfo.towerCost,
      towerInfo.towerAttack,
      towerInfo.towerRange,
      towerInfo.towerSpeed,
      towerInfo.towerId,
      towerInfo.img,
    );
    towers.push(tower);
    tower.draw(ctx);
  }
  serverSocket.emit('event', {
    handlerId: 30,
    tower: towers,
    numOfInitialTowers: numOfInitialTowers,
    towerObj: towerInfo.towerId,
  });
}

function placeNewTower() {
  //기지와 공유하는 인덱스를 담은 변수
  const upgradeTower = towerData[upgradeIndex].towerId;
  const upgradePrice = towerData[upgradeIndex].towerCost;
  // console.log(upgradePrice);
  const towerInfo = towerData.find((a) => a.towerId === upgradeTower);
  // console.log('타워번호', upgradeTower);

  //돈이 없을때 타워구매를 시도한 경우
  if (userGold < towerInfo.towerCost) {
    showMessage(`타워를 구입까지 ${upgradePrice - userGold}Gold 가 더 필요합니다`);
    return;
  }

  // console.log('towerNum:', upgradeTower);

  let currentGold = userGold;
  userGold -= towerInfo.towerCost;

  const { x, y } = getRandomPositionNearPath(0);

  const tower = new Tower(
    x,
    y,
    towerInfo.towerCost,
    towerInfo.towerAttack,
    towerInfo.towerRange,
    towerInfo.towerSpeed,
    towerInfo.towerId,
    towerInfo.img,
  );
  towers.push(tower);
  tower.draw(ctx);

  serverSocket.emit('event', {
    handlerId: 32,
    currentGold: currentGold,
    afterGold: userGold,
    currentTower: towers,
    towerObj: towerInfo.towerId,
  });
  serverSocket.emit('event', {
    handlerId: 33,
    tower: tower,
  });
  showMessage('타워를 설치했습니다.');
  // console.log(tower);
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  const upgradeBase = baseData[upgradeIndex].baseId;
  const baseInfo = baseData.find((a) => a.baseId === upgradeBase);
  base = new Base(lastPoint.x, lastPoint.y, baseHp, baseInfo);
  base.draw(ctx);
  serverSocket.emit('event', {
    handlerId: 35,
    base: base,
    currentUpgradeIndex: upgradeIndex,
  });
}

function spawnMonster() {
  if (isBossSpawned || (score >= bossSpawnScore && monsters.length > 0)) {
    return;
  }

  if (score >= bossSpawnScore && monsters.length === 0) {
    spawnBossMonster();
    return;
  }

  let mobId;
  if (monsterLevel === 0) {
    mobId = MIN_MONSTER_ID;
  } else {
    // 이전에 생성된 몬스터와 다른 ID를 선택
    const lowerMobId = MIN_MONSTER_ID + monsterLevel - 1;
    const higherMobId = MIN_MONSTER_ID + monsterLevel;
    mobId = lastSpawnedMonsterId === lowerMobId ? higherMobId : lowerMobId;
  }
  lastSpawnedMonsterId = mobId;
  if (Math.random() < 0.1) {
    mobId = 400 + monsterLevel;
  }
  const monsterInfo = monsterData.find((a) => a.monsterId === mobId);
  console.log('monsterInfo: ', monsterInfo);
  monsters.push(new Monster(monsterPath, monsterInfo));
  serverSocket.emit('event', {
    handlerId: 10,
    monster: monsterInfo,
  });
}

function spawnBossMonster() {
  if (!bossMonsterInfo) {
    console.error('Boss monster info not found');
    return;
  }

  const bossMultiplierInfo = {
    ...bossMonsterInfo,
    monsterHp: bossMonsterInfo.monsterHp * bossMultiplier,
    level: bossMonsterInfo.level * bossMultiplier,
  };

  console.log('bossMultiplierInfo: ', bossMultiplierInfo);
  monsters.push(new Monster(monsterPath, bossMultiplierInfo));

  isBossSpawned = true;

  serverSocket.emit('event', {
    handlerId: 10,
    monster: bossMultiplierInfo,
  });
}

function gameLoop() {
  // 렌더링 시에는 항상 배경 이미지부터 그려야 합니다! 그래야 다른 이미지들이 배경 이미지 위에 그려져요!
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 배경 이미지 다시 그리기
  drawPath(monsterPath); // 경로 다시 그리기

  ctx.font = '25px Times New Roman';
  ctx.fillStyle = 'skyblue';
  ctx.fillText(`최고 기록: ${highScore}`, 100, 50); // 최고 기록 표시
  ctx.fillStyle = 'white';
  ctx.fillText(`점수: ${score}`, 100, 100); // 현재 스코어 표시
  ctx.fillStyle = 'yellow';
  ctx.fillText(`골드: ${userGold}`, 100, 150); // 골드 표시
  ctx.fillStyle = 'black';
  ctx.fillText(`현재 레벨: ${monsterLevel}`, 100, 200); // 최고 기록 표시

  // 타워 그리기 및 몬스터 공격 처리
  if (selectedTowerIndex !== null) {
    drawTowerSelection(selectedTowerIndex);
  }
  towers.forEach((tower) => {
    tower.draw(ctx);
    tower.updateCooldown();
    monsters.forEach((monster) => {
      const distance = Math.sqrt(
        Math.pow(tower.x - monster.x, 2) + Math.pow(tower.y - monster.y, 2),
      );
      if (distance < tower.range) {
        if (tower.cooldown <= 0) {
          const beforeHp = monster.hp;
          tower.attack(monster);
          serverSocket.emit('event', {
            handlerId: 31,
            tower,
            monster,
            beforeHp,
          });
        }
      }
    });
  });
  // 몬스터가 공격을 했을 수 있으므로 기지 다시 그리기
  base.draw(ctx);

  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    if (monster.hp > 0) {
      const isDestroyed = monster.move(base);

      if (isDestroyed) {
        /* 게임 오버 */
        serverSocket.emit('event', {
          handlerId: 2,
          score,
        });
        alert('당신은 못으로 더럽혀졌습니다...');
        location.reload();
      }
      monster.draw(ctx);
    } else if (monster.hp < -9000) {
      if (monster.monsterId === BOSS_MONSTER_ID) {
        isBossSpawned = false;
        bossSpawnScore += BOSS_SPAWN_PERIOD;
      }
      monsters.splice(i, 1);
    } else {
      /* 몬스터가 죽었을 때 */
      userGold += monster.monsterGold; // 몬스터가 주는 골드 추가
      score += monster.monsterScore; // 몬스터가 주는 점수 추가
      console.log(monster);
      serverSocket.emit('event', {
        handlerId: 11,
        monster: {
          monsterId: monster.monsterId,
          monsterScore: monster.monsterScore,
          monsterGold: monster.monsterGold,
        },
      });

      if (monster.monsterId === BOSS_MONSTER_ID) {
        bossMultiplier *= 2;
        isBossSpawned = false;
        bossSpawnScore += BOSS_SPAWN_PERIOD;
      }
      monsters.splice(i, 1);
    }
  }

  // 다음 스테이지가 존재하면
  if (stageData[monsterLevel + 1]) {
    // 다음 스테이지로 넘어갈 점수가 달성됐다면
    if (score > stageData[monsterLevel + 1].stageStartScore) {
      serverSocket.emit('event', {
        handlerId: 21,
        nowLevel: monsterLevel,
        nextLevel: monsterLevel + 1,
        clientUserGold: userGold,
      });
      monsterLevel += 1;
      console.log('level up');
    }
  }

  //pause 상태가 아니라면 gameLoop 함수 호출
  if (!isPaused) {
    requestAnimationFrame(gameLoop); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
  }
}

function initGame() {
  if (isInitGame) {
    return;
  }

  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)
  placeBase(); // 기지 배치
  bossMonsterInfo = monsterData.find((a) => a.monsterId === BOSS_MONSTER_ID); // 보스 몬스터 정보 불러오기

  interval = setInterval(spawnMonster, monsterSpawnInterval); // 설정된 몬스터 생성 주기마다 몬스터 생성
  gameLoop(); // 게임 루프 최초 실행
  isInitGame = true;
  console.log('게임시작: initGame()');
  serverSocket.emit('event', {
    handlerId: 1,
  });
  placeInitialTowers(); // 설정된 초기 타워 개수만큼 사전에 타워 배치
}

// 이미지 로딩 완료 후 서버와 연결하고 게임 초기화
Promise.all([
  new Promise((resolve) => (backgroundImage.onload = resolve)),
  // new Promise((resolve) => (baseImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  // ...monsterImages.map((img) => new Promise((resolve) => (img.onload = resolve))),
]).then(() => {
  /* 서버 접속 코드 (여기도 완성해주세요!) */

  let somewhere = localStorage.getItem('Authorization');
  serverSocket = io('http://localhost:3000', {
    auth: {
      token: somewhere, // 토큰이 저장된 어딘가에서 가져와야 합니다!
    },
  });
  serverSocket.on('datainfo', async ({ towers, monsters, stages, bases, userHighScore }) => {
    towerData.push(...towers);
    monsterData.push(...monsters);
    stageData.push(...stages);
    baseData.push(...bases);
    highScore = userHighScore;
    console.log('datainfo get');
    if (!isInitGame) {
      initGame();
    }
  });
  serverSocket.on('connection', (data) => {
    console.log(data);
  });
  serverSocket.on('response', (data) => {
    console.log(data);
    if (data.error) {
      alert(data.message);
      location.reload();
    }
  });

  //서버에서 기지강화정보 받아오는 부분
  serverSocket.on('base', (data) => {
    upgradeIndex = data.index;
    userGold = data.gold;
    baseHp = data.hp;
    placeBase();
  });
});

//버튼 조정 로직
const stopButton = document.createElement('button');
stopButton.textContent = '일시 정지';
stopButton.style.position = 'absolute';
stopButton.style.top = '10px';
stopButton.style.right = '520px';
stopButton.style.padding = '10px 20px';
stopButton.style.fontSize = '16px';
stopButton.style.cursor = 'pointer';

stopButton.addEventListener('click', pauseGame);

document.body.appendChild(stopButton);

const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '350px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';

buyTowerButton.addEventListener('click', placeNewTower);

document.body.appendChild(buyTowerButton);

const sellTowerButton = document.createElement('button');
sellTowerButton.textContent = '타워 판매';
sellTowerButton.style.position = 'absolute';
sellTowerButton.style.top = '10px';
sellTowerButton.style.right = '180px';
sellTowerButton.style.padding = '10px 20px';
sellTowerButton.style.fontSize = '16px';
sellTowerButton.style.cursor = 'pointer';

sellTowerButton.addEventListener('click', () => {
  const sellTowers = sellTower();
  if (sellTowers) {
    const sellTowerPrice = towerData[upgradeIndex].towerCost;
    showMessage(`타워를 판매해 ${sellTowerPrice}Gold를 획득했습니다..`);
  } else {
    showMessage('타워를 지정해주세요');
  }
});

document.body.appendChild(sellTowerButton);

let selectedTower = null;

const baseUpgradeButton = document.createElement('button');
baseUpgradeButton.textContent = '기지 강화';
baseUpgradeButton.style.position = 'absolute';
baseUpgradeButton.style.top = '10px';
baseUpgradeButton.style.right = '10px';
baseUpgradeButton.style.padding = '10px 20px';
baseUpgradeButton.style.fontSize = '16px';
baseUpgradeButton.style.cursor = 'pointer';

baseUpgradeButton.addEventListener('click', () => {
  const baseUpgradePrice = baseData[upgradeIndex].baseUpgradeCost;
  if (userGold >= baseData[upgradeIndex].baseUpgradeCost) {
    if (upgradeIndex < baseData.length - 1) {
      baseUpgrade();
      showMessage('기지를 강화합니다!');
      // placeBase();
    } else if (
      (userGold >= baseUpgradePrice && upgradeIndex >= baseData.length - 1) ||
      (userGold <= baseUpgradePrice && upgradeIndex >= baseData.length - 1)
    ) {
      showMessage('이미 기지가 최고단계입니다!');
    }
  } else {
    showMessage(`기지 강화는 ${baseUpgradePrice - userGold}Gold 가 더 필요합니다.`);
  }
});

document.body.appendChild(baseUpgradeButton);

//일시정지 텍스트
const pauseText = document.createElement('text');
pauseText.textContent = '';
pauseText.style.position = 'absolute';
pauseText.style.top = '50%';
pauseText.style.right = '45%';
pauseText.style.fontSize = '60px';
document.body.appendChild(pauseText);

/**
 * @desc 메시지 표시 함수
 * @author 우종
 * @todo 버튼 클릭시 기능에 맞는 메시지 출력
 */

function showMessage(message) {
  const messageBox = document.createElement('div'); //div:컨테이너
  messageBox.textContent = message;
  messageBox.style.position = 'absolute'; // 다른 요소와 안겹치게 하고 원하는 위치에 배치
  messageBox.style.top = '200px'; //상단 위치
  messageBox.style.left = '50%';
  messageBox.style.transform = 'translateX(-50%)'; //x축 -50% 해서 가운데로
  messageBox.style.backgroundColor = 'transparent'; // 배경 투명하게
  messageBox.style.fontSize = '60px';
  messageBox.style.color = 'white';
  messageBox.style.padding = '10px';
  messageBox.style.borderRadius = '5px';
  messageBox.style.zIndex = 10000; //다른 요소 위에 표시되도록 하는거
  messageBox.style.transition = 'transform 0.5s ease, opacity 0.5s ease'; // 애니메이션 추가
  document.body.appendChild(messageBox); // body에 메시지박스를 생성

  // 애니메이션 시작: 위로 이동 및 투명도 변경
  setTimeout(() => {
    messageBox.style.transform = 'translate(-50%, -50px)'; // 위로 이동
    messageBox.style.opacity = '0'; // 투명도 변경
  }, 0);
  //1.5초후 메시지 사라지게
  setTimeout(() => {
    document.body.removeChild(messageBox); // 1.5초후 메시지박스 삭제
  }, 1500);
}

/**
 * @author 우종
 * @todo 버튼 키보드로 누르게 하는게 편해보임 z,x,c,space에 할당해주고싶음
 * @abstract 여기다가 버튼클릭시 올라올 텍스트도 넣어주면 될듯
 */

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'z':
      buyTowerButton.click(); //z 누르면 타워 구입
      break;
    case 'x':
      sellTowerButton.click(); //x 누르면 타워 판매
      break;
    case 'c':
      baseUpgradeButton.click(); //c 누르면 기지 강화
      break;
    case ' ': //스페이스바 = 공백처리
      stopButton.click(); //스페이스바 누르면 일시정지
  }
});

//타워 선택 및 판매 메서드
function sellTower() {
  if (selectedTowerIndex !== null) {
    const [tower] = towers.splice(selectedTowerIndex, 1);
    const beforeGold = userGold;
    userGold += tower.cost;
    serverSocket.emit('event', {
      handlerId: 34,
      beforeGold,
      userGold: userGold,
      selectedTowerIndex,
    });
    selectedTowerIndex = null;
    return true;
  }
  return false;
}

function drawTowerSelection(index) {
  const tower = towers[index];
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 10;
  ctx.strokeRect(tower.x + tower.width / 2 - 2.5, tower.y - 15, 10, 10);
}

function selectTower(x, y, tower) {
  return x > tower.x && x < tower.x + tower.width && y > tower.y && y < tower.y + tower.height;
}

canvas.addEventListener('click', (coordinate) => {
  const rect = canvas.getBoundingClientRect();
  const x = coordinate.clientX - rect.left;
  const y = coordinate.clientY - rect.top;

  let boolean = false;

  towers.forEach((tower, index) => {
    if (selectTower(x, y, tower)) {
      selectedTowerIndex = index;
      boolean = true;
    }
  });

  if (!boolean) {
    selectedTowerIndex = null;
  }
});

// 게임 일시정지 메서드
function pauseGame() {
  const background = document.getElementById('gameCanvas');

  if (isPaused) {
    background.style.opacity = '1';
    stopButton.textContent = '일시 정지';
    pauseText.textContent = '';
    isPaused = false;
    interval = setInterval(spawnMonster, monsterSpawnInterval);
    gameLoop();
  } else {
    background.style.opacity = '0.5';
    stopButton.textContent = '계속 하기';
    pauseText.textContent = '일시 정지';
    isPaused = true;
    clearInterval(interval);
    cancelAnimationFrame(animationId);
  }
}
