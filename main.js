const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

const SRC_DIR = 'src'
const INDEX_FILE = 'index.html'

function createWindow () {
  const win = new BrowserWindow({
    width: 500,
    height: 550,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })
  
  // Switch to dynamic pathing and loadURL
  const indexFile = path.join('file://', __dirname, SRC_DIR, INDEX_FILE)

  win.loadURL(indexFile)

  ipcMain.on('open-file-dialog', async (event) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });

    console.log('directories selected', result.filePaths)

    if (result && result.filePaths) { // TODO: also check dir is not empty somewhere? maybe not in main
      event.sender.send('selected-directory', result.filePaths)
    } else {
      dialog.showErrorBox('Directory Selection', `Something went wrong selecting directory ${result.filePaths}`)
    }
  })

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