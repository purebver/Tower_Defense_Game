import { getData } from '../init/data.js';
import { handleConnection, handleDisconnect, handlerEvent } from './handler.event.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { addUser } from '../models/user.model.js';
import { createBase } from '../models/base.model.js';

dotenv.config();

const registerHandler = (io) => {
  io.on('connection', async (socket) => {
    try {
      const [tokenType, token] = socket.handshake.auth.token.split(' ');
      const decodedToken = jwt.verify(token, process.env.JWT_KEY);

      //토큰에서 id분리
      const accountId = decodedToken.id;
      console.log('accountId: ', accountId);

      //유저 추가
      addUser({ accountId, socketId: socket.id });

      console.log('user connection');
      //setBase
      createBase(accountId);

      //프리즈마로 tower데이터 받아오기
      const { towers, monsters, stages, bases } = getData();

      //받은 데이터 emit으로 클라이언트에게 보내주기
      socket.emit('datainfo', {
        towers,
        monsters,
        stages,
        bases,
      });

      //접속 후
      handleConnection(socket, accountId);
      socket.on('event', (data) => handlerEvent(socket, accountId, data));

      //접속 해제 시 이벤트
      socket.on('disconnect', () => {
        handleDisconnect(accountId);
        console.log('user disconnect');
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.error('Token expired at: ', error.expiredAt);
        socket.emit('response', {
          message: '토큰이 만료되었습니다. 다시 로그인 해주세요.',
          error: true,
        });
        return socket.disconnect(true); // 만료 시 연결 종료
      }
    }
  });
};

export default registerHandler;
