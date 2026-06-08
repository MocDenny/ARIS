import { I } from '../icon.js'

export async function renderSettings(state) {
    // 1. carica il template HTML
    const res = await fetch('html/settings.html')
    const html = await res.text()
    document.getElementById('screen').innerHTML = html

    // 2. popola i dati
    const room = state.suiteConfig.room_config.rooms[state.room]
    document.getElementById('screen-room-label').textContent = room.name

    // 3. genera le card
    document.getElementById('iconProfile').innerHTML = I.profileIcon
    document.getElementById('icon-preference').innerHTML = I.preferencesIcon
}