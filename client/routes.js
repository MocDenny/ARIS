// client/js/api.js
// Unico file che conosce l'indirizzo del server.
// Tutto il resto dell'app non sa che esiste un server.

const BASE = 'http://localhost:3000'

/*Casa 

// Restituisce lo stato completo della casa
export async function getHome() {
  const res = await fetch(`${BASE}/`)
  return res.json()
}

/*Stanze ──────────────────────────────────────────────── */

// Restituisce tutte le stanze
export async function getRooms() {
  const res = await fetch(`${BASE}/rooms`)
  return res.json()
}

// Restituisce una stanza specifica
export async function getRoom(roomId) {
  const res = await fetch(`${BASE}/rooms/${roomId}`)
  return res.json()
}

/*Luci ────────────────────────────────────────────────── */

// Accende o spegne una luce
export async function toggleLight(roomId, lightId) {
  const res = await fetch(`${BASE}/rooms/${roomId}/lights/${lightId}/toggle`, {
    method: 'POST',
  })
  return res.json()
}

// Imposta la luminosità (0-100)
export async function setBrightness(roomId, lightId, value) {
  const res = await fetch(`${BASE}/rooms/${roomId}/lights/${lightId}/brightness`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  return res.json()
}

/*Termostato ──────────────────────────────────────────── */

// Imposta la temperatura target
export async function setTargetTemp(roomId, value) {
  const res = await fetch(`${BASE}/rooms/${roomId}/hvac/target`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  return res.json()
}

// Accende o spegne il termostato
export async function toggleHVAC(roomId) {
  const res = await fetch(`${BASE}/rooms/${roomId}/hvac/toggle`, {
    method: 'POST',
  })
  return res.json()
}

// Accende o spegne la ventola
export async function toggleFan(roomId) {
  const res = await fetch(`${BASE}/rooms/${roomId}/hvac/fan/toggle`, {
    method: 'POST',
  })
  return res.json()
}

// Imposta la velocità della ventola
export async function setFanSpeed(roomId, value) {
  const res = await fetch(`${BASE}/rooms/${roomId}/hvac/fan/speed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  return res.json()
}

/*Tende ───────────────────────────────────────────────── */

// Imposta lo stato della tenda (aperta/chiusa)
export async function setCurtainPosition(roomId, index, value) {
  const res = await fetch(`${BASE}/rooms/${roomId}/curtains/${index}/position`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  return res.json()
}

// Alias per compatibilità
export async function setBlindPosition(roomId, blindId, value) {
  return setCurtainPosition(roomId, blindId, value)
}


