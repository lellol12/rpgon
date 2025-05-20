function showPlayerSearch() {
    console.log('player_search.js: showPlayerSearch called');
    // Assumes Game.currentGameState, Game.setMainView, playerSearchViewDiv, gameOutput, actionButtonsContainer, Game.showLoggedInMenu, executePlayerSearch are available
    Game.currentGameState = 'PLAYER_SEARCH';
    Game.setMainView('player_search');

    if (gameOutput) gameOutput.style.display = 'none';
    if (actionButtonsContainer) actionButtonsContainer.style.display = 'none';
    if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";

    if (playerSearchViewDiv) {
        playerSearchViewDiv.style.display = 'block';
        playerSearchViewDiv.innerHTML = `
            <h3>Search Players</h3>
            <div class="mb-4 flex gap-2">
                <input type="text" id="player-search-input" class="modal-input flex-grow" placeholder="Enter player name...">
                <button id="player-search-button" class="action-button bg-blue-600 hover:bg-blue-700">Search</button>
            </div>
            <div id="player-search-results" class="space-y-2 max-h-96 overflow-y-auto pr-2">
                <!-- Search results will appear here -->
            </div>
            <button id="player-search-back-button" class="action-button bg-gray-600 hover:bg-gray-700 mt-4">Back to Menu</button>
        `;

        const searchButton = document.getElementById('player-search-button');
        if (searchButton) searchButton.addEventListener('click', () => executePlayerSearch());

        const searchInputEl = document.getElementById('player-search-input');
        if (searchInputEl) {
            searchInputEl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') executePlayerSearch();
            });
        }

        const backButton = document.getElementById('player-search-back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                if (gameOutput) gameOutput.style.display = 'block';
                if (actionButtonsContainer) actionButtonsContainer.style.display = 'grid';
                Game.showLoggedInMenu();
            });
        }
    }
}

async function executePlayerSearch() {
    console.log('player_search.js: executePlayerSearch called');
    // Assumes db, displayPlayerSearchResults are available
    const searchInput = document.getElementById('player-search-input');
    const resultsDiv = document.getElementById('player-search-results');
    if (!searchInput || !resultsDiv) return;

    const searchTerm = searchInput.value.trim();
    if (searchTerm.length < 1) {
        resultsDiv.innerHTML = '<p class="text-gray-400">Please enter a name to search.</p>';
        return;
    }
    resultsDiv.innerHTML = '<p class="text-gray-400">Searching...</p>';

    try {
        const querySnapshot = await db.collection("players")
            .where("name", ">=", searchTerm)
            .where("name", "<=", searchTerm + '\uf8ff')
            .limit(10)
            .get();

        if (querySnapshot.empty) {
            resultsDiv.innerHTML = '<p class="text-gray-400">No players found matching that name.</p>';
        } else {
            displayPlayerSearchResults(querySnapshot.docs);
        }
    } catch (error) {
        console.error("Error searching players:", error);
        resultsDiv.innerHTML = '<p class="text-red-500">Error performing search. Please try again.</p>';
    }
}

