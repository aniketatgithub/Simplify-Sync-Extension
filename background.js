// background.js

var simplifyInternshipUrl = "https://github.com/SimplifyJobs/Summer2024-Internships";



function isSimplifyInternshipPage(url) {
  return url.startsWith(simplifyInternshipUrl);
}

chrome.idle.onStateChanged.addListener((browserActivityState) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url && activeTab.url.match('https:\/\/github\.com\/SimplifyJobs\/Summer2024-Internships.*')) {
      chrome.tabs.sendMessage(activeTab.id, { browserActivityState: browserActivityState });
    }
  });
});
