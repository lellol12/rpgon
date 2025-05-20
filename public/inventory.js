function populateModalInventoryGrid(player) {
    console.log('inventory.js: populateModalInventoryGrid called');
    if (!modalInventoryGridContainer) { // modalInventoryGridContainer is a global from ui.js
        console.error("Modal inventory grid container not found!");
        return;
    }
    modalInventoryGridContainer.innerHTML = '';

    if (!player || !player.resources) {
        const emptySlot = document.createElement('div');
        emptySlot.classList.add('inventory-slot');
        const nameDiv = document.createElement('div');
        nameDiv.classList.add('inventory-slot-name');
        nameDiv.textContent = 'N/A';
        emptySlot.appendChild(nameDiv);
        modalInventoryGridContainer.appendChild(emptySlot);
        return;
    }

    const itemsToDisplay = [];
    // Assumes ITEM_DATA is available globally from data.js or Game.ITEM_DATA
    const itemDataGlobal = (typeof Game !== 'undefined' && Game.ITEM_DATA) ? Game.ITEM_DATA : ITEM_DATA;

    const sortedItemKeys = Object.keys(player.resources).sort((a, b) => {
        const itemA = itemDataGlobal[a];
        const itemB = itemDataGlobal[b];
        if (!itemA || !itemB) return 0;
        return (itemA.name || a).localeCompare(itemB.name || b);
    });

    for (const itemKey of sortedItemKeys) {
        if (player.resources[itemKey] > 0 && itemDataGlobal[itemKey] && itemDataGlobal[itemKey].type !== 'currency') {
            itemsToDisplay.push({ key: itemKey, quantity: player.resources[itemKey], data: itemDataGlobal[itemKey] });
        }
    }

    const totalSlots = player.maxInventorySlots || 50;

    for (let i = 0; i < totalSlots; i++) {
        const slotDiv = document.createElement('div');
        slotDiv.classList.add('inventory-slot');

        const frameDiv = document.createElement('div');
        frameDiv.classList.add('inventory-slot-frame');

        if (i < itemsToDisplay.length) {
            const item = itemsToDisplay[i];
            slotDiv.classList.add('has-item');
            frameDiv.title = `${item.data.name} (x${item.quantity})\n${item.data.description || ''}`;

            const iconDiv = document.createElement('div');
            iconDiv.classList.add('inventory-slot-icon');

            if (item.data.gameAsset) {
                iconDiv.style.backgroundImage = `url('${item.data.gameAsset}')`;
                iconDiv.textContent = '';
                iconDiv.style.backgroundSize = 'contain';
                iconDiv.style.backgroundRepeat = 'no-repeat';
                iconDiv.style.backgroundPosition = 'center';
            } else if (item.data.iconChar) {
                iconDiv.style.backgroundImage = 'none';
                iconDiv.textContent = item.data.iconChar;
            } else {
                iconDiv.style.backgroundImage = 'none';
                iconDiv.textContent = item.data.name ? item.data.name.substring(0, 1).toUpperCase() : '?';
            }
            frameDiv.appendChild(iconDiv);

            const nameDiv = document.createElement('div');
            nameDiv.classList.add('inventory-slot-name');
            nameDiv.textContent = item.data.name || 'Unknown Item';

            if (item.quantity > 0) {
                const quantityDiv = document.createElement('div');
                quantityDiv.classList.add('inventory-slot-quantity');
                quantityDiv.textContent = `x${item.quantity}`;
                frameDiv.appendChild(quantityDiv);
            }

            slotDiv.appendChild(frameDiv);
            slotDiv.appendChild(nameDiv);

            frameDiv.onclick = () => Game.promptUseItem(item.key, item.data.name); // Game object will have this method
        } else {
            slotDiv.appendChild(frameDiv);
            const emptyNameDiv = document.createElement('div');
            emptyNameDiv.classList.add('inventory-slot-name');
            emptyNameDiv.innerHTML = '&nbsp;';
            slotDiv.appendChild(emptyNameDiv);
        }
        modalInventoryGridContainer.appendChild(slotDiv);
    }
}

