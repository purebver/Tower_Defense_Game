import handlerMappings from './handlerMapping.js';
import { createTowers } from '../models/tower.model.js';
import { createMonsters } from '../models/monster.model.js';
import { getUser, removeUser } from '../models/user.model.js';

export const handlerEvent = async (socket, accountId, data) => {
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'handler not found' });
  }

  const response = handler(accountId, data);

  socket.emit('response', response);
};

export const handleConnection = async (socket, accountId) => {
  console.log(`New user connected!`);

  createTowers(accountId);
  createMonsters(accountId);

  socket.emit('connection', { status: 'success', message: 'New user connected' });
};

export const handleDisconnect = (accountId) => {
  removeUser(accountId);
  console.log(`User disconnected: ${accountId}`);
  console.log('Current users: ', getUser());
};