function displayPlayerSearchResults(playerDocs) {
    console.log('player_search.js: displayPlayerSearchResults called with', playerDocs.length, 'results');
    // Assumes Game.handlePlayerChoice, Game.sects, Player class are available
    const resultsDiv = document.getElementById('player-search-results');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = '';

    playerDocs.forEach(doc => {
        const playerData = doc.data();
        const tempPlayer = Player.fromFirestoreObject(playerData);

        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player-search-result-item', 'p-2', 'bg-gray-700', 'rounded');
        const escapedPlayerName = playerData.name.replace(/'/g, "\\'");
        playerDiv.innerHTML = `
            <p class="font-semibold text-lg"><a href="#" onclick="Game.handlePlayerChoice('prompt_view_player_profile', { playerId: '${doc.id}', playerName: '${escapedPlayerName}'})" class="text-blue-400 hover:text-blue-300">${playerData.name}</a></p>
            <p class="text-sm">Level: ${tempPlayer.cultivationLevel} (${tempPlayer.getCultivationRealmName()})</p>
            ${playerData.chosenClassName && playerData.chosenClassName !== "Undetermined" ? `<p class="text-xs text-gray-400">Class: ${playerData.chosenClassName}</p>` : ''}
            ${playerData.sectId && Game.sects[playerData.sectId] ? `<p class="text-xs text-gray-400">Sect: ${Game.sects[playerData.sectId].name}</p>` : ''}
        `;
        resultsDiv.appendChild(playerDiv);
    });
}

async function promptViewPlayerProfile(playerId, playerName) {
    console.log('player_search.js: promptViewPlayerProfile called for playerId:', playerId, 'playerName:', playerName);
    // Assumes getModalInput, viewPlayerProfile are available
    const confirm = await getModalInput(`View profile of ${playerName}? (yes/no)`);
    if (confirm && confirm.toLowerCase() === 'yes') {
        viewPlayerProfile(playerId, playerName);
    }
}

async function viewPlayerProfile(playerId, playerName) {
    console.log('player_search.js: viewPlayerProfile called for playerId:', playerId, 'playerName:', playerName);
    // Assumes playerSearchViewDiv, Game.setMainView, gameOutput, actionButtonsContainer, displayMessage, db, Player class, Game.sects, populateActionButtons, Game.showLoggedInMenu are available
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    Game.setMainView('gameplay');

    if (gameOutput) gameOutput.innerHTML = '';
    if (actionButtonsContainer) actionButtonsContainer.innerHTML = '';

    if (typeof displayMessage === 'function') displayMessage(`Viewing profile of ${playerName} (ID: ${playerId})...`, 'system');

    try {
        const playerDoc = await db.collection("players").doc(playerId).get();

        if (playerDoc.exists) {
            const playerData = playerDoc.data();
            const viewedPlayer = Player.fromFirestoreObject(playerData);

            if (typeof displayMessage === 'function') {
                displayMessage(`\n--- Profile: ${viewedPlayer.name} ---`, 'important');
                displayMessage(`Level: ${viewedPlayer.cultivationLevel} (${viewedPlayer.getCultivationRealmName()})`, 'narration');
                displayMessage(`Class: ${viewedPlayer.chosenClassName || "Undetermined"}`, 'narration');
                displayMessage(`Spiritual Root: ${viewedPlayer.spiritualRootName || "Undetermined"}`, 'narration');
                displayMessage(`Sect: ${viewedPlayer.sectId && Game.sects[viewedPlayer.sectId] ? Game.sects[viewedPlayer.sectId].name : "None"}`, 'narration');
                displayMessage(`\nBasic Attributes:`, 'system');
                displayMessage(`STR: ${viewedPlayer.strength} | AGI: ${viewedPlayer.agility} | CON: ${viewedPlayer.constitution}`, 'narration');
                displayMessage(`SPR: ${viewedPlayer.spirit} | INT: ${viewedPlayer.intellect} | WIL: ${viewedPlayer.willpower}`, 'narration');
                displayMessage(`\n(This is a basic profile view. More details coming soon!)`, 'narration');
            }
        } else {
            if (typeof displayMessage === 'function') displayMessage(`Player with ID ${playerId} not found.`, 'error');
        }
    } catch (error) {
        console.error("Error fetching player profile:", error);
        if (typeof displayMessage === 'function') displayMessage("Error loading player profile. Please try again.", "error");
    }

    if (typeof populateActionButtons === 'function' && actionButtonsContainer) {
        populateActionButtons([
            { text: "Back to Player Search", action: "show_player_search", style: "neutral" },
            { text: "Back to Main Menu", action: "show_logged_in_menu", style: "neutral" }
        ], actionButtonsContainer);
    }
}
