const { app, BrowserWindow } = require('electron')
const path = require('path')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 460,
    height: 760,
    backgroundColor: '#ece9e4',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.loadFile(path.join(__dirname, 'index.html'))
  // win.webContents.openDevTools()  // decommentare per debug
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
