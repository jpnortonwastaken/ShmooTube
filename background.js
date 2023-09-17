let watching = false;
let watchingPlaylist = false;
let playlistTime = '';

// Adds listener for messages from content/popup scripts
// If request contains watching/watchingPlaylist property, variables are updated
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (typeof request.watching !== 'undefined') {
    watching = request.watching;
  }

  if (typeof request.watchingPlaylist !== 'undefined') {
    watchingPlaylist = request.watchingPlaylist;
  }

  if (typeof request.playlistTime !== 'undefined') {
    playlistTime = request.playlistTime;
  }
});

// Adds listener that sends current value of watching and watchingPlaylist
// when a connection is made to the extension (e.g. popup is opened)
chrome.runtime.onConnect.addListener(port => {
  port.postMessage({ watching, watchingPlaylist, playlistTime });
});

// Adds listener for messages from content/popup scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // If request.adDuration is present, get the current total ad time from local storage,
  // add the new ad duration, and then save it back to local storage
  if (request.adDuration) {
    chrome.storage.local.get(['totalAdTime'], function(result) {
      let totalAdTime = result.totalAdTime || 0;
      totalAdTime += request.adDuration;
      chrome.storage.local.set({ totalAdTime: totalAdTime });
    });
  } 
  
  // If request.videoUrl is present, save video URL to local storage
  if (request.videoUrl) {
    chrome.storage.local.set({ videoUrl: request.videoUrl });
  }
  
  // If request.thumbnailUrl is present, save thumbnail URL to local storage
  if (request.thumbnailUrl) {
    chrome.storage.local.set({ thumbnailUrl: request.thumbnailUrl });
  }
});
