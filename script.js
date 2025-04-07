const startDate = new Date("2025-04-11");
const endDate = new Date("2025-04-21");

const dates = [];
let current = new Date(startDate);
while (current <= endDate) {
  const yyyy = current.getFullYear();
  const mm = String(current.getMonth() + 1).padStart(2, "0");
  const dd = String(current.getDate()).padStart(2, "0");
  dates.push(`${yyyy}${mm}${dd}`);
  current.setDate(current.getDate() + 1);
}

let currentLanguage = "en";
let currentDate = null;

const buttonLabels = {
  en: { ticket: "🎟️ Ticket", map: "🗺️ Map", more: "🔗 More Info" },
  kr: { ticket: "🎟️ 티켓", map: "🗺️ 지도", more: "🔗 자세히 보기" },
};

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

function loadSiteInfo() {
  fetch("page_meta.json")
    .then((response) => response.json())
    .then((data) => {
      const titleEl = document.getElementById("siteTitle");
      titleEl.textContent = currentLanguage === "kr" ? data.title_kr : data.title_en;
    });
}

function createTabs() {
  const tabsContainer = document.getElementById("tabs");
  const mobileList = document.getElementById("mobileDateList");
  const currentDateBtn = document.getElementById("currentDateBtn");

  dates.forEach((date, index) => {
    const display = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;

    const tab = document.createElement("div");
    tab.className = "tab";
    tab.textContent = display;
    tab.onclick = () => {
      loadSchedule(date);
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentDateBtn.textContent = `📅 ${display} ▾`;
    };
    tabsContainer.appendChild(tab);

    const li = document.createElement("li");
    li.textContent = display;
    li.onclick = () => {
      loadSchedule(date);
      currentDateBtn.textContent = `📅 ${display} ▾`;
      mobileList.classList.add("hidden");
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    };
    mobileList.appendChild(li);

    if (index === 0) {
      tab.click();
      li.click();
    }
  });

  currentDateBtn.onclick = () => {
    mobileList.classList.toggle("hidden");
  };
}

function loadSchedule(date) {
  currentDate = date;
  fetch(`daily_schedule/${date}_Schedule.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load: ${date}_Schedule.json`);
      return response.json();
    })
    .then((data) => {
      const scheduleContainer = document.getElementById("schedule");
      scheduleContainer.innerHTML = "";

      data.forEach((item) => {
        const type = item.type || "schedule";
        const itemDiv = document.createElement("div");
        itemDiv.className = `schedule-item ${type}`;

        const leftDiv = document.createElement("div");
        leftDiv.className = "schedule-left";

        const rightDiv = document.createElement("div");
        rightDiv.className = "schedule-right";

        const langKey = currentLanguage === "kr" ? "event_kr" : "event_en";
        const noteKey = currentLanguage === "kr" ? "note_kr" : "note_en";

        const startFormatted = formatTime(item.start, currentLanguage);
        const endFormatted = formatTime(item.end, currentLanguage);
        const timeStr = item.start ? `${startFormatted}${endFormatted ? ` – ${endFormatted}` : ""}` : `[Time TBA]`;

        let content = `
          <div class="time-block">${timeStr}</div>
          <div class="event-title">${item[langKey]}</div>
        `;

        if (item[noteKey]) {
          content += `<div>📝 ${item[noteKey]}</div>`;
        }

        leftDiv.innerHTML = content;

        if (item.ticket) {
          const ticketLink = document.createElement("a");
          ticketLink.href = item.ticket;
          ticketLink.target = "_blank";
          ticketLink.className = "schedule-button ticket-link";
          ticketLink.textContent = buttonLabels[currentLanguage].ticket;
          rightDiv.appendChild(ticketLink);
        }

        if (item.map) {
          const mapLink = document.createElement("a");
          mapLink.href = item.map;
          mapLink.target = "_blank";
          mapLink.className = "schedule-button map-link";
          mapLink.textContent = buttonLabels[currentLanguage].map;
          rightDiv.appendChild(mapLink);
        }

        if (item.more) {
          const moreLink = document.createElement("a");
          moreLink.href = item.more;
          moreLink.target = "_blank";
          moreLink.className = "schedule-button more-link";
          moreLink.textContent = buttonLabels[currentLanguage].more;
          rightDiv.appendChild(moreLink);
        }

        itemDiv.appendChild(leftDiv);
        itemDiv.appendChild(rightDiv);
        scheduleContainer.appendChild(itemDiv);
      });
    })
    .catch((err) => {
      document.getElementById("schedule").innerHTML = "Schedule not available.";
      console.error(err);
    });
}

function loadSiteInfo() {
  fetch("page_meta.json")
    .then((response) => response.json())
    .then((data) => {
      const titleEl = document.getElementById("siteTitle");
      const authorEl = document.getElementById("authorLine");
      const footerEl = document.getElementById("footerText");

      titleEl.textContent = currentLanguage === "kr" ? data.title_kr : data.title_en;
      footerEl.textContent = currentLanguage === "kr" ? data.footer_kr : data.footer_en;
      authorEl.textContent = data.author ? `👤 ${data.author}` : "";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  createTabs();
  loadSiteInfo();
  document.getElementById("languageSelect").addEventListener("change", (e) => {
    currentLanguage = e.target.value;
    if (currentDate) loadSchedule(currentDate);
    loadSiteInfo();
  });
});
