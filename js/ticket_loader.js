let currentLanguage = document.documentElement.lang || "kr";
let i18n = {};

document.addEventListener("DOMContentLoaded", async () => {
  const meta = document.getElementById("ticketMeta");
  const placeId = meta?.dataset.place || "";
  const dateFilter = meta?.dataset.date || "";

  i18n = await loadProperties(currentLanguage);

  document.getElementById("ticketTitle").textContent = i18n["ticket.title"] || "티켓";
  document.getElementById("ticketHeader").textContent = `🎟️ ${i18n["ticket.list"] || "티켓 목록"}`;

  try {
    const res = await fetch("../json/tickets.json");
    const allTickets = await res.json();
    const filtered = allTickets.filter((t) => t.place === placeId && t.date === dateFilter);
    renderTickets(filtered);
  } catch (e) {
    document.getElementById("ticketList").innerHTML = `<p>불러오기에 실패했습니다.</p>`;
  }
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

    const durationValue = ticket.start_time && ticket.end_time ? calculateDuration(ticket.start_time, ticket.end_time) : "";

    const durationStr = durationValue ? ` <span class="duration">(⏱️ ${durationValue}</span>)` : "";

    let datetimeLine = `<strong>${dateStr}</strong>`;
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
  const day = parseInt(dateStr.slice(6, 8), 10);
  const date = new Date(year, month, day);
  const dayIndex = date.getDay();
  const weekday = i18n[`weekday_${dayIndex}`] || "";

  return `${year}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)} (${weekday})`;
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
  if (durationMin < 0) durationMin += 1440; // handle overnight cases

  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;

  if (currentLanguage === "kr") {
    const hourText = hours > 0 ? `${hours}${i18n["hour"] || "시간"}` : "";
    const minText = minutes > 0 ? `${minutes}${i18n["minute"] || "분"}` : "";
    return `${hourText}${hourText && minText ? " " : ""}${minText}`;
  } else {
    const hourText = hours > 0 ? `${hours}h` : "";
    const minText = minutes > 0 ? `${minutes}m` : "";
    return `${hourText}${hourText && minText ? " " : ""}${minText}`;
  }
}

async function switchLanguage() {
  currentLanguage = currentLanguage === "kr" ? "en" : "kr";
  document.documentElement.lang = currentLanguage;
  i18n = await loadProperties(currentLanguage);

  const meta = document.getElementById("ticketMeta");
  const placeId = meta?.dataset.place || "";
  const dateFilter = meta?.dataset.date || "";

  const res = await fetch("../json/tickets.json");
  const allTickets = await res.json();
  const filtered = allTickets.filter((t) => t.place === placeId && t.date === dateFilter);
  renderTickets(filtered);
}

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
