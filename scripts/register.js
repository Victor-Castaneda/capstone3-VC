"use strict";

document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const fullName = document.getElementById('fullName').value;
    const password = document.getElementById('password').value;

    fetch('http://microbloglite.us-east-2.elasticbeanstalk.com/api/users', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            fullName: fullName,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('User created successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while creating the user.');
    });
});