async function promptUseItem(itemKey, itemName) {
    console.log('inventory.js: promptUseItem called with itemKey:', itemKey, 'and itemName:', itemName);
    // Assumes Game.players, Game.currentPlayerId, Game.ITEM_DATA are available
    const player = Game.players[Game.currentPlayerId];
    const itemData = Game.ITEM_DATA[itemKey];

    if (!player || !itemData || !player.resources[itemKey] || player.resources[itemKey] <= 0) {
        if (typeof displayMessage === 'function') displayMessage("Item not found or out of stock.", "error");
        return;
    }

    if (!(itemData.type === 'consumable' || itemData.type === 'weapon' || itemData.type === 'armor' || itemData.type === 'accessory' || itemData.type === 'recipe')) {
        if (typeof displayMessage === 'function') displayMessage(`${itemName || itemData.name}: ${itemData.description || 'This item cannot be used directly from here.'}`, 'narration');
        return;
    }

    const confirm = await getYesNoModalInput(`Use ${itemName || itemData.name}?`); // getYesNoModalInput from ui.js
    if (confirm === true) {
        await executeUseItem(itemKey);
    } else {
        if (typeof displayMessage === 'function') displayMessage("Item use cancelled.", "narration");
    }
}

async function executeUseItem(itemKey) {
    console.log('inventory.js: executeUseItem called with itemKey:', itemKey);
    // Assumes Game.players, Game.currentPlayerId, Game.ITEM_DATA, Game.saveCurrentPlayerState, updateStatsDisplay are available
    const player = Game.players[Game.currentPlayerId];
    const itemData = Game.ITEM_DATA[itemKey];
    if (!player || !itemData || !player.resources[itemKey] || player.resources[itemKey] <= 0) {
        if (typeof displayMessage === 'function') displayMessage("Item not found or out of stock.", "error");
        return;
    }
    let itemConsumedOrChanged = false;

    if (itemData.type === 'consumable' || itemData.type === 'recipe') {
        const originalQuantity = player.resources[itemKey];
        itemData.effect(player);
        if (player.resources[itemKey] < originalQuantity || itemData.type === 'recipe') {
            itemConsumedOrChanged = true;
        }
    } else if (itemData.type === 'weapon' || itemData.type === 'armor' || itemData.type === 'accessory') {
        let currentEquippedInSlot = null;
        if (itemData.slot && player.equippedItems && player.equippedItems.hasOwnProperty(itemData.slot)) {
            currentEquippedInSlot = player.equippedItems[itemData.slot];
        }

        if (currentEquippedInSlot && currentEquippedInSlot === itemKey) {
            if (typeof displayMessage === 'function') displayMessage(`${itemData.name} is already equipped in the ${itemData.slot} slot.`, "narration");
        } else {
            itemData.equipEffect(player); // This will call Game.equipItem(player, itemKey)
            itemConsumedOrChanged = true;
        }
    }

    if (itemConsumedOrChanged || (typeof Game !== 'undefined' && Game.currentCombat)) {
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
        if (typeof Game !== 'undefined' && typeof Game.saveCurrentPlayerState === 'function') await Game.saveCurrentPlayerState();
        if (gridInventoryModal && (gridInventoryModal.style.display === 'flex' || gridInventoryModal.style.display === 'block')) {
            populateModalInventoryGrid(player);
        }
    }
}

function updateProfileEquipmentSlotsUI(player) {
    console.log('inventory.js: updateProfileEquipmentSlotsUI called');
    // Assumes Game.ITEM_DATA is available
    if (!player || !player.equippedItems) return;

    const slotConfigurations = [
        { slotKey: 'head', elementId: 'profile-slot-head' },
        { slotKey: 'ring1', elementId: 'profile-slot-ring1' },
        { slotKey: 'weapon', elementId: 'profile-slot-weapon' },
        { slotKey: 'body', elementId: 'profile-slot-body' },
        { slotKey: 'feet', elementId: 'profile-slot-feet' }
    ];

    slotConfigurations.forEach(config => {
        const slotElement = document.getElementById(config.elementId);
        if (!slotElement) {
            console.warn(`Profile slot element #${config.elementId} not found.`);
            return;
        }
        slotElement.innerHTML = '';

        const itemKey = player.equippedItems[config.slotKey];
        const itemData = itemKey ? Game.ITEM_DATA[itemKey] : null;

        if (itemData) {
            const iconDiv = document.createElement('div');
            iconDiv.classList.add('item-icon-profile');
            if (itemData.gameAsset) {
                iconDiv.style.backgroundImage = `url('${itemData.gameAsset}')`;
            } else if (itemData.iconChar) {
                iconDiv.textContent = itemData.iconChar;
            } else {
                iconDiv.textContent = '?';
            }
            slotElement.appendChild(iconDiv);

            const nameDiv = document.createElement('div');
            nameDiv.classList.add('item-name-profile');
            nameDiv.textContent = itemData.name;
            slotElement.appendChild(nameDiv);

            const unequipBtn = document.createElement('button');
            unequipBtn.classList.add('unequip-button-profile');
            unequipBtn.textContent = 'X';
            unequipBtn.title = `Unequip ${itemData.name}`;
            unequipBtn.onclick = () => promptUnequipItem(config.slotKey); 
            slotElement.appendChild(unequipBtn);
        }
    });
}

