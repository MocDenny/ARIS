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
  previousTab: 'lights',
  goBack() {
    state.tab = state.previousTab;
    render();
  }
};

//-----------------------------------------------------------
export async function init() {
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
    render();
  });
  document.getElementById('nav-climate').addEventListener('click', async () => {
    state.tab = 'climate';
    render();
  });
  document.getElementById('nav-blinds').addEventListener('click', async () => {
    state.tab = 'blinds';
    render();
  });
  document.getElementById('nav-eco').addEventListener('click', async () => {
    if (state.tab !== 'eco' && state.tab !== 'settings') {
      state.previousTab = state.tab;
    }
    state.tab = 'eco';
    render();
  });
  document.getElementById('nav-settings').addEventListener('click', async () => {
    if (state.tab !== 'eco' && state.tab !== 'settings') {
      state.previousTab = state.tab;
    }
    state.tab = 'settings';
    render();
  });
}

/**
 * Creates the navigation bar for the rooms (Bedroom, Bathroom, Living Room) and attaches event listeners to update the state and re-render the interface when a room is selected.
 */
async function createRoomBar() {
  document.getElementById('nav-bedroom').addEventListener('click', async () => {
    state.room = 'bedroom';
    render();
  });
  document.getElementById('nav-bathroom').addEventListener('click', async () => {
    state.room = 'bathroom';
    render();
  });
  document.getElementById('nav-living_room').addEventListener('click', async () => {
    state.room = 'living_room';
    render();
  });
}

/**
 * Updates the active visual state of the navigation and room buttons.
 */
function updateActiveNav() {
  const tabs = ['lights', 'climate', 'blinds', 'eco', 'settings'];
  tabs.forEach((tab) => {
    const el = document.getElementById(`nav-${tab}`);
    if (el) {
      el.classList.toggle('active', state.tab === tab);
    }
  });

  const rooms = ['bedroom', 'bathroom', 'living_room'];
  rooms.forEach((room) => {
    const el = document.getElementById(`nav-${room}`);
    if (el) {
      el.classList.toggle('active', state.room === room);
    }
  });
}

/**
 * Renders the screen based on the current state.
 */
export function render() {
  updateActiveNav();

  // Manage room bar visibility
  const roomBar = document.getElementById('room-bar');
  if (roomBar) {
    if (state.tab === 'eco' || state.tab === 'settings') {
      roomBar.style.display = 'none';
    } else {
      roomBar.style.display = 'flex';
    }
  }

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
