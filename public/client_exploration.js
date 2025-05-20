// Assumes Game object and its properties/methods are available globally or imported.
// Assumes UI elements like actionButtonsContainer, combatInterface, gameOutput, etc., are accessible.

function exploreArea() {
    console.log('client_exploration.js: exploreArea called');
    const player = Game.players[Game.currentPlayerId];
    if (!player) { Game.showMainGate(); return; } // showMainGate should be from client_auth.js
    if (!player.isAlive()) {
        if (typeof displayMessage === 'function') displayMessage("Too weak to explore.", 'error');
        Game.showLoggedInMenu(); return; // showLoggedInMenu should be from client_auth.js or game.js
    }

    Game.currentGameState = 'AREA_SELECTION';
    Game.setMainView('gameplay'); // Assumes Game.setMainView handles UI changes

    // Hide various UI elements
    if (combatInterface) combatInterface.style.display = 'none';
    if (gameOutput) gameOutput.style.display = 'block'; // Or handle through setMainView
    if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
    if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none';
    if (marketMenuDiv) marketMenuDiv.style.display = 'none';
    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
    const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
    if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
    if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
    if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
    if (combatSpecificActions) combatSpecificActions.innerHTML = '';
    if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')"; // Ensure main.png is in public
    if(gridInventoryModal) gridInventoryModal.style.display = 'none';


    if (actionButtonsContainer) {
        actionButtonsContainer.innerHTML = '';
        actionButtonsContainer.classList.add('exploration-mode');
        actionButtonsContainer.style.gridTemplateColumns = ''; // Reset, let CSS handle
    }

    if (typeof displayMessage === 'function') displayMessage("\n--- Choose an Area to Explore ---", 'system');
    const playerRealmTier = Game.getRealmTier(player.cultivationLevel); // Assumes Game.getRealmTier is available

    const lockIconSvg = `<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"></path></svg>`;

    if (Game.EXPLORATION_AREAS) {
        for (const areaKey in Game.EXPLORATION_AREAS) {
            const area = Game.EXPLORATION_AREAS[areaKey];
            const isLocked = playerRealmTier < area.requiredRealmTier;
            const card = document.createElement('div');
            card.classList.add('exploration-card');
            if (isLocked) card.classList.add('locked-true');
            const imageUrl = area.image && area.image !== "null" && area.image !== "" ? area.image : 'assets/areas/default_area.png'; // Ensure path is relative to public
            card.style.backgroundImage = `url('${imageUrl.startsWith('assets/') ? imageUrl : 'assets/areas/' + imageUrl}')`;


            let cardOverlayContent = `
                <div class="exploration-card-header">
                    <div>
                        <h4 class="exploration-card-name">${area.name}</h4>
                        <span class="exploration-card-status ${isLocked ? 'locked' : 'unlocked'}">${isLocked ? 'Locked' : 'Unlocked'}</span>
                    </div>
                </div>
                <div class="exploration-card-details">
                    <p class="exploration-card-req">Requires: Realm Tier ${area.requiredRealmTier}</p>
                    <p class="exploration-card-desc">${area.description}</p>
                </div>
                <button class="action-button exploration-card-button ${isLocked ? 'bg-gray-600 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-700'}"
                        ${isLocked ? 'disabled' : ''}
                        onclick="Game.handlePlayerChoice('explore_specific_area', '${areaKey}')">
                    ${isLocked ? 'Locked' : 'Explore'}
                </button>
            `;
            const overlayDiv = document.createElement('div');
            overlayDiv.classList.add('exploration-card-overlay');
            overlayDiv.innerHTML = cardOverlayContent;
            card.appendChild(overlayDiv);

            if (isLocked) {
                const lockIconDiv = document.createElement('div');
                lockIconDiv.classList.add('exploration-card-lock-icon');
                lockIconDiv.innerHTML = lockIconSvg;
                card.appendChild(lockIconDiv);
            }
            if (actionButtonsContainer) actionButtonsContainer.appendChild(card);
        }
    }

    if (actionButtonsContainer) {
        const backButtonContainer = document.createElement('div');
        backButtonContainer.style.gridColumn = '1 / -1';
        backButtonContainer.style.textAlign = 'center';
        backButtonContainer.style.marginTop = '1.5rem';
        const backButton = document.createElement('button');
        backButton.textContent = "Back to Menu";
        backButton.classList.add('action-button', 'bg-slate-700', 'hover:bg-slate-800', 'text-white', 'font-semibold', 'py-3', 'px-6', 'rounded-lg', 'shadow-md');
        backButton.style.minWidth = '220px';
        backButton.onclick = () => {
            if (actionButtonsContainer) {
                actionButtonsContainer.classList.remove('exploration-mode');
                actionButtonsContainer.style.gridTemplateColumns = '';
            }
            Game.showLoggedInMenu(); // Assumes this function handles UI reset
        };
        backButtonContainer.appendChild(backButton);
        actionButtonsContainer.appendChild(backButtonContainer);
    }
}

