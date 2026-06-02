// Controller functions to setup server routes and handle requests.
const fs = require("fs");
const path = require('path')
const DATA_PATH = path.join(__dirname, 'data.json')

/**
 * Returns the current system data by reading the JSON file.
 * @returns JSON object with the current system data.
 */
function readData() {
    try {
        const data = fs.readFileSync(DATA_PATH, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data:", err);
        return null;
    }
}
/**
 * Overwrites existing data in the JSON file with the provided data.
 * @param {*} data data to write.
 * @returns {boolean} true if the operation was successful, false otherwise.
 */
function writeData(data) {
    try {
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing data:", err);
        return false;
    }
    return true;
}

/* Controller Functions ──────────────────────────────────────────────── */
/**
 * Returns the configuration of the whole suite.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const getAllInfo = (req, res) => {
    const data = readData();
    if (data === null) return res.status(500).json({ error: "Error reading data" });
    res.status(200).json(data);
};
/**
 * Returns the list of all rooms.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const getAllRooms = (req, res) => {
    const data = readData();
    if (data === null) return res.status(500).json({ error: "Error reading data" });
    res.status(200).json(data.room_config.rooms);
};
/**
 * Returns the details of the specified room.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const getRoom = (req, res) => {
    if (!req.params.room) return res.status(400).json({ error: "Parameter 'room' missing" });
    const data = readData();
    if (data === null) return res.status(500).json({ error: "Error reading data" });
    const room = data.room_config.rooms[req.params.room];
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.status(200).json(room);
};

/**
 * Turn on or off the light specified by parameters 'room' and 'lightName'. If the light is on, it will be turned off and vice versa. If the light is turned off, its brightness will be set to 0.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const toggleLight = (req, res) => {
    if (!req.params.room || !req.params.lightName)
        return res.status(400).json({ error: "Parameters 'room' or 'lightName' missing" });
    const data = readData();
    if (data === null) return res.status(500).json({ error: "Error reading data" });
    const room = data.room_config.rooms[req.params.room];
    if (!room) return res.status(404).json({ error: "Room not found" });

    for (let light of room.lights) {
        if (light.name === req.params.lightName) {
            light.state = light.state === "on" ? "off" : "on";
            if (light.state === "off") light.brightness = 0;
            if (writeData(data)) {
                return res
                    .status(200)
                    .json(
                        "State of the light \'" +
                            light.name +
                            "\' toggled to \'" +
                            light.state +
                            "\' successfully",
                    );
            } else {
                return res.status(500).json({ error: "Error writing data" });
            }
        }
    }
    return res.status(404).json({ error: "Light not found" });
};
/**
 * Sets the brightness of the specified light in the 'room' and 'lightName' parameters. The brightness value is passed in the request body as 'value'.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const setLightBrightness = (req, res) => {
    if (!req.params.room || !req.params.lightName || !req.body.value)
        return res.status(400).json({ error: "Parameters 'room', 'lightName' or 'value' missing" });
    const data = readData();
    if (data === null) return res.status(500).json({ error: "Error reading data" });
    const room = data.room_config.rooms[req.params.room];
    if (!room) return res.status(404).json({ error: "Room not found" });

    for (let light of room.lights) {
        if (light.name === req.params.lightName) {
            light.brightness = Math.max(0, Math.min(100, parseInt(req.body.value)));
            light.state = light.brightness > 0 ? "on" : "off";
            if (writeData(data)) {
                return res
                    .status(200)
                    .json(
                        "Brightness of the light \'" +
                            light.name +
                            "\' updated to \'" +
                            light.brightness +
                            "\' successfully",
                    );
            } else {
                return res.status(500).json({ error: "Error writing data" });
            }
        }
    }
    return res.status(404).json({ error: "Light not found" });
};
/**
 * Toggles the state of the HVAC system in the specified room.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @returns
 */
const toggleHVAC = (req, res) => {
    if (!req.params.room) return res.status(400).json({ error: "Parameter 'room' missing" });
    const data = readData();
    if (data === null) return res.status(500).json({ error: "Error reading data" });
    const room = data.room_config.rooms[req.params.room];
    if (!room) return res.status(404).json({ error: "Room not found" });
    room.hvac.state = room.hvac.state === "on" ? "off" : "on";

    if (writeData(data)) {
        return res
            .status(200)
            .json("State of the HVAC updated to \'" + room.hvac.state + "\' successfully");
    } else {
        return res.status(500).json({ error: "Error writing data" });
    }
};
/**
 * Sets the target temperature for the HVAC system in the specified room.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const setTemperature = (req, res) => {
    if (!req.params.room || !req.body.value)
        return res.status(400).json({ error: "Parameter 'room' or 'value' missing" });
    const data = readData();
    if (data === null) return res.status(500).json({ error: "Error reading data" });
    const room = data.room_config.rooms[req.params.room];
    if (!room) return res.status(404).json({ error: "Room not found" });

    room.hvac.target_temp = Math.max(16, Math.min(30, parseFloat(req.body.value)));

    if (writeData(data)) {
        return res
            .status(200)
            .json(
                "Target temperature of the HVAC updated to \'" +
                    room.hvac.target_temp +
                    "\' successfully",
            );
    } else {
        return res.status(500).json({ error: "Error writing data" });
    }
};
/**
 * Toggles the state of the fan in the specified room.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const toggleFan = (req, res) => {
    if (!req.params.room) return res.status(400).json({ error: "Parameter 'room' missing" });
    const data = readData();
    if (data === null) return res.status(500).json({ error: "Error reading data" });
    const room = data.room_config.rooms[req.params.room];
    if (!room) return res.status(404).json({ error: "Room not found" });

    room.hvac.fan.state = room.hvac.fan.state === "on" ? "off" : "on";

    if (writeData(data)) {
        return res
            .status(200)
            .json("State of the fan toggled to \'" + room.hvac.fan.state + "\' successfully");
    } else {
        return res.status(500).json({ error: "Error writing data" });
    }
};
/**
 * Sets the speed of the fan in the specified room.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const setFanSpeed = (req, res) => {
    if (!req.params.room || !req.body.value)
        return res.status(400).json({ error: "Parameter 'room' or 'value' missing" });
    const data = readData();
    if (data === null) return res.status(500).json({ error: "Error reading data" });
    const room = data.room_config.rooms[req.params.room];
    if (!room) return res.status(404).json({ error: "Room not found" });

    room.hvac.fan.speed = Math.max(0, Math.min(100, parseInt(req.body.value)));
    room.hvac.fan.state = room.hvac.fan.speed > 0 ? "on" : "off";

    if (writeData(data)) {
        return res
            .status(200)
            .json("Fan speed updated to \'" + room.hvac.fan.speed + "\' successfully");
    } else {
        return res.status(500).json({ error: "Error writing data" });
    }
};

/**
 * Sets the position of a curtain in the specified room.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 */
const setCurtainPosition = (req, res) => {
    if (!req.params.room || !req.params.curtainName || !req.body.value)
        return res
            .status(400)
            .json({ error: "Parameter 'room', 'curtainName' or 'value' missing" });
    const data = readData();
    const room = data.room_config.rooms[req.params.room];
    if (!room) return res.status(404).json({ error: "Room not found" });

    for (let curtain of room.curtains) {
        if (curtain.name === req.params.curtainName) {
            curtain.state = req.body.value === "open" ? "open" : "closed";
            if (writeData(data)) {
                return res
                    .status(200)
                    .json(
                        "State of the curtain '" +
                            curtain.name +
                            "' toggled to \'" +
                            curtain.state +
                            "\' successfully",
                    );
            } else {
                return res.status(500).json({ error: "Error writing data" });
            }
        }
    }
    return res.status(404).json({ error: "Curtain not found" });
};

module.exports = {
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
};
