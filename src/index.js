const { ipcRenderer } = require('electron')
const { BrowserWindow } = require('electron').remote
// const path = require('path');
const Store = require('electron-store');

const store = new Store();
var recents = store.get('recents') || [];
console.log(recents)

var selectedPath = null;
var startingPage = 0;

const recentsParent = document.getElementById('recents-wrapper');
const selectDirButton = document.getElementById('select-dir-button');
const openReaderButton = document.getElementById('open-reader-button');

function saveRecent(path, page) {
  // Remove the recents entry if applicable
  recents = recents.filter( (entry) => entry.path !== path);

  // Add the current directory to the front of the recents array
  recents.unshift({
    path: path,
    page: page
  })
}

function refreshRecents() {
  recentsParent.innerHTML = "";
  loadRecents(recents);
}

function loadRecents(recents) {
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
  startingPage = page;

  console.log(`user selected: [${path}]`);
  console.log(`starting from page: [${page}]`);
  document.getElementById('directory-path').innerHTML = `${path}`;
}


// Grab a directory?
selectDirButton.addEventListener('click', (e) => {
  ipcRenderer.send('open-file-dialog');
})

ipcRenderer.on('selected-directory', (event, path) => {
  startingPage = 0; // Directory chosen from dialog, assume starting page of 0
  onSelectDirectory(path)
})


// Aight, let's try opening this sucker up
// Communicate to main that the reader window should be opened
openReaderButton.addEventListener('click', (e) => {
  // Save the currently selected path as a recent entry
  saveRecent(selectedPath, startingPage);
  refreshRecents();

  ipcRenderer.send('show-reader-window', selectedPath, startingPage);
})