chrome.runtime.sendMessage({ action: 'detectSimplifyInternshipPage', detected: true });

function findJobTable() {
  var tables = document.querySelectorAll('table');
  for (var i = 0; i < tables.length; i++) {
    var headers = tables[i].querySelectorAll('thead th');
    if (headers.length >= 5) {
      var headerTexts = Array.from(headers).map(header => header.innerText.trim().toLowerCase());
      if (
        headerTexts.includes('company') &&
        headerTexts.includes('role') &&
        headerTexts.includes('location') &&
        headerTexts.includes('application/link') &&
        headerTexts.includes('date posted')
      ) {
        return tables[i];
      }
    }
  }
  return null;
}

function getTrackedJobs() {
  return JSON.parse(localStorage.getItem('trackedJobs')) || [];
}

function trackJob(job) {
  var trackedJobs = getTrackedJobs();
  trackedJobs.push(job);
  localStorage.setItem('trackedJobs', JSON.stringify(trackedJobs));
}

function applyTrackingIcons() {
  var jobTable = findJobTable();
  if (jobTable) {
    var jobRows = jobTable.querySelectorAll('tbody > tr');

    // Limit the iteration to the first 50 job rows
    var top50JobRows = Array.from(jobRows).slice(0, 50);

    top50JobRows.forEach(function (jobRow) {
      var jobTitleElement = jobRow.querySelector('td:nth-child(2)');
      var locationElement = jobRow.querySelector('td:nth-child(3)');
      var datePostedElement = jobRow.querySelector('td:nth-child(5)');

      var jobTitle = jobTitleElement ? jobTitleElement.innerText : 'N/A';
      var location = locationElement ? locationElement.innerText : 'N/A';
      var datePosted = datePostedElement ? datePostedElement.innerText : 'N/A';

      console.log('Job Tracked:', { jobTitle, location, datePosted });

      var icon = document.createElement('img');
      icon.src = 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Basic_green_dot.png';
      icon.alt = 'Track Job';
      icon.classList.add('centered-icon');

      var trackedJobs = getTrackedJobs();
      var isJobTracked = trackedJobs.some(job => job.title === jobTitle && job.location === location);

      if (isJobTracked) {
        icon.style.filter = 'grayscale(100%)';
      } else {
        icon.addEventListener('click', function () {
          trackJob({ title: jobTitle, location, datePosted });
          console.log('Icon clicked! Job tracked.');
          icon.style.filter = 'grayscale(100%)'; // Apply style immediately on click
          icon.removeEventListener('click', arguments.callee); // Remove the click event listener after tracking
        });

        icon.style.cursor = 'pointer';
      }

      jobRow.appendChild(icon);
    });
  } else {
    console.log('Job table not found on the page.');
  }
}

// Apply tracking icons when the content script is loaded
applyTrackingIcons();
