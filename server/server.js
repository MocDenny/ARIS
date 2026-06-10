import express from 'express';
import fs from 'fs';
import path from 'path';
import {
  getAllInfo,
  getAllRooms,
  getRoom,
  updateData,
  recordingStarted,
  recordingStopped,
  getSyncData,
  partialUpdateData,
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
app.get('/recording/rooms', getSyncData);
app.post('/recording/update', partialUpdateData);

// Start the server
app.listen(PORT, () => {
  console.log(`ARIS server listening on http://localhost:${PORT}`);
});
