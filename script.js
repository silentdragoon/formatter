const API_KEY = 'AIzaSyAWihABkwxCb1SY5zkgkOvx_NlUg32NIWw';
const pendingRequests = {};

// Purge stale cached video data (older than 24 hours) to prevent storage bloat
function purgeStaleCache() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dfVideos_')) {
            try {
                const entry = JSON.parse(localStorage.getItem(key));
                if (entry && entry.timestamp && (now - entry.timestamp > maxAge)) {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                // Invalid JSON, remove the entry
                localStorage.removeItem(key);
            }
        }
    }
}

// Run purge on script load
purgeStaleCache();
const DF_CHANNEL_ID = 'UC9PBzalIcEQCsiIkq36PyUA';

const datePicker = document.getElementById('base-date');
const updateBtn = document.getElementById('update-btn');

// Set the date picker to today's date by default
datePicker.valueAsDate = new Date();

async function fetchDFVideos(yearsAgo, elementId, baseDate) {
    const container = document.getElementById(elementId);
    container.innerHTML = "<p>Loading history...</p>";

    // Construct cache key based on parameters
    const cacheKey = `dfVideos_${yearsAgo}_${baseDate}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            // Optional: check timestamp validity (e.g., 24h)
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            if (now - parsed.timestamp < maxAge) {
                // Use cached data
                displayVideos(parsed.items, elementId);
                return;
            } else {
                // Stale cache, remove
                localStorage.removeItem(cacheKey);
            }
        } catch (e) {
            // Parsing error, clear cache entry
            localStorage.removeItem(cacheKey);
        }
    }

    const targetDate = new Date(baseDate);
    targetDate.setFullYear(targetDate.getFullYear() - yearsAgo);

    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    const publishedAfter = new Date(targetDate.getTime() - twoWeeksInMs).toISOString();
    const publishedBefore = new Date(targetDate.getTime() + twoWeeksInMs).toISOString();

    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${DF_CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}&type=video`;

    // Check if a request for this key is already in flight
    if (pendingRequests[cacheKey]) {
        const data = await pendingRequests[cacheKey];
        if (data && data.items) {
            displayVideos(data.items, elementId);
            return;
        }
    }
    // Initiate fetch and store promise
    const fetchPromise = fetch(url).then(r => r.json());
    pendingRequests[cacheKey] = fetchPromise;
    const data = await fetchPromise;
    // Clean up pending request entry
    delete pendingRequests[cacheKey];

    if (data.error) {
        // This will show you if it's a Quota or API Key issue
        container.innerHTML = `<p style="color: #ff4444;">API Error: ${data.error.message}</p>`;
        return;
    }

    // Cache successful response
    const cacheEntry = {
        timestamp: Date.now(),
        items: data.items
    };
    try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (e) {
        // If storage quota exceeded, optionally clear old entries (not implemented)
    }

    displayVideos(data.items, elementId);
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
