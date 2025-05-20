function manageSects() {
    console.log('sect_ui.js: manageSects called');
    // Assumes Game.players, Game.currentPlayerId, Game.sects, Game.currentGameState, Game.setMainView,
    // displayMessage, populateActionButtons, actionButtonsContainer, combatInterface, concoctionMenuDiv, etc. are available
    const player = Game.players[Game.currentPlayerId];
    if (!player) { Game.showMainGate(); return; }

    if (player.sectId && Game.sects[player.sectId]) {
        showSectDashboard(player.sectId);
    } else {
        Game.currentGameState = 'SECT_MANAGEMENT_NO_SECT';
        Game.setMainView('gameplay');
        if (combatInterface) combatInterface.style.display = 'none';
        if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
        if (combatSpecificActions) combatSpecificActions.innerHTML = '';
        if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
        const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
        if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
        if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
        if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
        if(gridInventoryModal) gridInventoryModal.style.display = 'none';
        if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";

        if (typeof displayMessage === 'function') displayMessage("\n--- Sect Hall ---", 'system');
        if (typeof displayMessage === 'function') displayMessage("Not in a sect.", 'narration');
        const actions = [
            { text: "Create Sect", action: "sect_create_prompt", style: "confirm" },
            { text: "View Sects", action: "sect_view_all" },
            { text: "Join Sect (ID)", action: "sect_join_prompt" },
            { text: "Back to Menu", action: "sect_back_to_main", style: "neutral" }
        ];
        if (typeof populateActionButtons === 'function' && actionButtonsContainer) {
            populateActionButtons(actions, actionButtonsContainer);
        }
    }
}

function showSectDashboard(sectId) {
    console.log('sect_ui.js: showSectDashboard called with sectId:', sectId);
    // Assumes Game.players, Game.currentPlayerId, Game.sects, Game.currentGameState, Game.setMainView, Game.currentOpenSectId, Game.currentSectDashboardTab
    // displayMessage, renderSectDashboardTabs, switchSectDashboardTab, Game.showLoggedInMenu
    // and UI elements like sectDashboardPanelDiv, combatInterface, etc. are available
    const player = Game.players[Game.currentPlayerId];
    const sect = Game.sects[sectId];
    if (!player || !sect) {
        if (typeof displayMessage === 'function') displayMessage("Sect not found or player error.", "error");
        Game.showLoggedInMenu();
        return;
    }

    Game.currentGameState = 'SECT_DASHBOARD';
    Game.currentOpenSectId = sectId;
    Game.setMainView('gameplay');

    if (combatInterface) combatInterface.style.display = 'none';
    if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
    if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none';
    if (marketMenuDiv) marketMenuDiv.style.display = 'none';
    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
    if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
    if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
    if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
    if(gridInventoryModal) gridInventoryModal.style.display = 'none';
    if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";
    if (actionButtonsContainer) actionButtonsContainer.innerHTML = '';

    if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'flex';

    const sectDashName = document.getElementById('sect-dashboard-name');
    if (sectDashName) sectDashName.textContent = sect.name;
    const sectDashMotto = document.getElementById('sect-dashboard-motto');
    if (sectDashMotto) sectDashMotto.textContent = sect.motto;

    renderSectDashboardTabs(sect);
    switchSectDashboardTab(Game.currentSectDashboardTab || 'hall', sect);

    const sectDashBackButton = document.getElementById('sect-dashboard-back-button');
    if (sectDashBackButton) {
        sectDashBackButton.onclick = () => {
            Game.currentOpenSectId = null;
            Game.currentSectDashboardTab = null;
            Game.showLoggedInMenu();
        };
    }
}

function renderSectDashboardTabs(sect) {
    console.log('sect_ui.js: renderSectDashboardTabs called for sect:', sect.name);
    // Assumes Game.handlePlayerChoice is available
    const tabsContainer = document.getElementById('sect-dashboard-tabs');
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';
    const tabDefinitions = [
        { id: 'hall', name: 'Hall' },
        { id: 'members', name: 'Members' },
        { id: 'shop', name: 'Shop' },
        { id: 'treasury', name: 'Treasury' },
        { id: 'quests', name: 'Quests/Events' }
    ];

    tabDefinitions.forEach(tabDef => {
        const button = document.createElement('button');
        button.id = `sect-tab-${tabDef.id}`;
        button.classList.add('sect-tab-button');
        button.textContent = tabDef.name;
        button.onclick = () => Game.handlePlayerChoice('switch_sect_tab', tabDef.id);
        tabsContainer.appendChild(button);
    });
}

