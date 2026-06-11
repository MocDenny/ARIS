import * as api from '../../wrapper.js';
import { I } from '../icon.js';

export async function renderEco(state) {
  let res = await fetch('html/eco.html');
  const html = await res.text();
  document.getElementById('screen').innerHTML = html;

  const backBtn = document.getElementById('btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.goBack();
    });
  }

  // Fetch data
  let suiteConfig = await api.getAllInfo();
  const on = suiteConfig.room_config.eco_mode == 'on' ? true : false;
  document.getElementById('screen-room-label').textContent = '';
  // Generate 'card' (A.K.A horizontal sections)
  let ecoCard = `
        <div class='card special-card ${on ? 'on' : ''}'>
            <div class='card-header'>
                <div style='display: flex; gap: 20px; align-items: center'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 32 32" fill="none">
  <circle cx="16" cy="16" r="15.75" stroke="#CAC4D0" stroke-width="0.5"/>
  <path d="M11 21.3518C10.3667 20.7101 9.875 19.9791 9.525 19.1588C9.175 18.3385 9 17.4903 9 16.6143C9 15.731 9.17083 14.8476 9.5125 13.9643C9.85417 13.081 10.4 12.2643 11.15 11.5143C11.8 10.8643 12.6292 10.3601 13.6375 10.0018C14.6458 9.64345 15.7167 9.38929 16.85 9.23929C17.9833 9.08929 19.1208 9.01012 20.2625 9.00179C21.4042 8.99345 22.4333 9.01429 23.35 9.06429C23.4167 9.96429 23.4458 10.9851 23.4375 12.1268C23.4292 13.2685 23.3417 14.406 23.175 15.5393C23.0083 16.6726 22.7458 17.7435 22.3875 18.7518C22.0292 19.7601 21.5333 20.581 20.9 21.2143C20.1667 21.9643 19.3708 22.5101 18.5125 22.8518C17.6542 23.1935 16.7978 23.3643 15.9435 23.3643C15.0478 23.3643 14.1583 23.1893 13.275 22.8393C12.3917 22.4893 11.6333 21.9935 11 21.3518ZM12.35 21.5643C12.8833 21.931 13.4708 22.206 14.1125 22.3893C14.7542 22.5726 15.3667 22.6643 15.95 22.6643C16.728 22.6643 17.4975 22.5143 18.2585 22.2143C19.0195 21.9143 19.7333 21.4143 20.4 20.7143C20.6968 20.4143 20.9978 19.9935 21.303 19.4518C21.6082 18.9101 21.8721 18.2018 22.0947 17.3268C22.3174 16.4518 22.4864 15.3935 22.6017 14.1518C22.7172 12.9101 22.75 11.431 22.7 9.71429C21.8833 9.68095 20.9542 9.67679 19.9125 9.70179C18.8708 9.72679 17.8292 9.81845 16.7875 9.97679C15.7458 10.1351 14.7708 10.3726 13.8625 10.6893C12.9542 11.006 12.2333 11.431 11.7 11.9643C10.9667 12.6976 10.45 13.4685 10.15 14.2768C9.85 15.0851 9.7 15.831 9.7 16.5143C9.7 17.3976 9.87917 18.2393 10.2375 19.0393C10.5958 19.8393 11.0667 20.481 11.65 20.9643C11.9833 19.831 12.5458 18.7435 13.3375 17.7018C14.1292 16.6601 15.3167 15.6476 16.9 14.6643C15.7667 15.6476 14.825 16.6726 14.075 17.7393C13.325 18.806 12.75 20.081 12.35 21.5643Z" fill="#CAC4D0"/>
</svg>
                    <span class='card-name'>Eco mode</span>
                </div>
                <button class="toggle-eco ${on ? 'on' : 'off'}">
                  <div class="toggle-eco-knob ${on ? 'on' : 'off'}"></div>
                </button>
            </div>
            <div id="text" >Reduce consumption while maintaining comfort.</div>
            <br><br>
        </div>
        <div id='content-eco-on'></div>
        <div id='content-eco-off'></div>
    `;
  document.getElementById('eco-list').innerHTML = ecoCard;
  generateContent(on);
  // Add events and render
  initEvents(state, suiteConfig);
}

