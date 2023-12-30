// popup.js





document.addEventListener('DOMContentLoaded', function () {
  var trackButton = document.getElementById('trackButton');
  var viewTrackedJobsButton = document.getElementById('viewTrackedJobsButton');
  var clearTrackedJobsButton = document.getElementById('clearTrackedJobsButton');

  clearTrackedJobsButton.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      chrome.tabs.sendMessage(currentTab.id, { action: 'clearTrackedJobs' }, function (response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log(response);
        }
      });
    });
  });
});


function clearTrackedJobs() {
  // Send a message to content script to clear its data
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    chrome.tabs.sendMessage(currentTab.id, { action: 'clearTrackedJobs' }, function (response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log(response);
      }
    });
  });
}
