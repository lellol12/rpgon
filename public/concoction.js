function showConcoctionMenu() {
    console.log('concoction.js: showConcoctionMenu called');
    // Assumes Game.currentGameState, concoctionMenuDiv, actionButtonsContainer, etc. are available
    Game.currentGameState = 'CONCOCTION_MENU';
    if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'block';
    if (actionButtonsContainer) actionButtonsContainer.innerHTML = '';
    if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none';
    if (marketMenuDiv) marketMenuDiv.style.display = 'none';
    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
    if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
    if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
    if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    if (combatInterface) combatInterface.style.display = 'none';
    const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
    if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
    if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";
    if(gridInventoryModal) gridInventoryModal.style.display = 'none';


    const player = Game.players[Game.currentPlayerId];
    if (!player) { Game.showMainGate(); return; }

    if (concoctionMenuDiv) concoctionMenuDiv.innerHTML = '<h3>Pill Concoction Chamber</h3>';
    let availableRecipes = [];

    if (Game.PILL_RECIPES) {
        for (const recipeKey in Game.PILL_RECIPES) {
            const recipe = Game.PILL_RECIPES[recipeKey];
            if (recipe.isBasic || (player.knownRecipes && player.knownRecipes.includes(recipeKey))) {
                if (player.cultivationLevel >= recipe.requiredCultivationLevel) {
                    availableRecipes.push(recipe);
                }
            }
        }
    }

    if (availableRecipes.length === 0 && concoctionMenuDiv) {
        concoctionMenuDiv.innerHTML += '<p class="text-gray-500 text-center">No recipes known or you do not meet requirements.</p>';
    } else if (concoctionMenuDiv) {
        availableRecipes.sort((a,b) => a.requiredCultivationLevel - b.requiredCultivationLevel || a.name.localeCompare(b.name));

        availableRecipes.forEach(recipe => {
            let ingredientsHtml = '<ul class="concoction-ingredient-list">';
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
            recipeDiv.classList.add('concoction-recipe-item');
            recipeDiv.innerHTML = `
                <h4>${recipe.name}</h4>
                <p><strong>Use:</strong> ${recipe.useDescription}</p>
                <p><strong>Ingredients:</strong></p>
                ${ingredientsHtml}
                <p><strong>Qi Cost:</strong> ${recipe.qiCost}</p>
                <p><strong>Produces:</strong> ${recipe.productName}</p>
            `;

            const concoctButton = document.createElement('button');
            concoctButton.textContent = "Concoct";
            concoctButton.classList.add('action-button', 'bg-lime-600', 'hover:bg-lime-700', 'text-gray-900', 'font-semibold', 'py-1', 'px-3', 'rounded', 'mt-2', 'text-sm');
            if (!canCraft || player.currentQi < recipe.qiCost) {
                concoctButton.disabled = true;
                concoctButton.classList.add('opacity-50', 'cursor-not-allowed');
            }
            concoctButton.onclick = () => promptConcoctQuantity(recipe.recipeKey); 
            recipeDiv.appendChild(concoctButton);
            concoctionMenuDiv.appendChild(recipeDiv);
        });
    }

    if (concoctionMenuDiv) {
        const backButton = document.createElement('button');
        backButton.textContent = "Back to Menu";
        backButton.classList.add('action-button', 'bg-gray-600', 'hover:bg-gray-700', 'text-white', 'font-semibold', 'py-2', 'px-4', 'rounded-lg', 'shadow-md', 'm-1', 'mt-4', 'mx-auto', 'block');
        backButton.onclick = () => Game.showLoggedInMenu(); // Game object will have this
        concoctionMenuDiv.appendChild(backButton);
    }
}

async function promptConcoctQuantity(recipeKey) {
    console.log('concoction.js: promptConcoctQuantity called with recipeKey:', recipeKey);
    // Assumes Game.players, Game.currentPlayerId, Game.PILL_RECIPES, getModalInput, displayMessage, executeConcoction, showConcoctionMenu are available
    const player = Game.players[Game.currentPlayerId];
    const recipe = Game.PILL_RECIPES[recipeKey];
    if (!player || !recipe) return;

    let maxPossible = Infinity;
    for (const ingKey in recipe.ingredients) {
        maxPossible = Math.min(maxPossible, Math.floor((player.resources[ingKey] || 0) / recipe.ingredients[ingKey]));
    }
    if (recipe.qiCost > 0) {
        maxPossible = Math.min(maxPossible, Math.floor(player.currentQi / recipe.qiCost));
    }
    if (maxPossible === Infinity || maxPossible <= 0) {
        if (typeof displayMessage === 'function') displayMessage("Cannot concoct: Not enough resources or Qi for even one.", "error");
        showConcoctionMenu();
        return;
    }

    const quantityStr = await getModalInput(`How many ${recipe.productName} to concoct? (Max possible: ${maxPossible})`, 'number');
    const quantity = parseInt(quantityStr);

    if (isNaN(quantity) || quantity <= 0) {
        if (typeof displayMessage === 'function') displayMessage("Invalid quantity.", "error");
        showConcoctionMenu();
        return;
    }
    if (quantity > maxPossible) {
        if (typeof displayMessage === 'function') displayMessage(`Cannot concoct ${quantity}. You can only make up to ${maxPossible}.`, "error");
        showConcoctionMenu();
        return;
    }
    await executeConcoction(recipeKey, quantity);
}

async function executeConcoction(recipeKey, quantity) {
    console.log('concoction.js: executeConcoction called with recipeKey:', recipeKey, 'and quantity:', quantity);
    // Assumes Game.players, Game.currentPlayerId, Game.PILL_RECIPES, Game.ITEM_DATA, Game.saveCurrentPlayerState, displayMessage, updateStatsDisplay, showConcoctionMenu are available
    const player = Game.players[Game.currentPlayerId];
    const recipe = Game.PILL_RECIPES[recipeKey];
    if (!player || !recipe) return;

    if (player.currentQi < recipe.qiCost * quantity) {
        if (typeof displayMessage === 'function') displayMessage(`Not enough Qi. Need ${recipe.qiCost * quantity}, have ${player.currentQi}.`, "error");
        showConcoctionMenu(); return;
    }

    for (const ingKey in recipe.ingredients) {
        if ((player.resources[ingKey] || 0) < recipe.ingredients[ingKey] * quantity) {
            if (typeof displayMessage === 'function') displayMessage(`Not enough ${Game.ITEM_DATA[ingKey].name}. Need ${recipe.ingredients[ingKey] * quantity}, have ${player.resources[ingKey] || 0}.`, "error");
            showConcoctionMenu(); return;
        }
    }

    player.currentQi -= recipe.qiCost * quantity;

    for (const ingKey in recipe.ingredients) {
        player.resources[ingKey] -= recipe.ingredients[ingKey] * quantity;
    }

    player.resources[recipe.producesItemKey] = (player.resources[recipe.producesItemKey] || 0) + quantity;

    if (typeof displayMessage === 'function') displayMessage(`Successfully concocted ${quantity}x ${recipe.productName}!`, "crafting");

    if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
    await Game.saveCurrentPlayerState();
    showConcoctionMenu();
}
