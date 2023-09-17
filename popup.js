 // Establish a connection to the background script through Chrome's extension API
let port = chrome.runtime.connect();

// Add a listener for messages from the background script
port.onMessage.addListener(msg => {
  console.log('watching video: ' + msg.watching);

  // If watching a playlist, show, else hide
  if (msg.watching) {
    document.getElementById("thumbnail-label").style.display = "block";
    document.getElementById("thumbnail-container").style.display = "block";
  } else {
    document.getElementById("thumbnail-label").style.display = "none";
    document.getElementById("thumbnail-container").style.display = "none";
  }

  const playlistTimeLabel = document.getElementById('playlistTimeLabel');
  const playlistTime = document.getElementById('playlistTime');
  
  console.log('watching playlist: ' + msg.watchingPlaylist);

  // If watching a playlist, show, else hide
  if (msg.watchingPlaylist) {
    playlistTimeLabel.style.display = 'block';
    playlistTime.style.display = 'block';
  } else {
    playlistTimeLabel.style.display = 'none';
    playlistTime.style.display = 'none';
  }

  // If watching a playlist then set playlistTime text
  if (msg.playlistTime) {
    let playlistTimeString = msg.playlistTime;

    if (playlistTimeString.includes('0 hrs ')) {
      playlistTimeString = playlistTimeString.replace('0 hrs ', '');
    }
    if (playlistTimeString.includes('0 mins ')) {
      playlistTimeString = playlistTimeString.replace('0 mins ', '');
    }

    document.getElementById('playlistTime').innerText = playlistTimeString;
  }
});

// Retrieve 'totalAdTime' and 'thumbnailUrl' from local storage
chrome.storage.local.get(['totalAdTime', 'thumbnailUrl'], function(result) {
    let totalAdTime = result.totalAdTime || 0; // Get the total ad time or default to 0
    totalAdTime = totalAdTime / 1000;  // Convert total ad time to seconds
    
    // Calculate minutes and seconds
    const minutes = Math.floor(totalAdTime / 60);
    const seconds = Math.round(totalAdTime % 60);
    
    // Update the 'totalAdTime' text in the document with the calculated minutes and seconds
    document.getElementById('totalAdTime').innerText = minutes + ' mins ' + seconds + ' secs';
    
    // If there is a thumbnail URL
    if (result.thumbnailUrl) {
        // Update the thumbnail source
        document.getElementById('thumbnail').src = result.thumbnailUrl;
        
        // Add event listener to 'View Full Size' button
        document.getElementById('viewFullSize').addEventListener('click', () => {
            // Open the thumbnail in a new tab
            chrome.tabs.create({url: result.thumbnailUrl});
        });
    }
});
