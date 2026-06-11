export async function renderVocal(state) {
  // Disable nav
  document.getElementById('side-nav').style.setProperty('visibility', 'collapse');
  document.getElementById('room-bar').style.setProperty('visibility', 'collapse');
  let res = await fetch('html/vocal_mode.html');
  const html = await res.text();
  document.getElementById('screen').innerHTML = '';
  document.getElementById('full-screen').innerHTML = html;
  document.body.style.setProperty('background-color', '#000');
}
