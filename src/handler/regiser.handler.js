import { getData } from '../init/data.js';
import { handleConnection, handleDisconnect, handlerEvent } from './handler.event.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const registerHandler = (io) => {
  io.on('connection', async (socket) => {
    //connection 이벤트 처리
    //클라이언트가 보낸 token
    const [tokenType, token] = socket.handshake.auth.token.split(' ');
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    //토큰에서 id분리
    const accountId = decodedToken.id;
    console.log('accountId: ', accountId);

    console.log('user connection');

    //프리즈마로 tower데이터 받아오기
    const { towers, monsters, stages } = getData();
    //받은 데이터 emit으로 클라이언트에게 보내주기
    socket.emit('datainfo', {
      towers,
      monsters,
      stages,
    });

    //접속 후
    handleConnection(socket, accountId);
    socket.on('event', (data) => handlerEvent(socket, accountId, data));

    //접속 해제 시 이벤트
    socket.on('disconnect', () => {
      handleDisconnect(accountId);
      console.log('user disconnect');
    });
  });
};

export default registerHandler;
