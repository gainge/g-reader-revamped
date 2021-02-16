const { BrowserWindow } = require('electron').remote
const path = require('path');

// Aight, let's try opening this sucker up
const openReaderButton = document.getElementById('open-reader-button');

openReaderButton.addEventListener('click', (e) => {
  const readerWindowPath = path.join('file://', __dirname, 'reader.html')
  let win = new BrowserWindow({
    width: 1920, 
    height: 1080, 
    frame: false,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })

  win.on('close', function () { win = null })
  win.loadURL(readerWindowPath)
  win.show()
})