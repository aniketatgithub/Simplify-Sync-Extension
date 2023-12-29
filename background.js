// background.js

var simplifyInternshipUrl = "https://github.com/SimplifyJobs/Summer2024-Internships";

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url && isSimplifyInternshipPage(changeInfo.url)) {
    chrome.browserAction.setIcon({
      path: {
        "16": "JobSync-logos.jpeg",
        "48": "JobSync-logos.jpeg",
        "128": "JobSync-logos.jpeg"
      }
    });
  } else {
    chrome.action.setIcon({
      path: {
        "16": "JobSync-logos_white.png",
        "48": "JobSync-logos_white.png",
        "128": "JobSync-logos_white.png"
      }
    });
  }
});

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
