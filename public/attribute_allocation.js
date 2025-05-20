function showAttributeAllocationMenu() {
    console.log('attribute_allocation.js: showAttributeAllocationMenu called');
    // Assumes Game.players, Game.currentPlayerId, Game.currentGameState, Game.setMainView, Game.initialFreeAttributePointsForSession, Game.tempAttributeAllocations,
    // displayMessage, combatInterface, classSelectionInfoDiv, etc. are available
    const player = Game.players[Game.currentPlayerId];
    if (!player || player.freeAttributePoints <= 0) {
        if (typeof displayMessage === 'function') displayMessage("No free attribute points to allocate.", "narration");
        Game.showLoggedInMenu();
        return;
    }

    if (Game.currentGameState !== 'ATTRIBUTE_ALLOCATION' || Object.keys(Game.tempAttributeAllocations).length === 0) {
        Game.initialFreeAttributePointsForSession = player.freeAttributePoints;
        Game.tempAttributeAllocations = { strength: 0, agility: 0, constitution: 0, spirit: 0, intellect: 0, willpower: 0 };
    }

    Game.currentGameState = 'ATTRIBUTE_ALLOCATION';
    Game.setMainView('gameplay');
    if (combatInterface) combatInterface.style.display = 'none';
    if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
    if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none';
    if (marketMenuDiv) marketMenuDiv.style.display = 'none';
    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
    if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
    if (genderSelectionContainer) genderSelectionContainer.style.display = 'none';
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
    if(gridInventoryModal) gridInventoryModal.style.display = 'none';


    if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";
    const allocationDiv = document.getElementById('attribute-allocation-menu');
    if (!allocationDiv) return;

    allocationDiv.style.display = 'block';
    allocationDiv.classList.add('rpg-ui-panel');

    let totalSpentFromTemp = Object.values(Game.tempAttributeAllocations).reduce((sum, val) => sum + val, 0);
    let currentDisplayableFreePoints = Game.initialFreeAttributePointsForSession - totalSpentFromTemp;

    allocationDiv.innerHTML = `<h3>Allocate Attribute Points</h3>
                               <p id="available-points-display">Available Points: <strong class="text-yellow-400">${currentDisplayableFreePoints}</strong></p>`;

    const attributes = [
        { key: 'strength', name: 'Strength' }, { key: 'agility', name: 'Agility' },
        { key: 'constitution', name: 'Constitution' }, { key: 'spirit', name: 'Spirit' },
        { key: 'intellect', name: 'Intellect' }, { key: 'willpower', name: 'Willpower' }
    ];

    attributes.forEach(attr => {
        const baseValue = player[attr.key];
        const increment = Game.tempAttributeAllocations[attr.key] || 0;
        const displayValue = baseValue + increment;

        allocationDiv.innerHTML += `
            <div class="attribute-allocation-row">
                <span class="attr-name">${attr.name}</span>
                <div class="attr-controls">
                    <button onclick="Game.handlePlayerChoice('temp_unallocate_point', '${attr.key}')" ${increment === 0 ? 'disabled' : ''}>-</button>
                    <span class="attr-value">${displayValue}</span>
                    <button onclick="Game.handlePlayerChoice('temp_allocate_point', '${attr.key}')" ${currentDisplayableFreePoints === 0 ? 'disabled' : ''}>+</button>
                </div>
            </div>
        `;
    });

    const actionButtonsDiv = document.createElement('div');
    actionButtonsDiv.id = 'attribute-allocation-actions';
    actionButtonsDiv.innerHTML = `
        <button class="action-button bg-green-600 hover:bg-green-700" onclick="Game.handlePlayerChoice('confirm_attribute_allocations')">Confirm</button>
        <button class="action-button bg-red-600 hover:bg-red-700" onclick="Game.handlePlayerChoice('cancel_attribute_allocations')">Cancel</button>
    `;
    allocationDiv.appendChild(actionButtonsDiv);

    if (actionButtonsContainer) actionButtonsContainer.innerHTML = '';
}

function handleTempAllocatePoint(attributeKey) {
    console.log('attribute_allocation.js: handleTempAllocatePoint called with attributeKey:', attributeKey);
    // Assumes Game.tempAttributeAllocations, Game.initialFreeAttributePointsForSession, showAttributeAllocationMenu, displayMessage are available
    let totalSpentFromTemp = Object.values(Game.tempAttributeAllocations).reduce((sum, val) => sum + val, 0);
    if (Game.initialFreeAttributePointsForSession - totalSpentFromTemp > 0) {
        Game.tempAttributeAllocations[attributeKey] = (Game.tempAttributeAllocations[attributeKey] || 0) + 1;
        showAttributeAllocationMenu();
    } else {
        if (typeof displayMessage === 'function') displayMessage("No more points available to allocate.", "error");
    }
}

function handleTempUnallocatePoint(attributeKey) {
    console.log('attribute_allocation.js: handleTempUnallocatePoint called with attributeKey:', attributeKey);
    // Assumes Game.tempAttributeAllocations, showAttributeAllocationMenu are available
    if (Game.tempAttributeAllocations[attributeKey] > 0) {
        Game.tempAttributeAllocations[attributeKey]--;
        showAttributeAllocationMenu();
    }
}

async function confirmAttributeAllocations() {
    console.log('attribute_allocation.js: confirmAttributeAllocations called');
    // Assumes Game.players, Game.currentPlayerId, Game.tempAttributeAllocations, Game.initialFreeAttributePointsForSession,
    // Game.saveCurrentPlayerState, updateStatsDisplay, displayMessage, Game.showLoggedInMenu are available
    const player = Game.players[Game.currentPlayerId];
    if (!player) return;

    for (const attrKey in Game.tempAttributeAllocations) {
        player[attrKey] += Game.tempAttributeAllocations[attrKey];
    }
    let totalSpent = Object.values(Game.tempAttributeAllocations).reduce((sum, val) => sum + val, 0);
    player.freeAttributePoints = Game.initialFreeAttributePointsForSession - totalSpent;

    player.maxHealth = player.calculateMaxHealth();
    player.maxQi = player.calculateMaxQi();

    Game.tempAttributeAllocations = {};
    Game.initialFreeAttributePointsForSession = 0;
    await Game.saveCurrentPlayerState();
    if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
    if (typeof displayMessage === 'function') displayMessage("Attributes updated!", "success");
    Game.showLoggedInMenu();
}

function cancelAttributeAllocations() {
    console.log('attribute_allocation.js: cancelAttributeAllocations called');
    // Assumes Game.tempAttributeAllocations, Game.initialFreeAttributePointsForSession, displayMessage, Game.showLoggedInMenu are available
    Game.tempAttributeAllocations = {};
    Game.initialFreeAttributePointsForSession = 0;
    if (typeof displayMessage === 'function') displayMessage("Attribute allocation cancelled.", "narration");
    Game.showLoggedInMenu();
}
