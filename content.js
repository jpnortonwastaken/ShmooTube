let adIsPlaying = false;
let adStartTime;
let videoId = '';
let videoUrl = '';

// Check page for ads and playlist
const checkPage = () => {
  const urlParams = new URLSearchParams(new URL(window.location.href).search); // Extract URL parameters
  const watchingPlaylist = urlParams.has('v') && urlParams.has('list'); // Check if the user is watching a playlist

  // Send the watchingPlaylist value to the background script
  chrome.runtime.sendMessage({ watchingPlaylist });

  // Get all playlist video time elements on page
  const videoDurations = document.querySelectorAll('.ytd-playlist-panel-video-renderer span.style-scope.ytd-thumbnail-overlay-time-status-renderer');

  let totalDurationInSeconds = 0;

  videoDurations.forEach(durationElement => {
    const durationText = durationElement.innerText.trim(); // E.g. "1:05:30" or "5:30"
    const timeParts = durationText.split(':').map(Number);

    // Depending on the length of the timeParts array, calculate the duration accordingly
    if (timeParts.length === 3) {
      totalDurationInSeconds += timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    } else if (timeParts.length === 2) {
      totalDurationInSeconds += timeParts[0] * 60 + timeParts[1];
    }
  });

  // Convert totalDurationInSeconds into a human-readable format (e.g. "9 hrs 9 mins 9 secs")
  const totalHours = Math.floor(totalDurationInSeconds / 3600);
  const remainingMinutes = Math.floor((totalDurationInSeconds % 3600) / 60);
  const remainingSeconds = totalDurationInSeconds % 60;
  const playlistTime = `${totalHours} hrs ${remainingMinutes} mins ${remainingSeconds} secs`;

  chrome.runtime.sendMessage({ playlistTime });
  
  // If the URL includes "watch," the user is watching a video
  if (window.location.href.includes("watch")) {
    chrome.runtime.sendMessage({ watching: true });
  } else {
    chrome.runtime.sendMessage({ watching: false });
  }

  const adOverlay = document.querySelector('.ad-interrupting'); // Check for an element with the class 'ad-interrupting' (an indicator of an ad)

  // If videoUrl is not set or the current URL is different from the previous URL
  if (!videoUrl || videoUrl !== window.location.href) {
    videoUrl = window.location.href; // Update videoUrl
    const urlParams = new URLSearchParams(new URL(videoUrl).search); // Extract URL parameters again
    if (urlParams.has('v')) { // If there's a video ID in the parameters
      videoId = urlParams.get('v'); // Retrieve video ID
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`; // Construct thumbnail URL
      console.log('Thumbnail URL: ' + thumbnailUrl);
      console.log('Video URL: ' + videoUrl);

      // Send thumbnail URL and video URL to background script
      chrome.runtime.sendMessage({ thumbnailUrl: thumbnailUrl, videoUrl: videoUrl });
    }
  }

  if (adOverlay && !adIsPlaying) { // If there's an ad overlay and ad is not already playing
    adIsPlaying = true; // Set ad playing flag
    adStartTime = Date.now(); // Record start time
    console.log('Ad started');
  } else if (!adOverlay && adIsPlaying) { // If there's no ad overlay and ad was previously playing
    adIsPlaying = false; // Clear ad playing flag
    const adEndTime = Date.now(); // Record end time
    const adDuration = adEndTime - adStartTime; // Calculate duration

    // Convert to seconds
    let adDurationSeconds = adDuration / 1000;
    const minutes = Math.floor(adDurationSeconds / 60); // Calculate minutes
    const seconds = Math.round(adDurationSeconds % 60); // Calculate seconds

    chrome.runtime.sendMessage({ adDuration: adDuration }); // Send ad duration to background script
    console.log('Ad ended. Duration: ' + minutes + ' mins ' + seconds + ' secs'); // Log duration
  }
};

// Run checkPage function every 500 ms
setInterval(checkPage, 500);