function switchSectDashboardTab(tabId, sectToDisplay = null) {
    console.log('sect_ui.js: switchSectDashboardTab called with tabId:', tabId);
    // Assumes Game.currentOpenSectId, Game.sects, Game.currentSectDashboardTab are available
    // Assumes renderSectHallTab, renderSectMembersTab, etc. are available
    const sect = sectToDisplay || (Game.currentOpenSectId ? Game.sects[Game.currentOpenSectId] : null);
    if (!sect) return;

    Game.currentSectDashboardTab = tabId;
    const contentDiv = document.getElementById('sect-dashboard-main-content');
    if (!contentDiv) return;
    contentDiv.innerHTML = '';

    document.querySelectorAll('.sect-tab-button').forEach(btn => btn.classList.remove('active'));
    const activeTabButton = document.getElementById(`sect-tab-${tabId}`);
    if (activeTabButton) activeTabButton.classList.add('active');

    switch (tabId) {
        case 'hall': renderSectHallTab(sect, contentDiv); break;
        case 'members': renderSectMembersTab(sect, contentDiv); break;
        case 'shop': renderSectShopTab(sect, contentDiv); break;
        case 'treasury': renderSectTreasuryTab(sect, contentDiv); break;
        case 'quests': renderSectQuestsTab(sect, contentDiv); break;
        default: contentDiv.innerHTML = '<h4>Unknown Tab</h4><p>Content not found.</p>';
    }
}

function renderSectHallTab(sect, contentDiv) {
    console.log('sect_ui.js: renderSectHallTab called for sect:', sect.name);
    // Assumes Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.promptRenameSect etc. are available
    contentDiv.innerHTML = `<h4>Sect Hall: ${sect.name}</h4>
                            <p><strong>Description:</strong> <span id="sect-hall-description">${sect.description || "A mysterious sect."}</span></p>
                            <p><strong>Motto:</strong> "<span id="sect-hall-motto">${sect.motto || "Cultivate and Ascend!"}</span>"</p>
                            <p><strong>Location:</strong> ${sect.location || "Unspecified Region"}</p>
                            <p><strong>Founder:</strong> ${sect.founderName || "Unknown"}</p>
                            <p><strong>Total Members:</strong> ${Object.keys(sect.members || {}).length}</p>`;

    let hallActionsHtml = '<div class="mt-4 space-y-2">';
    if (Game.hasSectPermission(sect.sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.RENAME_SECT)) {
        hallActionsHtml += `<button class="action-button bg-yellow-600 hover:bg-yellow-700 text-sm" onclick="Game.promptRenameSect('${sect.sectId}')">Rename Sect</button>`;
    }
    if (Game.hasSectPermission(sect.sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.EDIT_DESCRIPTION)) {
        hallActionsHtml += `<button class="action-button bg-yellow-600 hover:bg-yellow-700 text-sm" onclick="Game.promptEditSectDescription('${sect.sectId}')">Edit Description</button>`;
    }
    if (Game.hasSectPermission(sect.sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.SET_MOTTO)) {
        hallActionsHtml += `<button class="action-button bg-yellow-600 hover:bg-yellow-700 text-sm" onclick="Game.promptEditSectMotto('${sect.sectId}')">Edit Motto</button>`;
    }
    hallActionsHtml += '</div>';
    contentDiv.innerHTML += hallActionsHtml;
}

