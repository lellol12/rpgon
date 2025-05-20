async function forgeArtifact() {
    console.log('artifact.js: forgeArtifact called');
    // Assumes Game.players, Game.currentPlayerId, Game.ARTIFACT_RECIPES, Game.ITEM_DATA, Game.showLoggedInMenu are available
    // Assumes UI elements like combatInterface, classSelectionInfoDiv, etc. are global or accessible.
    const player = Game.players[Game.currentPlayerId];
    if (!player || player.chosenClassKey !== 'artifact_refiner') {
        if (typeof displayMessage === 'function') displayMessage("Only Artifact Refiners can forge artifacts.", "error");
        Game.showLoggedInMenu();
        return;
    }

    Game.currentGameState = 'FORGE_ARTIFACT_MENU';
    if (combatInterface) combatInterface.style.display = 'none';
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
    if (gridInventoryModal) gridInventoryModal.style.display = 'none';

    if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";
    if (actionButtonsContainer) actionButtonsContainer.innerHTML = '';

    const forgingMenuDiv = document.createElement('div');
    forgingMenuDiv.id = 'forging-menu';
    forgingMenuDiv.classList.add('rpg-ui-panel', 'p-4', 'max-w-md', 'mx-auto');
    forgingMenuDiv.innerHTML = '<h3 class="text-xl font-bold text-yellow-400 mb-4 text-center">Artifact Forge</h3>';

    let hasForgeableRecipes = false;

    if (Game.ARTIFACT_RECIPES) {
        for (const recipeKey in Game.ARTIFACT_RECIPES) {
            const recipe = Game.ARTIFACT_RECIPES[recipeKey];
            if (recipe.requiredClass === player.chosenClassKey && player.cultivationLevel >= recipe.requiredCultivationLevel) {
                hasForgeableRecipes = true;
                let ingredientsHtml = '<ul class="text-sm text-gray-300 mb-1 list-disc list-inside">';
                let canCraft = true;
                for (const ingKey in recipe.ingredients) {
                    const requiredCount = recipe.ingredients[ingKey];
                    const possessedCount = player.resources[ingKey] || 0;
                    const color = possessedCount >= requiredCount ? 'text-green-400' : 'text-red-400';
                    ingredientsHtml += `<li class="${color}">${Game.ITEM_DATA[ingKey].name}: ${possessedCount}/${requiredCount}</li>`;
                    if (possessedCount < requiredCount) canCraft = false;
                }
                ingredientsHtml += '</ul>';

                const recipeDiv = document.createElement('div');
                recipeDiv.classList.add('mb-3', 'p-3', 'bg-gray-700', 'rounded-md', 'border', 'border-gray-600');
                recipeDiv.innerHTML = `
                    <h4 class="text-lg font-semibold text-yellow-300">${recipe.name}</h4>
                    <img src="${Game.ITEM_DATA[recipe.producesItemKey].gameAsset}" alt="${Game.ITEM_DATA[recipe.producesItemKey].name}" class="mx-auto mb-2 h-20 w-20 object-cover rounded-md">
                    <p class="text-xs text-gray-400">Produces: ${Game.ITEM_DATA[recipe.producesItemKey].name}</p>
                    <p class="text-xs text-gray-400">Requires: ${recipe.qiCost} QI</p>
                    <p class="text-sm font-medium mt-1">Ingredients:</p>
                    ${ingredientsHtml}
                `;

                const forgeButton = document.createElement('button');
                forgeButton.textContent = "Forge Item";
                forgeButton.classList.add('action-button', 'bg-green-600', 'hover:bg-green-700', 'text-white', 'text-sm', 'py-1', 'px-3', 'rounded', 'mt-2');
                if (!canCraft || player.currentQi < recipe.qiCost) {
                    forgeButton.disabled = true;
                    forgeButton.classList.add('opacity-50', 'cursor-not-allowed');
                }
                forgeButton.onclick = () => displayItemRefiningUI(recipeKey);
                recipeDiv.appendChild(forgeButton);
                forgingMenuDiv.appendChild(recipeDiv);
            }
        }
    }


    if (!hasForgeableRecipes) {
        forgingMenuDiv.innerHTML += '<p class="text-gray-400 text-center">No artifacts available to forge at your current skill or level.</p>';
    }

    const backButton = document.createElement('button');
    backButton.textContent = "Back to Menu";
    backButton.classList.add('action-button', 'bg-gray-600', 'hover:bg-gray-700', 'text-white', 'font-semibold', 'py-2', 'px-4', 'rounded-lg', 'shadow-md', 'mt-4', 'mx-auto', 'block');
    backButton.onclick = () => {
        if (gameOutput && gameOutput.contains(forgingMenuDiv)) { // Check if it's a child before removing
             gameOutput.removeChild(forgingMenuDiv);
        }
        Game.showLoggedInMenu();
    };
    forgingMenuDiv.appendChild(backButton);

    if (gameOutput) {
        gameOutput.innerHTML = '';
        gameOutput.appendChild(forgingMenuDiv);
    }
}

