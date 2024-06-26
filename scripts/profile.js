"use strict";

async function fetchSpotifyUserInfo() {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer YOUR_ACCESS_TOKEN' // Replace with your actual access token
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

  // Call the function to fetch Spotify user info when the page loads
  window.onload = fetchSpotifyUserInfo;