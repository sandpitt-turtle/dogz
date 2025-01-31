
const cohortName = "2410-ftb-et-web-am";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/players`;


const showFormButton = document.getElementById("show_form");
const formPopup = document.getElementById("form_pop");
const closeFormButton = document.getElementById("close_button");
const playerListContainer = document.getElementById("player_list");
const newPlayerForm = document.getElementById("new-player-form");


showFormButton.addEventListener("click", () => (formPopup.style.display = "flex"));
closeFormButton.addEventListener("click", () => (formPopup.style.display = "none"));
formPopup.addEventListener("click", (event) => {
  if (event.target === formPopup) formPopup.style.display = "none";
});




/**
 * Fetches all players from the API.
 * @returns {Promise<Object[]>} Array of player objects.
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(API_URL);
    console.log(`fetch all players ${response.data }`) 
    if (!response.ok) throw new Error(`Failed to fetch players. Status: ${response.status}`);
    const data = await response.json();
    console.log(`feth all players ${data}`) 
    return data.data.players || [];
  } catch (error) {
    console.error("Error fetching all players:", error);
    return [];
  }
};



/**
 * Fetches a single player from the API.
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/${playerId}`);
    console.log(`fetching single player ${response}`)
    if (!response.ok) throw new Error(`Failed to fetch player #${playerId}`);
    const data = await response.json();
    console.log("Single Player API Response:", data); 
    return data.data; 
  } catch (error) {
    console.error(`Error fetching player #${playerId}:`, error);
    return null;
  }
};



/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 * @returns {Object} the player returned by the API
 */
const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerObj),
    });

     const json = await response.json();
     console.log(`fetching single player ${json}`)
    if (json.error) throw new Error(json.message);
    await updatePlayerList();
  } catch (error) {
    console.error("Error adding new player:", error);
    alert("Error adding new player. Please try again.");
  }
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/${playerId}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`Whoops, trouble removing player #${playerId} from the roster!`);
    await updatePlayerList();
  } catch (error) {
    console.error(`Error removing player #${playerId}:`, error);
  }
};

/**
 * Updates `<main>` to display a list of all players.
 */

const updatePlayerList = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);
};

/** 
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
 *
 * - "See details" button that, when clicked, calls `renderSinglePlayer` to
 *    display more information about the player
 * - "Remove from roster" button that, when clicked, will call `removePlayer` to
 *    remove that specific player and then re-render all players
 *
 * Note: this function should replace the current contents of `<main>`, not append to it.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = (playerList) => {
  playerListContainer.innerHTML = "";

  if (playerList.length === 0) {
    playerListContainer.innerHTML = `<li>No players found.</li>`;
    return;
  }

  playerList.forEach((player) => {
    const playerBlock = document.createElement("div");
    playerBlock.classList.add("player-block");
    playerBlock.setAttribute("data-player-id", player.id || 'N/A');
    const defaultImage = "/dog.jpg"; 
    playerBlock.innerHTML = `
      <img src="${player.imageUrl || defaultImage}" alt="${player.name || 'Unknown'}" onerror="this.src='${defaultImage}'" />
      <h3>${player.name || 'Unknown'}</h3>
      <p>ID: ${player.id || 'N/A'}</p>
      <button class="details-btn">See Details</button>
      <button class="remove-btn">Remove from roster</button>
    `;
    playerListContainer.appendChild(playerBlock);
  });

  setupPlayerButtons(); 
};


const setupPlayerButtons = () => {
  playerListContainer.addEventListener("click", async (event) => {
    const playerBlock = event.target.closest(".player-block");
    if (!playerBlock) return;

    const playerId = playerBlock.dataset.playerId;

    if (event.target.classList.contains("remove-btn")) {
      console.log("Remove button clicked:", playerId);
      await removePlayer(playerId);
    }

    if (event.target.classList.contains("details-btn")) {
      console.log("Details button clicked:", playerId);
      const playerData = await fetchSinglePlayer(playerId);
      if (playerData && playerData.player) {
        renderSinglePlayer(playerData.player); // Extract and pass the nested player object
      } else {
        alert("Error fetching player details. Please try again.");
      }
    }
  });
};




/**
 * Updates `<main>` to display a single player.
 * The player is displayed in a card with the following information:
 * - name
 * - id
 * - breed
 * - image (with alt text of the player's name)
 * - team name, if the player has one, or "Unassigned"
 *
 * The card also contains a "Back to all players" button that, when clicked,
 * will call `renderAllPlayers` to re-render the full list of players.
 * @param {Object} player an object representing a single player
 */
