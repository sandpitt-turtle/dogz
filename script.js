const cohortName = "2410-ftb-et-web-am";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/2410-ftb-et-web-am/players`;

const showFormButton = document.getElementById("show_form");
const formPopup = document.getElementById("form_pop");
const closeFormButton = document.getElementById("close_button");
const playerListContainer = document.getElementById("player_list");

showFormButton.addEventListener("click", () => {
  formPopup.style.display = "flex";
});

closeFormButton.addEventListener("click", () => {
  formPopup.style.display = "none";
});

/**
 * Fetches all players from the API.
 * @returns {Object[]} the array of player objects
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(API_URL);
    console.log("API Response Status:", response.status);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched Players Data:", data);

    const players = data.data.players;

    if (Array.isArray(players)) {
      return players;
    } else {
      console.error("Fetched data.players is not an array:", data);
      return [];
    }
  } catch (err) {
    console.error("Error fetching players:", err);
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
    const response = await fetch(
      `https://fsa-puppy-bowl.herokuapp.com/api/2410-ftb-et-web-am/players/${playerId}`
    );
    const data = await response.json();
    return data.data;
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
};

/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 * @returns {Object} the player returned by the API
 */
const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(
      `https://fsa-puppy-bowl.herokuapp.com/api/2410-ftb-et-web-am/players`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playerObj),
      }
    );
    const json = await response.json();

    if (json.error) {
      throw new Error(json.message);
    }

    const players = await fetchAllPlayers();
    renderAllPlayers(players);
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
  try {
    const response = await fetch(
      `https://fsa-puppy-bowl.herokuapp.com/api/2410-ftb-et-web-am/players/${playerId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error(
        `Whoops, trouble removing player #${playerId} from the roster!`
      );
    }

    const players = await fetchAllPlayers();
    renderAllPlayers(players);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Updates `<main>` to display a list of all players.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
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

    playerBlock.innerHTML = `
      <img src="${player.imageUrl}" alt="${player.name}" />
      <h3>${player.name}</h3>
      <p>ID: ${player.id}</p>
      <button class="details-btn">See Details</button>
      <button class="remove-btn">Remove from roster</button> 
    `;

    playerListContainer.appendChild(playerBlock);
  });

  playerListContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-btn")) {
      const playerId = event.target
        .closest(".player-block")
        .querySelector("p")
        .textContent.split(" ")[1];
      removePlayer(playerId);
    }

    if (event.target.classList.contains("details-btn")) {
      const playerId = event.target
        .closest(".player-block")
        .querySelector("p")
        .textContent.split(" ")[1];
      fetchSinglePlayer(playerId).then((playerData) => {
        renderSinglePlayer(playerData);
      });
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
  const main = document.querySelector("main");
  main.innerHTML = `
  <div class="player-block">
  <img src="${player.imageUrl}" alt="${player.name}" />
  <h3>${player.name}</h3>
  <p>ID: ${player.id}</p>
  <button class="remove-btn">Remove from roster</button> 
</div>
  `;

  const backButton = document.getElementById("back-btn");
  backButton.addEventListener("click", () => {
    init();
  });
};

/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = () => {
  const form = document.getElementById("new-player-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const name = document.getElementById("name").value.trim();
      const imageUrl = document.getElementById("imageUrl").value.trim();
      const breed = document.getElementById("breed").value.trim();
      const team = document.getElementById("team").value.trim() || null;

      const playerObj = { name, imageUrl, breed, team };
      await addNewPlayer(playerObj);

      const players = await fetchAllPlayers();
      renderAllPlayers(players);

      form.reset();
      formPopup.style.display = "none";
    } catch (err) {
      console.error("Uh oh, trouble rendering the new player form!", err);
      alert("Uh oh, trouble rendering the new player form!");
    }
  });
};

/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);
  renderNewPlayerForm();
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
