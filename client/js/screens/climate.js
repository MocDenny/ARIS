import * as api from '../../wrapper.js';

export async function renderClimate(state) {
  let res = await fetch('html/climate.html');
  const html = await res.text();
  document.getElementById('screen').innerHTML = html;
  // Fetch data
  const room = state.suiteConfig.room_config.rooms[state.room];
  const climateControl = room.hvac;
  document.getElementById('screen-room-label').textContent = room.name;
  // Generate 'card' (A.K.A horizontal sections)
  let temperatureCard = `
        <div class='card'>
            <div class='card-header'>
                <div style='display: flex; gap: 20px; align-items: center'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='55'
                        height='55'
                        viewBox='0 0 55 55'
                        fill='none'>
                        <circle
                            cx='27.2569'
                            cy='27.2569'
                            r='27.0069'
                            fill='white'
                            stroke='#CAC4D0'
                            stroke-width='0.5'
                        />
                        <path
                            d='M26.5596 37.5813C26.4394 37.4669 26.3792 37.3252 26.3792 37.1563V24.1241H18.7583C18.2938 24.1241 17.9221 23.9466 17.6431 23.5917C17.3645 23.2368 17.3003 22.8606 17.4506 22.4631L19.9308 15.01C20.1111 14.4777 20.4381 14.0464 20.9116 13.7162C21.385 13.3863 21.9149 13.2213 22.5011 13.2213H31.52C32.1062 13.2213 32.636 13.3863 33.1095 13.7162C33.583 14.0464 33.91 14.4777 34.0903 15.01L36.5705 22.4631C36.7208 22.8606 36.6566 23.2368 36.378 23.5917C36.099 23.9466 35.7272 24.1241 35.2628 24.1241H27.6419V37.1563C27.6419 37.3252 27.5811 37.4669 27.4597 37.5813C27.3385 37.6955 27.1882 37.7525 27.0087 37.7525C26.8296 37.7525 26.6799 37.6955 26.5596 37.5813ZM18.623 22.9316H35.3981L32.9179 15.3933C32.8277 15.1094 32.6548 14.8752 32.3993 14.6906C32.1438 14.5061 31.8507 14.4138 31.52 14.4138H22.5011C22.1704 14.4138 21.8773 14.5061 21.6218 14.6906C21.3663 14.8752 21.1934 15.1094 21.1032 15.3933L18.623 22.9316ZM21.5992 40.6486C21.4204 40.6486 21.2704 40.5912 21.1492 40.4765C21.0284 40.3621 20.9679 40.2201 20.9679 40.0506C20.9679 39.8814 21.0284 39.74 21.1492 39.6265C21.2704 39.5129 21.4204 39.4561 21.5992 39.4561H32.4218C32.6007 39.4561 32.7506 39.5134 32.8714 39.6282C32.9926 39.7426 33.0532 39.8845 33.0532 40.054C33.0532 40.2233 32.9926 40.3647 32.8714 40.4782C32.7506 40.5918 32.6007 40.6486 32.4218 40.6486H21.5992Z'
                            fill='#CAC4D0'
                        />
                    </svg>

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
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='55'
                        height='55'
                        viewBox='0 0 55 55'
                        fill='none'>
                        <circle
                            cx='27.2569'
                            cy='27.2569'
                            r='27.0069'
                            fill='white'
                            stroke='#CAC4D0'
                            stroke-width='0.5'
                        />
                        <path
                            d='M26.5596 37.5813C26.4394 37.4669 26.3792 37.3252 26.3792 37.1563V24.1241H18.7583C18.2938 24.1241 17.9221 23.9466 17.6431 23.5917C17.3645 23.2368 17.3003 22.8606 17.4506 22.4631L19.9308 15.01C20.1111 14.4777 20.4381 14.0464 20.9116 13.7162C21.385 13.3863 21.9149 13.2213 22.5011 13.2213H31.52C32.1062 13.2213 32.636 13.3863 33.1095 13.7162C33.583 14.0464 33.91 14.4777 34.0903 15.01L36.5705 22.4631C36.7208 22.8606 36.6566 23.2368 36.378 23.5917C36.099 23.9466 35.7272 24.1241 35.2628 24.1241H27.6419V37.1563C27.6419 37.3252 27.5811 37.4669 27.4597 37.5813C27.3385 37.6955 27.1882 37.7525 27.0087 37.7525C26.8296 37.7525 26.6799 37.6955 26.5596 37.5813ZM18.623 22.9316H35.3981L32.9179 15.3933C32.8277 15.1094 32.6548 14.8752 32.3993 14.6906C32.1438 14.5061 31.8507 14.4138 31.52 14.4138H22.5011C22.1704 14.4138 21.8773 14.5061 21.6218 14.6906C21.3663 14.8752 21.1934 15.1094 21.1032 15.3933L18.623 22.9316ZM21.5992 40.6486C21.4204 40.6486 21.2704 40.5912 21.1492 40.4765C21.0284 40.3621 20.9679 40.2201 20.9679 40.0506C20.9679 39.8814 21.0284 39.74 21.1492 39.6265C21.2704 39.5129 21.4204 39.4561 21.5992 39.4561H32.4218C32.6007 39.4561 32.7506 39.5134 32.8714 39.6282C32.9926 39.7426 33.0532 39.8845 33.0532 40.054C33.0532 40.2233 32.9926 40.3647 32.8714 40.4782C32.7506 40.5918 32.6007 40.6486 32.4218 40.6486H21.5992Z'
                            fill='#CAC4D0'
                        />
                    </svg>
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
  initEvents(state);
}

function initEvents(state) {
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
      // Update State variable
      state.suiteConfig.room_config.rooms[state.room].hvac.fan.speed =
        slider.value;
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
      state.suiteConfig.room_config.rooms[state.room].hvac.target_temp =
        tempIndicator.innerHTML;
      // Keep temperature between [16, 30]
      if (tempIndicator.innerHTML == 16) {
        // Disable '-' button
        event.target.classList.add('off');
      } else if (tempIndicator.innerHTML == 30) {
        // Disable '+' button
        event.target.classList.add('off');
      }
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
    state.suiteConfig.room_config.rooms[state.room].hvac.fan.state = newState;
  });
}