function showDedicatedExplorationView(areaKey) {
    console.log('client_exploration.js: showDedicatedExplorationView for area:', areaKey);
    const player = Game.players[Game.currentPlayerId];
    if (!player) { Game.showMainGate(); return; }
    const areaData = Game.EXPLORATION_AREAS[areaKey];
    if (!areaData) { if (typeof displayMessage === 'function') displayMessage("Invalid area.", "error"); exploreArea(); return; }

    Game.currentGameState = 'IN_DEDICATED_EXPLORATION';
    Game.currentExploringAreaKey = areaKey;
    Game.setMainView('gameplay');

    // Hide various UI elements
    if (combatInterface) combatInterface.style.display = 'none';
    // ... (other UI element hiding logic from original function)
    if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
    if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none';
    if (marketMenuDiv) marketMenuDiv.style.display = 'none';
    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
    if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
    if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
    if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
    if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
    if(gridInventoryModal) gridInventoryModal.style.display = 'none';


    if (actionButtonsContainer) {
        actionButtonsContainer.classList.remove('exploration-mode');
        actionButtonsContainer.innerHTML = '';
    }

    const imageUrl = areaData.image && areaData.image !== "null" && areaData.image !== "" ? areaData.image : 'assets/areas/default_area.png'; // Ensure path is relative to public
    if (gameContainer) {
        gameContainer.style.backgroundImage = `url('${imageUrl.startsWith('assets/') ? imageUrl : 'assets/areas/' + imageUrl}')`;
        gameContainer.classList.add('dedicated-exploration-background');
    }

    if (typeof displayMessage === 'function') displayMessage(`\n--- Exploring ${areaData.name} ---`, 'system');

    if (typeof populateActionButtons === 'function' && actionButtonsContainer) {
        populateActionButtons([
            { text: `Explore Deeper in ${areaData.name}`, action: "perform_dedicated_explore_action", value: areaKey, style: "confirm" },
            { text: `Leave ${areaData.name}`, action: "leave_dedicated_exploration_area", style: "neutral" }
        ], actionButtonsContainer);
    }
}

function leaveDedicatedExplorationArea() {
    console.log('client_exploration.js: leaveDedicatedExplorationArea called');
    if (typeof displayMessage === 'function' && Game.EXPLORATION_AREAS[Game.currentExploringAreaKey]) {
        displayMessage(`Leaving ${Game.EXPLORATION_AREAS[Game.currentExploringAreaKey].name}.`, 'narration');
    }
    Game.currentExploringAreaKey = null;
    if (gameContainer) {
        gameContainer.classList.remove('dedicated-exploration-background');
        gameContainer.style.backgroundImage = "url('main.png')"; // Ensure main.png is in public
    }
    exploreArea(); // Call the client-side exploreArea
}

