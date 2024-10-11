import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import UserRouter from './routes/user.router.js';
import RankRouter from './routes/rank.router.js';
import cors from 'cors';
import { readData } from './init/data.js';

const app = express();
const server = createServer(app);
const PORT = 3000;

app.use(
  cors({
    origin: 'http://localhost:8080', // 클라이언트의 주소
    exposedHeaders: ['Authorization'],
  }),
);
app.use(express.json());
app.use('/api', [UserRouter, RankRouter]);

initSocket(server);

server.listen(PORT, async () => {
  console.log(PORT, '포트로 서버가 열렸어요!');

  try {
    const gameData = await readData();
    console.log('gameData loaded successfully');
  } catch (e) {
    console.error('Failed to load gameData: ', e);
  }
});
