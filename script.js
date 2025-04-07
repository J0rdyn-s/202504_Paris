
let currentLanguage = "en";
let currentDate = null;
let dates = [];
let siteMeta = {};
let startDay = 0;

const buttonLabels = {
  en: { ticket: "🎟️ Ticket", map: "🗺️ Map", more: "🔗 More Info" },
  kr: { ticket: "🎟️ 티켓", map: "🗺️ 지도", more: "🔗 자세히 보기" }
};

const startDate = new Date("2025-04-11");
const endDate = new Date("2025-04-21");

while (startDate <= endDate) {
  const yyyy = startDate.getFullYear();
  const mm = String(startDate.getMonth() + 1).padStart(2, '0');
  const dd = String(startDate.getDate()).padStart(2, '0');
  dates.push(`${yyyy}${mm}${dd}`);
  startDate.setDate(startDate.getDate() + 1);
}

function formatTime(raw, lang) {
  if (!raw || raw.length !== 4) return null;
  const hours = parseInt(raw.substring(0, 2), 10);
  const minutes = parseInt(raw.substring(2), 10);
  if (lang === 'kr') {
    const isPM = hours >= 12;
    const h = hours % 12 || 12;
    const period = isPM ? '오후' : '오전';
    return `${period} ${h}시${minutes > 0 ? ` ${minutes}분` : ''}`;
  } else {
    const h = hours % 12 || 12;
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}

function updateDateDisplay(date) {
  const el = document.getElementById("dateDisplay");
  const index = dates.indexOf(date);
  const dateStr = `${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}`;
  const dayOffset = index + (siteMeta.start_day || 0);
  const label = currentLanguage === 'kr' ? `${dayOffset}일차` : `Day ${dayOffset}`;
  el.textContent = `📅 ${dateStr}: ${label} ▾`;
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
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("schedule");
      container.innerHTML = "";
      data.forEach(item => {
        const type = item.type || "schedule";
        const itemDiv = document.createElement("div");
        itemDiv.className = `schedule-item ${type}`;

        const left = document.createElement("div");
        left.className = "schedule-left";

        const right = document.createElement("div");
        right.className = "schedule-right";

        const langKey = currentLanguage === 'kr' ? 'event_kr' : 'event_en';
        const noteKey = currentLanguage === 'kr' ? 'note_kr' : 'note_en';

        const start = formatTime(item.start, currentLanguage);
        const end = formatTime(item.end, currentLanguage);
        const timeStr = item.start ? `${start}${end ? ` – ${end}` : ''}` : `[Time TBA]`;

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

function loadSiteMeta() {
  fetch("page_meta.json")
    .then(res => res.json())
    .then(data => {
      siteMeta = data;
      startDay = data.start_day || 0;
      currentLanguage = data.default_language || 'en';
      document.getElementById("languageSelect").value = currentLanguage;
      document.getElementById("siteTitle").textContent = data[`title_${currentLanguage}`];
      document.getElementById("authorLine").textContent = data.author ? `👤 ${data.author}` : "";
      document.getElementById("footerText").textContent = data[`footer_${currentLanguage}`] || "";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadSiteMeta();

  const mobileList = document.getElementById("mobileDateList");
  const dateDisplay = document.getElementById("dateDisplay");

  // Build dropdown
  dates.forEach(date => {
    const li = document.createElement("li");
    const index = dates.indexOf(date);
    const dayLabel = currentLanguage === 'kr'
      ? `${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}: ${index + (startDay)}일차`
      : `${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}: Day ${index + (startDay)}`;
    li.textContent = dayLabel;
    li.onclick = () => {
      loadSchedule(date);
      updateDateDisplay(date);
      mobileList.classList.add("hidden");
    };
    mobileList.appendChild(li);
  });

  // Toggle dropdown
  let open = false;
  dateDisplay.addEventListener("click", (e) => {
    e.stopPropagation();
    open = !open;
    mobileList.classList.toggle("hidden", !open);
  });

  document.addEventListener("click", () => {
    open = false;
    mobileList.classList.add("hidden");
  });

  document.getElementById("prevDate").onclick = () => selectDateByOffset(-1);
  document.getElementById("nextDate").onclick = () => selectDateByOffset(1);

  document.getElementById("languageSelect").addEventListener("change", (e) => {
    currentLanguage = e.target.value;
    document.getElementById("siteTitle").textContent = siteMeta[`title_${currentLanguage}`];
    document.getElementById("footerText").textContent = siteMeta[`footer_${currentLanguage}`] || "";
    if (currentDate) loadSchedule(currentDate);
    updateDateDisplay(currentDate);
  });

  const defaultDate = dates[0];
  loadSchedule(defaultDate);
  updateDateDisplay(defaultDate);
});