async function performDedicatedExploreActionUI(areaKey) {
    console.log('client_exploration.js: performDedicatedExploreActionUI for area:', areaKey);
    const player = Game.players[Game.currentPlayerId];
    if (!player) { Game.showMainGate(); return; }
    if (!player.isAlive()) { if (typeof displayMessage === 'function') displayMessage("Too weak to explore.", 'error'); Game.showLoggedInMenu(); return; }

    const areaData = Game.EXPLORATION_AREAS[areaKey]; // Client-side area data for quick checks
    if (!areaData) { if (typeof displayMessage === 'function') displayMessage("Invalid area selected.", "error"); Game.showLoggedInMenu(); return; }

    // Client-side Qi check (server will re-validate)
    const realmTierToQiCost = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 8 }; // Corrected: tier 6 costs 8
    const qiCost = realmTierToQiCost[areaData.requiredRealmTier] || 2;

    if (player.currentQi < qiCost) {
        if (typeof displayMessage === 'function') displayMessage(`Not enough Qi to explore ${areaData.name}. You need ${qiCost} Qi, but only have ${player.currentQi}.`, "error");
        return;
    }
    // Optimistically deduct Qi on client, server will confirm and adjust if needed
    // player.currentQi -= qiCost; // Server will handle actual deduction
    // if (typeof displayMessage === 'function') displayMessage(`Spent ${qiCost} Qi to explore.`, "system");
    // if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player); // Update UI based on server response

    if (typeof displayMessage === 'function') displayMessage(`\nVenturing into ${areaData.name}...`, 'narration');

    try {
        const exploreResult = await exploration_logic.performDedicatedExplore_logic(Game.currentPlayerId, areaKey);

        if (exploreResult.error) {
            if (typeof displayMessage === 'function') displayMessage(exploreResult.error, "error");
            if (exploreResult.updatedPlayer) Game.updateLocalPlayerState(exploreResult.updatedPlayer); // Sync player state
            return;
        }

        // Update local player state with results from server
        Game.updateLocalPlayerState(exploreResult.updatedPlayer); // Implement this function in game.js
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(Game.players[Game.currentPlayerId]);


        if (exploreResult.itemsFoundThisExplore && exploreResult.itemsFoundThisExplore.length > 0) {
            if (typeof displayMessage === 'function') displayMessage(`You found: ${exploreResult.itemsFoundThisExplore.join(', ')}!`, "loot");
        }

        if (exploreResult.xpGained > 0) {
             if (typeof displayMessage === 'function') displayMessage(`Gained insights from your surroundings. Gained ${exploreResult.xpGained} XP.`, 'success');
        }


        if (exploreResult.stealthOpportunity && player.chosenClassKey === 'poison_master') {
            if (typeof displayMessage === 'function') displayMessage("\nYou sense an opportunity to use your stealth...", 'narration');
            const choice = await getModalInput("Attempt a Stealthy Approach? (yes/no)"); // Assumes getModalInput is global
            if (choice && choice.toLowerCase() === 'yes') {
                const stealthResult = await exploration_logic.resolveStealthAttempt_logic(Game.currentPlayerId, areaKey);
                if (stealthResult.success) {
                    if (typeof displayMessage === 'function') displayMessage("Your stealthy approach was successful! You avoid any immediate danger and gain some insight.", 'success');
                    if(stealthResult.xpGained) player.gainCultivationXP(stealthResult.xpGained); // Or server updates this
                     Game.updateLocalPlayerState(stealthResult.updatedPlayer);
                    if (typeof updateStatsDisplay === 'function') updateStatsDisplay(Game.players[Game.currentPlayerId]);
                    Game.showLoggedInMenu(); // Or back to dedicated exploration view?
                    return;
                } else {
                    if (typeof displayMessage === 'function') displayMessage(stealthResult.message || "Your stealth attempt failed! A creature noticed you!", 'error');
                     Game.updateLocalPlayerState(stealthResult.updatedPlayer); // if any state changed
                }
            } else if (choice !== null && typeof displayMessage === 'function') {
                displayMessage("You decide against stealth.", 'narration');
            }
        }

        if (exploreResult.monsterEncountered) {
            if (Game.CombatManager && typeof Game.CombatManager.startCombat === 'function') {
                // The server should provide monster details if it's dynamically generated or modified
                await Game.CombatManager.startCombat(Game.players[Game.currentPlayerId], exploreResult.monsterDetails);
            } else {
                console.error("Game.CombatManager.startCombat is not a function or CombatManager is not initialized.");
                if(typeof displayMessage === 'function') displayMessage("Error initiating combat sequence.", "error");
            }
        } else {
            if (!exploreResult.foundSomething && !exploreResult.xpGained && typeof displayMessage === 'function') {
                 displayMessage("The area is quiet. You find a moment to reflect.", 'narration');
            }
            showDedicatedExplorationView(areaKey); // Stay in the area
        }
        // Game.saveCurrentPlayerState(); // Server handles saving

    } catch (error) {
        console.error("Error performing dedicated explore action (UI):", error);
        if (typeof displayMessage === 'function') displayMessage("An error occurred during exploration. Check console.", "error");
        showDedicatedExplorationView(areaKey); // Go back to area view on error
    }
}


// API interaction layer for exploration
const exploration_logic = {
    performDedicatedExplore_logic: async (playerId, areaKey) => {
        try {
            const response = await fetch(`/api/explore/${playerId}/${areaKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // No body needed if params are in URL for this specific endpoint as designed on server
            });
            // Check if response is ok (status in the range 200-299)
            if (!response.ok) {
                // Try to parse error response as JSON, otherwise use status text
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: response.statusText || `HTTP error ${response.status}` };
                }
                console.error("Server error during dedicated explore:", errorData);
                return { ...errorData, events: [{type: 'error', message: errorData.error || "Exploration failed."}] };
            }
            return await response.json(); // Server sends back exploreResult
        } catch (error) {
            console.error("Network error during dedicated explore:", error);
            return { error: "Network error. Could not perform exploration.", events: [{type: 'error', message: "Network error."}] };
        }
    },
    resolveStealthAttempt_logic: async (playerId, areaKey) => {
        try {
            const response = await fetch(`/api/explore/${playerId}/${areaKey}/stealth_resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // No body needed for this specific endpoint as designed on server
            });
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: response.statusText || `HTTP error ${response.status}`, success: false };
                }
                console.error("Server error during stealth resolve:", errorData);
                return { ...errorData, events: [{type: 'error', message: errorData.error || "Stealth resolve failed."}] };
            }
            return await response.json(); // Server sends back stealthResult
        } catch (error) {
            console.error("Network error during stealth resolve:", error);
            return { success: false, message: "Network error. Could not resolve stealth.", events: [{type: 'error', message: "Network error."}] };
        }
    }
};
