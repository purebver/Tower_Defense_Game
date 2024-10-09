import { getData } from '../init/data.js';
import { handleConnection, handlerEvent } from './handler.event.js';

const registerHandler = (io) => {
  io.on('connection', async (socket) => {
    //connection 이벤트 처리
    //클라이언트가 보낸 token
    const token = socket.handshake.auth.token;

    console.log('token: ', token);

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
    handleConnection(token);
    socket.on('event', (data) => handlerEvent(socket, token, data));

    //접속 해제 시 이벤트
    socket.on('disconnect', () => {
      console.log('user disconnect');
    });
  });
};

export default registerHandler;
