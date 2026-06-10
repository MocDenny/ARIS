import * as api from '../../wrapper.js';
import { I } from '../icon.js';

export async function renderClimate(state) {
  let res = await fetch('html/climate.html');
  const html = await res.text();
  document.getElementById('screen').innerHTML = html;
  // Fetch data
  let suiteConfig = await api.getAllInfo();
  const room = suiteConfig.room_config.rooms[state.room];
  const climateControl = room.hvac;
  document.getElementById('screen-room-label').textContent = room.name;
  // Generate 'card' (A.K.A horizontal sections)
  let temperatureCard = `
        <div class='card'>
            <div class='card-header'>
                <div style='display: flex; gap: 20px; align-items: center'>
                    ${I.HVAC}

                    <span class='card-name'>Temperature</span>
                </div>
            </div>
            <div class='value-setter-row'>
              <button class='square-button ${climateControl.target_temp > 16 ? '' : 'off'}'>-</button>
              <div class='value-displayer'>
                <span class='main-value'>${climateControl.target_temp}</span>
                <span class='unit'>°C</span>
              </div>              
              <button class='square-button ${climateControl.target_temp < 30 ? '' : 'off'}'>+</button>              
            </div>

            <div class='description-wrapper'>
              <span>Current temperature:</span>
              <br>
              <div class='value-displayer'>
                <span class='main-value'>${climateControl.current_temp}</span>
                <span class='unit'>°C</span>
              </div>                  
            </div>
        </div>
    `;
  const on = climateControl.fan.state == 'on' ? true : false;
  let fanCard = `
        <div class='card'>
            <div class='card-header'>
                <div style='display: flex; gap: 20px; align-items: center'>
                    ${I.Fan}
                    <span class='card-name'>Fan mode</span>
                </div>
                <button class="toggle ${on ? 'on' : 'off'}">
                  <div class="toggle-knob"></div>
                </button>
            </div>
            <div class="slider-label-row ${on ? '' : 'off'}">
              <span class="slider-label">Speed</span>
              <span class="slider-value">${climateControl.fan.speed}%</span>
            </div>
            <div class="slider-bar-row">
              <input type="range" min="0" max="100" value="${climateControl.fan.speed}" class="slider-bar" ${on ? '' : 'disabled'}>
            </div>
        </div>
    `;
  document.getElementById('climate-list').innerHTML =
    temperatureCard + ' ' + fanCard;
  // Add events and render
  initEvents(state, suiteConfig);
}

function initEvents(state, suiteConfig) {
  // Speed Fan Slider
  document.querySelectorAll('.slider-bar').forEach((slider) => {
    slider.style.setProperty('--value', slider.value);
    slider.style.setProperty('--min', slider.min == '' ? '0' : slider.min);
    slider.style.setProperty('--max', slider.max == '' ? '100' : slider.max);
    // When user interacts with the slider, text is updated
    slider.addEventListener('input', () => {
      // To avoid problems due to the thumb invisibility
      slider.style.setProperty('--value', slider.value);
      document.querySelector('.slider-value').innerHTML = slider.value + '%';
      suiteConfig.room_config.rooms[state.room].hvac.fan.speed = Number(
        slider.value
      );
    });
  });
  // Only send update tp JSON when user stopped holding down slider
  document.querySelectorAll('.slider-bar').forEach((slider) => {
    slider.addEventListener('change', () => {
      api.updateData(suiteConfig);
    });
  });

  // Manage temperature
  document.querySelectorAll('.square-button').forEach((button) => {
    button.addEventListener('click', async (event) => {
      // Only do something is button is enabled
      if (event.target.classList.contains('off')) {
        return;
      }
      let tempIndicator = document.querySelector('.main-value');
      if (event.target.innerHTML == '+') {
        // Reactivate '-' button if temperature is no longer 16
        if (tempIndicator.innerHTML == 16) {
          document
            .getElementsByClassName('square-button')[0]
            .classList.remove('off');
        }
        tempIndicator.innerHTML = Number(tempIndicator.innerHTML) + 1;
      } else {
        // Reactivate '+' button if temperature is no longer 30
        if (tempIndicator.innerHTML == 30) {
          document
            .getElementsByClassName('square-button')[1]
            .classList.remove('off');
        }
        tempIndicator.innerHTML = Number(tempIndicator.innerHTML) - 1;
      }
      // Update State variable
      suiteConfig.room_config.rooms[state.room].hvac.target_temp = Number(
        tempIndicator.innerHTML
      );
      // Keep temperature between [16, 30]
      if (tempIndicator.innerHTML == 16) {
        // Disable '-' button
        event.target.classList.add('off');
      } else if (tempIndicator.innerHTML == 30) {
        // Disable '+' button
        event.target.classList.add('off');
      }
      api.updateData(suiteConfig);
    });
  });
  // Toggle fan
  document.querySelector('.toggle').addEventListener('click', async (event) => {
    // Get toggle status
    let newState = '';
    if (event.target.classList.contains('off')) {
      // Toggle on
      event.target.classList.remove('off');
      event.target.classList.add('on');
      document.querySelector('.slider-label-row').classList.remove('off');
      document.querySelector('.slider-bar').removeAttribute('disabled');
      newState = 'on';
    } else {
      // Toggle off
      event.target.classList.remove('on');
      event.target.classList.add('off');
      // Apply state also to slider
      document.querySelector('.slider-label-row').classList.add('off');
      document.querySelector('.slider-bar').setAttribute('disabled', '');
      newState = 'off';
    }
    // Update State variable
    suiteConfig.room_config.rooms[state.room].hvac.fan.state = newState;
    api.updateData(suiteConfig);
  });
}
