document.addEventListener('DOMContentLoaded', function () {
    var trackedJobsList = document.getElementById('trackedJobsList');

    // Retrieve tracked jobs from local storage
    var trackedJobs = JSON.parse(localStorage.getItem('trackedJobs')) || [];

    // Display tracked jobs in the list
    trackedJobs.forEach(function (job) {
        var listItem = document.createElement('li');
        listItem.textContent = `${job.title} - ${job.location} (Posted on: ${job.datePosted})`;
        trackedJobsList.appendChild(listItem);
    });
});
