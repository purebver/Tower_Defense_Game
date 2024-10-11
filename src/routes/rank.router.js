import express from 'express';
import { prisma } from '../utils/prisma/prisma.client.js';

const router = express.Router();

router.get('/ranking', async (req, res, next) => {
  try {
    const top3 = await prisma.user.findMany({
      take: 3,
      orderBy: {
        highScore: 'desc',
      },
      select: {
        userId: true,
        highScore: true,
      },
    });
    return res.status(200).json({ ...top3 });
  } catch (err) {
    console.error('회원가입 에러:', err);
  }
});

export default router;
