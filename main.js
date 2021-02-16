const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

const SRC_DIR = 'src'
const INDEX_FILE = 'index.html'

function createWindow () {
  const win = new BrowserWindow({
    width: 400,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })
  
  // Switch to dynamic pathing and loadURL
  const indexFile = path.join('file://', __dirname, SRC_DIR, INDEX_FILE)

  win.loadURL(indexFile)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
