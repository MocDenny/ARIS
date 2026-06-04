import * as api from '../../wrapper.js'

export async function renderTemp(state) {
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
        renderTemp(state)
    })
}
