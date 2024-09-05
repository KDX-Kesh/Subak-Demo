/*
┌─┐┬ ┬┌┐ ┌─┐┬┌─ 
└─┐│ │├┴┐├─┤├┴┐ 
└─┘└─┘└─┘┴ ┴┴ ┴ 
---------------------------------
CHANGELOGS:

v0.3 20240905
- added a json content reader
- added back-facing scripts for frontend
- added animations and related functions

v0.2 20240904
- implemented json content input
- added left and right buttons
- added resizing media (image content)

v0.1 20240903
- added button support
- made wireframes and flexboxes
---------------------------------
File built by; Srikesh
last updated: 20240905

*/

// Global variable to hold the JSON data
var jsonData = {};
var cardIndex = 1;
var maxIndex = 0;

// Function to load JSON data and store it in the global jsonData object
function loadJsonData() {
  return fetch("content.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json(); // Parse the JSON data
    })
    .then((data) => {
      jsonData = data; // Store the fetched data in the global jsonData variable
      console.log(jsonData);
      maxIndex = jsonData.cards.length;
      console.log(maxIndex);

      updateCardContent(cardIndex, jsonData);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function setupArrowListeners() {
  let isAnimating = false; // Flag to prevent spamming

  document.addEventListener("DOMContentLoaded", function () {
    const leftArrow = document.getElementById("left-arrow");
    const rightArrow = document.getElementById("right-arrow");
    const restartButton = document.getElementById("restart-icon");
    leftArrow.style.display = "none";
    // restartButton.style.display = "none";

    // Event listener for the right arrow
    rightArrow.addEventListener("click", function () {
      if (cardIndex < maxIndex && !isAnimating) {
        cardIndex++;
        console.log(cardIndex);

        isAnimating = true; // Block further clicks
        updateCardContent(cardIndex, jsonData, "next");

        // Enable the buttons again after animation is complete (0.5s for animation)
        setTimeout(() => {
          isAnimating = false;
          leftArrow.style.display = "block";
          rightArrow.style.display = "block";
          if (cardIndex == 1) {
            leftArrow.style.display = "none";
          }
          if (cardIndex == maxIndex) {
            rightArrow.style.display = "none";
          }
        }, 500); // Match this to the duration of your animation
      }
    });

    // Event listener for the left arrow
    leftArrow.addEventListener("click", function () {
      if (cardIndex > 1 && !isAnimating) {
        cardIndex--;
        console.log(cardIndex);

        isAnimating = true; // Block further clicks
        updateCardContent(cardIndex, jsonData, "prev");

        // Enable the buttons again after animation is complete (0.5s for animation)
        setTimeout(() => {
          isAnimating = false;
          leftArrow.style.display = "block";
          rightArrow.style.display = "block";
          if (cardIndex == 1) {
            leftArrow.style.display = "none";
          }
          if (cardIndex == maxIndex) {
            rightArrow.style.display = "none";
          }
        }, 500); // Match this to the duration of your animation
      }
    });

    restartButton.addEventListener("click", function () {
      if (!isAnimating) {
        // Remove cardIndex check since we always restart
        cardIndex = 1; // Reset to the first card
        console.log("restarted");

        isAnimating = true; // Block further clicks
        updateCardContent(cardIndex, jsonData, "prev"); // Call the update function to reset content

        // Enable the buttons again after animation is complete (0.5s for animation)
        setTimeout(() => {
          isAnimating = false;
          leftArrow.style.display = "none"; // Hide left arrow because we're at the start
          rightArrow.style.display = "block"; // Show right arrow since we can progress

          if (cardIndex == maxIndex) {
            rightArrow.style.display = "none"; // Hide right arrow if we're at the last card
          }
        }, 500); // Match this to the duration of your animation
      }
    });
  });
}

function updateCardContent(cardIndex, jsonData, animMode) {
  // Get the card data for the current index
  const card = jsonData.cards[cardIndex - 1]; // Subtract 1 because arrays are 0-indexed, but cardIndex starts from 1

  // Get the card container and media container
  const cardElement = document.querySelector(".card");
  const mediaContainer = document.querySelector(".media-container");
  let mediaElement = document.getElementById("media");

  // Remove any previous "in" animation classes
  cardElement.classList.remove("animate-in-right", "animate-in-left");

  // Add 'animate-out' class to fade out the card
  if (animMode == "next") {
    cardElement.classList.add("animate-out-left");
  } else if (animMode == "prev") {
    cardElement.classList.add("animate-out-right");
  }

  // Wait for the fade-out animation to complete (0.5s)
  setTimeout(() => {
    // Remove the old media element
    if (mediaElement) {
      mediaElement.remove();
    }

    // Dynamically create the appropriate media element (image or video)
    if (card.media.type === "image") {
      mediaElement = document.createElement("img");
      mediaElement.src = card.media.url;
      mediaElement.alt = card.title;
      mediaElement.id = "media";
    } else if (card.media.type === "video") {
      mediaElement = document.createElement("video");
      mediaElement.src = card.media.url;
      mediaElement.autoplay = true;
      mediaElement.muted = true;
      mediaElement.loop = true;
      mediaElement.controls = false; // Disable controls
      mediaElement.id = "media";
      mediaElement.setAttribute("playsinline", ""); // Ensure inline playback on mobile devices
    }

    // Append the new media element to the media container
    mediaContainer.appendChild(mediaElement);

    // Update the title, context, subtext, and counter
    document.getElementById("title").textContent = card.title;
    document.getElementById("context").textContent = card.context;
    document.getElementById("subtext").textContent = card.subtext;
    document.getElementById(
      "counter"
    ).textContent = `${cardIndex}/${jsonData.cards.length}`;

    // Remove 'animate-out' class and add 'animate-in' class to fade in the new content
    if (animMode == "next") {
      cardElement.classList.remove("animate-out-left");
      void cardElement.offsetWidth; // Trigger a reflow to restart the animation
      cardElement.classList.add("animate-in-right");
    } else if (animMode == "prev") {
      cardElement.classList.remove("animate-out-right");
      void cardElement.offsetWidth; // Trigger a reflow to restart the animation
      cardElement.classList.add("animate-in-left");
    }
  }, 500); // Match the timeout to the duration of the animation (0.5s)
}

// Function to preload images and videos
function preloadMedia(jsonData) {
  jsonData.cards.forEach((card) => {
    if (card.media.type === "image") {
      const img = new Image(); // Create a new image object
      img.src = card.media.url; // Set the image source to the URL
    } else if (card.media.type === "video") {
      const video = document.createElement("video"); // Create a new video element
      video.src = card.media.url; // Set the video source to the URL
      video.preload = "auto"; // Preload the video automatically
    }
  });
}

// Initialize the page by loading the JSON data and preloading media
function initialize() {
  loadJsonData().then(() => {
    preloadMedia(jsonData); // Preload media after the data is loaded
    setupArrowListeners(); // Set up the arrow listeners after preloading
  });
}

loadJsonData();
setupArrowListeners();
