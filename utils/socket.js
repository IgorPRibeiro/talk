import {io} from 'socket.io-client';
const socket = io('http://localhost:9090', {
  autoConnect: false,
  reconnection: false,
});
export default socket;
