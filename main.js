const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const Store = require('electron-store');
const UserData = require('./util/UserData.js')

const SRC_DIR = 'src'
const INDEX_FILE = 'index.html'
const READER_FILE = 'reader.html';

const store = new Store();

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })
  
  // Switch to dynamic pathing and loadURL
  const indexFile = path.join('file://', __dirname, SRC_DIR, INDEX_FILE)

  win.loadURL(indexFile)

  win.webContents.once('dom-ready', () => {
    win.webContents.send('init-UI');
  })

  ipcMain.on('open-file-dialog', async (event) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });

    console.log('directories selected', result.filePaths)

    if (result && result.filePaths) { // TODO: also check dir is not empty somewhere? maybe not in main
      let selectedDir = result.filePaths[0];
      event.sender.send('selected-directory', selectedDir)
    } else {
      dialog.showErrorBox('Directory Selection', `Something went wrong selecting directory ${result.filePaths}`)
    }
  })

  ipcMain.on('show-reader-window', (e, imageDir, startingPage) => {
    const readerWindowPath = path.join('file://', __dirname, SRC_DIR, READER_FILE)
    let win = new BrowserWindow({
      width: 1920, 
      height: 1080, 
      frame: false,
      fullscreen: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
        show: false,
      }
    })

    win.on('close', function () { win = null })
    win.loadURL(readerWindowPath)

    win.webContents.once('dom-ready', () => {
      win.webContents.send('reader-path', imageDir, startingPage);
    })

    win.once('ready-to-show', () => {
      win.show();
    })
    
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