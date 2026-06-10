// Functions that handle server queries without exposing the internal structure of the server data.
const BASE = 'http://localhost:3000';

// In the html pages, ensure no conflicting write request appearing simulteneusly

/*Get info ──────────────────────────────────────────────── */
/**
 * Retrieves all suite configuration information.
 */
async function getAllInfo() {
  const res = await fetch(`${BASE}/config`);
  return res.json();
}
/**
 * Retrieves all rooms.
 */
async function getRooms() {
  const res = await fetch(`${BASE}/rooms`);
  return res.json();
}
// Retrieves details of a specific room by its name.
async function getRoom(roomName) {
  const res = await fetch(`${BASE}/rooms/${roomName}`);
  return res.json();
}

/*Update ──────────────────────────────────────────────── */

async function updateData() {
  const res = await fetch(`${BASE}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export {
  getAllInfo,
  getRooms,
  getRoom,
  updateData
};