function initEvents(state, suiteConfig) {
  const toggleBtn = document.querySelector('.toggle-eco');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', async () => {
      const isOn = toggleBtn.classList.contains('on');
      const newState = isOn ? 'off' : 'on';

      // Update toggles
      toggleBtn.classList.toggle('on', !isOn);
      toggleBtn.classList.toggle('off', isOn);
      const knob = toggleBtn.querySelector('.toggle-eco-knob');
      if (knob) {
        knob.classList.toggle('on', !isOn);
        knob.classList.toggle('off', isOn);
      }

      // Change card look
      const card = document.querySelector('.special-card');
      if (card) {
        card.classList.toggle('on', !isOn);
      }

      // Expand/collapse options
      const contentOn = document.getElementById('content-eco-on');
      const contentOff = document.getElementById('content-eco-off');
      if (contentOn && contentOff) {
        if (newState === 'on') {
          contentOff.style.display = 'none';
          contentOn.style.display = 'flex';
        } else {
          contentOn.style.display = 'none';
          contentOff.style.display = 'block';
        }
      }

      // Update State variable
      suiteConfig.room_config.eco_mode = newState;
      await api.updateData(suiteConfig);
    });
  }
}

function generateContent(ecoOn) {
  // HTML to add when eco mode is on
  let container = document.getElementById('content-eco-on');
  // Tab 1
  let card =
    `
  <div class='card card-extra'>
      <div style='display: flex; gap: 20px; align-items: center'> 
      ${I.lightEco}
        <span class='card-name-eco'>Primary lights</span>
      </div>
  </div>`;
  container.innerHTML = card;
  // Tab 2
  card =
    ` 
  <div class='card card-extra'>
      <div style='display: flex; flex-direction: column; gap:10px'> ` +
    `<div style='display: flex; flex-direction: row; gap: 20px; align-items: center;'>` +
    I.climateEco + `
          <span class='card-name-eco'>Climate</span>
          </div>
          <div style="margin-top: 5px; margin-left: 60px">
            <div class="text-eco">Set-point Shifting: 19 to 21 °C </div> 
            <div class="diveder-eco"></div>
            <div class="text-eco">Fan limit: 0 </div> 
            <div class="diveder-eco"></div>
            <div class="text-eco">Tollerance Zone: 2°C </div>
          </div>
      </div>
  </div>`;
  container.innerHTML += card;
  // Tab 3
  card =
    ` 
  <div class='card card-extra'>
      <div style='display: flex; gap: 20px; align-items: center'> ` +
    I.leaveRoomEco +
    `
        <span class='card-name-eco' style='font-family: manropeLight; white-space: nowrap;'>I am leaving the room</span>
        ${I.arrow}
      </div>
  </div>`;
  container.innerHTML += card;
  container.style.setProperty('display', ecoOn ? 'flex' : 'none');

  // Add content when eco mode is deactivated
  container = document.getElementById('content-eco-off');
  let span = document.createElement('span');
  span.innerHTML = 'When Eco mode is active';
  let listContainer = document.createElement('div');
  listContainer.classList.add('table');
  // First item in list
  let item = document.createElement('div');
  item.innerHTML =
    I.lightEco +
    ' ' +
    '<span class="text-eco">Only primary lights active</span>';
  listContainer.appendChild(item);
  // Second item
  item = document.createElement('div');
  item.innerHTML =
    I.climateEco +
    ' ' +
    '<div class="text-eco"><span>Set-point Shifting</span> <span>Fan limit</span> <span>Tollerance Zone</span></div>';
  listContainer.appendChild(item);
  // Last
  item = document.createElement('div');
  item.innerHTML =
    I.leaveRoomEco +
    ' ' +
    '<span class="text-eco">Shutdown when outside the room</span>';
  listContainer.appendChild(item);
  // Append
  container.appendChild(span);
  container.appendChild(listContainer);
  container.style.setProperty('display', ecoOn ? 'none' : 'block');
}

function createSvg(path) {
  return `
  <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 55 55' fill='none'>
      <circle cx='27.2569' cy='27.2569' r='27.0069' fill='white' stroke='#CAC4D0' stroke-width='0.5'/>
      <path 
        d='${path}'
        fill='#CAC4D0'
      />
  </svg>`;
}