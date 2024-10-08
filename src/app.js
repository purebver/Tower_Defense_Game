import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';

const app = express();
const server = createServer(app);
const PORT = 3000;

app.use(express.json());
app.use(express.static('tower_defense_client'));

initSocket(server);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
