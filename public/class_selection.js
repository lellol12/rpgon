function showClassSelectionMenu() {
    console.log('class_selection.js: showClassSelectionMenu called');
    // Assumes Game.currentGameState, classSelectionInfoDiv, inventoryMenuDiv, etc. are available
    // Assumes Game.players, Game.currentPlayerId, Game.CULTIVATOR_CLASSES, displayMessage, populateActionButtons, actionButtonsContainer are available
    Game.currentGameState = 'CLASS_SELECTION';
    if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'block';
    if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none';
    if (marketMenuDiv) marketMenuDiv.style.display = 'none';
    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
    if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
    if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
    if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
    if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
    if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";
    if (classSelectionInfoDiv) classSelectionInfoDiv.innerHTML = '<h3>Choose Your Path</h3><p>Select a class to view its details, then confirm your choice.</p>';
    Game.selectedClassForInfo = null;

    const player = Game.players[Game.currentPlayerId];
    if (typeof displayMessage === 'function') displayMessage(`\n${player.name}, with your <span class="spiritual-root">${player.spiritualRootName}</span>, it is time to choose your cultivation path.`, 'system');

    let classButtons = [];
    if (Game.CULTIVATOR_CLASSES) {
        for (const classKey in Game.CULTIVATOR_CLASSES) {
            classButtons.push({ text: Game.CULTIVATOR_CLASSES[classKey].name, action: 'show_class_info', value: classKey, style: 'class_select' });
        }
    }
    classButtons.push({ text: "Confirm Class", action: "select_class", value: null, style: "confirm" });
    classButtons.push({ text: "Logout", action: "logout", style: "neutral" });

    if (typeof populateActionButtons === 'function' && actionButtonsContainer) {
        populateActionButtons(classButtons, actionButtonsContainer);
    }
}

function showClassInfo(classKey) {
    console.log('class_selection.js: showClassInfo called with classKey:', classKey);
    // Assumes Game.CULTIVATOR_CLASSES, Game.selectedClassForInfo, classSelectionInfoDiv, populateActionButtons, actionButtonsContainer are available
    const classData = Game.CULTIVATOR_CLASSES[classKey];
    if (!classData) return;
    Game.selectedClassForInfo = classKey;

    if (classSelectionInfoDiv) {
        classSelectionInfoDiv.innerHTML = `
            <h3>${classData.name}</h3>
            <p><strong>Specialty:</strong> ${classData.specialty}</p>
            <p><strong>Recommended for:</strong> ${classData.recommendation}</p>
        `;
    }
    let classButtons = [];
    if (Game.CULTIVATOR_CLASSES) {
        for (const key in Game.CULTIVATOR_CLASSES) {
            classButtons.push({ text: Game.CULTIVATOR_CLASSES[key].name, action: 'show_class_info', value: key, style: 'class_select' });
        }
    }
    classButtons.push({ text: `Confirm ${classData.name}`, action: "select_class", value: classKey, style: "confirm" });
    classButtons.push({ text: "Logout", action: "logout", style: "neutral" });

    if (typeof populateActionButtons === 'function' && actionButtonsContainer) {
        populateActionButtons(classButtons, actionButtonsContainer);
    }
}

async function selectClass(classKey) {
    console.log('class_selection.js: selectClass called with classKey:', classKey);
    // Assumes Game.players, Game.currentPlayerId, Game.CULTIVATOR_CLASSES, displayMessage, Game.saveCurrentPlayerState, updateStatsDisplay, classSelectionInfoDiv, Game.showLoggedInMenu, showClassSelectionMenu are available
    const player = Game.players[Game.currentPlayerId];
    if (!player || !classKey || !Game.CULTIVATOR_CLASSES[classKey]) {
        if (typeof displayMessage === 'function') displayMessage("Invalid class selection.", "error");
        showClassSelectionMenu();
        return;
    }
    const chosenClassData = Game.CULTIVATOR_CLASSES[classKey];
    player.chosenClassName = chosenClassData.name;
    player.chosenClassKey = classKey;
    player.hasClassChosen = true;

    if (typeof displayMessage === 'function') displayMessage(`You have chosen the path of the <span class="class-info">${chosenClassData.name}</span>!`, "success");

    if (typeof chosenClassData.effect === 'function') {
        chosenClassData.effect(player);
    }

    await Game.saveCurrentPlayerState();
    if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
    if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
    Game.showLoggedInMenu();
}
