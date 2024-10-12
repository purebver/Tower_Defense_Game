export class Monster {
  constructor(path, monsterInfo) {
    // 생성자 안에서 몬스터의 속성을 정의한다고 생각하시면 됩니다!
    if (!path || path.length <= 0) {
      throw new Error('몬스터가 이동할 경로가 필요합니다.');
    }
    this.monsterId = monsterInfo.monsterId;
    // this.monsterNumber = Math.floor(Math.random() * monsterImages.length); // 몬스터 번호 (1 ~ 5. 몬스터를 추가해도 숫자가 자동으로 매겨집니다!)
    this.path = path; // 몬스터가 이동할 경로
    this.currentIndex = 0; // 몬스터가 이동 중인 경로의 인덱스
    this.x = path[0].x; // 몬스터의 x 좌표 (최초 위치는 경로의 첫 번째 지점)
    this.y = path[0].y; // 몬스터의 y 좌표 (최초 위치는 경로의 첫 번째 지점)
    /* 보스라면 크기 2배 속도는 절반 */
    const bossMultiplier = monsterInfo.monsterId === 500 ? 2 : 1;
    this.width = 80 * bossMultiplier; // 몬스터 이미지 가로 길이
    this.height = 80 * bossMultiplier; // 몬스터 이미지 세로 길이
    this.speed = monsterInfo.monsterMoveSpeed / bossMultiplier; // 몬스터의 이동 속도
    // this.image = monsterImages[this.monsterNumber]; // 몬스터 이미지
    this.level = monsterInfo.level; // 몬스터 레벨
    this.maxHp = monsterInfo.monsterHp; // 몬스터의 현재 HP
    this.attackPower = monsterInfo.monsterAttack; // 몬스터의 공격력 (기지에 가해지는 데미지)
    this.monsterGold = monsterInfo.monsterGold; // 몬스터 골드
    this.monsterScore = monsterInfo.monsterScore; // 몬스터 스코어

    /**
     * @author 우종
     * @todo 보스 몬스터 이미지에 애니메이션 효과 넣어줘야함
     */

    this.img = [];
    if (this.monsterId === 500) {
      // 보스 몬스터의 경우 이미지 2개
      this.img.push(new Image(), new Image());
      this.img[0].src = monsterInfo.img; // 첫 번째 보스 이미지
      this.img[1].src = '/images/octoBoss2.png'; // 두 번째 보스 이미지
    } else {
      //일반 몬스터의 경우 이미지 1개
      this.img.push(new Image());
      this.img[0].src = monsterInfo.img; // 일반 몬스터 이미지
    }
    //프레임 수를 카운트 하여 일정 프레임마다 현재 이미지 인덱스를 변경해 주기
    this.currentImgIndex = 0; //이미지 인덱스
    this.frameCounter = 0; // 프레임 카운터 초기값
    this.init();
  }

  init() {
    this.hp = this.maxHp; // 몬스터의 현재 HP
  }

  move(base) {
    if (this.currentIndex < this.path.length - 1) {
      const nextPoint = this.path[this.currentIndex + 1];
      const deltaX = nextPoint.x - this.x;
      const deltaY = nextPoint.y - this.y;
      // 2차원 좌표계에서 두 점 사이의 거리를 구할 땐 피타고라스 정리를 활용하면 됩니다! a^2 = b^2 + c^2니까 루트를 씌워주면 되죠!
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < this.speed) {
        // 거리가 속도보다 작으면 다음 지점으로 이동시켜주면 됩니다!
        this.currentIndex++;
      } else {
        // 거리가 속도보다 크면 일정한 비율로 이동하면 됩니다. 이 때, 단위 벡터와 속도를 곱해줘야 해요!
        this.x += (deltaX / distance) * this.speed; // 단위 벡터: deltaX / distance
        this.y += (deltaY / distance) * this.speed; // 단위 벡터: deltaY / distance

        /**
         * @author 우종
         */

        this.frameCounter++; //프레임 카운터 증가 시켜서 이미지 전환을 위한 카운트 준비

        //10프레임마다 이미지 전환
        if (this.frameCounter % 10 === 0) {
          //프레임 카운터가 10의 배수일 때 마다 현재 이미지의 인덱스를 변경
          this.currentImgIndex = (this.currentImgIndex + 1) % this.img.length;
          //현재 이미지 인덱스를 증가시키고 이미지 배열의길이로 나눈 나머지를 사용하여 인덱스를 순회함
          //이미지 배열의 끝에 도달할 경우 처음으로 돌아감
        }
      }
      return false;
    } else {
      const isDestroyed = base.takeDamage(this.attackPower); // 기지에 도달하면 기지에 데미지를 입힙니다!
      this.hp = -9999; // 몬스터는 이제 기지를 공격했으므로 자연스럽게 소멸해야 합니다.
      return isDestroyed;
    }
  }

  draw(ctx) {
    //현재 이미지 인덱스를 사용하여 배열에서 이미지를 선택할 수 있게 변경
    if (this.img[this.currentImgIndex] && this.img[this.currentImgIndex].complete) {
      //현재 인덱스에 맞는 이미지를 그릴수 있도록 인덱스 추가
      ctx.drawImage(this.img[this.currentImgIndex], this.x, this.y, this.width, this.height);
      ctx.font = '12px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`(레벨 ${this.level}) ${this.hp}/${this.maxHp}`, this.x, this.y - 5);
    } else {
      //이미지가 로드되지 않았을 경우 onload 이벤트 처리
      if (this.img[this.currentImgIndex]) {
        this.img[this.currentImgIndex].onload = () => {
          ctx.drawImage(this.img[this.currentImgIndex], this.x, this.y, this.width, this.height);
          ctx.font = '12px Arial';
          ctx.fillStyle = 'white';
          ctx.fillText(`(레벨 ${this.level}) ${this.hp}/${this.maxHp}`, this.x, this.y - 5);
        };
      }
    }
  }
}
