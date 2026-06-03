/** 
 * Funzionamento generale:
 * 1. STATO (`state`): Mantiene in memoria lo stato corrente del client (scheda attiva, stanza selezionata,
 *    e l'oggetto con le informazioni di tutte le stanze scaricato dal server).
 * 2. INIZIALIZZAZIONE (`init`): All'avvio carica i dati dal server tramite le API esportate da `wrapper.js`,
 *    configura i listener per la navigazione (sezioni e stanze) e avvia il primo rendering.
 * 3. NAVIGAZIONE: I click sui pulsanti delle sezioni (Lights, Climate, Blinds) o delle stanze (Bedroom, Bathroom, Living Room)
 *    aggiornano lo stato locale e richiamano la funzione principale `render()`.
 * 4. RENDERING DINAMICO (`renderLights`, `renderTemp`, `renderBlinds`): Genera l'HTML dinamicamente a partire
 *    dai dati presenti nello stato. Associa a ogni pulsante dei dispositivi (luci, hvac, tende) un listener
 *    che effettua la chiamata API per modificare lo stato sul server, ricarica i dati aggiornati e aggiorna l'interfaccia.
 */

import * as api from '../wrapper.js'

//-----------------------------------------------------------
//gestione dello stato 
const state = {
  tab: 'lights',
  room: 'bedroom',
  rooms: {},
}



//-----------------------------------------------------------
async function init() {
  state.rooms = await api.getRooms()
  createSecNavBar()
  createRoomBar()
  render()
}



//-----------------------------------------------------------
//creazione della barra laterale per le sezioni ed eventListener
function createSecNavBar() {
  document.getElementById('nav-lights').addEventListener('click', () => {
    state.tab = 'lights'
    render()
  })
  document.getElementById('nav-climate').addEventListener('click', () => {
    state.tab = 'climate'
    render()
  })
  document.getElementById('nav-blinds').addEventListener('click', () => {
    state.tab = 'blinds'
    render()
  })
}





//-----------------------------------------------------------
//creazione roombar e eventListener
function createRoomBar() {
  document.getElementById('nav-bedroom').addEventListener('click', () => {
    state.room = 'bedroom'
    console.log(state.room)
    render()
  })
  document.getElementById('nav-bathroom').addEventListener('click', () => {
    state.room = 'bathroom'
    console.log(state.room)
    render()
  })
  document.getElementById('nav-living_room').addEventListener('click', () => {
    state.room = 'living_room'
    console.log(state.room)
    render()
  })
}






//-----------------------------------------------------------
//rendering delle schermate a seconda della tab, non ottimizzato per ora
function render() {
  switch (state.tab) {
    case 'lights':
      renderLights()
      break
    case 'climate':
      renderTemp()
      break
    case 'blinds':
      renderBlinds()
      break
  }

}






//-----------------------------------------------------------
//funzione per il rendering delle luci
function renderLights() {
  const lights = state.rooms[state.room].lights
  const lightsHtml = lights.map((light, idx) => `
    <div class="card${idx + 1}" style="padding: 10px;">
      <div> ${light.name} </div>
      <button id="light-${idx}" data-name="${light.name}"> ${light.state === "on" ? "off" : "on"} </button>
    </div>
  `).join('')
  console.log(lightsHtml)

  document.getElementById('screen').innerHTML = `
  <h1> Luci </h1>
  <div class="cards" style="display: flex; flex-direction: column;">
    ${lightsHtml}
  </div>
  `
  //quando viene cliccato un bottone, viene chiamata la funzione toggleLight, che toggle lo stato della luce e poi richiama renderLights per aggiornare l'interfaccia
  document.querySelectorAll('[data-name]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api.toggleLight(state.room, btn.dataset.name)
      state.rooms = await api.getRooms()
      renderLights()
    })
  })
}






//-----------------------------------------------------------
//funzione per il rendering della temperatura
function renderTemp() {
  const hvac = state.rooms[state.room].hvac
  document.getElementById('screen').innerHTML = `
  <h1> HVAC </h1>
  <div class="cards" style="display: flex; flex-direction: column;">
    <div class="card1" style="padding: 10px;">
      <div> HVAC </div>
      <button id=hvac-0> ${hvac.state === "on" ? "off" : "on"} </button>
    </div>
  </div>
  `

  //quando viene cliccato il bottone, viene chiamata la funzione toggleHVAC, che toggle lo stato dell'hvac e poi richiama renderTemp per aggiornare l'interfaccia
  document.querySelector("#hvac-0").addEventListener("click", async () => {
    await api.toggleHVAC(state.room)
    state.rooms = await api.getRooms()
    renderTemp()
  })
}






//-----------------------------------------------------------
//funzione per il rendering delle tende
function renderBlinds() {
  const curtains = state.rooms[state.room].curtains
  const curtainsHtml = curtains.map((curtain, idx) => `
    <div class="card1" style="padding: 10px;">
      <div> ${curtain.name || 'Blinds'} </div>
      <button id="curtain-${idx}"> ${curtain.state === "open" ? "closed" : "open"} </button>
    </div>
  `).join('')

  document.getElementById('screen').innerHTML = `
  <h1> Blinds </h1>

  <div class="cards" style="display: flex; flex-direction: column;">
    ${curtainsHtml}
  </div>
  `
  //quando viene cliccato un bottone, viene chiamata la funzione setCurtainPosition, che setta la posizione della tenda e poi richiama renderBlinds per aggiornare l'interfaccia
  curtains.forEach((curtain, idx) => {
    const btn = document.getElementById(`curtain-${idx}`)
    if (btn) {
      btn.addEventListener("click", async () => {
        await api.setCurtainPosition(state.room, curtain.name, curtain.state === "open" ? "closed" : "open")
        state.rooms = await api.getRooms()
        renderBlinds()
      })
    }
  })
}




init()