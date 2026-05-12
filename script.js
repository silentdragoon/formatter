const API_KEY = 'AIzaSyAWihABkwxCb1SY5zkgkOvx_NlUg32NIWw';
const DF_CHANNEL_ID = 'UC9PBzalIcEQCsiIkq36PyUA';

const datePicker = document.getElementById('base-date');
const updateBtn = document.getElementById('update-btn');

// Set the date picker to today's date by default
datePicker.valueAsDate = new Date();

async function fetchDFVideos(yearsAgo, elementId, baseDate) {
    const container = document.getElementById(elementId);
    container.innerHTML = "<p>Loading history...</p>";

    const targetDate = new Date(baseDate);
    targetDate.setFullYear(targetDate.getFullYear() - yearsAgo);

    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    const publishedAfter = new Date(targetDate.getTime() - twoWeeksInMs).toISOString();
    const publishedBefore = new Date(targetDate.getTime() + twoWeeksInMs).toISOString();

    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${DF_CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}&type=video`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            // This will show you if it's a Quota or API Key issue
            container.innerHTML = `<p style="color: #ff4444;">API Error: ${data.error.message}</p>`;
            return;
        }

        displayVideos(data.items, elementId);
    } catch (error) {
        container.innerHTML = "<p>Network Error. Check your connection.</p>";
    }
}

function displayVideos(videos, elementId) {
    const container = document.getElementById(elementId);
    if (!videos || videos.length === 0) {
        container.innerHTML = "<p>No videos found for this window.</p>";
        return;
    }

    container.innerHTML = videos.map(v => `
        <div class="video-card">
            <a href="https://www.youtube.com/watch?v=${v.id.videoId}" target="_blank">
                <img src="${v.snippet.thumbnails.medium.url}" alt="thumbnail">
                <h3>${v.snippet.title}</h3>
                <p>${new Date(v.snippet.publishedAt).toLocaleDateString()}</p>
            </a>
        </div>
    `).join('');
}

// Master function to refresh all sections
function updateAllGrids() {
    const selectedDate = new Date(datePicker.value);

    // Validate date
    if (isNaN(selectedDate.getTime())) return;

    fetchDFVideos(1, 'grid-1', selectedDate);
    fetchDFVideos(5, 'grid-5', selectedDate);
    fetchDFVideos(10, 'grid-10', selectedDate);
}

// Listen for button click
updateBtn.addEventListener('click', updateAllGrids);

// Initial load
updateAllGrids();
