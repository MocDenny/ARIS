// Functions that handle server queries without exposing the internal structure of the server data.
const BASE = 'http://localhost:3000'

/*Rooms ──────────────────────────────────────────────── */

/**
 * Retrieves all rooms.
 */
async function getRooms() {
  const res = await fetch(`${BASE}/rooms`)
  return res.json()
}
// Retrieves details of a specific room by its name.
async function getRoom(roomName) {
  const res = await fetch(`${BASE}/rooms/${roomName}`)
  return res.json()
}

/*Ligths ────────────────────────────────────────────────── */

/**
 * Toggles light in a specific room.
 * @param {*} roomName room name 
 * @param {*} lightName light name
 */
async function toggleLight(roomName, lightName) {
  const res = await fetch(`${BASE}/rooms/${roomName}/lights/${lightName}/toggle`, {
    method: 'POST',
  })
  return res.json()
}
/**
 * Sets the brightness of a specific light in a room.
 * @param {*} roomName room name
 * @param {*} lightName light name
 * @param {*} value brightness value (0-100)
 */
async function setBrightness(roomName, lightName, value) {
  const res = await fetch(`${BASE}/rooms/${roomName}/lights/${lightName}/brightness`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  return res.json()
}

/*HVAC ──────────────────────────────────────────── */

/**
 * Sets the target temperature for a specific room.
 * @param {*} roomName room name
 * @param {*} value temperature value
 */
async function setTargetTemp(roomName, value) {
  const res = await fetch(`${BASE}/rooms/${roomName}/hvac/target`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  return res.json()
}
/**
 * Toggles the HVAC system in a specific room.
 * @param {*} roomName room name
 */
async function toggleHVAC(roomName) {
  const res = await fetch(`${BASE}/rooms/${roomName}/hvac/toggle`, {
    method: 'POST',
  })
  return res.json()
}
/**
 * Toggles the fan in a specific room.
 * @param {*} roomName room name
 */
async function toggleFan(roomName) {
  const res = await fetch(`${BASE}/rooms/${roomName}/hvac/fan/toggle`, {
    method: 'POST',
  })
  return res.json()
}
/**
 * Sets the speed of the fan in a specific room.
 * @param {*} roomName room name
 * @param {*} value fan speed value
 */
async function setFanSpeed(roomName, value) {
  const res = await fetch(`${BASE}/rooms/${roomName}/hvac/fan/speed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  return res.json()
}

/*Curtains ───────────────────────────────────────────────── */

/**
 * Sets the position of a specific curtain in a room.
 * @param {*} roomName room name
 * @param {*} curtainName curtain name
 * @param {*} value position value
 */
async function setCurtainPosition(roomName, curtainName, value) {
  const res = await fetch(`${BASE}/rooms/${roomName}/curtains/${curtainName}/position`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  return res.json()
}
/**
 * Compatibility alias for setting blind position.
 * @param {*} roomName room name
 * @param {*} blindName blind name
 * @param {*} value position value
 */
async function setBlindPosition(roomName, blindName, value) {
  return setCurtainPosition(roomName, blindName, value)
}

export {
  getRooms,
  getRoom,
  toggleLight,
  setBrightness,
  setTargetTemp,
  toggleHVAC,
  toggleFan,
  setFanSpeed,
  setCurtainPosition,
  setBlindPosition
}