function renderSectMembersTab(sect, contentDiv) {
    console.log('sect_ui.js: renderSectMembersTab called for sect:', sect.name);
    // Assumes Game.players, Game.currentPlayerId, Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.getRankOrder,
    // Game.promptInviteMemberToSect, Game.promptPromoteMember, Game.promptDemoteMember, Game.confirmKickMember are available
    contentDiv.innerHTML = `<h4>Sect Members</h4>`;
    const player = Game.players[Game.currentPlayerId];

    if (Game.hasSectPermission(sect.sectId, player.playerId, Game.SECT_PERMISSIONS.ACCEPT_NEW_MEMBER)) {
        contentDiv.innerHTML += `<button class="action-button bg-green-500 hover:bg-green-600 text-sm mb-3" onclick="Game.promptInviteMemberToSect('${sect.sectId}')">Invite Member (by Name)</button>`;
    }

    let membersHtml = '<div class="space-y-2">';
    const sortedMemberIds = Object.keys(sect.members).sort((a, b) => {
        const rankOrderA = Game.getRankOrder(sect.members[a].role, sect.ranks);
        const rankOrderB = Game.getRankOrder(sect.members[b].role, sect.ranks);
        if (rankOrderA !== rankOrderB) return rankOrderA - rankOrderB;
        return (sect.members[a].playerName || '').localeCompare(sect.members[b].playerName || '');
    });

    sortedMemberIds.forEach(memberId => {
        const member = sect.members[memberId];
        membersHtml += `<div class="p-2 bg-gray-700 rounded">
                            <p class="font-semibold">${member.playerName} <span class="text-xs text-gray-400">(${member.role})</span></p>
                            <p class="text-xs">Contribution: ${member.contributionPoints || 0}</p>`;

        if (player.playerId !== memberId) {
            if (Game.hasSectPermission(sect.sectId, player.playerId, Game.SECT_PERMISSIONS.PROMOTE_MEMBER, memberId)) {
                membersHtml += `<button class="action-button bg-blue-500 hover:bg-blue-600 text-xs py-1 px-2 mr-1" onclick="Game.promptPromoteMember('${sect.sectId}', '${memberId}')">Promote</button>`;
            }
            if (Game.hasSectPermission(sect.sectId, player.playerId, Game.SECT_PERMISSIONS.DEMOTE_MEMBER, memberId)) {
                membersHtml += `<button class="action-button bg-yellow-500 hover:bg-yellow-600 text-xs py-1 px-2 mr-1" onclick="Game.promptDemoteMember('${sect.sectId}', '${memberId}')">Demote</button>`;
            }
            if (Game.hasSectPermission(sect.sectId, player.playerId, Game.SECT_PERMISSIONS.KICK_MEMBER, memberId)) {
                membersHtml += `<button class="action-button bg-red-500 hover:bg-red-600 text-xs py-1 px-2" onclick="Game.confirmKickMember('${sect.sectId}', '${memberId}')">Kick</button>`;
            }
        }
        membersHtml += `</div>`;
    });
    membersHtml += `</div>`;
    contentDiv.innerHTML += membersHtml;
}

function renderSectShopTab(sect, contentDiv) {
    console.log('sect_ui.js: renderSectShopTab called for sect:', sect.name);
    // Assumes Game.currentPlayerId, Game.hasSectPermission, Game.SECT_PERMISSIONS are available
    contentDiv.innerHTML = `<h4>Sect Shop</h4>`;
    if (Game.hasSectPermission(sect.sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.BUY_FROM_SECT_SHOP)) {
        contentDiv.innerHTML += `<p>Welcome! Browse sect-exclusive items. (Shop items TBD)</p>`;
    } else {
        contentDiv.innerHTML += `<p>You do not have permission to purchase from the sect shop. Increase your rank or contribution.</p>`;
    }
}

function renderSectTreasuryTab(sect, contentDiv) {
    console.log('sect_ui.js: renderSectTreasuryTab called for sect:', sect.name);
    // Assumes Game.currentPlayerId, Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.donateToSectTreasury are available
    contentDiv.innerHTML = `<h4>Sect Treasury</h4>
                            <p>Current Spirit Stones: <span id="sect-treasury-stones">${sect.treasury.spiritStones || 0}</span></p>`;
    if (Game.hasSectPermission(sect.sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.DONATE_TO_TREASURY)) {
        contentDiv.innerHTML += `<div class="mt-3">
                                    <input type="number" id="sect-donate-amount" class="modal-input w-1/2 inline-block" placeholder="Amount">
                                    <button class="action-button bg-green-500 hover:bg-green-600 text-sm ml-2" onclick="Game.donateToSectTreasury('${sect.sectId}')">Donate Spirit Stones</button>
                                 </div>`;
    }
    if (Game.hasSectPermission(sect.sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.MANAGE_TREASURY)) {
         contentDiv.innerHTML += `<p class="mt-2 text-yellow-400">Treasury management features (withdraw, logs) coming soon.</p>`;
    }
}

