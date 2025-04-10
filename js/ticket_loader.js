let currentLanguage = document.documentElement.lang || "kr";
let i18n = {};
const placeId = getPlaceId(); // e.g., "orsay" if file is ticket_orsay.html

document.addEventListener("DOMContentLoaded", async () => {
  i18n = await loadProperties(currentLanguage);

  document.getElementById("ticketTitle").textContent = i18n["ticket.title"] || "티켓";
  document.getElementById("ticketHeader").textContent = `🎟️ ${i18n["ticket.list"] || "티켓 목록"}`;

  const res = await fetch("../json/tickets.json");
  const allTickets = await res.json();

  const filtered = allTickets.filter((t) => t.place === placeId);
  renderTickets(filtered);
});

function renderTickets(tickets) {
  const container = document.getElementById("ticketList");
  container.innerHTML = "";

  tickets.forEach((ticket) => {
    const name = currentLanguage === "en" ? ticket.name_en : ticket.name_kr;
    const note = currentLanguage === "en" ? ticket.note_en : ticket.note_kr;

    const dateStr = ticket.date ? formatDateWithWeekday(ticket.date) : "";
    const startStr = ticket.start_time ? formatTime(ticket.start_time) : "";
    const endStr = ticket.end_time ? formatTime(ticket.end_time) : "";

    // Duration in ( ) only if both times exist
    const durationStr = ticket.start_time && ticket.end_time ? ` (${calculateDuration(ticket.start_time, ticket.end_time)})` : "";

    // Combine line: yyyy-mm-dd (요일) 오전 10:00 - 오전 11:00 (1h 0m)
    let datetimeLine = dateStr;
    if (startStr || endStr) {
      datetimeLine += " ";
      datetimeLine += startStr || "-";
      datetimeLine += " - ";
      datetimeLine += endStr || "-";
      datetimeLine += durationStr;
    }

    const card = document.createElement("div");
    card.className = "ticket-card";
    card.innerHTML = `
      <div class="ticket-name">${name}</div>
      <div class="ticket-meta">${datetimeLine}</div>
      ${note ? `<div class="ticket-note">📝 ${note}</div>` : ""}
      <a href="${ticket.file}" class="ticket-button" target="_blank">${i18n["ticket.view"] || "티켓 보기"}</a>
    `;
    container.appendChild(card);
  });
}

function formatDateWithWeekday(dateStr) {
  const year = dateStr.slice(0, 4);
  const month = parseInt(dateStr.slice(4, 6), 10) - 1;
  const day = dateStr.slice(6, 8);
  const date = new Date(year, month, day);
  const dayIndex = date.getDay();
  const weekday = i18n[`weekday_${dayIndex}`] || "";

  return `${year}-${dateStr.slice(4, 6)}-${day} (${weekday})`;
}

function formatTime(timeStr) {
  if (!timeStr || timeStr.length !== 4) return i18n["tba"] || "TBA";

  const hour = parseInt(timeStr.slice(0, 2), 10);
  const minute = timeStr.slice(2, 4);
  const isAM = hour < 12;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const period = isAM ? i18n["am"] || "AM" : i18n["pm"] || "PM";

  return currentLanguage === "kr" ? `${period} ${displayHour}:${minute}` : `${displayHour}:${minute} ${period}`;
}

function calculateDuration(start, end) {
  const startHour = parseInt(start.slice(0, 2), 10);
  const startMin = parseInt(start.slice(2, 4), 10);
  const endHour = parseInt(end.slice(0, 2), 10);
  const endMin = parseInt(end.slice(2, 4), 10);

  let durationMin = endHour * 60 + endMin - (startHour * 60 + startMin);
  if (durationMin < 0) durationMin += 24 * 60; // Handle overnight spans

  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  const label = currentLanguage === "kr" ? "소요시간" : "Duration";

  return `${label} ${hours ? `${hours}h ` : ""}${minutes}m`;
}

function formatDateWithWeekday(dateStr) {
  const year = dateStr.slice(0, 4);
  const month = parseInt(dateStr.slice(4, 6), 10) - 1;
  const day = dateStr.slice(6, 8);
  const date = new Date(year, month, day);
  const dayIndex = date.getDay();
  const dayLabel = i18n[`weekday_${dayIndex}`] || "";

  return `${year}-${dateStr.slice(4, 6)}-${day} (${dayLabel})`;
}

function formatTime(timeStr) {
  if (!timeStr || timeStr.length !== 4) return i18n["tba"] || "TBA";

  const hour = parseInt(timeStr.slice(0, 2), 10);
  const minute = timeStr.slice(2, 4);
  const isAM = hour < 12;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  const period = isAM ? i18n["am"] || "AM" : i18n["pm"] || "PM";

  return currentLanguage === "kr" ? `${period} ${displayHour}:${minute}` : `${displayHour}:${minute} ${period}`;
}

function calculateDuration(start, end) {
  const startHour = parseInt(start.slice(0, 2), 10);
  const startMin = parseInt(start.slice(2, 4), 10);
  const endHour = parseInt(end.slice(0, 2), 10);
  const endMin = parseInt(end.slice(2, 4), 10);

  let durationMin = endHour * 60 + endMin - (startHour * 60 + startMin);
  if (durationMin < 0) durationMin += 24 * 60; // Handle overnight spans

  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  const label = currentLanguage === "kr" ? "소요시간" : "Duration";

  return `${label} ${hours ? `${hours}h ` : ""}${minutes}m`;
}

// Format 20250417 → 2025-04-17
function formatDate(dateStr) {
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

// Format 1815 → 18:15
function formatTime(timeStr) {
  return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`;
}

// Extract place from filename: ticket_orsay.html → orsay
function getPlaceId() {
  const filename = location.pathname.split("/").pop();
  const match = filename.match(/^ticket_(.+)\.html$/);
  return match ? match[1] : "";
}

// Language switch integration (optional)
async function switchLanguage() {
  const newLang = currentLanguage === "kr" ? "en" : "kr";
  document.documentElement.lang = newLang;
  currentLanguage = newLang;
  i18n = await loadProperties(newLang);
  console.log("Loaded i18n weekday_2:", i18n["weekday_2"]);

  const res = await fetch("../json/tickets.json");
  const data = await res.json();
  const filtered = data.filter((t) => t.place === placeId);
  renderTickets(filtered);
}

// Load .properties file and convert to object
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
