import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/prisma.client.js';

const env = process.env;
const router = express.Router();

/**
 * @desc 회원가입 API
 * @author 우종
 */

router.post('/sign-up', async (req, res, next) => {
  try {
    // 요청 본문값
    const { userId, pw } = req.body;

    // 동일한 아이디
    const isExistUserId = await prisma.user.findFirst({
      where: { userId: userId },
    });

    // 유효성 검사
    if (isExistUserId) {
      return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
    }

    if (!pw) {
      return res.status(400).json({ message: '비밀번호를 입력해주세요.' });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(pw, 10);

    // account 테이블에 데이터 추가
    await prisma.user.create({
      data: { userId, pw: hashedPassword },
    });

    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
    });
  } catch (err) {
    console.error('회원가입 에러:', err);
  }
});

/**
 * @desc 로그인 API
 * @author 우종
 */
router.post('/sign-in', async (req, res, next) => {
  try {
    // 요청 본문값
    const { userId, pw } = req.body;

    // 유저 아이디 조회
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    // 유효성 검사
    if (!user) {
      return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
    }
    if (!(await bcrypt.compare(pw, user.pw))) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 토큰 발급
    const token = jwt.sign({ userId: user.id }, env.JWT_KEY, {
      expiresIn: '30m',
    });
    res.header('Authorization', ` ${env.JWT_KEY} ${token}`);

    return res.status(200).json({
      message: '로그인이 성공했습니다.',
    });
  } catch (err) {
    console.error('로그인 에러', err);
  }
});
export default router;
