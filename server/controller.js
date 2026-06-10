// Controller functions to setup server routes and handle requests.
import fs from 'fs';
import path from 'path';
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
 * Overwrites existing data in the JSON file with the given data in the body of the request.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const updateData = (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'Missing body' });
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(req.body, null, 2));
  } catch (err) {
    return res.status(500).json({ error: 'Error writing data' });
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
 * Updates the configuration of the whole suite by merging the requested partial JSON with the body parameter.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const updateDataSection = async (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'Missing body' });

  // Get whole room configuration
  const data = readData();
  if (data === null)
    return res.status(500).json({ error: 'Error reading data' });

  // Change the retrieved room configuration and then update the JSON file
  const mergedData = deepMerge(data, req.body);
  const result = await wrapper.updateData(mergedData);
  return res.json(result);
};

/**
 * Takes target object and updates it with the keys and values of the source object.
 * @param {*} target object to modify
 * @param {*} source object with the information to transfer
 * @returns modified target object
 */
function deepMerge(target, source) {
  for (const key in source) {
    // Change json only if a key exists in the target object
    if (key in target) {
      if (source[key] instanceof Object) {
        if (Array.isArray(source[key]) && Array.isArray(target[key])) {
          source[key].forEach((srcItem) => {
            if (srcItem && srcItem.name) {
              const targetItem = target[key].find(
                (t) => t.name === srcItem.name
              );
              if (targetItem) {
                deepMerge(targetItem, srcItem);
              }
            }
          });
        } else {
          Object.assign(target[key], deepMerge(target[key], source[key]));
        }
      } else {
        target[key] = validateField(key, target[key], source[key]);
      }
    }
  }
  return target;
}

/**
 * Validates modified data of the room. The deepMerge function does not add other fields, but might introduce invalid values in the json.
 * @param {*} key object key that has to be modified
 * @param {*} currentValue current value of object
 * @param {*} newValue value to update the object with
 */
function validateField(key, currentValue, newValue) {
  if (key == 'speed' || key == 'brightness') {
    // Value has to be a number between 0-100
    if (!isNaN(newValue)) {
      newValue = Number(newValue);
      // Check number is between 0-100
      return Math.min(100, Math.max(0, newValue));
    }
  } else if (key == 'eco_mode' || key == 'learning_mode' || key == 'state') {
    // Accepted value are only open, closed, on, off
    const curtainsValues = ['open', 'closed'];
    const standardValues = ['on', 'off'];
    if (curtainsValues.includes(curtainsValues)) {
      if (curtainsValues.includes(newValue)) {
        return newValue;
      }
    } else {
      if (standardValues.includes(newValue)) {
        return newValue;
      }
    }
  } else if (key == 'target_temp' || key == 'current_temp') {
    // Value has to be a number between 16-30
    if (!isNaN(newValue)) {
      newValue = Number(newValue);
      // Check number is between 16-30
      return Math.min(30, Math.max(16, newValue));
    }
  }
  // Otherwise field cannot be changed
  return currentValue;
}

export {
  getAllInfo,
  getAllRooms,
  getRoom,
  updateData,
  updateDataSection,
  recordingStarted,
  recordingStopped,
};
