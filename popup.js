document.addEventListener('DOMContentLoaded', function () {
  var trackButton = document.getElementById('trackButton');
  var viewTrackedJobsButton = document.getElementById('viewTrackedJobsButton');

  trackButton.addEventListener('click', function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          var currentTab = tabs[0];
          chrome.tabs.sendMessage(currentTab.id, { action: 'trackJob' });
      });
  });

  viewTrackedJobsButton.addEventListener('click', function () {
      chrome.tabs.create({ url: chrome.extension.getURL('tracked_jobs.html') });
  });
});