function renderSectQuestsTab(sect, contentDiv) {
    console.log('sect_ui.js: renderSectQuestsTab called for sect:', sect.name);
    // Assumes Game.currentPlayerId, Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.startSectEvent are available
    contentDiv.innerHTML = `<h4>Sect Quests & Events</h4>`;
    if (Game.hasSectPermission(sect.sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.START_SECT_EVENT)) {
        contentDiv.innerHTML += `<button class="action-button bg-purple-500 hover:bg-purple-600 text-sm mb-3" onclick="Game.startSectEvent('${sect.sectId}')">Start New Sect Event (Placeholder)</button>`;
    }
    contentDiv.innerHTML += `<p>Daily and weekly missions for the sect. (Coming Soon)</p>`;
}

function showSectCreationPanel() {
    console.log('sect_ui.js: showSectCreationPanel called');
    // Assumes Game.players, Game.currentPlayerId, Game.currentGameState, Game.setMainView, displayMessage,
    // sectCreationPanelDiv, combatInterface, etc. are available
    const player = Game.players[Game.currentPlayerId];
    if (!player) { Game.showMainGate(); return; }

    if (player.sectId) {
        if (typeof displayMessage === 'function') displayMessage("You are already in a sect. You must leave your current sect to create a new one.", 'error');
        manageSects();
        return;
    }
    if (player.cultivationLevel < 10) {
        if (typeof displayMessage === 'function') displayMessage("You must reach the Foundation Establishment realm (Level 10) to create a sect.", 'error');
        manageSects();
        return;
    }
    if ((player.resources.spiritStones || 0) < 1000) {
        if (typeof displayMessage === 'function') displayMessage("You need at least 1000 Spirit Stones to establish a sect.", 'error');
        manageSects();
        return;
    }

    Game.currentGameState = 'SECT_CREATION_PANEL';
    Game.setMainView('gameplay');

    if (combatInterface) combatInterface.style.display = 'none';
    if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
    if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none';
    if (marketMenuDiv) marketMenuDiv.style.display = 'none';
    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
    if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
    const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
    if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
    if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";
    if (actionButtonsContainer) actionButtonsContainer.innerHTML = '';

    if (sectCreationPanelDiv) {
        sectCreationPanelDiv.style.display = 'block';
        sectCreationPanelDiv.innerHTML = `
            <h3>Establish Your Sect</h3>
            <div><label for="sect-create-name">Sect Name:</label><input type="text" id="sect-create-name" class="form-input"></div>
            <div><label for="sect-create-banner-url">Banner URL (optional):</label><input type="text" id="sect-create-banner-url" class="form-input" placeholder="https://example.com/banner.png"></div>
            <div><label for="sect-create-motto">Sect Motto:</label><input type="text" id="sect-create-motto" class="form-input"></div>
            <div>
                <label for="sect-create-location">Sect Location:</label>
                <select id="sect-create-location" class="form-select">
                    <option value="Hidden Mountain Valley">Hidden Mountain Valley</option>
                    <option value="Floating Cloud Peak">Floating Cloud Peak</option>
                    <option value="Ancient Forest Grove">Ancient Forest Grove</option>
                    <option value="Volcanic Caldera Stronghold">Volcanic Caldera Stronghold</option>
                    <option value="Sunken City Ruins">Sunken City Ruins</option>
                    <option value="Whispering Bamboo Thicket">Whispering Bamboo Thicket</option>
                    <option value="Celestial Pagoda Heights">Celestial Pagoda Heights</option>
                    <option value="Desolate Badlands Outpost">Desolate Badlands Outpost</option>
                </select>
            </div>
            <p class="text-sm text-gray-400 mt-2">Cost: 1000 Spirit Stones</p>
            <div id="sect-creation-panel-actions">
                <button class="action-button bg-green-600 hover:bg-green-700" onclick="Game.handlePlayerChoice('confirm_sect_creation')">Create Sect</button>
                <button class="action-button bg-red-600 hover:bg-red-700" onclick="Game.handlePlayerChoice('cancel_sect_creation')">Cancel</button>
            </div>
        `;
    }
}

