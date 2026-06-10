/**
 * General Logic:
 * 1. STATE (`state`): Store current state of the client (active tab, selected room and the object with information about all rooms fetched from the server).
 * 2. INITIALIZATION (`init`): On startup, load data from the server via APIs exported from `wrapper.js`,
 *    configure listeners for navigation (sections and rooms) and start the initial rendering.
 * 3. NAVIGATION: Clicking on section buttons (Lights, Climate, Blinds) or room buttons (Bedroom, Bathroom, Living Room),
 *    update the local state and call the main function `render()`.
 * 4. DYNAMIC RENDERING (`renderLights`, `renderClimate`, `renderBlinds`): Generates dynamically the HTML starting from the data in the state.
 *    Associates each device button (lights, hvac, blinds) with a listener that makes an API call to update the device state on the server,
 *    reloads the updated data, and refreshes the interface.
 */

import * as api from '../wrapper.js';
import { renderLights } from './screens/light.js';
import { renderClimate } from './screens/climate.js';
import { renderBlinds } from './screens/curtains.js';
import { renderSettings } from './screens/settings.js';
import { renderEco } from './screens/eco.js';

/**
 * State variable to keep track of the current tab, selected room, and the current state of the suite.
 * */
const state = {
  tab: 'lights',
  room: 'bedroom',
  suiteConfig: {},
};
/**
 * Returns room config stored in the state variable.
 */
export function getRoomConfig(){
  return state.suiteConfig
}
/**
 * Sets room config of the state variable.
 * @param {*} roomConfig complete room configuration used to update state
 */
export function setRoomConfig(roomConfig){
  state.suiteConfig = roomConfig;
}

//-----------------------------------------------------------
export async function init() {
  state.suiteConfig = await api.getAllInfo();
  await createSecNavBar();
  await createRoomBar();
  render();
}

//-----------------------------------------------------------

/**
 * Creates the lateral navigation bar for sections (Lights, Climate, Blinds) and attaches event listeners to update the state and re-render the interface when a section is selected.
 */
async function createSecNavBar() {
  // Before changing tab update room configuration changes on JSON room configuration file
  document.getElementById('nav-lights').addEventListener('click', async () => {
    state.tab = 'lights';
    const res = api.updateData();
    if (res.error) {
      // Error updating data
      console.error(res.error);
    }
    render();
  });
  document.getElementById('nav-climate').addEventListener('click', async () => {
    state.tab = 'climate';
    const res = await api.updateData();
    if (res.error) {
      console.error(res.error);
    }
    render();
  });
  document.getElementById('nav-blinds').addEventListener('click', async () => {
    state.tab = 'blinds';
    const res = await api.updateData();
    if (res.error) {
      console.error(res.error);
    }
    render();
  });
  document.getElementById('nav-eco').addEventListener('click', async () => {
    state.tab = 'eco';
    const res = await api.updateData();
    if (res.error) {
      console.error(res.error);
    }
    render();
  });
  document
    .getElementById('nav-settings')
    .addEventListener('click', async () => {
      state.tab = 'settings';
      const res = await api.updateData();
      if (res.error) {
        console.error(res.error);
      }
      render();
    });
}

/**
 * Creates the navigation bar for the rooms (Bedroom, Bathroom, Living Room) and attaches event listeners to update the state and re-render the interface when a room is selected.
 */
async function createRoomBar() {
  document.getElementById('nav-bedroom').addEventListener('click', async () => {
    state.room = 'bedroom';
    const res = await api.updateData();
    if (res.error) {
      console.error(res.error);
    }
    render();
  });
  document
    .getElementById('nav-bathroom')
    .addEventListener('click', async () => {
      state.room = 'bathroom';
      const res = await api.updateData();
      if (res.error) {
        console.error(res.error);
      }
      render();
    });
  document
    .getElementById('nav-living_room')
    .addEventListener('click', async () => {
      state.room = 'living_room';
      const res = await api.updateData();
      if (res.error) {
        console.error(res.error);
      }
      render();
    });
}

/**
 * Renders the screen based on the current state.
 */
function render() {
  switch (state.tab) {
    case 'lights':
      renderLights(state);
      break;
    case 'climate':
      renderClimate(state);
      break;
    case 'blinds':
      renderBlinds(state);
      break;
    case 'settings':
      renderSettings(state);
      break;
    case 'eco':
      renderEco(state);
      break;
  }
}
