const API_KEY = 'AIzaSyAWihABkwxCb1SY5zkgkOvx_NlUg32NIWw';
const DF_CHANNEL_ID = 'UC9PBzalIcEQCsiIkq36PyUA';

async function fetchDFVideos(yearsAgo, elementId) {
    // 1. Get the actual "now"
    const now = new Date(); 
    
    // 2. Create a target date by subtracting the years
    const targetDate = new Date();
    targetDate.setFullYear(now.getFullYear() - yearsAgo);
    
    // 3. Define the +/- 14 day window (in milliseconds)
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    const publishedAfter = new Date(targetDate.getTime() - twoWeeksInMs).toISOString();
    const publishedBefore = new Date(targetDate.getTime() + twoWeeksInMs).toISOString();

    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${DF_CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}&type=video`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Handle potential API errors (like quota limits)
        if (data.error) {
            console.error("API Error:", data.error.message);
            return;
        }
        
        displayVideos(data.items, elementId);
    } catch (error) {
        console.error("Network or Fetch Error:", error);
    }
}

function displayVideos(videos, elementId) {
    const container = document.getElementById(elementId);
    if (!videos || videos.length === 0) {
        container.innerHTML = "<p>No videos found for this period.</p>";
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

// Initialize
fetchDFVideos(1, 'grid-1');
fetchDFVideos(5, 'grid-5');
fetchDFVideos(10, 'grid-10');
