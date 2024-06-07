// posts.js

const clientId = 'acf7aec2080a4c4691ab10fd73acae30'; // Replace with your client ID
const redirectUri = 'http://localhost:5500/callback'; // Replace with your redirect URI
const scope = 'user-library-read';

document.getElementById('registerbutton').addEventListener('click', () => {
    console.log("Register button clicked");
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    console.log("Auth URL:", authUrl);
    window.location.href = authUrl;
});

window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
        console.log("Access Token:", accessToken);
        fetch('https://api.spotify.com/v1/me/tracks', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        .then(response => response.json())
        .then(data => {
            const tracksDiv = document.getElementById('tracks');
            data.items.forEach((item, idx) => {
                const track = item.track;
                const trackElement = document.createElement('div');
                trackElement.textContent = `${idx + 1}: ${track.artists[0].name} – ${track.name}`;
                tracksDiv.appendChild(trackElement);
            });
        })
        .catch(error => console.error('Error fetching saved tracks:', error));
    }
});
app.get('/callback', (req, res) => {
    // Handle callback logic here
});