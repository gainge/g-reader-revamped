const remote = require('electron').remote
const path = require('path')

const closeButton = document.getElementById('close-reader-button');

closeButton.addEventListener('click', (e) => {
  var window = remote.getCurrentWindow();
  window.close();
})