// This function seems redundant if updateProfileEquipmentSlotsUI handles the visual profile.
// The old #stat-weapon etc. are being replaced by the grid.
// Keeping it for now in case it's used by some other logic, but it might be removable.
function updateEquippedItemsUI(player) {
    console.log('inventory.js: updateEquippedItemsUI called');
    if (!player || !player.equippedItems) return;
    // This function might need to be re-evaluated or removed if all equipment display
    // is handled by updateProfileEquipmentSlotsUI and the inventory modal.
    // For now, it's a direct port.
    const slotMappings = {
        weapon: 'equipped-weapon',
        body:   'equipped-armor',
        head:   'equipped-helmet',
        feet:   'equipped-boots',
        ring1:  'equipped-ring'
    };

    for (const slotKey in slotMappings) {
        const elementId = slotMappings[slotKey];
        const uiElement = document.getElementById(elementId);
        if (uiElement) {
            const itemKey = player.equippedItems[slotKey];
            const item = itemKey ? Game.ITEM_DATA[itemKey] : null;

            const existingUnequipBtn = document.getElementById(`${elementId}-unequip-btn`);
            if (existingUnequipBtn) {
                existingUnequipBtn.remove();
            }

            if (item && item.name) {
                safeSetTextContent(uiElement, item.name); // safeSetTextContent from utils.js
                uiElement.className = 'stat-value text-green-400';

                const unequipBtn = document.createElement('button');
                unequipBtn.id = `${elementId}-unequip-btn`;
                unequipBtn.textContent = "Unequip";
                unequipBtn.classList.add('unequip-button');
                unequipBtn.onclick = () => promptUnequipItem(slotKey);
                uiElement.insertAdjacentElement('afterend', unequipBtn);

            } else {
                safeSetTextContent(uiElement, 'Empty');
                uiElement.className = 'stat-value text-gray-400';
            }
        }
    }
    const generalWeaponStatElement = document.getElementById('stat-weapon');
    if (generalWeaponStatElement) {
        const weaponItemKey = player.equippedItems.weapon;
        const weaponItem = weaponItemKey ? Game.ITEM_DATA[weaponItemKey] : null;
        if (weaponItem && weaponItem.name) {
            safeSetTextContent(generalWeaponStatElement, weaponItem.name);
        } else {
            safeSetTextContent(generalWeaponStatElement, 'Unarmed');
        }
    }
}

function unequipItem(player, slotToUnequip) {
    console.log('inventory.js: unequipItem called for player:', player.name, 'slot:', slotToUnequip);
    // Assumes Game.ITEM_DATA is available
    if (!player || !player.equippedItems) return;
    let itemKeyCurrentlyEquipped = player.equippedItems[slotToUnequip];
    let itemData = null;

    if (!itemKeyCurrentlyEquipped) return;

    itemData = Game.ITEM_DATA[itemKeyCurrentlyEquipped];
    if (!itemData) {
        console.error(`Cannot unequip: Item data not found for key ${itemKeyCurrentlyEquipped}`);
        return;
    }

    if (itemData.stats) {
        for (const stat in itemData.stats) {
            if (player.hasOwnProperty(stat)) {
                player[stat] -= itemData.stats[stat];
            }
        }
    }

    player.equippedItems[slotToUnequip] = null;
    if (slotToUnequip === 'weapon') {
        player.weaponPhysicalAttackBonus = 0;
    }

    player.maxHealth = player.calculateMaxHealth();
    player.health = Math.min(player.health, player.maxHealth);
    player.maxQi = player.calculateMaxQi();
    player.currentQi = Math.min(player.currentQi, player.maxQi);
}

