function showMarketMenu() {
    console.log('market.js: showMarketMenu called');
    // Assumes Game.currentGameState, marketMenuDiv, marketListingsViewDiv, actionButtonsContainer, etc. are available
    Game.currentGameState = 'MARKET_MENU';
    if (marketMenuDiv) marketMenuDiv.style.display = 'block';
    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
    if (actionButtonsContainer) actionButtonsContainer.innerHTML = '';
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
    if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
    if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none'; // old text one
    if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
    if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
    if (combatInterface) combatInterface.style.display = 'none';
    const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
    if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
    if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";
    if(gridInventoryModal) gridInventoryModal.style.display = 'none';


    if (marketMenuDiv) marketMenuDiv.innerHTML = '<h3>Marketplace</h3>';
    if (typeof displayMessage === 'function') displayMessage("Welcome to the Marketplace. What would you like to do?", "market");

    if (typeof populateActionButtons === 'function' && marketMenuDiv) {
        populateActionButtons([
            { text: "List Item for Sale", action: "market_list_item_select", style: "market_action"},
            { text: "View Market Listings", action: "market_view_listings", style: "market_action"},
            { text: "Back to Menu", action: "show_logged_in_menu", style: "neutral"}
        ], marketMenuDiv);
    }
}

async function marketListItemSelect() {
    console.log('market.js: marketListItemSelect called');
    // Assumes Game.players, Game.currentPlayerId, Game.ITEM_DATA, marketMenuDiv are available
    const player = Game.players[Game.currentPlayerId];
    if (!player) return;

    if (marketMenuDiv) marketMenuDiv.innerHTML = '<h3>List Item for Sale - Select Item</h3>';
    let itemsToList = [];
    for (const itemKey in player.resources) {
        if (player.resources[itemKey] > 0 && Game.ITEM_DATA[itemKey]) {
            const itemData = Game.ITEM_DATA[itemKey];
            if (itemData.type !== 'currency' && itemData.type !== 'quest_item') {
                 itemsToList.push({
                    text: `${itemData.name} (x${player.resources[itemKey]})`,
                    action: 'list_item_for_sale_prompt',
                    value: itemKey,
                    style: 'inventory_item_original'
                });
            }
        }
    }

    if (itemsToList.length === 0 && marketMenuDiv) {
        marketMenuDiv.innerHTML += '<p class="text-gray-500 text-center">You have no items to list.</p>';
    }
    if (typeof populateActionButtons === 'function' && marketMenuDiv) {
        populateActionButtons(itemsToList, marketMenuDiv);
    }

    if (marketMenuDiv) {
        const backButton = document.createElement('button');
        backButton.textContent = "Back to Marketplace";
        backButton.classList.add('action-button', 'bg-gray-600', 'hover:bg-gray-700', 'text-white', 'font-semibold', 'py-2', 'px-4', 'rounded-lg', 'shadow-md', 'm-1', 'mt-4', 'mx-auto', 'block');
        backButton.onclick = () => showMarketMenu();
        marketMenuDiv.appendChild(backButton);
    }
}

async function promptListItemForSale(itemKey) {
    console.log('market.js: promptListItemForSale called with itemKey:', itemKey);
    // Assumes Game.players, Game.currentPlayerId, Game.ITEM_DATA, getModalInput, displayMessage, listItemOnMarket, showMarketMenu are available
    const player = Game.players[Game.currentPlayerId];
    const itemData = Game.ITEM_DATA[itemKey];
    if (!player || !itemData || !player.resources[itemKey] || player.resources[itemKey] <= 0) {
        if (typeof displayMessage === 'function') displayMessage("Invalid item or no stock.", "error");
        showMarketMenu();
        return;
    }

    const quantityToSellStr = await getModalInput(`How many ${itemData.name} to sell? (You have ${player.resources[itemKey]})`, 'number');
    const quantityToSell = parseInt(quantityToSellStr);

    if (isNaN(quantityToSell) || quantityToSell <= 0 || quantityToSell > player.resources[itemKey]) {
        if (typeof displayMessage === 'function') displayMessage("Invalid quantity or not enough stock.", "error");
        showMarketMenu();
        return;
    }

    const pricePerItemStr = await getModalInput(`Price per ${itemData.name} (in Spirit Stones):`, 'number');
    const pricePerItem = parseInt(pricePerItemStr);

    if (isNaN(pricePerItem) || pricePerItem <= 0) {
        if (typeof displayMessage === 'function') displayMessage("Invalid price.", "error");
        showMarketMenu();
        return;
    }

    const confirm = await getModalInput(`List ${quantityToSell}x ${itemData.name} for ${pricePerItem} Spirit Stones each? (Total: ${quantityToSell * pricePerItem}) (yes/no)`);
    if (confirm && confirm.toLowerCase() === 'yes') {
        await listItemOnMarket(itemKey, quantityToSell, pricePerItem);
    } else {
        if (typeof displayMessage === 'function') displayMessage("Listing cancelled.", "narration");
        showMarketMenu();
    }
}

