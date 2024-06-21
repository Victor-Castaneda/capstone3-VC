const clientId = 'acf7aec2080a4c4691ab10fd73acae30'; // Replace with your client ID
const redirectUri = 'http://localhost:5500/callback'; // Replace with your redirect URI
const scope = ['user-library-read', "user-top-read"];

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
        // Store access token in session storage
        sessionStorage.setItem('spotifyAccessToken', accessToken);
        // Redirect to posts.html without the fragment
        window.location.href = 'posts.html';
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
const express = require('express'); // Express web server framework
const request = require('request');
// const axios = require("axios"); // "Request" library
// const bodyParser = require("body-parser");
// const cors = require("cors");
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');
// const https = require("https");
// const exphbs = require("express-handlebars");
const cors = require('cors');
// const { config } = require("./config");
require('dotenv').config();

const client_id = process.env.clientID; // Your client id
const client_secret = process.env.clientSecret; // Your secret
const privateKey = fs.readFileSync('AuthKey_A8FKGGUQP3.p8').toString();
const teamId = process.env.teamId;
const keyId = process.env.keyId;

var redirect_uri = process.env.redirect_uri || 'http://localhost:5500/callback'; // Your redirect uri
// var redirect_uri = "http://localhost:5500/callback";
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated stringh
 */
var generateRandomString = function (length) {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/login', function (req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  // user-read-private & user-read-email used to get current user info
  // user-top-read used to get top track info
  var scope =
    'user-read-private user-read-email user-top-read playlist-modify-public';
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get('/callback', function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        querystring.stringify({
          error: 'state_mismatch',
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization:
          'Basic ' +
          new Buffer(client_id + ':' + client_secret).toString('base64'),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        res.redirect(
          '/#' +
            querystring.stringify({
              client: 'spotify',
              access_token: access_token,
              refresh_token: refresh_token,
            })
        );
        // res.redirect("/spotify");
        // console.log(retrieveTracksSpotify(access_token, "short_term", 1, "LAST MONTH"));
        // res.render("spotify", {
        //   shortTerm: retrieveTracksSpotify(access_token, "short_term", 1, "LAST MONTH"),
        //   mediumTerm: retrieveTracksSpotify(access_token, "medium_term", 2, "LAST 6 MONTHS"),
        //   longTerm: retrieveTracksSpotify(access_token, "long_term", 3, "ALL TIME")
        // });
      } else {
        res.send('There was an error during authentication.');
      }
    });
  }
});

app.get('/refresh_token', function (req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer(client_id + ':' + client_secret).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

app.listen(5500, function () {
  console.log('Server is running on port 5500');
});

function createPost(){
  fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: '{\n  "text": "hallo\n"\n}'
  });
}