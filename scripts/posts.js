const clientId = 'acf7aec2080a4c4691ab10fd73acae30';
const clientSecret = '41de33a206f943058a9d9dd431e97770';
const redirectUri = 'http://127.0.0.1:5501/posts.html';
const scope = ['user-library-read', 'user-top-read', 'ugc-image-upload', 'user-read-recently-played'];

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadSpotifyToken();
    fetchPosts();
    setupSpotifyLoginButton();
    fetchAndUpdateProfileInfo();
});

function initEventListeners() {
    document.getElementById('top-artists-button').addEventListener('click', fetchTopArtists);
    document.getElementById('top-songs-button').addEventListener('click', fetchTopSongs);
    document.getElementById('top-genres-button').addEventListener('click', fetchTopGenres);
    document.getElementById('postButton').onclick = createPostWithTracks;
}

function fetchTopArtists() {
    const token = sessionStorage.getItem('spotifyAccessToken');
    fetchTop5Spotify('artists', token);
}

function fetchTopSongs() {
    const token = sessionStorage.getItem('spotifyAccessToken');
    fetchTop5Spotify('tracks', token);
}

function fetchTopGenres() {
    alert('Spotify API does not support fetching top genres directly.');
}

function fetchTop5Spotify(type, token) {
    let endpoint = '';
    if (type === 'artists') {
        endpoint = 'https://api.spotify.com/v1/me/top/artists?limit=5';
    } else if (type === 'tracks') {
        endpoint = 'https://api.spotify.com/v1/me/top/tracks?limit=5';
    }

    return fetch(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        displayTop5(data, type);
        return data.items;
    })
    .catch(error => {
        console.error(`Error fetching top ${type} from Spotify:`, error);
        throw error;
    });
}

function displayTop5(data, type) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results

    if (!data.items) {
        resultDiv.innerText = 'No data found.';
        return;
    }

    if (type === 'artists') {
        const artists = data.items.slice(0, 5).map(artist => {
            const imageUrl = artist.images && artist.images.length > 0 ? artist.images[0].url : 'images/maria.jpg';
            const genres = artist.genres && artist.genres.length > 0 ? artist.genres.join(', ') : 'No genres available';
            return `
                <div class="artist">
                    <h3>${artist.name}</h3>
                    <img src="${imageUrl}" alt="${artist.name}" height="160" width="160">
                    <p>Genres: ${genres}</p>
                    <p>Popularity: ${artist.popularity}</p>
                    <a href="${artist.external_urls.spotify}" target="_blank">Listen on Spotify</a>
                </div>
            `;
        }).join('');
        resultDiv.innerHTML = '<h2>Top 5 Artists</h2>' + artists;
    } else if (type === 'tracks') {
        const tracks = data.items.map(track => `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`).join('<br>');
        resultDiv.innerHTML = '<h2>Top 5 Tracks</h2>' + tracks;
    }
}

function loadSpotifyToken() {
    const accessToken = sessionStorage.getItem('spotifyAccessToken');
    if (accessToken) {
        updateSpotifyButtonToLogout();
        fetchTopTracks(accessToken);
    } else {
        updateSpotifyButtonToLogin();
    }
}

window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
        sessionStorage.setItem('spotifyAccessToken', accessToken);
        updateSpotifyButtonToLogout();
        fetchTopTracks(accessToken);
    } else {
        const storedAccessToken = sessionStorage.getItem('spotifyAccessToken');
        if (storedAccessToken) {
            updateSpotifyButtonToLogout();
            fetchTopTracks(storedAccessToken);
        } else {
            updateSpotifyButtonToLogin();
        }
    }
});

function fetchTopTracks(token) {
    fetch('https://api.spotify.com/v1/me/top/tracks?limit=5', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        displayTop5(data, 'tracks');
    })
    .catch(error => {
        console.error('Error fetching top tracks:', error);
    });
}

