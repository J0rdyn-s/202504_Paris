// Fetch the default language and other settings from page_meta.json
fetch("page_meta.json")
  .then((res) => res.json())
  .then((data) => {
    const defaultLanguage = data.default_language || "en";
    document.getElementById("languageSelect").value = defaultLanguage;
    loadProperties(defaultLanguage);
    loadTravelInfo(defaultLanguage);

    document.getElementById("languageSelect").addEventListener("change", (event) => {
      const selectedLanguage = event.target.value;
      loadProperties(selectedLanguage);
      loadTravelInfo(selectedLanguage);
    });
  })
  .catch((err) => console.error("Error loading page_meta.json:", err));

// Load properties from a .properties file
function loadProperties(language) {
  const propertiesFile = `properties_${language}.properties`;

  fetch(propertiesFile)
    .then((res) => res.text())
    .then((text) => {
      const properties = parseProperties(text);
      updateUI(properties);
    })
    .catch((err) => console.error(`Error loading ${propertiesFile}:`, err));
}

// Parse .properties file text into key-value pairs
function parseProperties(text) {
  const props = {};
  const lines = text.split("\n");

  lines.forEach((line) => {
    if (line.trim() && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        props[key.trim()] = valueParts.join("=").trim();
      }
    }
  });

  return props;
}

// Update static UI elements with translated text
function updateUI(properties) {
  // Get current language-specific translations
  const showMoreText = properties["show_more_button"] || "Show More";
  const showLessText = properties["show_less_button"] || "Show Less";
  const goToScheduleText = properties["go_to_schedule_button"] || "Go to Schedule";

  // Store translated strings globally for later use in renderSections
  window.translatedText = {
    showMoreText,
    showLessText,
  };

  // Update all elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (properties[key]) {
      el.textContent = properties[key];
    }
  });

  // Update "Show More" / "Show Less" buttons already rendered in the DOM
  document.querySelectorAll(".more-info-button").forEach((button) => {
    const text = button.textContent.trim();
    if (text === "More Info" || text === "Show More" || text === window.translatedText?.showMoreText) {
      button.textContent = showMoreText;
    } else if (text === "Less Info" || text === "Show Less" || text === window.translatedText?.showLessText) {
      button.textContent = showLessText;
    }
  });

  // Update the "Go to Schedule" button (just in case it doesn't have data-i18n)
  const scheduleBtn = document.getElementById("toSchedule");
  if (scheduleBtn) {
    scheduleBtn.textContent = goToScheduleText;
  }
}

// Load language-specific travel information
function loadTravelInfo(language) {
  fetch(`travel_info_${language}.json`)
    .then((res) => res.json())
    .then((data) => renderSections(data))
    .catch((err) => console.error(`Error loading travel_info_${language}.json:`, err));
}

// Render each section dynamically
function renderSections(data) {
  const container = document.getElementById("sectionsContainer");
  container.innerHTML = "";

  for (const sectionKey in data) {
    const sectionData = data[sectionKey];

    const section = document.createElement("div");
    section.classList.add("section");
    section.id = sectionKey;

    const title = document.createElement("h2");
    title.textContent = sectionData.title;
    section.appendChild(title);

    const list = document.createElement("ul");
    sectionData.content.forEach((item) => {
      const li = document.createElement("li");
      if (item.label && item.value) {
        li.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
      } else if (item.phrase && item.translation) {
        li.innerHTML = `<strong>${item.phrase}:</strong> ${item.translation}`;
      }
      list.appendChild(li);
    });

    if (sectionData.hidden) {
      const hiddenDiv = document.createElement("div");
      hiddenDiv.classList.add("hidden");
      hiddenDiv.appendChild(list);

      const toggleBtn = document.createElement("button");
      toggleBtn.classList.add("more-info-button");
      toggleBtn.textContent = (window.translatedText && window.translatedText.showMoreText) || "More Info";

      toggleBtn.onclick = () => {
        hiddenDiv.classList.toggle("hidden");
        toggleBtn.textContent = hiddenDiv.classList.contains("hidden")
          ? (window.translatedText && window.translatedText.showMoreText) || "More Info"
          : (window.translatedText && window.translatedText.showLessText) || "Less Info";
      };

      section.appendChild(toggleBtn);
      section.appendChild(hiddenDiv);
    } else {
      section.appendChild(list);
    }

    if (Array.isArray(sectionData.links)) {
      sectionData.links.forEach((link) => {
        const linkBtn = document.createElement("button");
        linkBtn.classList.add("more-info-button");
        linkBtn.textContent = link.text;
        linkBtn.onclick = () => (window.location.href = link.url);
        section.appendChild(linkBtn);
      });
    }

    container.appendChild(section);
  }
}

// Schedule page redirection
document.getElementById("toSchedule").addEventListener("click", () => {
  window.location.href = "index.html";
});