function equipItem(player, itemKeyToEquip) {
    console.log('inventory.js: equipItem called for player:', player.name, 'itemKey:', itemKeyToEquip);
    // Assumes Game.ITEM_DATA is available
    if (!player || !itemKeyToEquip) return;
    const itemData = Game.ITEM_DATA[itemKeyToEquip];
    if (!itemData) {
        console.error(`Cannot equip: Item data not found for key ${itemKeyToEquip}`);
        return;
    }

    const slot = itemData.slot;
    if (!slot) {
        console.error(`Cannot equip: Item ${itemKeyToEquip} has no slot defined.`);
        return;
    }

    if (player.equippedItems && player.equippedItems[slot]) {
        unequipItem(player, slot);
    }

    if (itemData.stats) {
        for (const stat in itemData.stats) {
            if (player.hasOwnProperty(stat)) {
                player[stat] = (player[stat] || 0) + itemData.stats[stat];
            }
        }
    }

    if (player.equippedItems.hasOwnProperty(slot)) {
        player.equippedItems[slot] = itemKeyToEquip;
        if (slot === 'weapon' && itemData.weaponPhysicalAttackBonus) {
            player.weaponPhysicalAttackBonus = itemData.weaponPhysicalAttackBonus;
        }
    } else {
        console.error(`Cannot equip: Invalid slot "${slot}" defined in item data or player.equippedItems.`);
        return;
    }

    player.maxHealth = player.calculateMaxHealth();
    player.health = Math.min(player.health, player.maxHealth);
    player.maxQi = player.calculateMaxQi();
    player.currentQi = Math.min(player.currentQi, player.maxQi);

    if (typeof showEquipmentToast === 'function') showEquipmentToast(`Successfully equipped ${itemData.name}!`);
    if (typeof displayMessage === 'function') displayMessage(`Equipped ${itemData.name}.`, "item-use");
    // updateStatsDisplay and saveCurrentPlayerState will be called by the caller (e.g., executeUseItem)
}

async function promptUnequipItem(slotKey) {
    console.log('inventory.js: promptUnequipItem called with slotKey:', slotKey);
    // Assumes Game.players, Game.currentPlayerId, Game.ITEM_DATA are available
    const player = Game.players[Game.currentPlayerId];
    if (!player || !player.equippedItems || !player.equippedItems[slotKey]) {
        if (typeof displayMessage === 'function') displayMessage("Nothing to unequip in that slot.", "narration");
        return;
    }
    const itemKey = player.equippedItems[slotKey];
    const itemData = Game.ITEM_DATA[itemKey];
    if (!itemData) {
        console.error(`Item data not found for ${itemKey} in slot ${slotKey}`);
        return;
    }

    const confirm = await getYesNoModalInput(`Unequip ${itemData.name}?`); // getYesNoModalInput from ui.js
    if (confirm === true) {
        await executeUnequipItem(slotKey);
    } else {
        if (typeof displayMessage === 'function') displayMessage(`Unequip of ${itemData.name} cancelled.`, "narration");
    }
}

async function executeUnequipItem(slotKey) {
    console.log('inventory.js: executeUnequipItem called with slotKey:', slotKey);
    // Assumes Game.players, Game.currentPlayerId, Game.ITEM_DATA, Game.saveCurrentPlayerState, updateStatsDisplay are available
    const player = Game.players[Game.currentPlayerId];
    const itemKey = player.equippedItems[slotKey];
    const itemName = Game.ITEM_DATA[itemKey] ? Game.ITEM_DATA[itemKey].name : "Item";

    unequipItem(player, slotKey);
    if (typeof showEquipmentToast === 'function') showEquipmentToast(`Successfully unequipped ${itemName}!`);
    if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
    if (typeof Game !== 'undefined' && typeof Game.saveCurrentPlayerState === 'function') await Game.saveCurrentPlayerState();
    if (gridInventoryModal && (gridInventoryModal.style.display === 'flex' || gridInventoryModal.style.display === 'block')) {
        populateModalInventoryGrid(player);
    }
}
