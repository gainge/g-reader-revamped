const remote = require('electron').remote
const { ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')

const closeButton = document.getElementById('close-reader-button');

closeButton.addEventListener('click', (e) => {
  var window = remote.getCurrentWindow();
  window.close();
});


ipcRenderer.on('reader-path', (e, imageDir) => {
  document.getElementById('temp').innerHTML = imageDir
  console.log(`Reader window received ${imageDir}`);
  console.log(typeof(imageDir))

  fs.readdir(imageDir, (error, files) => {
    console.log(files)
  })
});