// json that saves room configuration and returns information
let room_config = {
    room_number: "405",
    rooms: {
        bedroom: {
            name: "Bedroom",
            lights: [
                {
                    name: "ceiling_light_1",
                    state: "off",
                    brightness: 0
                },
                {
                    name: "bedside_lamp_1",
                    state: "off",
                    brightness: 0
                }
            ],
            hvac: {
                state: "on",
                target_temp: 20.0,
                current_temp: 19.0,
                fan: {
                    state: "on",
                    speed: 10
                }

            },
            curtains: [
                {
                    name: "window_blind_1",
                    state: "open"
                },
                {
                    name: "window_blind_2",
                    state: "closed"
                }
            ]
        },
        bathroom: {
            name: "Bathroom",
            lights: [
                {
                    name: "ceiling_light_1",
                    state: "off",
                    brightness: 0
                }
            ],
            hvac: {
                state: "on",
                target_temp: 20.0,
                current_temp: 19.0,
                fan: {
                    state: "on",
                    speed: 10
                }

            },
            curtains: [
                {
                    name: "window_blind_1",
                    state: "open"
                }
            ]
        },
        living_room: {
            name: "Living Room",
            lights: [
                {
                    name: "ceiling_light_1",
                    state: "off",
                    brightness: 0
                },
                {
                    name: "ceiling_light_2",
                    state: "on",
                    brightness: 50
                }
            ],
            hvac: {
                state: "on",
                target_temp: 20.0,
                current_temp: 19.0,
                fan: {
                    state: "on",
                    speed: 10
                }

            },
            curtains: [
                {
                    name: "window_blind_1",
                    state: "open"
                },
                {
                    name: "window_blind_2",
                    state: "closed"
                }
            ]
        },
    },
    eco_mode: "off",
    settings: {
        learning_mode: "off"
    }

};

function get_room_info() {
    return room_config;
}

function update_light_state(room_name, light_name, new_state) {
    for (let light of room_config.rooms[room_name].lights) {
        if (light.name === light_name) {
            light.state = new_state;
            break;
        }
    }

}

function update_light_brightness(room_name, light_name, new_brightness) {
    for (let light of room_config.rooms[room_name].lights) {
        if (light.name === light_name) {
            light.brightness = new_brightness;
            break;
        }
    }

}

function update_temp(room_name, new_temp) {
    room_config[room_name].hvac.target_temp = new_temp;
}

function update_fan_state(room_name, new_state) {
    room_config[room_name].hvac.fan.state = new_state;
}

function update_fan_speed(room_name, new_speed) {
    room_config[room_name].hvac.fan.speed = new_speed;
}

function update_curtain_state(room_name, curtain_name, new_state) {
    for (let curtain of room_config[room_name].curtains) {
        if (curtain.name === curtain_name) {
            curtain.state = new_state;
            break;
        }
    }
}

function update_eco_mode(new_state) {
    room_config.eco_mode = new_state;
}

function update_learning_mode(new_state) {
    room_config.settings.learning_mode = new_state;
}

export { get_room_info, update_light_state, update_light_brightness, update_temp, update_fan_state, update_fan_speed, update_curtain_state, update_eco_mode, update_learning_mode };