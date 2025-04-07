let currentLanguage = "en";
let currentDate = null;
let dates = [];
let siteMeta = {};
let startDay = 0;
let isDropdownOpen = false;

const buttonLabels = {
  en: { ticket: "🎟️ Ticket", map: "🗺️ Map", more: "🔗 More Info" },
  kr: { ticket: "🎟️ 티켓", map: "🗺️ 지도", more: "🔗 자세히 보기" },
};

function generateDates(startStr, endStr) {
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  while (startDate <= endDate) {
    const yyyy = startDate.getFullYear();
    const mm = String(startDate.getMonth() + 1).padStart(2, "0");
    const dd = String(startDate.getDate()).padStart(2, "0");
    dates.push(`${yyyy}${mm}${dd}`);
    startDate.setDate(startDate.getDate() + 1);
  }
}

function formatTime(raw, lang) {
  if (!raw || raw.length !== 4) return null;
  const hours = parseInt(raw.substring(0, 2), 10);
  const minutes = parseInt(raw.substring(2), 10);
  if (lang === "kr") {
    const isPM = hours >= 12;
    const h = hours % 12 || 12;
    const period = isPM ? "오후" : "오전";
    return `${period} ${h}시${minutes > 0 ? ` ${minutes}분` : ""}`;
  } else {
    const h = hours % 12 || 12;
    const period = hours >= 12 ? "PM" : "AM";
    return `${h}:${minutes.toString().padStart(2, "0")} ${period}`;
  }
}

function updateDateDisplay(date) {
  if (!siteMeta || !dates.length) return;
  const el = document.getElementById("dateDisplay");
  const index = dates.indexOf(date);
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  const weekdayIndex = new Date(`${year}-${month}-${day}`).getDay();
  const weekdays = {
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    kr: ["일", "월", "화", "수", "목", "금", "토"],
  };
  const weekday = weekdays[currentLanguage][weekdayIndex];
  const dayOffset = index + (siteMeta.start_day || 0);
  const label = currentLanguage === "kr" ? `${year}-${month}-${day}(${weekday}): ${dayOffset}일차` : `${year}-${month}-${day}(${weekday}): Day ${dayOffset}`;
  el.textContent = `📅 ${label} ▾`;
}

function selectDateByOffset(offset) {
  const index = dates.indexOf(currentDate);
  const nextIndex = Math.min(dates.length - 1, Math.max(0, index + offset));
  const newDate = dates[nextIndex];
  if (newDate !== currentDate) {
    loadSchedule(newDate);
    updateDateDisplay(newDate);
  }
}

function loadSchedule(date) {
  currentDate = date;
  fetch(`daily_schedule/${date}_Schedule.json`)
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("schedule");
      container.innerHTML = "";
      data.forEach((item) => {
        const type = item.type || "schedule";
        const itemDiv = document.createElement("div");
        itemDiv.className = `schedule-item ${type}`;

        const left = document.createElement("div");
        left.className = "schedule-left";

        const right = document.createElement("div");
        right.className = "schedule-right";

        const langKey = currentLanguage === "kr" ? "event_kr" : "event_en";
        const noteKey = currentLanguage === "kr" ? "note_kr" : "note_en";

        const start = formatTime(item.start, currentLanguage);
        const end = formatTime(item.end, currentLanguage);
        const timeStr = item.start ? `${start}${end ? ` – ${end}` : ""}` : `[Time TBA]`;

        let content = `<div class="time-block">${timeStr}</div>
                       <div class="event-title">${item[langKey]}</div>`;

        if (item[noteKey]) {
          content += `<div>📝 ${item[noteKey]}</div>`;
        }

        left.innerHTML = content;

        if (item.ticket) {
          const btn = document.createElement("a");
          btn.href = item.ticket;
          btn.target = "_blank";
          btn.className = "schedule-button ticket-link";
          btn.textContent = buttonLabels[currentLanguage].ticket;
          right.appendChild(btn);
        }

        if (item.map) {
          const btn = document.createElement("a");
          btn.href = item.map;
          btn.target = "_blank";
          btn.className = "schedule-button map-link";
          btn.textContent = buttonLabels[currentLanguage].map;
          right.appendChild(btn);
        }

        if (item.more) {
          const btn = document.createElement("a");
          btn.href = item.more;
          btn.target = "_blank";
          btn.className = "schedule-button more-link";
          btn.textContent = buttonLabels[currentLanguage].more;
          right.appendChild(btn);
        }

        itemDiv.appendChild(left);
        itemDiv.appendChild(right);
        container.appendChild(itemDiv);
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const mobileList = document.getElementById("mobileDateList");
  const dateDisplay = document.getElementById("dateDisplay");
  const siteTitle = document.getElementById("siteTitle");
  const authorLine = document.getElementById("authorLine");
  const footerText = document.getElementById("footerText");

  let dates = [];
  let startDay = 0;
  let currentLanguage = "kr";

  // Ensure the date list is hidden initially (using display: none)
  mobileList.style.display = "none";

  // Fetch and process the page meta data
  fetch("page_meta.json")
    .then((res) => res.json())
    .then((data) => {
      try {
        startDay = data.start_day || 0;
        currentLanguage = data.default_language || "kr";

        siteTitle.textContent = data[`title_${currentLanguage}`];
        authorLine.textContent = data.author ? `👤 ${data.author}` : "";
        footerText.textContent = data[`footer_${currentLanguage}`] || "";

        // Generate the dates based on start and end date
        dates = generateDates(data.start_date, data.end_date);
        if (!Array.isArray(dates) || dates.length === 0) {
          console.error("⚠️ No dates generated. Check start_date/end_date in page_meta.json.");
          return;
        }

        // Build the date list, but keep it hidden initially
        mobileList.innerHTML = ""; // Clear any previous content
        dates.forEach((date, index) => {
          const li = document.createElement("li");
          const dayLabel = currentLanguage === "kr" ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}: ${index + startDay}일차` : `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}: Day ${index + startDay}`;

          li.textContent = dayLabel;
          li.onclick = () => {
            // Update the displayed date
            dateDisplay.textContent = dayLabel;
            // Hide the date list after selection (using display: none)
            mobileList.style.display = "none";
            // Optionally, load the schedule or update other content here
            loadSchedule(date);
            updateDateDisplay(date);
          };
          mobileList.appendChild(li); // Add the date to the list
        });
      } catch (e) {
        console.error("🚨 Error processing site meta:", e);
      }
    })
    .catch((err) => {
      console.error("🚨 Failed to fetch page_meta.json:", err);
    });

  // Simple fallback for generateDates if missing
  function generateDates(start, end) {
    if (!start || !end) return [];

    // Convert YYYY-MM-DD to YYYYMMDD
    const startDate = new Date(start.replace(/-/g, "/"));
    const endDate = new Date(end.replace(/-/g, "/"));

    const result = [];
    while (startDate <= endDate) {
      const y = startDate.getFullYear();
      const m = String(startDate.getMonth() + 1).padStart(2, "0");
      const d = String(startDate.getDate()).padStart(2, "0");
      result.push(`${y}${m}${d}`);
      startDate.setDate(startDate.getDate() + 1);
    }
    return result;
  }

  // Toggle the visibility of the date list when clicking dateDisplay
  dateDisplay.addEventListener("click", () => {
    if (mobileList.style.display === "none") {
      mobileList.style.display = "block"; // Show the list
    } else {
      mobileList.style.display = "none"; // Hide the list
    }
  });
});
