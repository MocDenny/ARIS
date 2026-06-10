// Controller functions to setup server routes and handle requests.
import fs from 'fs';
import path from 'path';
import { getRoomConfig } from '../client/js/render.js';
import * as wrapper from '../client/wrapper.js';

const __dirname = import.meta.dirname;
const DATA_PATH = path.join(__dirname, 'data.json');

/**
 * Returns the current system data by reading the JSON file.
 * @returns JSON object with the current system data.
 */
function readData() {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading data:', err);
    return null;
  }
}

/* Controller Functions ──────────────────────────────────────────────── */
/**
 * Returns the configuration of the whole suite.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const getAllInfo = (req, res) => {
  const data = readData();
  if (data === null)
    return res.status(500).json({ error: 'Error reading data' });
  res.status(200).json(data);
};
function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            if (Array.isArray(source[key]) && Array.isArray(target[key])) {
                source[key].forEach(srcItem => {
                    if (srcItem && srcItem.name) {
                        const targetItem = target[key].find(t => t.name === srcItem.name);
                        if (targetItem) {
                            deepMerge(targetItem, srcItem);
                        } else {
                            target[key].push(srcItem);
                        }
                    } else {
                        // Se non c'è name, non sappiamo come fare il merge, quindi aggiungiamo o sostituiamo.
                    }
                });
            } else {
                Object.assign(target[key], deepMerge(target[key], source[key]));
            }
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

/**
 * Updates the configuration of the whole suite by merging the requested partial JSON.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const updateAllInfo = (req, res) => {
    if (!req.body) return res.status(400).json({ error: "Body missing" });
    
    const data = readData();
    if (data === null) return res.status(500).json({ error: "Error reading data" });

    // Effettua un deep merge dei dati
    const mergedData = deepMerge(data, req.body);

    if (writeData(mergedData)) {
        return res.status(200).json("System data updated successfully");
    } else {
        return res.status(500).json({ error: "Error writing data" });
    }
};
/**
 * Returns the list of all rooms.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const getAllRooms = (req, res) => {
  const data = readData();
  if (data === null)
    return res.status(500).json({ error: 'Error reading data' });
  res.status(200).json(data.room_config.rooms);
};
/**
 * Returns the details of the specified room.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const getRoom = (req, res) => {
  if (!req.params.room)
    return res.status(400).json({ error: "Parameter 'room' missing" });
  const data = readData();
  if (data === null)
    return res.status(500).json({ error: 'Error reading data' });
  const room = data.room_config.rooms[req.params.room];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.status(200).json(room);
};

/**
 * Overwrites existing data in the JSON file with the sdata saved in the application's state.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const updateData = (req, res) => {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(getRoomConfig(), null, 2));
  } catch (err) {
    return res.status(400).json({ error: "Error writing data" });
  }
  return res.status(200).json('Successfully updated json');
};

/* Button push detectors ──────────────────────────────────────────────── */
const recordingStarted = (req, res) => {
  return res.status(200).json('Successfully sent signal');
};

const recordingStopped = (req, res) => {
  return res.status(200).json('Successfully sent signal');
};

/* Other Vocal assistant endpoints */
/**
 * Returns all room information after synchronizing information with the application state.
 * @param {*} req
 * @param {*} res 
 */
const getSyncData =  async (req, res) => {
  // update json with state
  await wrapper.updateData();
  return res.status(200).json(getRoomConfig());
};

/**
 * Updates state and json file, with the partial information given.
 * @param {*} req
 * @param {*} res 
 */
const partialUpdateData =  async (req, res) => {
  //
  await wrapper.updateData();
  return res.status(200).json(getRoomConfig());
};

export {
  getAllInfo,
  getAllRooms,
  getRoom,
  updateData,
  updateAllInfo,
  partialUpdateData,
  recordingStarted,
  recordingStopped,
  getSyncData
};
