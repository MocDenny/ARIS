const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3000
const DATA_PATH = path.join(__dirname, 'data.json')

app.use(express.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// serve i file del client
app.use(express.static(path.join(__dirname, '../client')))

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

// casa
app.get('/', (req, res) => {
  res.json(readData())
})

// Stanze
app.get('/rooms', (req, res) => {
  const data = readData()
  res.json(data.room_config.rooms)
})

app.get('/rooms/:room', (req, res) => {
  const data = readData()
  const room = data.room_config.rooms[req.params.room]
  if (!room) return res.status(404).json({ error: 'Stanza non trovata' })
  res.json(room)
})

//Light
app.post('/rooms/:room/lights/:index/toggle', (req, res) => {
  const data = readData()
  const room = data.room_config.rooms[req.params.room]
  if (!room) return res.status(404).json({ error: 'Stanza non trovata' })

  const light = room.lights[req.params.index]
  if (!light) return res.status(404).json({ error: 'Luce non trovata' })

  light.state = light.state === 'on' ? 'off' : 'on'
  if (light.state === 'off') light.brightness = 0

  writeData(data)
  res.json(light)
})

app.post('/rooms/:room/lights/:index/brightness', (req, res) => {
  const data = readData()
  const room = data.room_config.rooms[req.params.room]
  if (!room) return res.status(404).json({ error: 'Stanza non trovata' })

  const light = room.lights[req.params.index]
  if (!light) return res.status(404).json({ error: 'Luce non trovata' })

  light.brightness = Math.max(0, Math.min(100, parseInt(req.body.value)))
  light.state = light.brightness > 0 ? 'on' : 'off'

  writeData(data)
  res.json(light)
})

// HVAC 
app.post('/rooms/:room/hvac/toggle', (req, res) => {
  const data = readData()
  const room = data.room_config.rooms[req.params.room]
  if (!room) return res.status(404).json({ error: 'Stanza non trovata' })

  room.hvac.state = room.hvac.state === 'on' ? 'off' : 'on'

  writeData(data)
  res.json(room.hvac)
})

app.post('/rooms/:room/hvac/target', (req, res) => {
  const data = readData()
  const room = data.room_config.rooms[req.params.room]
  if (!room) return res.status(404).json({ error: 'Stanza non trovata' })

  room.hvac.target_temp = Math.max(16, Math.min(30, parseFloat(req.body.value)))

  writeData(data)
  res.json(room.hvac)
})

//Fan
app.post('/rooms/:room/hvac/fan/toggle', (req, res) => {
  const data = readData()
  const room = data.room_config.rooms[req.params.room]
  if (!room) return res.status(404).json({ error: 'Stanza non trovata' })

  room.hvac.fan.state = room.hvac.fan.state === 'on' ? 'off' : 'on'

  writeData(data)
  res.json(room.hvac.fan)
})

app.post('/rooms/:room/hvac/fan/speed', (req, res) => {
  const data = readData()
  const room = data.room_config.rooms[req.params.room]
  if (!room) return res.status(404).json({ error: 'Stanza non trovata' })

  room.hvac.fan.speed = Math.max(0, Math.min(100, parseInt(req.body.value)))
  room.hvac.fan.state = room.hvac.fan.speed > 0 ? 'on' : 'off'

  writeData(data)
  res.json(room.hvac.fan)
})

// Tende
app.post('/rooms/:room/curtains/:index/position', (req, res) => {
  const data = readData()
  const room = data.room_config.rooms[req.params.room]
  if (!room) return res.status(404).json({ error: 'Stanza non trovata' })

  const curtain = room.curtains[req.params.index]
  if (!curtain) return res.status(404).json({ error: 'Tenda non trovata' })

  curtain.state = req.body.value === 'open' ? 'open' : 'closed'

  writeData(data)
  res.json(curtain)
})

// Avvio
app.listen(PORT, () => {
  console.log(`ARIS server in ascolto su http://localhost:${PORT}`)
})