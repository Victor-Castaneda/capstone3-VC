const clientId = 'acf7aec2080a4c4691ab10fd73acae30';
const redirectUri = 'http://127.0.0.1:5501/posts.html';
const scope = ['user-library-read', 'user-top-read'];

document.addEventListener('DOMContentLoaded', () => {
    const accessToken = sessionStorage.getItem('spotifyAccessToken');
    if (accessToken) {
        updateSpotifyButtonToLogout();
        fetchTopTracks(accessToken);
    } else {
        updateSpotifyButtonToLogin();
    }
    fetchPosts();
});

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
        displayTopTracks(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayTopTracks(data) {
    if (data.items) {
        const tracks = data.items.map(track => `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`).join('<br>');
        document.getElementById('result').innerHTML = '<h2>Top 5 Tracks</h2>' + tracks;
        document.getElementById('postSection').style.display = 'block';

        document.getElementById('postButton').onclick = function() {
            const postText = document.getElementById('postText').value;
            const fullPostText = postText + '<br><br>' + tracks;
            createPost(fullPostText);
        };
    } else {
        document.getElementById('result').innerText = 'Failed to fetch top tracks';
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
    fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts?limit=15&offset=5', {
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkVsR2F0bzU3IiwiaWF0IjoxNzE5NDE5OTczLCJleHAiOjE3MTk1MDYzNzN9.gxauwLzxi8175BSfV9y2HPB0gV502_HX1fEa2xalRr0'
        }
    })
    .then(response => response.json())
    .then(result => displayPosts(result))
    .catch(error => console.error('Error:', error));
}

function displayPosts(postData) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    if (postData.length) {
        postData.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${post.username}</h5>
                        <p class="card-text">${post.text}</p>
                        <p class="card-text"><small class="text-muted">${new Date(post.createdAt).toLocaleString()}</small></p>
                    </div>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    } else {
        postsContainer.innerText = 'No posts found.';
    }
}

function updateSpotifyButtonToLogin() {
    const spotifyLoginButton = document.getElementById('spotify-login-button');
    spotifyLoginButton.innerHTML = 'Log in with Spotify';
    spotifyLoginButton.className = 'btn btn-primary';
    spotifyLoginButton.onclick = function() {
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    };
}

function updateSpotifyButtonToLogout() {
    const spotifyLoginButton = document.getElementById('spotify-login-button');
    spotifyLoginButton.innerHTML = 'Log out of Spotify';
    spotifyLoginButton.className = 'btn btn-primary';
    spotifyLoginButton.onclick = function() {
        sessionStorage.removeItem('spotifyAccessToken');
        updateSpotifyButtonToLogin();
        document.getElementById('result').innerText = '';
        document.getElementById('postSection').style.display = 'none';
    };
}

function getLoginData() {
    // Implement this function to return login data including token
    // Example:
    return {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkVsR2F0bzU3IiwiaWF0IjoxNzE5NDE5OTczLCJleHAiOjE3MTk1MDYzNzN9.gxauwLzxi8175BSfV9y2HPB0gV502_HX1fEa2xalRr0'
    };
}
