import * as api from '../../wrapper.js';
import { I } from '../icon.js';

export async function renderLights(state) {
  const res = await fetch('html/lights.html');
  const html = await res.text();
  document.getElementById('screen').innerHTML = html;

  // Wait for room config
  let suiteConfig = await api.getAllInfo();
  const room = suiteConfig.room_config.rooms[state.room];
  const lights = room.lights;
  document.getElementById('screen-room-label').textContent = room.name;

  // Generate graphic cards
  document.getElementById('lights-list').innerHTML = lights
    .map((light, idx) => {
      const on = light.state === 'on';
      return `
      <div class="card">
        <div class="card-header">
        <div style="display: flex; gap:20px; align-items: center;"> 
        ${idx === 0 ? I.ceilingLight : I.tableLight}
        
          <span class="card-name">${light.name}</span>
         </div> 
          <button class="toggle ${on ? 'on' : 'off'}" data-index="${idx}">
            <div class="toggle-knob"></div>
          </button>
        </div>
        <div class="slider-label-row ${on ? '' : 'off'}">
          <span class="slider-label">Brightness</span>
          <span class="slider-value" data-brightness-label="${idx}">${light.brightness}%</span>
        </div>
        <div class="slider-bar-row">
          <input type="range" min="0" max="100" value="${light.brightness}" class="slider-bar" data-index="${idx}" ${on ? '' : 'disabled'}>
        </div>
      </div>`;
    })
    .join('');

  // 4. attacca gli eventi
  initEvents(state, suiteConfig);
}

function initEvents(state, suiteConfig) {
  // Slider
  document.querySelectorAll('.slider-bar').forEach((slider) => {
    slider.style.setProperty('--value', slider.value);
    slider.style.setProperty('--min', slider.min === '' ? '0' : slider.min);
    slider.style.setProperty('--max', slider.max === '' ? '100' : slider.max);
    slider.addEventListener('input', () => {
      slider.style.setProperty('--value', slider.value);
      document.querySelector(
        `[data-brightness-label="${slider.dataset.index}"]`
      ).innerHTML = slider.value + '%';
    });
  });
  // Only send update tp JSON when user stopped holding down slider
  document.querySelectorAll('.slider-bar').forEach((slider) => {
    slider.addEventListener('change', () => {
      suiteConfig.room_config.rooms[state.room].lights[
        slider.dataset.index
      ].brightness = slider.value;
      api.updateData(suiteConfig);
    });
  });

  // Toggle
  document.querySelectorAll('.toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const sliderLabelRow = card.querySelector('.slider-label-row');
      const sliderBar = card.querySelector('.slider-bar');
      if (btn.classList.contains('off')) {
        btn.classList.remove('off');
        btn.classList.add('on');
        sliderLabelRow.classList.remove('off');
        sliderBar.removeAttribute('disabled');
        suiteConfig.room_config.rooms[state.room].lights[
          btn.dataset.index
        ].state = 'on';
      } else {
        btn.classList.remove('on');
        btn.classList.add('off');
        sliderLabelRow.classList.add('off');
        sliderBar.setAttribute('disabled', '');
        suiteConfig.room_config.rooms[state.room].lights[
          btn.dataset.index
        ].state = 'off';
      }
      api.updateData(suiteConfig);
    });
  });
}
