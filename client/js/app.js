import { init, render } from './render.js';
import { io } from 'https://cdn.socket.io/4.8.3/socket.io.esm.min.js';
import { renderVocal } from './screens/vocal.js';

init();

// Socket connection
const socket = io();
socket.on('recordingStarted', () => {
  // Check validity
  if (document.getElementById('full-screen').innerHTML == '') {
    // Load correct audio page
    renderVocal();
  }
});
socket.on('recordingStopped', () => {
  // Check validity
  if (document.getElementById('full-screen').innerHTML != '') {
    // Re-activate nav
    document.body.style.setProperty('background-color', '#fff');
    document.getElementById('full-screen').innerHTML = '';
    document
      .getElementById('side-nav')
      .style.setProperty('visibility', 'visible');
    document
      .getElementById('room-bar')
      .style.setProperty('visibility', 'visible');

    setTimeout(() => {
      render();
    }, 600);
  }
});