async function listItemOnMarket(itemKey, quantity, pricePerItem) {
    console.log('market.js: listItemOnMarket called with itemKey:', itemKey, 'quantity:', quantity, 'pricePerItem:', pricePerItem);
    // Assumes Game.players, Game.currentPlayerId, Game.ITEM_DATA, Game.saveCurrentPlayerState, db, firebase.firestore.FieldValue, displayMessage, updateStatsDisplay, showMarketMenu are available
    const player = Game.players[Game.currentPlayerId];
    if (!player || !Game.ITEM_DATA[itemKey] || player.resources[itemKey] < quantity) {
        if (typeof displayMessage === 'function') displayMessage("Cannot list item: Insufficient stock or invalid item.", "error");
        showMarketMenu();
        return;
    }

    player.resources[itemKey] -= quantity;

    const listingId = db.collection("marketListings").doc().id;
    const listingData = {
        listingId: listingId,
        itemId: itemKey,
        itemName: Game.ITEM_DATA[itemKey].name,
        quantity: quantity,
        pricePerItem: pricePerItem,
        sellerId: player.playerId,
        sellerName: player.name,
        listedAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: "active"
    };

    try {
        await db.collection("marketListings").doc(listingId).set(listingData);
        await Game.saveCurrentPlayerState();
        if (typeof displayMessage === 'function') displayMessage(`${quantity}x ${listingData.itemName} listed on the market for ${pricePerItem} Spirit Stones each.`, "market");
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
    } catch (error) {
        console.error("Error listing item on market:", error);
        if (typeof displayMessage === 'function') displayMessage("Failed to list item. Please try again.", "error");
        player.resources[itemKey] += quantity; // Rollback
    }
    showMarketMenu();
}

async function showMarketListings() {
    console.log('market.js: showMarketListings called');
    // Assumes Game.currentGameState, marketListingsViewDiv, marketMenuDiv, actionButtonsContainer, etc. and db are available
    Game.currentGameState = 'VIEW_MARKET_LISTINGS';
    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'block';
    if (marketMenuDiv) marketMenuDiv.style.display = 'none';
    if (actionButtonsContainer) actionButtonsContainer.innerHTML = '';
    if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
    if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
    if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
    if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
    if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";
    if(gridInventoryModal) gridInventoryModal.style.display = 'none';


    if (marketListingsViewDiv) marketListingsViewDiv.innerHTML = '<h3>Active Market Listings</h3>';
    if (typeof displayMessage === 'function') displayMessage("Fetching market listings...", "system");

    const player = Game.players[Game.currentPlayerId];
    if (!player) { showMarketMenu(); return; }

    try {
        const listingsQuery = await db.collection("marketListings")
                                            .where("status", "==", "active")
                                            .orderBy("listedAt", "desc")
                                            .limit(20)
                                            .get();

        if (listingsQuery.empty && marketListingsViewDiv) {
            marketListingsViewDiv.innerHTML += '<p class="text-gray-500 text-center">The marketplace is currently empty.</p>';
        } else if (marketListingsViewDiv) {
            let listingsHtml = '<div class="space-y-2">';
            listingsQuery.forEach(doc => {
                const listing = doc.data();
                const totalPrice = listing.quantity * listing.pricePerItem;
                listingsHtml += `
                    <div class="market-listing-item p-2 bg-gray-700 rounded">
                        <p class="font-semibold text-lg">${listing.itemName} (x${listing.quantity})</p>
                        <p class="text-sm">Price: ${listing.pricePerItem} Spirit Stones each</p>
                        <p class="text-sm">Total: ${totalPrice} Spirit Stones</p>
                        <p class="text-xs text-gray-400">Seller: ${listing.sellerName} ${listing.sellerId === player.playerId ? "(You)" : ""}</p>
                        ${listing.sellerId !== player.playerId ?
                            `<button class="action-button bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded mt-1" onclick="promptBuyItem('${listing.listingId}')">Buy</button>` :
                            `<button class="action-button bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded mt-1" onclick="promptRemoveListing('${listing.listingId}')">Remove Listing</button>`
                        }
                    </div>
                `;
            });
            listingsHtml += '</div>';
            marketListingsViewDiv.innerHTML += listingsHtml;
        }
    } catch (error) {
        console.error("Error fetching market listings:", error);
        if (marketListingsViewDiv) marketListingsViewDiv.innerHTML += '<p class="text-red-500 text-center">Could not load market listings. Please try again later.</p>';
    }

    if (marketListingsViewDiv) {
        const backButton = document.createElement('button');
        backButton.textContent = "Back to Marketplace";
        backButton.classList.add('action-button', 'bg-gray-600', 'hover:bg-gray-700', 'text-white', 'font-semibold', 'py-2', 'px-4', 'rounded-lg', 'shadow-md', 'm-1', 'mt-4', 'mx-auto', 'block');
        backButton.onclick = () => showMarketMenu();
        marketListingsViewDiv.appendChild(backButton);
    }
}