function setupSpotifyLoginButton() {
    const loginData = getLoginData();
    const spotifyLoginButton = document.getElementById('spotify-login-button');
    if (loginData) {
        spotifyLoginButton.textContent = 'Logout from Spotify';
        spotifyLoginButton.onclick = () => {
            logout();
        };
    } else {
        spotifyLoginButton.textContent = 'Log in with Spotify';
        spotifyLoginButton.onclick = () => {
            window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope.join(' '))}`;
        };
    }
}

function createPostWithTracks() {
    const postText = document.getElementById('postText').value;
    let tracksText = '';

    // Check if fetching top tracks or artists
    const token = sessionStorage.getItem('spotifyAccessToken');
    const fetchType = document.querySelector('input[name="fetch-type"]:checked').value; // Assuming you have radio buttons to select 'tracks' or 'artists'

    if (fetchType === 'tracks') {
        fetchTop5Spotify('tracks', token)
            .then(tracks => {
                // Construct text for top tracks
                if (tracks.length > 0) {
                    tracksText = '<br><br><strong>Top 5 Tracks:</strong><br>';
                    tracks.forEach((track, index) => {
                        tracksText += `${index + 1}. ${track.name} by ${track.artists.map(artist => artist.name).join(', ')}<br>`;
                    });
                }

                const fullPostText = postText + tracksText;
                createPost(fullPostText);
            })
            .catch(error => {
                console.error('Error fetching top tracks:', error);
                alert('Error fetching top tracks. Please try again later.');
            });
    } else if (fetchType === 'artists') {
        fetchTop5Spotify('artists', token)
            .then(artists => {
                // Construct text for top artists
                if (artists.length > 0) {
                    tracksText = '<br><br><strong>Top 5 Artists:</strong><br>';
                    artists.forEach((artist, index) => {
                        const imageUrl = artist.images && artist.images.length > 0 ? artist.images[0].url : 'images/maria.jpg';
                        const genres = artist.genres && artist.genres.length > 0 ? artist.genres.join(', ') : 'No genres available';
                        tracksText += `
                            <div class="artist">
                                <h3>${artist.name}</h3>
                                <img src="${imageUrl}" alt="${artist.name}" height="160" width="160">
                                <p>Genres: ${genres}</p>
                                <p>Popularity: ${artist.popularity}</p>
                                <a href="${artist.external_urls.spotify}" target="_blank">Listen on Spotify</a>
                            </div><br>`;
                    });
                }

                const fullPostText = postText + tracksText;
                createPost(fullPostText);
            })
            .catch(error => {
                console.error('Error fetching top artists:', error);
                alert('Error fetching top artists. Please try again later.');
            });
    }
}

function createPost(text) {
    const loginData = getLoginData();
    fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
            text: text
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Post created successfully!');
        fetchPosts();
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while creating the post.');
    });
}

function fetchPosts() {
    fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts?limit=15&offset=0', {
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkVsR2F0bzU3IiwiaWF0IjoxNzE5NDE5OTczLCJleHAiOjE3MTk1MDYzNzN9.gxauwLzxi8175BSfV9y2HPB0gV502_HX1fEa2xalRr0'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayPosts(data);
    })
    .catch(error => {
        console.error('Error fetching posts:', error);
        // Optionally, you can add UI feedback for the user:
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '<p>Failed to fetch posts. Please try again later.</p>';
    });
}

function updateSpotifyButtonToLogin() {
    const spotifyLoginButton = document.getElementById('spotify-login-button');
    spotifyLoginButton.textContent = 'Log in with Spotify';
    spotifyLoginButton.onclick = () => {
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope.join(' '))}`;
    };
}

function updateSpotifyButtonToLogout() {
    const spotifyLoginButton = document.getElementById('spotify-login-button');
    spotifyLoginButton.textContent = 'Logout from Spotify';
    spotifyLoginButton.onclick = () => {
        logout();
    };
}

function logout() {
    sessionStorage.removeItem('spotifyAccessToken');
    window.location.href = redirectUri;
}

function getLoginData() {
    return JSON.parse(localStorage.getItem('login-data'));
}

function fetchAndUpdateProfileInfo() {
    const loginData = getLoginData();
    if (loginData) {
        fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/me', {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            }
        })
        .then(response => response.json())
        .then(user => {
            document.getElementById('profileName').textContent = user.username;
        })
        .catch(error => console.error('Error fetching profile info:', error));
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'card mb-3';
        postCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${post.username}</h5>
                <p class="card-text">${post.text}</p>
                <p class="card-text"><small class="text-muted">${new Date(post.createdAt).toLocaleString()}</small></p>
                <button class="btn btn-outline-primary like-button ${post.likes.includes(getLoginData().username) ? 'liked' : ''}" data-post-id="${post._id}">
                    <i class="bi bi-heart"></i> 
                    <span class="like-count">${post.likes.length}</span>
                </button>
            </div>
        `;
        postsContainer.appendChild(postCard);
    });

    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            toggleLike(postId, this);
        });
    });
}

function toggleLike(postId, button) {
    const loginData = getLoginData();
    const token = loginData.token;
    const likeCountSpan = button.querySelector('.like-count');
    const isLiked = button.classList.contains('liked');
    const method = isLiked ? 'DELETE' : 'POST';

    fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes/${isLiked ? postId : ''}`, {
        method: method,
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId: postId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const likeCount = parseInt(likeCountSpan.textContent);
            likeCountSpan.textContent = isLiked ? likeCount - 1 : likeCount + 1;
            button.classList.toggle('liked');
        } else {
            console.error('Error toggling like:', data.message);
        }
    })
    .catch(error => console.error('Error toggling like:', error));
}

//THIS IS A TEST to see if I can have music from a specific artist to play in the background of my website.

window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'your_access_token'; // Replace with the user's access token obtained via OAuth
  
    const player = new Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: cb => { cb(token); }
    });
  
    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });
  
    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });
  
    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
  
      // Replace with The Marías' Spotify artist ID
      const artistId = '2sSGPbdZJkaSE2AbcGOACx';
  
      // Get top tracks of the artist
      fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        const topTracks = data.tracks.map(track => track.uri);
        
        // Play the first track
        player
          .connect()
          .then(() => {
            player
              .resume()
              .then(() => {
                player
                  .play({
                    uris: topTracks
                  })
                  .then(() => {
                    console.log('Playing top tracks');
                  })
                  .catch(error => {
                    console.error('Error playing track:', error);
                  });
              })
              .catch(error => {
                console.error('Error resuming playback:', error);
              });
          })
          .catch(error => {
            console.error('Error connecting to player:', error);
          });
      })
      .catch(error => {
        console.error('Error fetching top tracks:', error);
      });
    });
  
    // Connect to the player
    player.connect().then(success => {
      if (success) {
        console.log('The Web Playback SDK successfully connected to Spotify!');
      }
    }).catch(error => {
      console.error('Failed to connect to Spotify:', error);
    });
  };