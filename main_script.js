// Fetch data from the JSON file and populate the page
fetch("travel_info.json")
  .then((res) => res.json())
  .then((data) => {
    console.log("Data fetched:", data); // Debugging

    // Get the container where sections will be added
    const sectionsContainer = document.getElementById("sectionsContainer");

    // Loop through the sections in the JSON and create them dynamically
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
  })
  .catch((err) => {
    console.error("Error loading the JSON data:", err);
  });
