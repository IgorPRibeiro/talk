import React from 'react';
import socketio from 'socket.io-client';

export const socket = socketio('http://localhost:9090', {
  autoConnect: false,
  reconnection: false,
});
export const SocketContext = React.createContext();