async function promptBuyItem(listingId) {
    console.log('market.js: promptBuyItem called with listingId:', listingId);
    // Assumes Game.players, Game.currentPlayerId, db, getModalInput, displayMessage, executeBuyItem, showMarketListings are available
    const buyer = Game.players[Game.currentPlayerId];
    if (!buyer) return;

    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';

    try {
        const listingDoc = await db.collection("marketListings").doc(listingId).get();
        if (!listingDoc.exists) {
            if (typeof displayMessage === 'function') displayMessage("Listing no longer available.", "error");
            showMarketListings(); return;
        }
        const listingData = listingDoc.data();

        if (listingData.status !== 'active') {
            if (typeof displayMessage === 'function') displayMessage("This item is no longer for sale.", "error");
            showMarketListings(); return;
        }
        if (listingData.sellerId === buyer.playerId) {
            if (typeof displayMessage === 'function') displayMessage("You cannot buy your own items.", "error");
            showMarketListings(); return;
        }

        let quantityToBuy = 1;
        if (listingData.quantity > 1) {
            const quantityStr = await getModalInput(`How many ${listingData.itemName} to buy? (Max ${listingData.quantity}, Price: ${listingData.pricePerItem} each)`, 'number');
            quantityToBuy = parseInt(quantityStr);
            if (isNaN(quantityToBuy) || quantityToBuy <= 0 || quantityToBuy > listingData.quantity) {
                if (typeof displayMessage === 'function') displayMessage("Invalid quantity.", "error");
                showMarketListings(); return;
            }
        }

        const totalPrice = listingData.pricePerItem * quantityToBuy;
        if ((buyer.resources.spiritStones || 0) < totalPrice) {
            if (typeof displayMessage === 'function') displayMessage(`Not enough Spirit Stones. You need ${totalPrice}, but have ${buyer.resources.spiritStones || 0}.`, "error");
            showMarketListings(); return;
        }

        const confirm = await getModalInput(`Buy ${quantityToBuy}x ${listingData.itemName} for ${totalPrice} Spirit Stones? (yes/no)`);
        if (confirm && confirm.toLowerCase() === 'yes') {
            await executeBuyItem(listingId, quantityToBuy);
        } else {
            if (typeof displayMessage === 'function') displayMessage("Purchase cancelled.", "narration");
            showMarketListings();
        }

    } catch (error) {
        console.error("Error prompting for buy:", error);
        if (typeof displayMessage === 'function') displayMessage("Error processing purchase. Please try again.", "error");
        showMarketListings();
    }
}

async function executeBuyItem(listingId, quantityToBuy) {
    console.log('market.js: executeBuyItem called with listingId:', listingId, 'quantityToBuy:', quantityToBuy);
    // Assumes Game.players, Game.currentPlayerId, db, firebase.firestore.runTransaction, displayMessage, updateStatsDisplay, showMarketListings are available
    const buyer = Game.players[Game.currentPlayerId];
    if (!buyer) return;

    try {
        await db.runTransaction(async (transaction) => {
            const listingRef = db.collection("marketListings").doc(listingId);
            const listingDoc = await transaction.get(listingRef);

            if (!listingDoc.exists) throw new Error("Listing not found.");
            const listingData = listingDoc.data();

            if (listingData.status !== "active") throw new Error("This listing is no longer active.");
            if (listingData.quantity < quantityToBuy) throw new Error("Not enough items in stock for this quantity.");
            if (listingData.sellerId === buyer.playerId) throw new Error("You cannot buy your own items.");

            const totalPrice = listingData.pricePerItem * quantityToBuy;
            if ((buyer.resources.spiritStones || 0) < totalPrice) throw new Error("Not enough Spirit Stones.");

            const sellerRef = db.collection("players").doc(listingData.sellerId);
            const sellerDoc = await transaction.get(sellerRef);
            if (!sellerDoc.exists) throw new Error("Seller not found. Purchase cannot be completed.");
            const sellerData = sellerDoc.data();

            const newBuyerResources = { ...(buyer.resources || {}) };
            newBuyerResources.spiritStones = (newBuyerResources.spiritStones || 0) - totalPrice;
            newBuyerResources[listingData.itemId] = (newBuyerResources[listingData.itemId] || 0) + quantityToBuy;

            const newSellerResources = { ...(sellerData.resources || {}) };
            newSellerResources.spiritStones = (newSellerResources.spiritStones || 0) + totalPrice;

            transaction.update(listingRef, {
                quantity: listingData.quantity - quantityToBuy,
                status: (listingData.quantity - quantityToBuy === 0) ? "sold" : "active"
            });
            const buyerRef = db.collection("players").doc(buyer.playerId);
            transaction.update(buyerRef, { resources: newBuyerResources });
            transaction.update(sellerRef, { resources: newSellerResources });

            Game.tempTransactionData = { // Game object needs to be defined for this
                buyerResources: newBuyerResources,
                itemBoughtId: listingData.itemId,
                itemBoughtName: listingData.itemName,
                quantityBought: quantityToBuy
            };
        });

        buyer.resources = Game.tempTransactionData.buyerResources;
        if (typeof displayMessage === 'function') displayMessage(`Successfully purchased ${Game.tempTransactionData.quantityBought}x ${Game.tempTransactionData.itemBoughtName}.`, "market");
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(buyer);

    } catch (error) {
        console.error("Transaction failed: ", error);
        if (typeof displayMessage === 'function') displayMessage(`Purchase failed: ${error.message}`, "error");
    } finally {
        if (typeof Game !== 'undefined') delete Game.tempTransactionData;
        showMarketListings();
    }
}

