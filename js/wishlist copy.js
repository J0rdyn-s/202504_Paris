let currentLanguage = document.documentElement.lang || "kr";
let i18n = {};

// Load language file and then render wishlist
document.addEventListener("DOMContentLoaded", async () => {
  try {
    i18n = await loadProperties(currentLanguage);
    const res = await fetch("../json/wishlist.json");
    const data = await res.json();
    renderWishlist(data);
  } catch (err) {
    document.getElementById("wishlist-container").innerHTML = "<p>불러오기에 실패했습니다.</p>";
  }
});

// Render the wishlist from JSON and localization
function renderWishlist(data) {
  const container = document.getElementById("wishlist-container");
  container.innerHTML = "";

  data.forEach((section) => {
    const sectionEl = document.createElement("section");

    const title = document.createElement("h3");
    title.textContent = currentLanguage === "en" ? section.category_en : section.category_kr;
    sectionEl.appendChild(title);

    const ul = document.createElement("ul");

    section.items.forEach((item) => {
      const name = currentLanguage === "en" ? item.name_en : item.name_kr;
      const note = currentLanguage === "en" ? item.note_en : item.note_kr;

      const li = document.createElement("li");
      li.innerHTML = `
        <span class="status ${item.status}">${getStatusLabel(item.status)}</span>
        ${name}
        ${note ? `<div class="note">📝 ${note}</div>` : ""}
      `;
      ul.appendChild(li);
    });

    sectionEl.appendChild(ul);
    container.appendChild(sectionEl);
  });
}

// Get localized label for status code
function getStatusLabel(status) {
  return i18n[`status.${status}`] || "";
}

// Language switching logic
async function switchLanguage() {
  const lang = document.documentElement.lang;
  const newLang = lang === "kr" ? "en" : "kr";
  document.documentElement.lang = newLang;
  currentLanguage = newLang;

  i18n = await loadProperties(currentLanguage);

  const wishlistContainer = document.getElementById("wishlist-container");
  if (wishlistContainer) {
    const res = await fetch("../json/wishlist.json");
    const data = await res.json();
    renderWishlist(data);
  }
}

// Load .properties file and convert it to JS object
async function loadProperties(lang = "kr") {
  const res = await fetch(`../lang/properties_${lang}.properties`);
  const text = await res.text();
  return parseProperties(text);
}

function parseProperties(text) {
  const lines = text.split(/\r?\n/);
  const result = {};

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf("=");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    result[key] = value;
  }

  return result;
}

// Parse .properties file into object
function parseProperties(text) {
  const lines = text.split(/\r?\n/);
  const result = {};

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf("=");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    result[key] = value;
  }

  return result;
}
