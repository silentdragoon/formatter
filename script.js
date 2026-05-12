const API_KEY = 'AIzaSyAWihABkwxCb1SY5zkgkOvx_NlUg32NIWw';
const DF_CHANNEL_ID = 'UC9PBzalIcEQCsiIkq36PyUA';

async function fetchDFVideos(yearsAgo, elementId) {
    const today = new Date("2026-05-12"); // Hardcoded to current simulated date
    const targetDate = new Date(today.setFullYear(today.getFullYear() - yearsAgo));
    
    // Set +/- 2 week range
    const after = new Date(targetDate.getTime() - (14 * 24 * 60 * 60 * 1000)).toISOString();
    const before = new Date(targetDate.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString();

    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${DF_CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&publishedAfter=${after}&publishedBefore=${before}&type=video`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayVideos(data.items, elementId);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function displayVideos(videos, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = videos.map(v => `
        <div class="video-card">
            <a href="https://www.youtube.com/watch?v=${v.id.videoId}" target="_blank">
                <img src="${v.snippet.thumbnails.medium.url}" alt="thumbnail">
                <h3>${v.snippet.title}</h3>
                <p>${new Date(v.snippet.publishedAt).toDateString()}</p>
            </a>
        </div>
    `).join('');
}

// Initialize
fetchDFVideos(1, 'grid-1');
fetchDFVideos(5, 'grid-5');
fetchDFVideos(10, 'grid-10');
