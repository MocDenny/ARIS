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
import { renderLights } from './screens/light.js'
import { renderTemp } from './screens/hvac.js'
import { renderBlinds } from './screens/curtains.js'

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
      renderLights(state)
      break
    case 'climate':
      renderTemp(state)
      break
    case 'blinds':
      renderBlinds(state)
      break
  }

}








init()