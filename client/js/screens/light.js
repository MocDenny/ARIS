import * as api from '../../wrapper.js';

export async function renderLights(state) {
  // 1. carica il template HTML
  const res = await fetch('html/lights.html');
  const html = await res.text();
  document.getElementById('screen').innerHTML = html;

  // 2. popola i dati
  const room = state.suiteConfig.room_config.rooms[state.room];
  const lights = room.lights;
  document.getElementById('screen-room-label').textContent = room.name;

  // 3. genera le card
  document.getElementById('lights-list').innerHTML = lights
    .map((light, idx) => {
      const on = light.state === 'on';
      return `
      <div class="card ${on ? '' : 'off'}">
        <div class="card-header">
        <div style="display: flex; gap:20px; align-items: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 55 55" fill="none">
            <circle cx="27.2569" cy="27.2569" r="27.0069" fill="white" stroke="#CAC4D0" stroke-width="0.5" />
            <path d="M26.5596 37.5813C26.4394 37.4669 26.3792 37.3252 26.3792 37.1563V24.1241H18.7583C18.2938 24.1241 17.9221 23.9466 17.6431 23.5917C17.3645 23.2368 17.3003 22.8606 17.4506 22.4631L19.9308 15.01C20.1111 14.4777 20.4381 14.0464 20.9116 13.7162C21.385 13.3863 21.9149 13.2213 22.5011 13.2213H31.52C32.1062 13.2213 32.636 13.3863 33.1095 13.7162C33.583 14.0464 33.91 14.4777 34.0903 15.01L36.5705 22.4631C36.7208 22.8606 36.6566 23.2368 36.378 23.5917C36.099 23.9466 35.7272 24.1241 35.2628 24.1241H27.6419V37.1563C27.6419 37.3252 27.5811 37.4669 27.4597 37.5813C27.3385 37.6955 27.1882 37.7525 27.0087 37.7525C26.8296 37.7525 26.6799 37.6955 26.5596 37.5813ZM18.623 22.9316H35.3981L32.9179 15.3933C32.8277 15.1094 32.6548 14.8752 32.3993 14.6906C32.1438 14.5061 31.8507 14.4138 31.52 14.4138H22.5011C22.1704 14.4138 21.8773 14.5061 21.6218 14.6906C21.3663 14.8752 21.1934 15.1094 21.1032 15.3933L18.623 22.9316ZM21.5992 40.6486C21.4204 40.6486 21.2704 40.5912 21.1492 40.4765C21.0284 40.3621 20.9679 40.2201 20.9679 40.0506C20.9679 39.8814 21.0284 39.74 21.1492 39.6265C21.2704 39.5129 21.4204 39.4561 21.5992 39.4561H32.4218C32.6007 39.4561 32.7506 39.5134 32.8714 39.6282C32.9926 39.7426 33.0532 39.8845 33.0532 40.054C33.0532 40.2233 32.9926 40.3647 32.8714 40.4782C32.7506 40.5918 32.6007 40.6486 32.4218 40.6486H21.5992Z" fill="#CAC4D0" />
        </svg>
        
          <span class="card-name">${light.name}</span>
         </div> 
          <button class="toggle ${on ? 'on' : 'off'}" data-index="${idx}">
            <div class="toggle-knob"></div>
          </button>
        </div>
        <div class="slider-label-row">
          <span class="slider-label ${on ? '' : 'off'}">Brightness</span>
          <span class="slider-value ${on ? '' : 'off'}" data-brightness-label="${idx}">${light.brightness}%</span>
        </div>
        <div class="slider-wrap ${on ? '' : 'off'}" data-slider="${idx}">
          <div class="slider-track ${on ? '' : 'off'}">
            <div class="slider-fill ${on ? '' : 'off'}" data-slider-fill="${idx}" style="width:${light.brightness}%"></div>
          </div>
        </div>
      </div>`;
    })
    .join('');

  // 4. attacca gli eventi
  initEvents(state);
}

function initEvents(state) {
  // toggle
  document.querySelectorAll('.toggle').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const light =
        state.suiteConfig.room_config.rooms[state.room].lights[
          btn.dataset.index
        ];
      // Toggle just the client app
      // state.rooms = await api.getRooms()
      // renderLights(state)
    });
  });

  //TODO toggle
}
