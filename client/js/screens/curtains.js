import * as api from '../../wrapper.js';

export async function renderBlinds(state) {
  const curtains = state.rooms[state.room].curtains;
  const curtainsHtml = curtains
    .map(
      (curtain, idx) => `
    <div class="card1" style="padding: 10px;">
      <div> ${curtain.name || 'Blinds'} </div>
      <button id="curtain-${idx}"> ${curtain.state === 'open' ? 'closed' : 'open'} </button>
    </div>
  `
    )
    .join('');

  document.getElementById('screen').innerHTML = `
  <h1> Blinds </h1>

  <div class="cards" style="display: flex; flex-direction: column;">
    ${curtainsHtml}
  </div>
  `;
  //quando viene cliccato un bottone, viene chiamata la funzione setCurtainPosition, che setta la posizione della tenda e poi richiama renderBlinds per aggiornare l'interfaccia
  curtains.forEach((curtain, idx) => {
    const btn = document.getElementById(`curtain-${idx}`);
    if (btn) {
      btn.addEventListener('click', async () => {
        await api.setCurtainPosition(
          state.room,
          curtain.name,
          curtain.state === 'open' ? 'closed' : 'open'
        );
        state.rooms = await api.getRooms();
        renderBlinds(state);
      });
    }
  });
}
