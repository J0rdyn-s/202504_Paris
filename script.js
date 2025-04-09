let currentLanguage = "en";
let currentDate = null;
let dates = [];
let siteMeta = {};
let startDay = 0;
let isDropdownOpen = false;

const todayStr = (() => {
  const today = new Date();
  // const today = new Date("2025-04-14"); // 🧪 Change to any date you *do* have to test

  return `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
})();

let translations = {}; // ✅ Global now

async function loadLanguageProperties(lang) {
  const response = await fetch(`properties_${lang}.properties`);
  const text = await response.text();

  translations = Object.fromEntries(
    text
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const [key, ...valParts] = line.split("=");
        return [key.trim(), valParts.join("=").trim()];
      })
  );
}

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

  const isPM = hours >= 12;
  const h = hours % 12 || 12;

  const amLabel = translations["am"] || (lang === "kr" ? "오전" : "AM");
  const pmLabel = translations["pm"] || (lang === "kr" ? "오후" : "PM");

  if (lang === "kr") {
    const period = isPM ? pmLabel : amLabel;
    return `${period} ${h}시${minutes > 0 ? ` ${minutes}분` : ""}`;
  } else {
    const period = isPM ? pmLabel : amLabel;
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
  const weekday = translations[`weekday_${weekdayIndex}`];
  const dayOffset = index + (siteMeta.start_day || 0);
  const label = currentLanguage === "kr" ? `${year}-${month}-${day}(${weekday}): ${dayOffset}일차` : `${year}-${month}-${day}(${weekday}): Day ${dayOffset}`;
  el.textContent = `📅 ${label} ▾`;
}

function selectDateByOffset(offset) {
  const index = dates.indexOf(currentDate);
  const nextIndex = Math.min(dates.length - 1, Math.max(0, index + offset));
  const newDate = dates[nextIndex];
  if (newDate !== currentDate) {
    currentDate = newDate;
    loadSchedule(currentDate);
    updateDateDisplay(currentDate);
    updateNavButtons();
  }
}

function updateNavButtons() {
  const index = dates.indexOf(currentDate);
  document.getElementById("prevDate").disabled = index === 0;
  document.getElementById("nextDate").disabled = index === dates.length - 1;
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
        let timeStr = "";

        if (item.start && item.end) {
          timeStr = `${start} – ${end}`;
        } else if (item.start) {
          timeStr = start;
        } else if (item.end) {
          timeStr = currentLanguage === "kr" ? `– ${end}` : `– ${end}`;
        } else {
          timeStr = translations["tba"] || "[Time TBA]";
        }

        let content = `<div class="time-block">${timeStr}</div>
                       <div class="event-title">${item[langKey]}</div>`;

        if (item[noteKey]) {
          content += `<div>${item[noteKey]}</div>`;
        }

        left.innerHTML = content;

        if (item.ticket) {
          const btn = document.createElement("a");
          btn.href = item.ticket;
          btn.target = "_blank";
          btn.className = "schedule-button ticket-link";
          btn.textContent = translations["ticket"] || "Ticket";
          right.appendChild(btn);
        }

        if (item.map) {
          const btn = document.createElement("a");
          btn.href = item.map;
          btn.target = "_blank";
          btn.className = "schedule-button map-link";
          btn.textContent = translations["map"] || "Map";
          right.appendChild(btn);
        }

        if (item.more) {
          const btn = document.createElement("a");
          btn.href = item.more;
          btn.target = "_blank";
          btn.className = "schedule-button more-link";
          btn.textContent = translations["more"] || "More Info";
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
  const languageSelect = document.getElementById("languageSelect");

  document.getElementById("prevDate").addEventListener("click", () => {
    selectDateByOffset(-1);
  });

  document.getElementById("nextDate").addEventListener("click", () => {
    selectDateByOffset(1);
  });

  // Ensure the date list is hidden initially
  mobileList.style.display = "none";

  // Fetch and process the page meta data
  fetch("page_meta.json")
    .then((res) => res.json())
    .then(async (data) => {
      try {
        siteMeta = data;
        startDay = data.start_day || 0;
        currentLanguage = data.default_language || "kr";

        // ✅ Load language labels
        await loadLanguageProperties(currentLanguage);

        // ✅ Sync language dropdown
        languageSelect.value = currentLanguage;

        // ✅ Set title, author, and footer
        siteTitle.textContent = siteMeta[`title_${currentLanguage}`];
        authorLine.textContent = siteMeta.author ? `👤 ${siteMeta.author}` : "";
        footerText.textContent = siteMeta[`footer_${currentLanguage}`] || "";

        // ✅ Generate dates
        dates = generateDates(data.start_date, data.end_date);
        if (!Array.isArray(dates) || dates.length === 0) {
          console.error("⚠️ No dates generated. Check start_date/end_date in page_meta.json.");
          return;
        }

        // ✅ Build date list
        buildDateList();

        // ✅ Try today's date first; fallback to first available
        findFirstAvailableDate(dates).then((validDate) => {
          if (validDate) {
            currentDate = validDate;
            loadSchedule(validDate);
            updateDateDisplay(validDate);
            updateNavButtons();
          } else {
            console.error("🚨 No available JSON file found for any date.");
            document.getElementById("schedule").innerHTML = "<p>⚠️ No schedule available.</p>";
          }
        });
      } catch (e) {
        console.error("🚨 Error processing site meta:", e);
      }
    })
    .catch((err) => {
      console.error("🚨 Failed to fetch page_meta.json:", err);
    });

  // ✅ Toggle date list visibility
  dateDisplay.addEventListener("click", () => {
    mobileList.style.display = mobileList.style.display === "none" ? "block" : "none";
  });

  // ✅ Close the dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const isDisplayClicked = dateDisplay.contains(e.target);
    const isDropdownClicked = mobileList.contains(e.target);
    if (!isDisplayClicked && !isDropdownClicked) {
      mobileList.style.display = "none";
    }
  });

  // ✅ Language selector event
  languageSelect.addEventListener("change", async (e) => {
    currentLanguage = e.target.value;
    await loadLanguageProperties(currentLanguage);

    siteTitle.textContent = siteMeta[`title_${currentLanguage}`] || "";
    footerText.textContent = siteMeta[`footer_${currentLanguage}`] || "";

    if (currentDate) {
      updateDateDisplay(currentDate);
      loadSchedule(currentDate);
    }

    buildDateList();
  });

  // ✅ Reusable date list builder
  function buildDateList() {
    mobileList.innerHTML = "";

    dates.forEach((date, index) => {
      const year = date.slice(0, 4);
      const month = date.slice(4, 6);
      const day = date.slice(6, 8);
      const weekdayIndex = new Date(`${year}-${month}-${day}`).getDay();
      const weekday = translations[`weekday_${weekdayIndex}`] || `?${weekdayIndex}`;
      if (!translations[`weekday_${weekdayIndex}`]) {
        console.warn(`⚠️ Missing weekday_${weekdayIndex} in translations`);
      }

      const offset = index + (siteMeta.start_day || 0);

      const dayLabel = currentLanguage === "kr" ? `${year}-${month}-${day}(${weekday}): ${offset}일차` : `${year}-${month}-${day}(${weekday}): Day ${offset}`;

      const li = document.createElement("li");
      li.textContent = `${dayLabel}`;
      if (date === todayStr) li.classList.add("today"); // ✅ Highlight today
      li.onclick = () => {
        mobileList.style.display = "none";
        loadSchedule(date);
        updateDateDisplay(date);
      };
      mobileList.appendChild(li);
    });
  }

  // ✅ Local fallback for generateDates if needed
  function generateDates(start, end) {
    if (!start || !end) return [];
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

  async function findFirstAvailableDate(dates) {
    const today = new Date();
    // const today = new Date("2025-04-14"); // 🧪 Change to any date you *do* have to test

    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

    // Step 1: Try today's date first
    const priorityDates = dates.includes(todayStr) ? [todayStr, ...dates.filter((d) => d !== todayStr)] : dates;

    for (const date of priorityDates) {
      try {
        const res = await fetch(`daily_schedule/${date}_Schedule.json`, { method: "HEAD" });
        if (res.ok) return date;
      } catch (err) {
        // Ignore failed fetch
      }
    }

    return null; // nothing found
  }
});
