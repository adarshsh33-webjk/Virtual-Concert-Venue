// Mock concert data
const concerts = [
  { name: "Ultra Miami", genre: "edm", country: "usa", venue: "Bayfront Park", date: "Mar 22, 2025" },
  { name: "Coachella", genre: "pop", country: "usa", venue: "Indio, California", date: "Apr 12, 2025" },
  { name: "Rock in Rio", genre: "rock", country: "brazil", venue: "Rio de Janeiro", date: "Sep 18, 2025" },
  { name: "Montreux Jazz Fest", genre: "jazz", country: "france", venue: "Montreux", date: "Jul 5, 2025" },
  { name: "Fuji Rock", genre: "rock", country: "japan", venue: "Naeba Ski Resort", date: "Jul 28, 2025" },
  { name: "Tomorrowland", genre: "edm", country: "belgium", venue: "Boom", date: "Jul 18, 2025" }
];

const eventList = document.getElementById("eventList");

// Render Events
function renderEvents(filtered = concerts) {
  eventList.innerHTML = "";
  filtered.forEach(ev => {
    const card = document.createElement("div");
    card.className = "event-card";
    card.innerHTML = `<h3>${ev.name}</h3><p>${ev.venue}</p><p>${ev.date}</p>`;
    eventList.appendChild(card);
  });
}

// Dropdown toggles
document.querySelectorAll(".dropdown").forEach(drop => {
  drop.addEventListener("click", () => drop.classList.toggle("active"));
});

// Genre change → background change
const genreBackgrounds = {
  edm: "url('https://images.unsplash.com/photo-1543353071-873f17a7a088')",
  rock: "url('https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2')",
  jazz: "url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4')",
  pop: "url('https://images.unsplash.com/photo-1511376777868-611b54f68947')",
  classical: "url('https://images.unsplash.com/photo-1511379938547-c1f69419868d')",
  hiphop: "url('https://images.unsplash.com/photo-1518972559570-7cc1309f3229')"
};

// Handle genre selection
document.querySelectorAll("#genreDropdown .dropdown-content div").forEach(item => {
  item.addEventListener("click", () => {
    const genre = item.dataset.genre;
    const filtered = concerts.filter(c => c.genre === genre);
    renderEvents(filtered);
    document.body.style.backgroundImage = genreBackgrounds[genre];
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
  });
});

// Handle country selection
document.querySelectorAll("#countryDropdown .dropdown-content div").forEach(item => {
  item.addEventListener("click", () => {
    const country = item.dataset.country;
    const filtered = concerts.filter(c => c.country === country);
    renderEvents(filtered);
  });
});

// Theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  const themeButton = document.getElementById("theme-toggle");
  themeButton.textContent = document.body.classList.contains("dark-theme") ? "☀️" : "🌙";
});

// Prevent dropdowns from closing when clicking inside
document.querySelectorAll(".dropdown-content").forEach(menu => {
  menu.addEventListener("click", e => e.stopPropagation());
});
// Close dropdowns when clicking anywhere outside
window.addEventListener("click", e => {
  document.querySelectorAll(".dropdown").forEach(drop => {
    if (!drop.contains(e.target)) drop.classList.remove("active");
  });
});


// Handle redirect from home to events by genre
function goToGenre(genre) {
  localStorage.setItem("selectedGenre", genre);
  window.location.href = "events.html";
}

// Auto-filter on events page based on saved genre
window.addEventListener("DOMContentLoaded", () => {
  const savedGenre = localStorage.getItem("selectedGenre");
  if (savedGenre && document.getElementById("genreDropdown")) {
    const filtered = concerts.filter(c => c.genre === savedGenre);
    renderEvents(filtered);
    document.body.style.backgroundImage = genreBackgrounds[savedGenre];
    localStorage.removeItem("selectedGenre");
  }
});
// Initialize
renderEvents();
document.body.style.backgroundImage = "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb')";
document.body.style.backgroundSize = "cover";
document.body.style.backgroundAttachment = "fixed";
