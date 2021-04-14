const remote = require('electron').remote
const { ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const Mousetrap = require('mousetrap');
const Store = require('electron-store');
const sizeOf = require('image-size')

const UserData = require('../util/UserData')

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
var selectedDir = null;
var currentPage = 0; // TODO: allow for saved page num from recents
var images = null;
var dimensions = [];

const store = new Store();

const page1 = document.getElementById('page-1');
const page2 = document.getElementById('page-2');
const closeButton = document.getElementById('close-reader-button');
const toggleDisplayButton = document.getElementById('toggle-display-button');
const pageNumInput = document.getElementById('page-num-input');
const pageCountLabel = document.getElementById('page-count-label');
const jumpPageButton = document.getElementById('jump-page-button');
const pageControlForm = document.getElementById('page-control-container');

closeButton.addEventListener('click', (e) => {
  closeWindow();
});

toggleDisplayButton.addEventListener('click', (e) => {
  toggleDisplayMode();
})
toggleDisplayButton.setAttribute('title', `(m)`);

function saveCurrentPage() {
  ipcRenderer.send('update-recent-page', selectedDir, currentPage);

  // let recents = store.get(UserData.RECENTS_KEY) || [];

  // // Update the page attribute
  // recents.forEach( (entry) => {
  //   if (entry.path === selectedDir) {
  //     entry.page = currentPage;
  //   }
  // });

  // store.set(UserData.RECENTS_KEY, recents)
}

function closeWindow() {
  saveCurrentPage()

  let window = remote.getCurrentWindow();
  window.close();
}

pageControlForm.addEventListener('submit', (e) => {
  e.preventDefault()
  jumpPage()
})

jumpPageButton.addEventListener('click', (e) => {
  jumpPage()
})



/* Helper Functions */

function jumpPage() {
  let pageVal = pageNumInput.value;

  if (!isInt(pageVal)) return;

  pageVal = Number(pageVal)
  // Check bounds
  if (pageVal < 0 || pageVal >= images.length) return;

  // Otherwise we're good to jump
  changePage(pageVal);
}

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
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
  if (pageNum < 0) pageNum = 0; // Floor page number
  if (pageNum >= images.length) { // Ceiling page number
    pageNum = images.length - 1;
  }
  // Check for spread mode overflow
  if (displayMode === DISPLAY_SPREAD && pageNum == images.length - 1) {
    pageNum -= 1; // Start display one more page early
  }

  window.scrollTo(0, 0);

  // update current page
  currentPage = pageNum;

  // Update page input value
  pageNumInput.value = currentPage;

  // change image
  page1.setAttribute('src', images[currentPage]);
  
  if (displayMode === DISPLAY_SPREAD) {
    page2.setAttribute('src', images[currentPage + 1]);
  }
}

ipcRenderer.on('reader-path', (e, imageDir, startingPage = 0) => {
  console.log(`Reader window received ${imageDir}`);
  console.log(`Starting Page: ${startingPage}`)
  selectedDir = imageDir;
  currentPage = startingPage; // TODO: add confirmation window

  fs.readdir(imageDir, (error, files) => {
    console.log(files)
    // Create our array of full image paths
    images = files.map((file) => path.join(imageDir, file))

    // Store image dimensions as array of objects
    dimensions = images.map(image => sizeOf(image));

    // Set page count
    pageCountLabel.innerHTML = images.length - 1

    changePage(currentPage); // Display the content!

    addShortcuts();
  })
});
