/* Landing Page JavaScript */

"use strict";

const loginForm = document.querySelector("#login");

loginForm.onsubmit = function (event) {
    // Prevent the form from refreshing the page,
    // as it will do by default when the Submit event is triggered:
    event.preventDefault();

    // We can use loginForm.username (for example) to access
    // the input element in the form which has the ID of "username".
    const loginData = {
        username: loginForm.username.value,
        password: loginForm.password.value,
    }

    // Disables the button after the form has been submitted already:
    loginForm.loginButton.disabled = true;

    // Time to actually process the login using the function from auth.js!
    login(loginData);
};

document.addEventListener("DOMContentLoaded", function() {
    var audio = document.getElementById("audio");
    var volumeSlider = document.getElementById("volume-slider");

    // Set the initial volume
    audio.volume = volumeSlider.value / 75;

    // Add an event listener to the volume slider
    volumeSlider.addEventListener("input", function() {
        audio.volume = this.value / 100;
    });

    // Play the audio after user interaction
    function playAudio() {
        audio.play();
        document.removeEventListener('click', playAudio);
    }

    // Add an event listener to start playing the audio on user interaction
    document.addEventListener('click', playAudio);
});

var originalTitle = document.title;

// Define the onblur event handler
window.onblur = function () {
    document.title = 'you left :(';
};

// Define the onfocus event handler
window.onfocus = function () {
    // Set the title to the welcome message
    document.title = 'WELCOME BACK!!';

    // After a delay, restore the original title
    setTimeout(function () {
        document.title = originalTitle;
    }, 2000); // Adjust the delay (in milliseconds) as needed
};
