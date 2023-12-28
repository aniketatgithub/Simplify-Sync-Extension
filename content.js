chrome.runtime.sendMessage({ action: 'detectSimplifyInternshipPage', detected: true });
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'trackJob') {
    var jobTable = findJobTable(); // Function to find the correct job table
    if (jobTable) {
      var jobRows = jobTable.querySelectorAll('tbody > tr'); // Select all job rows within tbody

      // Limit the iteration to the first 50 job rows
      var top50JobRows = Array.from(jobRows).slice(0, 50);

      top50JobRows.forEach(function (jobRow) {
        var jobTitleElement = jobRow.querySelector('td:nth-child(2)');
        var locationElement = jobRow.querySelector('td:nth-child(3)');
        var datePostedElement = jobRow.querySelector('td:nth-child(5)');

        // Check if elements are found before accessing their properties
        var jobTitle = jobTitleElement ? jobTitleElement.innerText : 'N/A';
        var location = locationElement ? locationElement.innerText : 'N/A';
        var datePosted = datePostedElement ? datePostedElement.innerText : 'N/A';

        // Replace this with your logic to handle each tracked job data
        console.log('Job Tracked:', { jobTitle, location, datePosted });

        // Create and append a clickable icon element to each jobRow
        var icon = document.createElement('img');
        icon.src = 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Basic_green_dot.png'; // Replace with the correct path to your icon
        icon.alt = 'Track Job';
        icon.classList.add('centered-icon');
        
        // Make the icon clickable and handle the click event
        icon.addEventListener('click', function () {
          // Add your logic here to connect to Google Sheets and update the data
          // You can use the jobTitle, location, and datePosted variables to get the data
          console.log('Icon clicked! Add logic to update Google Sheets.');
        });

        // Change cursor style to pointer when hovering over the icon
        icon.style.cursor = 'pointer';

        jobRow.appendChild(icon);
      });
    } else {
      console.log('Job table not found on the page.');
    }
  }

  function findJobTable() {
    // Look for tables with specific column headers
    var tables = document.querySelectorAll('table');
    for (var i = 0; i < tables.length; i++) {
      var headers = tables[i].querySelectorAll('thead th');
      if (headers.length >= 5) { // Assuming you have at least 5 columns
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
});
