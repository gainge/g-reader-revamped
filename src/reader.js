const remote = require('electron').remote
const { ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const Mousetrap = require('mousetrap');

const DISPLAY_SPREAD = 0;
const DISPLAY_SINGLE = 1;
const ZOOM_STEP = 20;
const MIN_ZOOM = 100;

var zoomLevel = 0;
var displayMode = DISPLAY_SPREAD;
var pageStep = displayMode === DISPLAY_SPREAD ? 2 : 1;
var currentPage = 0; // TODO: allow for saved page num from recents
var images = null;

const page1 = document.getElementById('page-1');
const page2 = document.getElementById('page-2');
const closeButton = document.getElementById('close-reader-button');

closeButton.addEventListener('click', (e) => {
  closeWindow();
});

function closeWindow() {
  let window = remote.getCurrentWindow();
  window.close();
}

function addShortcuts() {
  Mousetrap.bind('left', () => {showNextPage()});
  Mousetrap.bind('right', () => {showPrevPage()});
  Mousetrap.bind('esc', () => {closeWindow()});
  Mousetrap.bind('m', () => {console.log('Pressed M! (I think?)')})
}

function getPageStep() {
  return displayMode === DISPLAY_SPREAD ? 2 : 1;
}

function showPrevPage() {
  changePage(currentPage - getPageStep())
}

function showNextPage() {
  changePage(currentPage + getPageStep())
}

// Pre-condition that images have been populated
function changePage(pageNum) {
  // check bounds
  if (pageNum < 0 || pageNum >= images.length ||
      (pageNum === images.length - 1 && displayMode === DISPLAY_SPREAD)) {
    console.log(`Invalid page number: ${pageNum}`);
    return;
  }

  // update current page
  currentPage = pageNum;

  // change image
  page1.setAttribute('src', images[currentPage]);
  
  if (displayMode === DISPLAY_SPREAD) {
    page2.setAttribute('src', images[currentPage + 1]);
  }
}

ipcRenderer.on('reader-path', (e, imageDir) => {
  console.log(`Reader window received ${imageDir}`);
  console.log(typeof(imageDir))

  fs.readdir(imageDir, (error, files) => {
    console.log(files)
    // Create our array of full image paths
    images = files.map((file) => path.join(imageDir, file))
    changePage(0); // Display the content!
    addShortcuts();
  })
});