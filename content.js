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

function applyTrackingIcons() {
  const jobTable = findJobTable();
  if (!jobTable) {
    console.log('Job table not found on the page.');
    return;
  }

  const jobRows = jobTable.querySelectorAll('tbody > tr');
  const top50JobRows = Array.from(jobRows).slice(0, 50);

  top50JobRows.forEach(jobRow => {
    const jobTitleElement = jobRow.querySelector('td:nth-child(2)');
    const locationElement = jobRow.querySelector('td:nth-child(3)');
    const datePostedElement = jobRow.querySelector('td:nth-child(5)');

    const jobTitle = jobTitleElement?.innerText || 'N/A';
    const location = locationElement?.innerText || 'N/A';
    const datePosted = datePostedElement?.innerText || 'N/A';

    console.log('Job Tracked:', { jobTitle, location, datePosted });

    const icon = document.createElement('img');
    icon.src = 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Basic_green_dot.png';
    icon.alt = 'Track Job';
    icon.classList.add('centered-icon');

    const trackedJobs = getTrackedJobs();
    const isJobTracked = trackedJobs.some(job => job.title === jobTitle && job.location === location);

    if (isJobTracked) {
      icon.style.filter = 'grayscale(100%)';
    } else {
      icon.addEventListener('click', () => {
        trackJob({ title: jobTitle, location, datePosted });
        console.log('Icon clicked! Job tracked.');

        // Update trackedJobs and store in localStorage
        const updatedTrackedJobs = getTrackedJobs();
        updatedTrackedJobs.push({ title: jobTitle, location, datePosted });
        localStorage.setItem('trackedJobs', JSON.stringify(updatedTrackedJobs));

        icon.style.filter = 'grayscale(100%)';
        icon.removeEventListener('click', () => {});
      });

      icon.style.cursor = 'pointer';
    }

    jobRow.appendChild(icon);
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

