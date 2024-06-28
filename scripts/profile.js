'use strict';

document.addEventListener("DOMContentLoaded", async () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.replace("index.html"); // Redirect to index.html if user is not logged in
        return;
    }

    const logoutButton = document.getElementById('logout-button'); // Reference to the logout button element
    const postForm = document.getElementById('post-form'); // Reference to the form element for creating posts
    const editProfileForm = document.getElementById('edit-profile-form'); // Reference to the form element for editing profile
    const profileInfo = document.getElementById('profile-info'); // Reference to display profile information
    const userPosts = document.getElementById('user-posts'); // Reference to display user posts

    // Function to handle logout when logout button is clicked
    logoutButton.addEventListener('click', () => {
        logout(); // Call the logout function (presumably logs the user out)
    });

    // Function to fetch and display user profile information
    const displayUserProfile = async () => {
        const loginData = getLoginData();
        try {
            // Fetch user profile data
            const profileResponse = await fetch(apiBaseURL + `/api/users/${loginData.username}`, {
                headers: {
                    "Authorization": `Bearer ${loginData.token}`
                }
            });

            if (!profileResponse.ok) {
                throw new Error('Failed to fetch profile data');
            }

            const profileData = await profileResponse.json();
            const { username, fullName, bio } = profileData;

            // Display profile information
            profileInfo.innerHTML = `
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Full Name:</strong> ${fullName}</p>
                <p><strong>Bio:</strong> ${bio || 'No bio provided'}</p>
            `;
        } catch (error) {
            console.error('Error fetching profile:', error);
            profileInfo.innerHTML = '<p>Failed to fetch profile information.</p>';
        }
    };

    // Function to fetch and display user posts
    const displayUserPosts = async () => {
        const loginData = getLoginData();
        const username = loginData.username;

        try {
            // Fetch user posts
            const postsResponse = await fetch(`${apiBaseURL}/api/posts?limit=100&offset=0&username=${username}`, {
                headers: {
                    "Authorization": `Bearer ${loginData.token}`
                }
            });

            if (!postsResponse.ok) {
                throw new Error(`Failed to fetch user posts: ${postsResponse.status} ${postsResponse.statusText}`);
            }

            const postsData = await postsResponse.json();

            // Display user posts
            if (postsData.length === 0) {
                userPosts.innerHTML = '<p>No posts yet.</p>';
            } else {
                userPosts.innerHTML = postsData.map(post => `
                    <div class="card mb-3">
                        <div class="card-body">
                            <p class="card-text">${post.text}</p>
                            <p class="card-text"><small class="text-muted">${new Date(post.createdAt).toLocaleString()}</small></p>
                            <span class="like-count ms-2" id="like-count-${post._id}">${post.likes.length}</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error fetching user posts:', error);
            userPosts.innerHTML = `<p>Failed to fetch user posts. Error: ${error.message}</p>`;
        }
    };

    // Load profile information and user posts on page load
    await Promise.all([
        displayUserProfile(),
        displayUserPosts()
    ]);

    // Function to handle post creation when the post form is submitted (already implemented)
    postForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Retrieve the content of the post from the form input
        const postContent = document.getElementById('post-content').value;

        // Retrieve login data (like username and token) from localStorage
        const loginData = getLoginData();

        // Validate that the post content is not empty
        if (!postContent) {
            alert('Post content cannot be empty.'); // Alert user if post content is empty
            return;
        }

        // Prepare data to send as JSON for creating a new post
        const postData = {
            text: postContent, // Assign the post content to the 'text' property
        };

        try {
            // Send a POST request to the API endpoint to create a new post
            const response = await fetch(apiBaseURL + "/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // Specify JSON content type
                    "Authorization": `Bearer ${loginData.token}`, // Attach authorization token in the header
                },
                body: JSON.stringify(postData), // Convert postData object to JSON string for the request body
            });

            // Check if the response is not successful
            if (!response.ok) {
                const errorText = await response.text(); // Get error message from response body
                throw new Error('Network response was not ok: ' + errorText); // Throw an error with the error message
            }

            // If successful, parse the response JSON
            const result = await response.json();
            console.log(result); // Log the result (optional)

            // Optionally, clear the form input or show a success message
            document.getElementById('post-content').value = ''; // Clear the form input after successful post creation
            alert('Post created successfully.'); // Show an alert to notify user of successful post creation

            // Refresh user posts after successful creation
            await displayUserPosts();

        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error); // Log error if fetch operation fails
            alert('Failed to create post: ' + error.message); // Show an alert to notify user of failed post creation
        }
    });

    // Function to handle profile update when the edit profile form is submitted (already implemented)
    editProfileForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Retrieve user information from the form inputs
        const username = document.getElementById('username').value;
        const fullName = document.getElementById('full-name').value;
        const bio = document.getElementById('bio').value;
        const password = document.getElementById('password').value;

        // Retrieve login data (like username and token) from localStorage
        const loginData = getLoginData();

        // Prepare data to send as JSON for updating user information
        const profileData = {
            username: username,
            fullName: fullName,
            bio: bio,
            password: password
        };

        try {
            // Send a PUT request to the API endpoint to update user information
            const response = await fetch(apiBaseURL + `/api/users/${username}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json", // Specify JSON content type
                    "Authorization": `Bearer ${loginData.token}`, // Attach authorization token in the header
                },
                body: JSON.stringify(profileData), // Convert profileData object to JSON string for the request body
            });

            // Check if the response is not successful
            if (!response.ok) {
                const errorText = await response.text(); // Get error message from response body
                throw new Error('Network response was not ok: ' + errorText); // Throw an error with the error message
            }

            // If successful, parse the response JSON
            const result = await response.json();
            console.log(result); // Log the result (optional)

            // Optionally, clear the form input or show a success message
            alert('Profile updated successfully.'); // Show an alert to notify user of successful profile update

            // Refresh profile information after successful update
            await displayUserProfile();

        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error); // Log error if fetch operation fails
            alert('Failed to update profile: ' + error.message); // Show an alert to notify user of failed profile update
        }
    });
});

