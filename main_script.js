// Fetch the default language and other settings from page_meta.json
fetch("page_meta.json")
  .then((res) => res.json())
  .then((data) => {
    const defaultLanguage = data.default_language || "en";
    // Set the language select to default value
    document.getElementById("languageSelect").value = defaultLanguage;

    // Load the properties for the default language
    loadProperties(defaultLanguage);

    // Load content for the default language
    loadTravelInfo(defaultLanguage);

    // Handle language change event
    document.getElementById("languageSelect").addEventListener("change", (event) => {
      const selectedLanguage = event.target.value;
      loadProperties(selectedLanguage); // Update text based on selected language
      loadTravelInfo(selectedLanguage); // Load the travel info for the selected language
    });
  })
  .catch((err) => {
    console.error("Error loading page_meta.json:", err);
  });

// Function to load properties from a .properties file
function loadProperties(language) {
  const propertiesFile = `properties_${language}.properties`; // Determine the correct properties file

  fetch(propertiesFile)
    .then((res) => res.text()) // Fetch the properties file as text
    .then((text) => {
      const properties = parseProperties(text); // Parse the properties
      updateUI(properties); // Update the UI elements
    })
    .catch((err) => {
      console.error(`Error loading ${propertiesFile}:`, err);
    });
}

// Function to parse .properties file text into key-value pairs
function parseProperties(propertiesText) {
  const properties = {};
  const lines = propertiesText.split("\n");

  lines.forEach((line) => {
    if (line.trim() && !line.startsWith("#")) {
      const [key, value] = line.split("=");
      if (key && value) {
        properties[key.trim()] = value.trim();
      }
    }
  });

  return properties;
}

// Function to update UI elements with the properties
function updateUI(properties) {
  // Update the "More Info" button text
  const buttons = document.querySelectorAll(".more-info-button");
  buttons.forEach((button) => {
    if (button.textContent === "More Info") {
      button.textContent = properties["more_info_button"];
    } else if (button.textContent === "Less Info") {
      button.textContent = properties["less_info_button"];
    }
  });
}

// Function to load the correct travel_info JSON based on language
function loadTravelInfo(language) {
  fetch(`travel_info_${language}.json`)
    .then((res) => res.json())
    .then((data) => {
      renderSections(data); // Render the sections dynamically based on the fetched data
    })
    .catch((err) => {
      console.error(`Error loading travel_info_${language}.json:`, err);
    });
}

// Function to render the sections dynamically
function renderSections(data) {
  const sectionsContainer = document.getElementById("sectionsContainer");
  sectionsContainer.innerHTML = ""; // Clear any existing content

  // Loop through the sections and create them dynamically
  for (const sectionKey in data) {
    const sectionData = data[sectionKey];

    // Create a new section
    const section = document.createElement("div");
    section.classList.add("section");
    section.id = sectionKey;

    // Create the section title
    const title = document.createElement("h2");
    title.textContent = sectionData.title;
    section.appendChild(title);

    // Create a list of content items (either label/value or phrase/translation)
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

    section.appendChild(list);

    // Handle visibility based on the 'hidden' property
    if (sectionData.hidden) {
      // If hidden, add the 'hidden' class to keep it hidden by default
      const hiddenContent = document.createElement("div");
      hiddenContent.classList.add("hidden");
      hiddenContent.appendChild(list); // Add the content into the hidden div

      // Add a toggle button to show/hide the content
      const toggleButton = document.createElement("button");
      toggleButton.classList.add("more-info-button");
      toggleButton.textContent = `More Info`;

      // Toggle button behavior
      toggleButton.onclick = () => {
        hiddenContent.classList.toggle("hidden");
        if (hiddenContent.classList.contains("hidden")) {
          toggleButton.textContent = `More Info`;
        } else {
          toggleButton.textContent = `Less Info`;
        }
      };

      // Append the toggle button and hidden content to the section
      section.appendChild(toggleButton);
      section.appendChild(hiddenContent);
    }

    // Render the links section as a button for more information
    if (sectionData.links !== null) {
      sectionData.links.forEach((link) => {
        const button = document.createElement("button");
        button.classList.add("more-info-button");
        button.textContent = link.text; // Button text will be the link text

        // When the button is clicked, open the URL
        button.onclick = () => {
          window.location.href = link.url; // Navigate to the link
        };

        section.appendChild(button);
      });
    }

    // Append the section to the container
    sectionsContainer.appendChild(section);
  }
}

// Schedule button event
document.getElementById("toSchedule").addEventListener("click", function () {
  window.location.href = "index.html"; // Navigate to the schedule page
});
