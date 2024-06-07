const clientId = 'acf7aec2080a4c4691ab10fd73acae30'; // Replace with your client ID
const redirectUri = 'http://localhost:5500/callback'; // Replace with your redirect URI
const scope = 'user-library-read';

// Client-side code
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
        // Redirect to posts.html
        window.location.href = 'posts.html'; // Redirect to the desired page
    }
});

// Server-side code (assuming you're using Express.js)
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname)); // Serve static files from the current directory

app.get('/callback', (req, res) => {
    // Handle callback logic here
    res.sendFile(path.join(__dirname, 'posts.html')); // Serve posts.html from the current directory
});

// Other routes and server configurations...

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
