import * as api from '../../wrapper.js'
import { I } from '../icon.js'

export async function renderBlinds(state) {
  // 1. carica il template HTML
  const res = await fetch('html/blinds.html')
  const html = await res.text()
  document.getElementById('screen').innerHTML = html

  // 2. popola i dati
  const room = state.suiteConfig.room_config.rooms[state.room]
  const curtains = room.curtains
  document.getElementById('screen-room-label').textContent = room.name

  // 3. genera le card
  document.getElementById('curtains-list').innerHTML = curtains.map((curtain, idx) => {
    const open = curtain.state === 'open'
    return `
      <div class="card ${open ? '' : 'closed'}" data-index="${idx}">
        <div class="card-header">
          <div style="display: flex; gap:20px; align-items: center;">
          ${open ? I.curtain : I.curtainClosed}
            <span class="card-name ${open ? '' : 'closed'}" >${curtain.name}</span>
          </div>
          <div class="state-indicator ${open ? '' : 'closed'}">${open ? 'open' : 'closed'}</div>
        </div>

        <div class="button-curtains-container" style="display: flex; gap:14px; justify-content: center;">
          <div class="button-curtains-close" style="align-items:center;">
          ${open ? I.closeCurtain : I.closeCurtainWhite}
          </div>
          <div class="button-curtains-open" style="align-items:center;">
          ${open ? I.openCurtain : I.openCurtainWhite}
          </div>
        </div>
      </div>`
  }).join('')

  // 4. attacca gli eventi
  initEvents(state)
}
//TODO riuscire a disabilitare il button quando viene cliccato
function initEvents(state) {
  // toggle
  document.getElementById('curtains-list').addEventListener('click', async (e) => {
    const btnClose = e.target.closest('.button-curtains-close')
    const btnOpen = e.target.closest('.button-curtains-open')

    if (!btnClose && !btnOpen) return

    const btn = btnClose || btnOpen
    btn.classList.add('pressing')

    const card = e.target.closest('.card')
    const curtainIdx = card.dataset.index
    const curtain = state.suiteConfig.room_config.rooms[state.room].curtains[curtainIdx]

    if (!curtain) return

    const newState = btnOpen ? "open" : "closed"

    await new Promise(r => setTimeout(r, 160))
    curtain.state = newState
    renderBlinds(state)

  })

}