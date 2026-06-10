import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {
  getAllInfo,
  getAllRooms,
  getRoom,
  updateData,
  recordingStarted,
  recordingStopped,
  updateDataSection,
} from './controller.js';

const __dirname = import.meta.dirname;
const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'data.json');

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.static(path.join(__dirname, '../client')));

// Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});
// Get all suite configuration
app.get('/config', getAllInfo);
// Get all rooms info
app.get('/rooms', getAllRooms);
// Get specific room info
app.get('/rooms/:room', getRoom);
// Update json file
app.post('/update', updateData);

/** Endpoints for vocal assistant button state */
app.post('/recording/start', recordingStarted);
app.post('/recording/stop', recordingStopped);
app.post('/recording/update', updateDataSection);

// Socket connection is required to prompt client to switch page when button press is detected
const httpServer = createServer(app);
export const io = new Server(httpServer);
io.on('connection', (socket) => {
});
// Start the server
httpServer.listen(PORT, () => {
  console.log(`ARIS server listening on http://localhost:${PORT}`);
});
