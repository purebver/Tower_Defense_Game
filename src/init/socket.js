import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handler/regiser.handler.js';

//html서버로 소켓io연결
const initSocket = (server) => {
  const io = new SocketIO();
  io.attach(server);

  registerHandler(io);
};

export default initSocket;
