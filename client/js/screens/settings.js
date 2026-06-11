import { I } from '../icon.js';
import * as api from '../../wrapper.js';

export async function renderSettings(state) {
  const res = await fetch('html/settings.html');
  const html = await res.text();
  document.getElementById('screen').innerHTML = html;

  const backBtn = document.getElementById('btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.goBack();
    });
  }

  document.getElementById('iconProfile').innerHTML = I.profile;
  document.getElementById('iconPreference').innerHTML = I.preference;

  let suiteConfig = await api.getAllInfo();
  const on = suiteConfig.room_config.settings.learning_mode === 'on';

  renderPreferencesCard(on);
  initEvent(state, suiteConfig);
}

function renderPreferencesCard(on) {
  document.getElementById('toggle-container').innerHTML = `
    <button class="toggle-eco ${on ? 'on' : 'off'}" id="pref-toggle">
      <div class="toggle-eco-knob ${on ? 'on' : 'off'}"></div>
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
      ${I.transferPref}
      <span class="learning-text-settings tranfer">Transfer preferences</span>
      ${I.arrow}
    </div>
  </div>
`;
  } else {
    extraCards.innerHTML = '';
  }
}

function initEvent(state, suiteConfig) {
  const btn = document.getElementById('pref-toggle');
  if (btn) {
    btn.addEventListener('click', async () => {
      const isOn = btn.classList.contains('on');
      const newState = isOn ? 'off' : 'on';

      btn.classList.toggle('on', !isOn);
      btn.classList.toggle('off', isOn);

      suiteConfig.room_config.settings.learning_mode = newState;

      renderPreferencesCard(newState === 'on');
      await api.updateData(suiteConfig);
      initEvent(state, suiteConfig);
    });
  }
}
