const clientId = "acf7aec2080a4c4691ab10fd73acae30";
const clientSecret = "41de33a206f943058a9d9dd431e97770";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  const accessToken = await getAccessToken(clientId, code);
  const profile = await fetchProfile(accessToken);
  const genres = await fetchGeneres(accessToken);
  const toptrack = await fetchTopTracks(accessToken);
  populateUI(profile);
}

async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5501/callback");
  params.append("scope", "user-read-private user-read-email user-library-read user-top-read ugc-image-upload user-read-recently-played");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Other functions and logic follow...


function generateCodeVerifier(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:5501/callback");
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token } = await result.json();
  return access_token;
}

async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

async function fetchGeneres(token) {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/recommendations/available-genre-seeds",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    populateDropdown(data.genres);
  } catch (error) {
    console.error("Error fetching genre seeds:", error);
  }
}

async function fetchTopTracks(token) {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/top/artists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    popuilateToptraks(data);
  } catch (error) {
    console.error("Error fetching genre seeds:", error);
  }
}

function populateDropdown(genres) {
  const dropdown = document.getElementById("genresDropdown");
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.text = genre;
    dropdown.appendChild(option);
  });
}

async function searchArtist(artistName) {
  let bearerToken = localStorage.getItem("bearerToken");
  if (!bearerToken) {
    bearerToken = await getAuthorizationToken();
    if (!bearerToken) {
      console.error("Failed to obtain bearer token");
      return;
    }
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        artistName
      )}&type=artist`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    displayArtistInfo(data.artists.items[0]);
  } catch (error) {
    console.error("Error searching for artist:", error);
  }
}

function displayArtistInfo(artist) {
  const artistInfoDiv = document.getElementById("artistInfo");
  artistInfoDiv.innerHTML = `
        <h3>${artist.name}</h3>
        <p>Genres: ${artist.genres.join(", ")}</p>
        <P>Popularity: ${artist.popularity}</p>
        <p>Followers: ${artist.followers.total}</p>
        <img src="${artist.images[0] ? artist.images[0].url : ""}" alt="${
    artist.name
  }" height="640" width="640">
        <p><a href="${
          artist.external_urls.spotify
        }" target="_blank">Open in Spotify</a></p>
    `;
}

document.getElementById("searchButton").addEventListener("click", () => {
  const artistName = document.getElementById("artistSearch").value;
  if (artistName) {
    searchArtist(artistName);
  } else {
    alert("Please enter an artist name");
  }
});

function populateUI(profile) {
  document.getElementById("displayName").innerText = profile.display_name;
  if (profile.images[0]) {
    const profileImage = new Image(200, 200);
    profileImage.src = profile.images[0].url;
    document.getElementById("avatar").appendChild(profileImage);
    document.getElementById("imgUrl").innerText = profile.images[0].url;
  }
  document.getElementById("id").innerText = profile.id;
  document.getElementById("email").innerText = profile.email;
  document.getElementById("uri").innerText = profile.uri;
  document
    .getElementById("uri")
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url").innerText = profile.href;
  document.getElementById("url").setAttribute("href", profile.href);
}
