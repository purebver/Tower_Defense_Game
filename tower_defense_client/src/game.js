import { Base } from './base.js';
import { Monster } from './monster.js';
import { Tower } from './tower.js';

/* 
  어딘가에 엑세스 토큰이 저장이 안되어 있다면 로그인을 유도하는 코드를 여기에 추가해주세요!
*/

let serverSocket; // 서버 웹소켓 객체
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const NUM_OF_MONSTERS = 5; // 몬스터 개수

let userGold = 0; // 유저 골드
let base; // 기지 객체
let baseHp = 0; // 기지 체력

let towerData = [];
let monsterData = [];
let stageData = [];

let towerCost = 0; // 타워 구입 비용
let numOfInitialTowers = 3; // 초기 타워 개수
let monsterLevel = 0; // 몬스터 레벨
let monsterSpawnInterval = 1000; // 몬스터 생성 주기

const monsters = [];
const towers = [];

let score = 0; // 게임 점수
let highScore = 0; // 기존 최고 점수
let isInitGame = false;

// 이미지 로딩 파트
const backgroundImage = new Image();
backgroundImage.src = 'images/bg.webp';

const baseImage = new Image();
baseImage.src = 'images/base.png';

const pathImage = new Image();
pathImage.src = 'images/path.png';

const monsterImages = [];
for (let i = 1; i <= NUM_OF_MONSTERS; i++) {
  const img = new Image();
  img.src = `images/monster${i}.png`;
  monsterImages.push(img);
}

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
  /* 
    타워를 초기에 배치하는 함수입니다.
    무언가 빠진 코드가 있는 것 같지 않나요? 
  */
  console.log('towerData 연결?', towerData);

  const towerInfo = towerData.find((a) => a.towerId === 100);
  console.log('towerInfo 연결', towerInfo);

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
  const randomTowerId = Math.floor(Math.random() * 5) + 100;
  const towerInfo = towerData.find((a) => a.towerId === randomTowerId);

  if (userGold < towerInfo.towerCost) {
    alert('message: 타워 구입에 필요한 금액이 부족합니다.');
    return;
  }
  console.log('towerNum:', randomTowerId);
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
  console.log(tower);
}

function placeBase() {
  const lastPoint = monsterPath[monsterPath.length - 1];
  base = new Base(lastPoint.x, lastPoint.y, baseHp);
  base.draw(ctx, baseImage);
}

function spawnMonster() {
  const monsterInfo = monsterData.find((a) => a.monsterId === 300);
  console.log(monsterInfo);
  monsters.push(new Monster(monsterPath, monsterImages, monsterInfo));

  serverSocket.emit('event', {
    handlerId: 10,
    monster: monsterInfo,
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
  base.draw(ctx, baseImage);

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
        alert('게임 오버. 스파르타 본부를 지키지 못했다...ㅠㅠ');
        location.reload();
      }
      monster.draw(ctx);
    } else {
      /**
       * @desc 골드, 점수 추가
       * @author 민석
       * @abstract 몬스터가 죽었을때 DB에 저장되어있는 몬스터 ID에 해당된 골드, 점수 ++
       */
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
      });
      monsterLevel += 1;
      console.log('level up');
    }
  }

  requestAnimationFrame(gameLoop); // 지속적으로 다음 프레임에 gameLoop 함수 호출할 수 있도록 함
}

function initGame() {
  if (isInitGame) {
    return;
  }

  monsterPath = generateRandomMonsterPath(); // 몬스터 경로 생성
  initMap(); // 맵 초기화 (배경, 몬스터 경로 그리기)
  placeBase(); // 기지 배치

  setInterval(spawnMonster, monsterSpawnInterval); // 설정된 몬스터 생성 주기마다 몬스터 생성
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
  new Promise((resolve) => (baseImage.onload = resolve)),
  new Promise((resolve) => (pathImage.onload = resolve)),
  ...monsterImages.map((img) => new Promise((resolve) => (img.onload = resolve))),
]).then(() => {
  /* 서버 접속 코드 (여기도 완성해주세요!) */

  let somewhere = localStorage.getItem('Authorization');
  serverSocket = io('http://localhost:3000', {
    auth: {
      token: somewhere, // 토큰이 저장된 어딘가에서 가져와야 합니다!
    },
  });
  serverSocket.on('datainfo', async ({ towers, monsters, stages }) => {
    towerData.push(...towers);
    monsterData.push(...monsters);
    stageData.push(...stages);
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
  });

  /* 
    서버의 이벤트들을 받는 코드들은 여기다가 쭉 작성해주시면 됩니다! 
    e.g. serverSocket.on("...", () => {...});
    이 때, 상태 동기화 이벤트의 경우에 아래의 코드를 마지막에 넣어주세요! 최초의 상태 동기화 이후에 게임을 초기화해야 하기 때문입니다! 
    
  */
});

const buyTowerButton = document.createElement('button');
buyTowerButton.textContent = '타워 구입';
buyTowerButton.style.position = 'absolute';
buyTowerButton.style.top = '10px';
buyTowerButton.style.right = '10px';
buyTowerButton.style.padding = '10px 20px';
buyTowerButton.style.fontSize = '16px';
buyTowerButton.style.cursor = 'pointer';

buyTowerButton.addEventListener('click', placeNewTower);

document.body.appendChild(buyTowerButton);