async function promptRemoveListing(listingId) {
    console.log('market.js: promptRemoveListing called with listingId:', listingId);
    // Assumes Game.players, Game.currentPlayerId, db, getModalInput, displayMessage, executeRemoveListing, showMarketListings are available
    const player = Game.players[Game.currentPlayerId];
    if (!player) return;

    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';

    try {
        const listingDoc = await db.collection("marketListings").doc(listingId).get();
        if (!listingDoc.exists) {
            if (typeof displayMessage === 'function') displayMessage("Listing no longer available.", "error");
            showMarketListings(); return;
        }
        const listingData = listingDoc.data();

        if (listingData.sellerId !== player.playerId) {
            if (typeof displayMessage === 'function') displayMessage("This is not your listing.", "error");
            showMarketListings(); return;
        }
        if (listingData.status !== 'active') {
            if (typeof displayMessage === 'function') displayMessage("This listing is not active and cannot be removed.", "error");
            showMarketListings(); return;
        }

        const confirm = await getModalInput(`Remove your listing of ${listingData.quantity}x ${listingData.itemName}? The items will be returned to your inventory. (yes/no)`);
        if (confirm && confirm.toLowerCase() === 'yes') {
            await executeRemoveListing(listingId);
        } else {
            if (typeof displayMessage === 'function') displayMessage("Removal cancelled.", "narration");
            showMarketListings();
        }

    } catch (error) {
        console.error("Error prompting for removal:", error);
        if (typeof displayMessage === 'function') displayMessage("Error processing removal. Please try again.", "error");
        showMarketListings();
    }
}

async function executeRemoveListing(listingId) {
    console.log('market.js: executeRemoveListing called with listingId:', listingId);
    // Assumes Game.players, Game.currentPlayerId, db, firebase.firestore.runTransaction, displayMessage, updateStatsDisplay, showMarketListings are available
    const player = Game.players[Game.currentPlayerId];
    if (!player) return;

    try {
        await db.runTransaction(async (transaction) => {
            const listingRef = db.collection("marketListings").doc(listingId);
            const listingDoc = await transaction.get(listingRef);

            if (!listingDoc.exists) throw new Error("Listing not found.");
            const listingData = listingDoc.data();

            if (listingData.sellerId !== player.playerId) throw new Error("Cannot remove: Not your listing.");
            if (listingData.status !== "active") throw new Error("Cannot remove: Listing is not active.");

            const newPlayerResources = { ...(player.resources || {}) };
            newPlayerResources[listingData.itemId] = (newPlayerResources[listingData.itemId] || 0) + listingData.quantity;

            transaction.update(listingRef, { status: "removed" });

            const playerRef = db.collection("players").doc(player.playerId);
            transaction.update(playerRef, { resources: newPlayerResources });

            Game.tempTransactionData = { // Game object needs to be defined for this
                playerResources: newPlayerResources,
                itemRemovedId: listingData.itemId,
                itemRemovedName: listingData.itemName,
                quantityRemoved: listingData.quantity
            };
        });

        player.resources = Game.tempTransactionData.playerResources;
        if (typeof displayMessage === 'function') displayMessage(`Successfully removed ${Game.tempTransactionData.quantityRemoved}x ${Game.tempTransactionData.itemRemovedName} from the market. Items returned to inventory.`, "market");
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);

    } catch (error) {
        console.error("Transaction failed (Remove Listing): ", error);
        if (typeof displayMessage === 'function') displayMessage(`Removal failed: ${error.message}`, "error");
    } finally {
        if (typeof Game !== 'undefined') delete Game.tempTransactionData;
        showMarketListings();
    }
}