function displayItemRefiningUI(recipeKey) {
    console.log('artifact.js: displayItemRefiningUI called with recipeKey:', recipeKey);
    // Assumes Game.players, Game.currentPlayerId, Game.ARTIFACT_RECIPES, Game.ITEM_DATA, gameOutput, displayMessage are available
    const player = Game.players[Game.currentPlayerId];
    const recipe = Game.ARTIFACT_RECIPES[recipeKey];
    if (!player || !recipe) {
        if (typeof displayMessage === 'function') displayMessage("Invalid recipe selected.", "error");
        return;
    }

    const STAT_ABBREVIATIONS = {
        strength: "STR", agility: "AGI", constitution: "CON",
        spirit: "SPR", intellect: "INT", willpower: "WIL"
    };

    const itemDataForStats = Game.ITEM_DATA[recipe.producesItemKey];
    let statsDisplayString = "No specific stats.";
    if (itemDataForStats.stats && Object.keys(itemDataForStats.stats).length > 0) {
        statsDisplayString = Object.entries(itemDataForStats.stats)
            .map(([statKey, statValue]) => `+${statValue} ${STAT_ABBREVIATIONS[statKey] || statKey.toUpperCase()}`)
            .join(', ');
    }
    if (itemDataForStats.weaponPhysicalAttackBonus) {
        const attackBonusString = `+${itemDataForStats.weaponPhysicalAttackBonus} Phys. Attack`;
        statsDisplayString = (statsDisplayString === "No specific stats.") ? attackBonusString : `${statsDisplayString}, ${attackBonusString}`;
    }

    if (gameOutput) gameOutput.innerHTML = '';
    const itemDiv = document.createElement('div');
    itemDiv.id = 'refining-ui';
    itemDiv.classList.add('rpg-ui-panel', 'p-4', 'max-w-md', 'mx-auto');
    itemDiv.innerHTML = `
        <h3 class="text-xl font-bold text-yellow-400 mb-4 text-center">Refining Process: ${recipe.name}</h3>
        <img src="${itemDataForStats.gameAsset}" alt="${itemDataForStats.name}" class="mx-auto mb-4 h-24 w-24 object-cover rounded-md">
        <p class="mb-2 text-gray-300"><strong>Stats:</strong> ${statsDisplayString}</p>
        <h4 class="text-lg font-semibold text-yellow-300 mb-2">Materials Required:</h4>
        <ul class="list-disc list-inside text-gray-300"></ul>
        <p class="text-xs text-gray-400">QI Cost: ${recipe.qiCost}</p>
        <button class="action-button bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow-md mt-4">Craft</button>
        <button class="action-button bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md mt-4" style="margin-left: 0.5rem;">Back to Selection</button>
    `;

    const materialsList = itemDiv.querySelector('ul');
    let canCraft = true;

    for (const ingKey in recipe.ingredients) {
        const requiredCount = recipe.ingredients[ingKey];
        const possessedCount = (player.resources[ingKey] || 0);
        const currentItemData = Game.ITEM_DATA[ingKey];
        const color = possessedCount >= requiredCount ? 'text-green-400' : 'text-red-400';

        const listItem = document.createElement('li');
        listItem.classList.add(color);
        listItem.textContent = `${currentItemData.name}: ${possessedCount}/${requiredCount}`;
        materialsList.appendChild(listItem);

        if (possessedCount < requiredCount) {
            canCraft = false;
        }
    }

    if (player.currentQi < recipe.qiCost) {
         canCraft = false;
    }

    const craftButton = itemDiv.querySelector('button:nth-of-type(1)');
    if (canCraft) {
        craftButton.onclick = () => executeForgeArtifact(recipeKey); 
    } else {
        craftButton.disabled = true;
        craftButton.classList.add('opacity-50', 'cursor-not-allowed');
    }

    const backButton = itemDiv.querySelector('button:nth-of-type(2)');
    backButton.onclick = () => {
        forgeArtifact(); // Call the local forgeArtifact function
    }

    if (gameOutput) gameOutput.appendChild(itemDiv);
}


async function executeForgeArtifact(recipeKey) {
    console.log('artifact.js: executeForgeArtifact called with recipeKey:', recipeKey);
    // Assumes Game.players, Game.currentPlayerId, Game.ARTIFACT_RECIPES, Game.ITEM_DATA, Game.saveCurrentPlayerState, displayMessage, updateStatsDisplay, forgeArtifact are available
    const player = Game.players[Game.currentPlayerId];
    const recipe = Game.ARTIFACT_RECIPES[recipeKey];
    if (!player || !recipe) return;

    if (player.currentQi < recipe.qiCost) {
        if (typeof displayMessage === 'function') displayMessage(`Not enough Qi. Need ${recipe.qiCost}, have ${player.currentQi}.`, "error");
        forgeArtifact();
        return;
    }

    for (const ingKey in recipe.ingredients) {
        if ((player.resources[ingKey] || 0) < recipe.ingredients[ingKey]) {
            if (typeof displayMessage === 'function') displayMessage(`Not enough ${Game.ITEM_DATA[ingKey].name}. Need ${recipe.ingredients[ingKey]}, have ${player.resources[ingKey] || 0}.`, "error");
            forgeArtifact();
            return;
        }
    }

    player.currentQi -= recipe.qiCost;
    for (const ingKey in recipe.ingredients) {
        player.resources[ingKey] -= recipe.ingredients[ingKey];
    }
    player.resources[recipe.producesItemKey] = (player.resources[recipe.producesItemKey] || 0) + 1;

    if (typeof displayMessage === 'function') displayMessage(`Successfully forged 1x ${Game.ITEM_DATA[recipe.producesItemKey].name}!`, "crafting");

    if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
    await Game.saveCurrentPlayerState();
    forgeArtifact();
}
