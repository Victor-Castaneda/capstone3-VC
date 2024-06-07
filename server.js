const http = require('http');
const express = require('express');
const session = require('express-session');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path');

const app = express();

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Note: In production, set 'secure' to true
}));

const clientId = 'acf7aec2080a4c4691ab10fd73acae30';
const clientSecret = '41de33a206f943058a9d9dd431e97770';
const redirectUri = 'http://localhost:5500/callback';
const scopes = ['playlist-read-private', 'user-library-read'];

const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/callback', (req, res) => {
    const code = req.query.code || null;
    spotifyApi.authorizationCodeGrant(code).then(data => {
        req.session.accessToken = data.body['access_token'];
        req.session.refreshToken = data.body['refresh_token'];
        spotifyApi.setAccessToken(req.session.accessToken);
        spotifyApi.setRefreshToken(req.session.refreshToken);
        res.redirect('/');
    }).catch(err => {
        console.log('Error getting tokens:', err);
        res.redirect('/');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

// Start the HTTP server
const port = 5500;
http.createServer(app).listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
