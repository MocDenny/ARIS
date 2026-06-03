const express = require("express");
const fs = require("fs");
const path = require("path");
const {
    getAllInfo,
    getAllRooms,
    getRoom,
    toggleLight,
    setLightBrightness,
    toggleHVAC,
    setTemperature,
    toggleFan,
    setFanSpeed,
    setCurtainPosition,
} = require("./controller.js");

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, "data.json");

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(express.static(path.join(__dirname, "../client")));

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});
// Get all suite configuration
app.get("/config", getAllInfo);
// Get all rooms info
app.get("/rooms", getAllRooms);
// Get specific room info
app.get("/rooms/:room", getRoom);
// Toggle light state
app.post("/rooms/:room/lights/:lightName/toggle", toggleLight);
// Set light brightness
app.post("/rooms/:room/lights/:index/brightness", setLightBrightness);
// Toggle HVAC state
app.post("/rooms/:room/hvac/toggle", toggleHVAC);
// Set target temperature
app.post("/rooms/:room/hvac/target", setTemperature);
// Toggle fan state
app.post("/rooms/:room/hvac/fan/toggle", toggleFan);
// Set fan speed
app.post("/rooms/:room/hvac/fan/speed", setFanSpeed);
// Set curtain position
app.post("/rooms/:room/curtains/:curtainName/position", setCurtainPosition);

// Start the server
app.listen(PORT, () => {
    console.log(`ARIS server listening on http://localhost:${PORT}`);
});
