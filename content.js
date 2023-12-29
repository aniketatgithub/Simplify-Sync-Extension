// content.js

chrome.runtime.sendMessage({ action: 'detectSimplifyInternshipPage', detected: true });

function findJobTable() {
  const tables = document.querySelectorAll('table');
  for (const table of tables) {
    const headers = table.querySelectorAll('thead th');
    if (headers.length >= 5) {
      const headerTexts = Array.from(headers).map(header => header.innerText.trim().toLowerCase());
      if (
        headerTexts.includes('company') &&
        headerTexts.includes('role') &&
        headerTexts.includes('location') &&
        headerTexts.includes('application/link') &&
        headerTexts.includes('date posted')
      ) {
        return table;
      }
    }
  }
  return null;
}

function getTrackedJobs() {
  return JSON.parse(localStorage.getItem('trackedJobs')) || [];
}

function trackJob(job) {
  try {
    // Inform the background script about the tracked job
    chrome.runtime.sendMessage({ action: 'jobTracked', job });
  } catch (error) {
    console.error('Error in trackJob:', error);
  }
}

function untrackJob(job) {
  try {
    // Inform the background script about the untracked job
    chrome.runtime.sendMessage({ action: 'jobUntracked', job });
  } catch (error) {
    console.error('Error in untrackJob:', error);
  }
}

function createTrackingIcon() {
  const icon = document.createElement('img');
  icon.src = 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Basic_green_dot.png';
  icon.alt = 'Track Job';
  icon.classList.add('centered-icon');
  icon.style.cursor = 'pointer';

  return icon;
}

function applyTrackingIcons() {
  const jobTable = findJobTable();
  if (!jobTable) {
    console.log('Job table not found on the page.');
    return;
  }

  const jobRows = jobTable.querySelectorAll('tbody > tr');

  jobRows.forEach(jobRow => {
    const icon = createTrackingIcon(); // Create an icon without querying initially
    jobRow.appendChild(icon);

    icon.addEventListener('click', () => {
      const jobTitleElement = jobRow.querySelector('td:nth-child(2)');
      const locationElement = jobRow.querySelector('td:nth-child(3)');
      const datePostedElement = jobRow.querySelector('td:nth-child(5)');

      const jobTitle = jobTitleElement?.innerText || 'N/A';
      const location = locationElement?.innerText || 'N/A';
      const datePosted = datePostedElement?.innerText || 'N/A';

      const trackedJobs = getTrackedJobs();
      const isJobTracked = trackedJobs.some(job => job.title === jobTitle && job.location === location);

      if (isJobTracked) {
        untrackJob({ title: jobTitle, location, datePosted }); // Untrack the job
        console.log('Icon clicked! Job untracked.');
        icon.style.filter = 'grayscale(100%)'; // Apply the grayscale filter for untracked color
      } else {
        trackJob({ title: jobTitle, location, datePosted }); // Track the job
        console.log('Icon clicked! Job tracked.');
        icon.style.filter = ''; // Reset the grayscale filter for tracked color
      }

      // Update trackedJobs and store in localStorage
      const updatedTrackedJobs = getTrackedJobs();
      const existingJobIndex = updatedTrackedJobs.findIndex(job => job.title === jobTitle && job.location === location);

      if (existingJobIndex !== -1) {
        // Job is already tracked, so untrack it
        updatedTrackedJobs.splice(existingJobIndex, 1);
      } else {
        // Job is not tracked, so track it
        updatedTrackedJobs.push({ title: jobTitle, location, datePosted });
      }

      localStorage.setItem('trackedJobs', JSON.stringify(updatedTrackedJobs));
    });
  });
}

// Apply tracking icons when the content script is loaded
applyTrackingIcons();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'clearTrackedJobs') {
    clearTrackedJobs();
    sendResponse({ success: true }); // Send a response indicating success
  }
});

function clearTrackedJobs() {
  // Clear tracked jobs data from localStorage
  localStorage.removeItem('trackedJobs');
  console.log('Tracked jobs cleared.');
}
