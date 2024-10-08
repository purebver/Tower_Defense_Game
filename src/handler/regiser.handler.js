const registerHandler = (io) => {
  io.on('connection', (socket) => {
    //connection 이벤트 처리
    //접속
    console.log('user connection');
    //접속 후

    //접속 해제 시 이벤트
    socket.on('disconnect', () => {
      console.log('user disconnect');
    });
  });
};

export default registerHandler;
