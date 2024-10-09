import handlerMappings from './handlerMapping.js';
import createTowers from '../models/tower.model.js';

export const handlerEvent = async (socket, token, data) => {
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'handler not found' });
  }

  const response = handler(token, data);

  socket.emit('response', response);
};

export const handleConnection = async (socket, token) => {
  console.log(`New user connected!`);

  createTowers(token);

  socket.emit('connection', { status: 'success', message: 'New user connected' });
};