function cancelSectCreation() {
    console.log('sect_ui.js: cancelSectCreation called');
    // Assumes sectCreationPanelDiv and manageSects are available
    if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
    manageSects();
}

async function confirmSectCreation() {
    console.log('sect_ui.js: confirmSectCreation called');
    // Assumes Game.players, Game.currentPlayerId, Game.sects, db, Sect class, displayMessage, manageSects are available
    const player = Game.players[Game.currentPlayerId];
    if (!player) { Game.showMainGate(); return;}
    try {
        if (player.sectId) { if (typeof displayMessage === 'function') displayMessage("You are already in a sect.", 'error'); cancelSectCreation(); return; }
        if (player.cultivationLevel < 10) { if (typeof displayMessage === 'function') displayMessage("Must be Foundation Establishment (Level 10).", 'error'); cancelSectCreation(); return; }
        if ((player.resources.spiritStones || 0) < 1000) { if (typeof displayMessage === 'function') displayMessage("Not enough Spirit Stones (need 1000).", 'error'); cancelSectCreation(); return; }

        const name = document.getElementById('sect-create-name').value.trim();
        const bannerUrl = document.getElementById('sect-create-banner-url').value.trim() || null;
        const motto = document.getElementById('sect-create-motto').value.trim() || "To cultivate immortality and tread the path of the strong!";
        const location = document.getElementById('sect-create-location').value;

        if (!name) { if (typeof displayMessage === 'function') displayMessage("Sect Name cannot be empty.", 'error'); return; }

        const sectNameQuery = await db.collection("sects").where("name", "==", name).get();
        if (!sectNameQuery.empty) {
            if (typeof displayMessage === 'function') displayMessage("A sect with this name already exists.", 'error');
            manageSects(); return;
        }

        player.resources.spiritStones -= 1000;

        const description = `The illustrious ${name} Sect, founded by ${player.name}.`;
        const newSect = new Sect(name, player.playerId, player.name, description, motto, location, bannerUrl);
        await db.collection("sects").doc(newSect.sectId).set(newSect.toFirestoreObject());
        Game.sects[newSect.sectId] = newSect;
        player.joinSect(newSect.sectId);
        if (typeof displayMessage === 'function') displayMessage(`Sect '${name}' established! You are the Founder.`, 'success');
        if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
        manageSects();
    } catch (e) { console.error("Confirm Sect Creation Error:", e); if (typeof displayMessage === 'function') displayMessage("Sect creation error.", "error"); }
}

function viewAllSects() {
    console.log('sect_ui.js: viewAllSects called');
    // Assumes Game.sects, Game.players, displayMessage, manageSects are available
    if (Object.keys(Game.sects).length===0) { if (typeof displayMessage === 'function') displayMessage("No sects yet.",'narration'); }
    else {
        if (typeof displayMessage === 'function') displayMessage("\n--- Available Sects ---", 'system');
        Object.values(Game.sects).forEach(s => {
            const fN = (Game.players[s.founderId] && Game.players[s.founderId].name) ? Game.players[s.founderId].name : 'Unknown Founder';
            const memberCount = s.members ? Object.keys(s.members).length : 0;
            if (typeof displayMessage === 'function') displayMessage(`ID: ${s.sectId} | Name: ${s.name} (Founder: ${s.founderName || fN}) | Members: ${memberCount} | Motto: ${s.motto}`); });
    }
    manageSects();
}

