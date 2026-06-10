import { init } from './render.js';
import { io } from 'https://cdn.socket.io/4.8.3/socket.io.esm.min.js';

init();
// Socket connection
const socket = io();
socket.on('recordingStarted', () => {
  console.log('Go to to Audio Wave screen'); 
});
socket.on('recordingStopped', () => {
  console.log('Exit Audio Wave screen'); 
});

