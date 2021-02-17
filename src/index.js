const { ipcRenderer } = require('electron')
const { BrowserWindow } = require('electron').remote
const path = require('path');

var selectedPath = null;

// Grab a directory?
const selectDirButton = document.getElementById('select-dir-button');

selectDirButton.addEventListener('click', (e) => {
  ipcRenderer.send('open-file-dialog');
})

ipcRenderer.on('selected-directory', (event, path) => {
  selectedPath = path;

  console.log(`user selected: [${path}]`);
  document.getElementById('directory-path').innerHTML = `${path}`;
})


// Aight, let's try opening this sucker up
const openReaderButton = document.getElementById('open-reader-button');

// Communicate to main that the reader window should be opened
openReaderButton.addEventListener('click', (e) => {
  ipcRenderer.send('show-reader-window', selectedPath);
})