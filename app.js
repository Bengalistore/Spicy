const API_KEY = "fed86956458f19fb45cdd382b6e6de83";

// 👉 JSONBin config
const BIN_ID = "69c49f05aa77b81da91ddfee";
const MASTER_KEY = "$2a$10$gJvpY1M53MtNjUcZvgS5t.xnWtqRkH8Zy0cGOaMe9K9kq/F6Qk6fO";

// URL parse
const path = window.location.pathname.split("/");
const id = path[1];
const season = path[2];

if (id) {
  document.getElementById("home").style.display = "none";
  document.getElementById("details").style.display = "block";
  loadDetails(id, season);
}

// Search
function search() {
  const id = document.getElementById("searchInput").value;
  window.location.href = "/" + id;
}

// Main load function
async function loadDetails(id, season) {
  let data;
  let type = "movie";

  // Try movie
  let res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);

  if (res.status === 200) {
    data = await res.json();
  } else {
    type = "tv";
    res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`);
    data = await res.json();
  }

  // 🔥 JSONBin fetch with MASTER KEY
  const streamRes = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: {
      "X-Master-Key": MASTER_KEY
    }
  });

  const jsonFull = await streamRes.json();
  const streamData = jsonFull.record;

  let streamUrl = "";

  if (type === "movie") {
    streamUrl = streamData[id]?.url;
  } else {
    if (!season) {
      showSeasonSelector(id, data);
      return;
    }
    streamUrl = streamData[id]?.seasons?.[season];
  }

  render(data, streamUrl);
}

// Render UI
function render(data, streamUrl) {
  const content = document.getElementById("content");

  content.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${data.poster_path}">
    <h2>${data.title || data.name}</h2>
    <p>${data.overview}</p>
    ${streamUrl ? `<a class="watch-btn" href="${streamUrl}">Watch Now</a>` : "<p>No Stream Available</p>"}
  `;
}

// Season selector
function showSeasonSelector(id, data) {
  const content = document.getElementById("content");

  let html = "";

  data.seasons.forEach(s => {
    html += `<button onclick="goSeason(${id}, ${s.season_number})">Season ${s.season_number}</button>`;
  });

  content.innerHTML = `
    <h2>${data.name}</h2>
    ${html}
  `;
}

function goSeason(id, season) {
  window.location.href = "/" + id + "/" + season;
}