async function joinSectPrompt() {
    console.log('sect_ui.js: joinSectPrompt called');
    // Assumes Game.players, Game.currentPlayerId, Game.sects, getModalInput, displayMessage, manageSects are available
    const player = Game.players[Game.currentPlayerId]; if (!player) { Game.showMainGate(); return; }
    try {
        if (player.sectId) { if (typeof displayMessage === 'function') displayMessage("Already in a sect.", 'error'); manageSects(); return; }
        if (Object.keys(Game.sects).length === 0) { if (typeof displayMessage === 'function') displayMessage("No sects to join.", 'narration'); manageSects(); return; }
        const id = await getModalInput("Sect ID to join:");
        if (!id) { if (typeof displayMessage === 'function') displayMessage("Cancelled.", "narration"); manageSects(); return; }

        if (Game.sects[id]) {
            player.joinSect(id);
        } else {
            if (typeof displayMessage === 'function') displayMessage("Sect ID not found locally. (Loading from DB not yet implemented for join).", 'error');
        }
    } catch (e) { console.error("Join Sect Error:", e); if (typeof displayMessage === 'function') displayMessage("Join sect error.", "error"); }
    manageSects();
}

function viewMySectInfo() {
    console.log('sect_ui.js: viewMySectInfo called');
    // Assumes Game.players, Game.currentPlayerId, Game.sects, showSectDashboard, displayMessage, manageSects are available
    const player = Game.players[Game.currentPlayerId]; if (!player) { Game.showMainGate(); return; }
    if (player.sectId && Game.sects[player.sectId]) {
        showSectDashboard(player.sectId);
    } else { if (typeof displayMessage === 'function') displayMessage("Not in a sect.", 'error'); manageSects(); }
}

function leaveMySect() {
    console.log('sect_ui.js: leaveMySect called');
    // Assumes Game.players, Game.currentPlayerId, manageSects are available
    const player = Game.players[Game.currentPlayerId]; if (!player) {Game.showMainGate(); return;}
    player.leaveSect();
    manageSects();
}

