"use strict";

document.addEventListener('DOMContentLoaded', () => {
    fetchAndUpdateProfileInfo();
});

async function fetchSpotifyUserInfo(accessToken) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();

        // Update HTML content with fetched data
        document.getElementById('display-name').textContent = `Display Name: ${data.display_name}`;
        document.getElementById('followers').textContent = `Followers: ${data.followers.total}`;
        
        if (data.images.length > 0) {
            const profileImage = document.createElement('img');
            profileImage.src = data.images[0].url;
            profileImage.alt = 'Profile Image';
            profileImage.style.width = '200px'; // Adjust size as needed
            document.getElementById('profile-image').appendChild(profileImage);
        } else {
            document.getElementById('profile-image').textContent = 'Profile Image not available';
        }
    } catch (error) {
        console.error('Error fetching Spotify user info:', error);
        document.getElementById('spotify-info').innerHTML = '<p>Error fetching Spotify user info. Please try again later.</p>';
    }
}

function fetchAndUpdateProfileInfo() {
    const loginData = getLoginData(); // Implement getLoginData to retrieve login details
    if (loginData) {
        fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/me', {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch profile info');
            }
            return response.json();
        })
        .then(user => {
            document.getElementById('profileName').textContent = user.username;
            // Call fetchSpotifyUserInfo after fetching profile info
            fetchSpotifyUserInfo(loginData.spotifyAccessToken); // Replace with actual Spotify access token
        })
        .catch(error => console.error('Error fetching profile info:', error));
    }
}
