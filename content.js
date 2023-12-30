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

function createTrackingIcon(jobTitle, location, datePosted, isJobTracked) {
  const icon = document.createElement('img');
  icon.alt = 'Track Job';
  icon.classList.add('centered-icon');
  icon.style.cursor = 'pointer';

  // Set color for tracked or untracked state
  icon.style.filter = isJobTracked ? 'grayscale(100%)' : ''; // Swap colors

  // Change the image source based on the tracking state
  icon.src = 'https://miro.medium.com/v2/resize:fit:512/1*nZ9VwHTLxAfNCuCjYAkajg.png';

  icon.addEventListener('click', () => {
    // Toggle the tracking state
    isJobTracked = !isJobTracked;

    // Change the image source dynamically after the click event
    icon.filter = isJobTracked
      ? 'grayscale(100%)'
      : 'grayscale(0%)';

    // Update the grayscale filter based on the new tracking state
    icon.style.filter = isJobTracked ? 'grayscale(100%)' : '';

    // Update the tracking state for the next click
    if (isJobTracked) {
      trackJob({ title: jobTitle, location, datePosted });
      console.log('Icon clicked! Job tracked.');
    } else {
      untrackJob({ title: jobTitle, location, datePosted });
      console.log('Icon clicked! Job untracked.');
    }
  });

  return icon;
}



function applyTrackingIcons() {
  const jobTable = findJobTable();
  if (!jobTable) {
    console.log('Job table not found on the page.');
    return;
  }

  const jobRows = jobTable.querySelectorAll('tbody > tr');

  // Intersection Observer options
  const options = {
    threshold: 0.5, // Adjust as needed
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const jobRow = entry.target;
        const jobTitleElement = jobRow.querySelector('td:nth-child(2)');
        const locationElement = jobRow.querySelector('td:nth-child(3)');
        const datePostedElement = jobRow.querySelector('td:nth-child(5)');

        const jobTitle = jobTitleElement?.innerText || 'N/A';
        const location = locationElement?.innerText || 'N/A';
        const datePosted = datePostedElement?.innerText || 'N/A';

        const trackedJobs = getTrackedJobs();
        const isJobTracked = trackedJobs.some(job => job.title === jobTitle && job.location === location);

        const icon = createTrackingIcon(jobTitle, location, datePosted, isJobTracked);
        jobRow.appendChild(icon);

        icon.addEventListener('click', () => {
          // Toggle the tracking state
          // if (isJobTracked) {
          //   untrackJob({ title: jobTitle, location, datePosted });
          //   console.log('Icon clicked! Job untracked.');
          //   icon.src = 'https://miro.medium.com/v2/resize:fit:512/1*nZ9VwHTLxAfNCuCjYAkajg.png';
          // } else {
          //   trackJob({ title: jobTitle, location, datePosted });
          //   console.log('Icon clicked! Job tracked.');
          //   icon.src = 'https://toppng.com/uploads/preview/blue-dot-circle-icon-116420329010b2hxeeljn.png';
          // }

          // Update trackedJobs and store in localStorage
          const updatedTrackedJobs = getTrackedJobs();
          const existingJobIndex = updatedTrackedJobs.findIndex(job => job.title === jobTitle && job.location === location);
          
          if (existingJobIndex !== -1) {
            updatedTrackedJobs.splice(existingJobIndex, 1);
          } else {
            updatedTrackedJobs.push({ title: jobTitle, location, datePosted });
          }

          localStorage.setItem('trackedJobs', JSON.stringify(updatedTrackedJobs));
        });

        // Unobserve the row once the icon is added
        observer.unobserve(jobRow);
      }
    });
  }, options);

  // Observe each job row
  jobRows.forEach(jobRow => {
    observer.observe(jobRow);
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
