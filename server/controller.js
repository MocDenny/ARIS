// Controller functions to setup server routes and handle requests.
const fs = require('fs');
const path = require('path');
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
 * Overwrites existing data in the JSON file with the provided data.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const updateData = (req, res) => {
  if (!req.body || !req.body.data)
    return res.status(400).json({ error: "Parameter 'data' missing" });
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(req.body.data, null, 2));
  } catch (err) {
    return res.status(400).json({ error: "Parameter 'data' missing" });
  }
  return res.status(200).json('Successfully updated json');
};

module.exports = {
  getAllInfo,
  getAllRooms,
  getRoom,
  updateData
};
