const remote = require('electron').remote
const { ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const Mousetrap = require('mousetrap');

const DISPLAY_SPREAD = 0;
const DISPLAY_SINGLE = 1;
const ZOOM_STEP = 20;
const MIN_ZOOM = 100;
const SINGLE_ZOOM = 200;
const CLASS_SPREAD_PAGE = 'reader-image-spread';
const CLASS_SINGLE_PAGE = 'reader-image-single';

var zoomLevel = 0;
var displayMode = DISPLAY_SPREAD;
var pageStep = displayMode === DISPLAY_SPREAD ? 2 : 1;
var currentPage = 0; // TODO: allow for saved page num from recents
var images = null;

const page1 = document.getElementById('page-1');
const page2 = document.getElementById('page-2');
const closeButton = document.getElementById('close-reader-button');
const toggleDisplayButton = document.getElementById('toggle-display-button');

closeButton.addEventListener('click', (e) => {
  closeWindow();
});

toggleDisplayButton.addEventListener('click', (e) => {
  toggleDisplayMode();
})
toggleDisplayButton.setAttribute('title', `(m)`);

function closeWindow() {
  let window = remote.getCurrentWindow();
  window.close();
}

function addShortcuts() {
  Mousetrap.bind('left', () => {showNextPage()});
  Mousetrap.bind('right', () => {showPrevPage()});
  Mousetrap.bind('esc', () => {closeWindow()});
  Mousetrap.bind('m', () => {toggleDisplayMode()})
}

function toggleDisplayMode() {
  // Maybe hide both?
  page1.classList.add('hidden')
  page2.classList.add('hidden')

  // Conditionally hide
  if (displayMode === DISPLAY_SPREAD) {
    displayMode = DISPLAY_SINGLE;
    // Update the style to single height
    page1.classList.remove(CLASS_SPREAD_PAGE);
    page1.classList.add(CLASS_SINGLE_PAGE);
  } else {
    displayMode = DISPLAY_SPREAD;
    // Revert back to spread layout
    page1.classList.remove(CLASS_SINGLE_PAGE);
    page1.classList.add(CLASS_SPREAD_PAGE);

  }

  // Display images
  refreshPages();

  // Show pages if appropriate
  if (displayMode === DISPLAY_SPREAD) {
    page2.classList.remove('hidden');
  }
  page1.classList.remove('hidden')

}

function refreshPages() {
  changePage(currentPage);
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
  window.scrollTo(0, 0);

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