async function promptRenameSect(sectId) {
    console.log('sect_ui.js: promptRenameSect called with sectId:', sectId);
    // Assumes Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.currentPlayerId, Game.sects, getModalInput, displayMessage, Game.saveSectData, updateStatsDisplay are available
    if (!Game.hasSectPermission(sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.RENAME_SECT)) {
        if (typeof displayMessage === 'function') displayMessage("You do not have permission to rename the sect.", "error"); return;
    }
    const newName = await getModalInput("Enter new sect name:");
    if (newName && newName.trim() !== "") {
        const sect = Game.sects[sectId];
        sect.name = newName.trim();
        const sectDashName = document.getElementById('sect-dashboard-name');
        if (sectDashName) sectDashName.textContent = sect.name;
        if (Game.players[Game.currentPlayerId].sectId === sectId && typeof updateStatsDisplay === 'function') updateStatsDisplay(Game.players[Game.currentPlayerId]);
        await Game.saveSectData(sectId);
        if (typeof displayMessage === 'function') displayMessage(`Sect renamed to ${sect.name}.`, "success");
    } else { if (typeof displayMessage === 'function') displayMessage("Rename cancelled or invalid name.", "narration"); }
}
async function promptEditSectDescription(sectId) {
    console.log('sect_ui.js: promptEditSectDescription called with sectId:', sectId);
    // Assumes Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.currentPlayerId, Game.sects, getModalInput, displayMessage, Game.saveSectData are available
    if (!Game.hasSectPermission(sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.EDIT_DESCRIPTION)) {
        if (typeof displayMessage === 'function') displayMessage("You do not have permission to edit the description.", "error"); return;
    }
    const currentDesc = Game.sects[sectId].description;
    const newDesc = await getModalInput(`Enter new sect description (current: ${currentDesc}):`);
    if (newDesc !== null) {
        Game.sects[sectId].description = newDesc.trim();
        const sectHallDesc = document.getElementById('sect-hall-description');
        if (sectHallDesc) sectHallDesc.textContent = Game.sects[sectId].description;
        await Game.saveSectData(sectId);
        if (typeof displayMessage === 'function') displayMessage(`Sect description updated.`, "success");
    } else { if (typeof displayMessage === 'function') displayMessage("Edit cancelled.", "narration"); }
}
async function promptEditSectMotto(sectId) {
    console.log('sect_ui.js: promptEditSectMotto called with sectId:', sectId);
    // Assumes Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.currentPlayerId, Game.sects, getModalInput, displayMessage, Game.saveSectData are available
    if (!Game.hasSectPermission(sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.SET_MOTTO)) {
        if (typeof displayMessage === 'function') displayMessage("You do not have permission to set the motto.", "error"); return;
    }
    const currentMotto = Game.sects[sectId].motto;
    const newMotto = await getModalInput(`Enter new sect motto (current: "${currentMotto}"):`);
    if (newMotto && newMotto.trim() !== "") {
        Game.sects[sectId].motto = newMotto.trim();
        const sectHallMotto = document.getElementById('sect-hall-motto');
        if (sectHallMotto) sectHallMotto.textContent = Game.sects[sectId].motto;
        const sectDashMotto = document.getElementById('sect-dashboard-motto');
        if (sectDashMotto) sectDashMotto.textContent = Game.sects[sectId].motto;
        await Game.saveSectData(sectId);
        if (typeof displayMessage === 'function') displayMessage(`Sect motto updated.`, "success");
    } else { if (typeof displayMessage === 'function') displayMessage("Edit cancelled or invalid motto.", "narration"); }
}
async function promptInviteMemberToSect(sectId) {
    console.log('sect_ui.js: promptInviteMemberToSect called with sectId:', sectId);
    // Assumes Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.currentPlayerId, getModalInput, displayMessage are available
    if (!Game.hasSectPermission(sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.ACCEPT_NEW_MEMBER)) {
        if (typeof displayMessage === 'function') displayMessage("You do not have permission to invite members.", "error"); return;
    }
    const playerName = await getModalInput("Enter name of the player to invite:");
    if (playerName && playerName.trim() !== "") {
        if (typeof displayMessage === 'function') displayMessage(`Invite functionality for '${playerName.trim()}' is a placeholder. In a full system, an invitation would be sent.`, "system");
    } else { if (typeof displayMessage === 'function') displayMessage("Invite cancelled.", "narration"); }
}
async function promptPromoteMember(sectId, targetMemberId) {
    console.log('sect_ui.js: promptPromoteMember called with sectId:', sectId, 'targetMemberId:', targetMemberId);
    // Assumes Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.currentPlayerId, Game.sects, displayMessage are available
    if (!Game.hasSectPermission(sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.PROMOTE_MEMBER, targetMemberId)) {
        if (typeof displayMessage === 'function') displayMessage("You do not have permission or the target is not of lower rank.", "error"); return;
    }
    if (typeof displayMessage === 'function') displayMessage(`Promote member ${Game.sects[sectId].members[targetMemberId].playerName}? (Full UI for rank selection TBD)`, "system");
}
async function promptDemoteMember(sectId, targetMemberId) {
    console.log('sect_ui.js: promptDemoteMember called with sectId:', sectId, 'targetMemberId:', targetMemberId);
    // Assumes Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.currentPlayerId, Game.sects, displayMessage are available
    if (!Game.hasSectPermission(sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.DEMOTE_MEMBER, targetMemberId)) {
        if (typeof displayMessage === 'function') displayMessage("You do not have permission or the target is not of lower rank.", "error"); return;
    }
    if (typeof displayMessage === 'function') displayMessage(`Demote member ${Game.sects[sectId].members[targetMemberId].playerName}? (Full UI for rank selection TBD)`, "system");
}
async function confirmKickMember(sectId, targetMemberId) {
    console.log('sect_ui.js: confirmKickMember called with sectId:', sectId, 'targetMemberId:', targetMemberId);
    // Assumes Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.currentPlayerId, Game.sects, getModalInput, displayMessage are available
    if (!Game.hasSectPermission(sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.KICK_MEMBER, targetMemberId)) {
        if (typeof displayMessage === 'function') displayMessage("You do not have permission or the target is not of lower rank.", "error"); return;
    }
    const targetName = Game.sects[sectId].members[targetMemberId].playerName;
    const confirm = await getModalInput(`Are you sure you want to kick ${targetName} from the sect? (yes/no)`);
    if (confirm && confirm.toLowerCase() === 'yes') {
        if (typeof displayMessage === 'function') displayMessage(`${targetName} has been kicked (Placeholder).`, "success");
    } else { if (typeof displayMessage === 'function') displayMessage("Kick cancelled.", "narration"); }
}
async function donateToSectTreasury(sectId) {
    console.log('sect_ui.js: donateToSectTreasury called with sectId:', sectId);
    // Assumes Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.currentPlayerId, Game.players, Game.sects,
    // Game.saveCurrentPlayerState, Game.saveSectData, db, firebase.firestore.FieldValue, displayMessage, updateStatsDisplay are available
    if (!Game.hasSectPermission(sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.DONATE_TO_TREASURY)) {
        if (typeof displayMessage === 'function') displayMessage("You do not have permission to donate.", "error"); return;
    }
    const player = Game.players[Game.currentPlayerId];
    const amountStr = document.getElementById('sect-donate-amount').value;
    const amount = parseInt(amountStr);

    if (isNaN(amount) || amount <= 0) { if (typeof displayMessage === 'function') displayMessage("Invalid amount.", "error"); return; }
    if ((player.resources.spiritStones || 0) < amount) { if (typeof displayMessage === 'function') displayMessage("Not enough Spirit Stones.", "error"); return; }

    const sect = Game.sects[sectId];
    const contributionGained = amount;

    player.resources.spiritStones -= amount;
    sect.treasury.spiritStones = (sect.treasury.spiritStones || 0) + amount;
    if (sect.members[player.playerId]) {
        sect.members[player.playerId].contributionPoints = (sect.members[player.playerId].contributionPoints || 0) + contributionGained;
    }
    sect.totalContributionPoints = (sect.totalContributionPoints || 0) + contributionGained;

    const sectTreasuryStonesEl = document.getElementById('sect-treasury-stones');
    if (sectTreasuryStonesEl) sectTreasuryStonesEl.textContent = sect.treasury.spiritStones;
    if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
    if (Game.currentSectDashboardTab === 'members') renderSectMembersTab(sect, document.getElementById('sect-dashboard-main-content'));
    const sectDonateAmountEl = document.getElementById('sect-donate-amount');
    if (sectDonateAmountEl) sectDonateAmountEl.value = '';

    await Game.saveCurrentPlayerState();

    try {
        const sectRef = db.collection("sects").doc(sectId);
        const playerMemberPath = `members.${player.playerId}.contributionPoints`;
        const newLogEntry = {
            playerId: player.playerId, playerName: player.name,
            action: "donated_spirit_stones", details: `Donated ${amount} Spirit Stones.`,
            amount: contributionGained, timestamp: new Date()
        };

        await sectRef.update({
            "treasury.spiritStones": firebase.firestore.FieldValue.increment(amount),
            [playerMemberPath]: firebase.firestore.FieldValue.increment(contributionGained),
            totalContributionPoints: firebase.firestore.FieldValue.increment(contributionGained),
            contributionLogs: firebase.firestore.FieldValue.arrayUnion(newLogEntry)
        });
    } catch (error) {
        console.error("Error updating sect data atomically:", error);
        if (typeof displayMessage === 'function') displayMessage("Failed to record contribution to sect. Please check connection.", "error");
    }

    if (typeof displayMessage === 'function') displayMessage(`Donated ${amount} Spirit Stones to the sect treasury. Gained ${contributionGained} contribution points.`, "success");
}
async function startSectEvent(sectId) {
    console.log('sect_ui.js: startSectEvent called with sectId:', sectId);
    // Assumes Game.hasSectPermission, Game.SECT_PERMISSIONS, Game.currentPlayerId, displayMessage are available
    if (!Game.hasSectPermission(sectId, Game.currentPlayerId, Game.SECT_PERMISSIONS.START_SECT_EVENT)) {
        if (typeof displayMessage === 'function') displayMessage("You do not have permission to start sect events.", "error"); return;
    }
    if (typeof displayMessage === 'function') displayMessage("Starting a new sect event... (Placeholder - event system TBD)", "system");
}
