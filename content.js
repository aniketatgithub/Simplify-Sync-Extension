// Detect Simplify Internship Page and inform background script
const elements = document.querySelectorAll('.Box-sc-g0xbh4-0.bJMeLZ.js-snippet-clipboard-copy-unpositioned');

// Iterate over the found elements and override padding
elements.forEach(element => {
  element.style.padding = '0px';
});

chrome.runtime.sendMessage({ action: 'detectSimplifyInternshipPage', detected: true });

// Function to find the job table in the page
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
        // Add two more columns
        const appliedHeader = document.createElement('th');
        appliedHeader.innerText = 'Applied';
        headers[headers.length - 1].insertAdjacentElement('afterend', appliedHeader);

        const dateAppliedHeader = document.createElement('th');
        dateAppliedHeader.innerText = 'Date Applied';
        headers[headers.length - 1].insertAdjacentElement('afterend', dateAppliedHeader);

        // Apply styles to the table

        return table;
      }
    }
  }
  return null;
}

// Function to apply styles to the specified layout
function applyLayoutStyles() {
  const layoutElement = document.querySelector('.Layout--flowRow-until-md.react-repos-overview-margin.Layout--sidebarPosition-end.Layout--sidebarPosition-flowRow-end');

  if (layoutElement) {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @media (min-width: 1012px) {
        .Layout {
          --Layout-sidebar-width: 240px;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
}

// Function to retrieve tracked jobs from localStorage
function getTrackedJobs() {
  return JSON.parse(localStorage.getItem('trackedJobs')) || [];
}

// Function to inform the background script about a tracked job
function trackJob(job) {
  try {
    chrome.runtime.sendMessage({ action: 'jobTracked', job });
  } catch (error) {
    console.error('Error in trackJob:', error);
  }
}

// Function to inform the background script about an untracked job
function untrackJob(job) {
  try {
    chrome.runtime.sendMessage({ action: 'jobUntracked', job });
  } catch (error) {
    console.error('Error in untrackJob:', error);
  }
}

// Function to create tracking icons for jobs
function createTrackingIcon(jobTitle, location, datePosted, trackedDate, isJobTracked, jobRow) {
  const iconContainer = document.createElement('div');
  iconContainer.classList.add('icon-container');

  const icon = document.createElement('img');
  icon.alt = 'Track Job';
  icon.classList.add('centered-icon');
  icon.style.cursor = 'pointer';

  // Set a fixed width and height for consistency
  icon.style.width = '20px';
  icon.style.height = '20px';

  // Set color for tracked or untracked state
  icon.style.filter = isJobTracked ? '' : 'grayscale(100%)';

  // Change the image source based on the tracking state
  icon.src = 'https://miro.medium.com/v2/resize:fit:512/1*nZ9VwHTLxAfNCuCjYAkajg.png';

  icon.addEventListener('click', () => {
    // Toggle the tracking state
    isJobTracked = !isJobTracked;

    // Change the image source dynamically after the click event
    icon.style.filter = isJobTracked ? '' : 'grayscale(100%)';

    // Update the tracking state for the next click
    if (isJobTracked) {
      const currentDate = new Date();
      const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
      trackJob({ title: jobTitle, location, datePosted, trackedDate: formattedDate });
      console.log('Icon clicked! Job tracked.');
      updateTrackingInfo(jobTitle, location, datePosted, formattedDate, isJobTracked, jobRow);
    } else {
      untrackJob({ title: jobTitle, location, datePosted });
      console.log('Icon clicked! Job untracked.');
      updateTrackingInfo(jobTitle, location, datePosted, '', isJobTracked, jobRow);
    }
  });

  iconContainer.appendChild(icon);

  // Append applied information to the row
  const appliedElement = document.createElement('div');
  appliedElement.innerText = isJobTracked ? 'Yes' : 'No';
  appliedElement.classList.add('applied');
  iconContainer.appendChild(appliedElement);

  // Append trackedDate information to the row
  const trackedDateElement = document.createElement('div');
  trackedDateElement.innerText = trackedDate ? formatDate(trackedDate) : '';
  trackedDateElement.classList.add('tracked-date');
  iconContainer.appendChild(trackedDateElement);

  return iconContainer;
}

// Function to apply tracking icons to job rows
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
        const trackedJob = trackedJobs.find(job => job.title === jobTitle && job.location === location);

        const isJobTracked = !!trackedJob;
        const trackedDate = trackedJob ? trackedJob.trackedDate : null;

        const icon = createTrackingIcon(jobTitle, location, datePosted, trackedDate, isJobTracked, jobRow);
        jobRow.appendChild(icon);

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

// Function to update tracking information in the UI immediately
function updateTrackingInfo(jobTitle, location, datePosted, trackedDate, isJobTracked, jobRow) {
  const iconContainer = jobRow.querySelector('.icon-container');
  if (iconContainer) {
    const appliedElement = iconContainer.querySelector('.applied');
    const trackedDateElement = iconContainer.querySelector('.tracked-date');
    const icon = iconContainer.querySelector('img');

    // Set color for tracked or untracked state
    icon.style.filter = isJobTracked ? '' : 'grayscale(100%)';

    // Change the image source based on the tracking state
    icon.src = isJobTracked
      ? 'https://miro.medium.com/v2/resize:fit:512/1*nZ9VwHTLxAfNCuCjYAkajg.png'
      : 'https://miro.medium.com/v2/resize:fit:512/1*nZ9VwHTLxAfNCuCjYAkajg.png'; // Adjust the source URLs as needed

    // Update applied information
    appliedElement.innerText = isJobTracked ? 'Yes' : 'No';

    // Update trackedDate information
    trackedDateElement.innerText = trackedDate ? formatDate(trackedDate) : '';
  }

  // Update local storage
  const updatedTrackedJobs = getTrackedJobs();
  const existingJobIndex = updatedTrackedJobs.findIndex(
    job => job.title === jobTitle && job.location === location
  );

  if (isJobTracked) {
    const currentDate = new Date();
    const formattedDate = formatDate(`${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`);

    if (existingJobIndex !== -1) {
      updatedTrackedJobs[existingJobIndex].trackedDate = formattedDate;
    } else {
      updatedTrackedJobs.push({ title: jobTitle, location, datePosted, trackedDate: formattedDate });
    }
  } else {
    if (existingJobIndex !== -1) {
      updatedTrackedJobs.splice(existingJobIndex, 1);
    }
  }

  localStorage.setItem('trackedJobs', JSON.stringify(updatedTrackedJobs));
}

// Function to format date without the year and time
function formatDate(dateTimeString) {
  const date = new Date(dateTimeString);

  // Format date
  const formattedDate = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  // Format time
  const formattedTime = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Combine formatted date and time on the same line
  const result = `${formattedDate} ${formattedTime}`.replace(/\r?\n|\r/g, ' ');
  return result;
}

// Apply tracking icons when the content script is loaded
applyTrackingIcons();

// Apply styles to the specified layout
applyLayoutStyles();

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'clearTrackedJobs') {
    clearTrackedJobs();
    console.log('Message received: clearTrackedJobs');
    sendResponse({ success: true }); // Send a response indicating success
  }
});

// Function to clear tracked jobs
function clearTrackedJobs() {
  console.log('Clear tracked jobs function called.');
  // Clear tracked jobs data from localStorage
  localStorage.removeItem('trackedJobs');
  console.log('Tracked jobs cleared.');
}

// Add the following styles at the end of your content.js file

const styles = `
  .centered-icon {
    width: 20px; /* Set a fixed width for consistency */
    height: 20px; /* Set a fixed height for consistency */
    margin: auto;
    display: block;
  }

  .icon-container {
    display: flex;
    align-items: center;
  }

  .icon-container img {
    margin-right: 2px; /* 2px border between icons and date+time */
    flex: 1; /* Allow the image to grow within the container */
    object-fit: contain; /* Maintain aspect ratio while filling the container */
  }

  .applied {
    font-size: 12px; /* Adjust the font size as needed */
  }

  .tracked-date {
    font-size: 12px; /* Adjust the font size as needed */
  }
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);