const renderSinglePlayer = (player) => {
  console.log("Player object in renderSinglePlayer:", player);

  const main = document.querySelector("main");
  main.innerHTML = ""; // Clears main completely

  const playerBlock = document.createElement("div");
  playerBlock.classList.add("player-block", "single-player-block");
  playerBlock.setAttribute("data-player-id", player.id || 'N/A');

  playerBlock.innerHTML = `
    <img src="${player.imageUrl || '/dog.jpg'}" alt="${player.name || 'Unknown'}" onerror="this.src='/dog.jpg'" />
    <h3>${player.name || 'Unknown'}</h3>
    <p>ID: ${player.id || 'N/A'}</p>
    <p>Breed: ${player.breed || 'Unknown'}</p>
    <p>Status: ${player.status || 'Unspecified'}</p>
    <div class="button-container">
      <button class="back_to_all_players">Back to all players</button>
      <button class="remove-btn">Remove from roster</button>
    </div>
  `;

  main.appendChild(playerBlock);



  
  main.querySelector(".back_to_all_players").addEventListener("click", async () => {
    console.log("Back to All Players clicked");
    main.innerHTML = ""; // Properly clears the single player view
    main.appendChild(playerListContainer); // Re-adds the player list correctly
    await updatePlayerList(); // Ensure player list is properly fetched
  });

  main.querySelector(".remove-btn").addEventListener("click", async () => {
    console.log("Remove from Roster clicked for Player ID:", player.id);

    if (!player.id) {
      alert("Player ID is missing or invalid. Unable to remove the player.");
      return;
    }

    try {
      await removePlayer(player.id); 
      await updatePlayerList(); 
      alert(`Player ${player.name} has been removed.`);
    } catch (error) {
      console.error(`Failed to remove player ${player.id}:`, error);
      alert("An error occurred while removing the player. Please try again.");
    }
  });



console.log("Player object in renderSinglePlayer:", player);
console.log("Player Name:", player.name);
console.log("Player Image URL:", player.imageUrl);
console.log("Player Breed:", player.breed);
console.log("Player Status:", player.status);


};




/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = () => {
  newPlayerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const imageUrl = document.getElementById("imageUrl").value.trim() || "/dog.jpg"; 
    const breed = document.getElementById("breed").value.trim();
    const team = document.getElementById("team").value.trim() || "Unassigned";


    if (!name || !imageUrl || !breed) {
      alert("Uh oh, trouble rendering the new player form!");
      return;
    }

      const playerObj = { name, imageUrl, breed, team };
      await addNewPlayer(playerObj);
      newPlayerForm.reset();
      formPopup.style.display = "none";
    });
  };

/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */


const init = async () => {
  await updatePlayerList();
  renderNewPlayerForm(); // Ensure this runs properly
};


init();

// This script will be run using Node when testing, so here we're doing a quick
// check to see if we're in Node or the browser, and exporting the functions
// we want to test if we're in Node.
if (typeof window === "undefined") {
  module.exports = {
    fetchAllPlayers,
    fetchSinglePlayer,
    addNewPlayer,
    removePlayer,
    renderAllPlayers,
    renderSinglePlayer,
    renderNewPlayerForm,
  };
}
