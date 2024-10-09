import handlerMappings from './handlerMapping.js';

export const handlerEvent = async (socket, data) => {
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'handler not found' });
  }

  // const response = handler(data.);
};
