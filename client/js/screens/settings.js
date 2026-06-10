import { I } from '../icon.js';
import * as api from '../../wrapper.js';

export async function renderSettings(state) {
  const res = await fetch('html/settings.html');
  const html = await res.text();
  document.getElementById('screen').innerHTML = html;

  document.getElementById('iconProfile').innerHTML = I.profileIcon;
  let suiteConfig = await api.getAllInfo();
  const on = suiteConfig.room_config.settings.learning_mode === 'on';

  renderPreferencesCard(on);
  initEvent(state, suiteConfig);
}

function renderPreferencesCard(on) {
  document.getElementById('toggle-container').innerHTML = `
    <button class="toggle ${on ? 'on' : 'off'}" id="pref-toggle">
      <div class="toggle-knob"></div>
    </button>
  `;

  // card preferenze principale
  const prefCard = document.getElementById('pref-card');
  prefCard.className = `card ${on ? 'card-dark' : ''}`;

  // mostra/nasconde le card extra
  const extraCards = document.getElementById('extra-cards');
  if (on) {
    extraCards.innerHTML = `
  <div class="card card-extra">
    <div class="pills-grid">
      <div class="pill">Ecomode</div>
      <div class="pill">Fan power: 2</div>
      <div class="pill">Day: 23 °C</div>
      <div class="pill">Day: 21 °C</div>
    </div>
  </div>

  <div class="card card-transfer">
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;cursor:pointer">
      ${I.downloadIcon}
      <span class="card-name">Transfer preferences</span>
      <span>›</span>
    </div>
  </div>
`;
  } else {
    extraCards.innerHTML = '';
  }
}

function initEvent(state, suiteConfig) {
  document.getElementById('pref-toggle').addEventListener('click', () => {
    const btn = document.getElementById('pref-toggle');
    const isOn = btn.classList.contains('on');

    btn.classList.toggle('on', !isOn);
    btn.classList.toggle('off', isOn);

    const newState = isOn ? 'off' : 'on';
    suiteConfig.room_config.settings.learning_mode = newState;

    renderPreferencesCard(newState === 'on');
    api.updateData(suiteConfig);
    initEvent(state);
  });
}
