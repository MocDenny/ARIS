import * as api from '../wrapper.js'

const state = {
  tab: 'lights',
  room: 'bedroom',
  rooms: {},
}

async function init() {
  state.rooms = await api.getRooms()
  renderLights()
}

function renderLights() {
  const lights = state.rooms[state.room].lights
  document.getElementById('screen').innerHTML = `
  <h1> Luci </h1>
  <div class="cards" style="display: flex; flex-direction: column;">
    <div class="card1" style="padding: 10px;">
      <div> ${lights[0].name} </div>
      <button data-index=0> ${lights[0].state === "on" ? "off" : "on"} </button>
    </div>
    <div class="card2" style="padding: 10px;">
      <div> ${lights[1].name} </div>
      <button data-index=1> ${lights[1].state === "on" ? "off" : "on"} </button>
    </div>
  </div>
  `
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api.toggleLight(state.room, btn.dataset.index)
      state.rooms = await api.getRooms()
      renderLights()
    })
  })

}


init()