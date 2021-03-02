const { ipcRenderer } = require('electron')
const { BrowserWindow } = require('electron').remote
// const path = require('path');
const Store = require('electron-store');
const UserData = require('../util/UserData')

const store = new Store();
var recents = store.get(UserData.RECENTS_KEY) || [];

console.log(recents)

var selectedPath = null;
var startingPage = 0;

const recentsParent = document.getElementById('recents-wrapper');
const selectDirButton = document.getElementById('select-dir-button');
const openReaderButton = document.getElementById('open-reader-button');
const directoryPathLabel = document.getElementById('directory-path');

function getStartingPage(dir) {
  let recents = store.get(UserData.RECENTS_KEY) || [];
  console.log(`Searching for ${dir}`);

  let startingPage = 0;

  recents.forEach( (entry) => {
    if (entry.path === dir) {
      console.log('found matching entry')
      startingPage = entry.page;
    }
  })

  console.log(`index starting page: ${startingPage}`)

  return startingPage;
}

function refreshRecents() {
  recentsParent.innerHTML = "";
  loadRecents();
}

function loadRecents() {
  recents = store.get(UserData.RECENTS_KEY) || [];

  recents.forEach(entry => {
    const listItem = document.createElement('p');
    listItem.innerHTML = entry.path;
    listItem.addEventListener('click', (e) => {
      onSelectDirectory(entry.path, entry.page)
    })

    recentsParent.appendChild(listItem);
  });
}

function onSelectDirectory(path, page = 0) {
  selectedPath = path;
  startingPage =  page || getStartingPage(selectedPath); // Attempt to read from recents

  console.log(`user selected: [${path}]`);
  console.log(`starting from page: [${page}]`);
  directoryPathLabel.innerHTML = `${path}`;
  openReaderButton.disabled = false;
}

ipcRenderer.on('init-UI', (e, args) => {
  loadRecents();
})

ipcRenderer.on('refresh-UI', (e, args) => {
  // reset selections and update UI accordingly
  selectedPath = null;
  startingPage = 0;
  directoryPathLabel.innerHTML = "";
  openReaderButton.disabled = true;
  refreshRecents();
})

// Grab a directory?
selectDirButton.addEventListener('click', (e) => {
  ipcRenderer.send('open-file-dialog');
})

ipcRenderer.on('selected-directory', (event, path) => {
  if (!path) return;

  onSelectDirectory(path)
})


// Aight, let's try opening this sucker up
// Communicate to main that the reader window should be opened
openReaderButton.addEventListener('click', (e) => {
  // Save the currently selected path as a recent entry
  // saveRecent(selectedPath, startingPage); // TODO: take this out and only update recents via ipc from main
  refreshRecents();

  ipcRenderer.send('show-reader-window', selectedPath, startingPage);
})