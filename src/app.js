import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import cors from 'cors';

const app = express();
const server = createServer(app);
const PORT = 3000;

app.use(cors());
app.use(express.json());

initSocket(server);

server.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
