const clientId = 'acf7aec2080a4c4691ab10fd73acae30';
const redirectUri = 'http://127.0.0.1:5501/posts.html';
const scope = ['user-library-read', 'user-top-read', 'ugc-image-upload', 'user-read-recently-played'];

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadSpotifyToken();
    fetchPosts();
    setupSpotifyLoginButton();
});

function initEventListeners() {
    document.getElementById('top-artists-button').addEventListener('click', fetchTopArtists);
    document.getElementById('top-songs-button').addEventListener('click', fetchTopSongs);
    document.getElementById('postButton').addEventListener('click', createPostWithTracks);
}

function fetchTopArtists() {
    const token = sessionStorage.getItem('spotifyAccessToken');
    fetchTop5Spotify('artists', token);
}

function fetchTopSongs() {
    const token = sessionStorage.getItem('spotifyAccessToken');
    fetchTop5Spotify('tracks', token);
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch data from Spotify API');
        }
        return response.json();
    })
    .then(data => {
        displayTop5(data, type);
        return data.items;
    })
    .catch(error => {
        console.error(`Error fetching top ${type} from Spotify:`, error);
        alert(`Error fetching top ${type} from Spotify. Please try again later.`);
        throw error;
    });
}

function displayTop5(data, type) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results

    if (!data.items || data.items.length === 0) {
        resultDiv.innerText = `No ${type} found.`;
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch top tracks from Spotify API');
        }
        return response.json();
    })
    .then(data => {
        displayTop5(data, 'tracks');
    })
    .catch(error => {
        console.error('Error fetching top tracks:', error);
        alert('Error fetching top tracks. Please try again later.');
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
    const postText = document.getElementById('postText').value.trim(); // Get trimmed post text
    if (!postText) {
        alert('Please enter something to post.');
        return;
    }

    const loginData = getLoginData();
    fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: postText
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create post');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Post created successfully!');
        fetchPosts(); // Refresh posts after successful creation
    })
    .catch(error => {
        console.error('Error creating post:', error);
        alert('An error occurred while creating the post.');
    });
}

function fetchPosts() {
    const loginData = getLoginData();
    fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts?limit=15&offset=0', {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        return response.json();
    })
    .then(data => {
        displayPosts(data);
    })
    .catch(error => {
        console.error('Error fetching posts:', error);
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '<p>Failed to fetch posts. Please try again later.</p>';
    });
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

function getLoginData() {
    return JSON.parse(localStorage.getItem('login-data'));
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to toggle like');
        }
        return response.json();
    })
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
        Spotifylogout();
    };
}

function Spotifylogout() {
    sessionStorage.removeItem('spotifyAccessToken');
    window.location.href = redirectUri;
}

function getLoginData() {
    return JSON.parse(localStorage.getItem('login-data'));
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to toggle like');
        }
        return response.json();
    })
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
