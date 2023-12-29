// popup.js

document.addEventListener('DOMContentLoaded', function () {
  var trackButton = document.getElementById('trackButton');
  var viewTrackedJobsButton = document.getElementById('viewTrackedJobsButton');
  var clearTrackedJobsButton = document.getElementById('clearTrackedJobsButton');

  trackButton.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      chrome.tabs.sendMessage(currentTab.id, { action: 'trackJob' });
    });
  });

  viewTrackedJobsButton.addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.extension.getURL('tracked_jobs.html') });
  });

  // Add event handling for the "Clear Tracked Jobs" button
  clearTrackedJobsButton.addEventListener('click', function () {
    clearTrackedJobs();
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
