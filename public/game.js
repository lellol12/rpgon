// --- START: JAVASCRIPT GAME ENGINE (BACKEND LOGIC) ---
let db; // Firestore instance, will be initialized in Game.initializeGame

const Game = {
    players: {},
    sects: {},
    // --- START: JAVASCRIPT GAME ENGINE (BACKEND LOGIC) ---
    currentPlayerId: null,
    // currentCombat: null, // Managed by CombatManager
    currentGameState: 'MAIN_GATE',
    selectedClassForInfo: null,
    currentExploringAreaKey: null,
    tempTransactionData: null,
    tempAttributeAllocations: {},
    PILL_RECIPES: {}, // Populated by loadPillDataFromCSV
    chatMessagesListener: null, // Firebase listener unsubscribe handle

    // Chat functions from chat.js
    // These functions are defined in chat.js and assigned here.
    // Ensure chat.js is loaded before game.js or that these are available globally.
    sendChatMessage: typeof sendChatMessage !== 'undefined' ? sendChatMessage : async function(...args) { console.error("Game.sendChatMessage: chat.js not loaded or sendChatMessage not global.", args); return Promise.resolve(); },
    listenForChatMessages: typeof listenForChatMessages !== 'undefined' ? listenForChatMessages : function(...args) { console.error("Game.listenForChatMessages: chat.js not loaded or listenForChatMessages not global.", args); },
    stopListeningForChatMessages: typeof stopListeningForChatMessages !== 'undefined' ? stopListeningForChatMessages : function(...args) { console.error("Game.stopListeningForChatMessages: chat.js not loaded or stopListeningForChatMessages not global.", args); },

    // Auth functions from client_auth.js
    // Ensure client_auth.js is loaded before game.js or that these are available globally.
    showMainGate: typeof showMainGate !== 'undefined' ? showMainGate : function(...args) { console.error("Game.showMainGate: client_auth.js not loaded or showMainGate not global.", args); },
    showCreateAccountForm: typeof showCreateAccountForm !== 'undefined' ? showCreateAccountForm : function(...args) { console.error("Game.showCreateAccountForm: client_auth.js not loaded or showCreateAccountForm not global.", args); },
    showLoginForm: typeof showLoginForm !== 'undefined' ? showLoginForm : function(...args) { console.error("Game.showLoginForm: client_auth.js not loaded or showLoginForm not global.", args); },
    handleCreateAccountFormSubmit: typeof handleCreateAccountFormSubmitUI !== 'undefined' ? handleCreateAccountFormSubmitUI : async function(...args) { console.error("Game.handleCreateAccountFormSubmit: client_auth.js not loaded or handleCreateAccountFormSubmitUI not global.", args); return Promise.resolve(); },
    showGenderSelection: typeof showGenderSelection !== 'undefined' ? showGenderSelection : function(...args) { console.error("Game.showGenderSelection: client_auth.js not loaded or showGenderSelection not global.", args); },
    handleGenderSelection: typeof handleGenderSelectionUI !== 'undefined' ? handleGenderSelectionUI : async function(...args) { console.error("Game.handleGenderSelection: client_auth.js not loaded or handleGenderSelectionUI not global.", args); return Promise.resolve(); },
    handleLoginFormSubmit: typeof handleLoginFormSubmitUI !== 'undefined' ? handleLoginFormSubmitUI : async function(...args) { console.error("Game.handleLoginFormSubmit: client_auth.js not loaded or handleLoginFormSubmitUI not global.", args); return Promise.resolve(); },
    logout: typeof logout !== 'undefined' ? logout : function(...args) { console.error("Game.logout: client_auth.js not loaded or logout not global.", args); },
    checkAndRestoreSession: typeof checkAndRestoreSessionUI !== 'undefined' ? checkAndRestoreSessionUI : async function(...args) { console.error("Game.checkAndRestoreSession: client_auth.js not loaded or checkAndRestoreSessionUI not global.", args); return Promise.resolve(false); },

    // Exploration functions from client_exploration.js
    // Ensure client_exploration.js is loaded before game.js or that these are available globally.
    exploreArea: typeof exploreArea !== 'undefined' ? exploreArea : function(...args) { console.error("Game.exploreArea: client_exploration.js not loaded or exploreArea not global.", args); },
    showDedicatedExplorationView: typeof showDedicatedExplorationView !== 'undefined' ? showDedicatedExplorationView : function(...args) { console.error("Game.showDedicatedExplorationView: client_exploration.js not loaded or showDedicatedExplorationView not global.", args); },
    leaveDedicatedExplorationArea: typeof leaveDedicatedExplorationArea !== 'undefined' ? leaveDedicatedExplorationArea : function(...args) { console.error("Game.leaveDedicatedExplorationArea: client_exploration.js not loaded or leaveDedicatedExplorationArea not global.", args); },
    performDedicatedExploreAction: typeof performDedicatedExploreActionUI !== 'undefined' ? performDedicatedExploreActionUI : async function(...args) { console.error("Game.performDedicatedExploreAction: client_exploration.js not loaded or performDedicatedExploreActionUI not global.", args); return Promise.resolve(); },

    // Class Selection functions from class_selection.js
    // Ensure class_selection.js is loaded before game.js or that these are available globally.
    showClassSelectionMenu: typeof showClassSelectionMenu !== 'undefined' ? showClassSelectionMenu : function(...args) { console.error("Game.showClassSelectionMenu: class_selection.js not loaded or showClassSelectionMenu not global.", args); },
    showClassInfo: typeof showClassInfo !== 'undefined' ? showClassInfo : function(...args) { console.error("Game.showClassInfo: class_selection.js not loaded or showClassInfo not global.", args); },
    selectClass: typeof selectClass !== 'undefined' ? selectClass : async function(...args) { console.error("Game.selectClass: class_selection.js not loaded or selectClass not global.", args); return Promise.resolve(); },

    // Inventory UI functions
    // Ensure ui.js and inventory.js are loaded before game.js
    toggleGridInventoryModal: typeof toggleGridInventoryModal !== 'undefined' ? toggleGridInventoryModal : function(...args) { console.error("Game.toggleGridInventoryModal: ui.js not loaded or toggleGridInventoryModal not global.", args); },
    promptUseItem: typeof promptUseItem !== 'undefined' ? promptUseItem : async function(...args) { console.error("Game.promptUseItem: inventory.js not loaded or promptUseItem not global.", args); return Promise.resolve(); },
    equipItem: typeof equipItem !== 'undefined' ? equipItem : function(...args) { console.error("Game.equipItem: inventory.js not loaded or equipItem not global.", args); },
    unequipItem: typeof unequipItem !== 'undefined' ? unequipItem : function(...args) { console.error("Game.unequipItem: inventory.js not loaded or unequipItem not global.", args); },
    // populateModalInventoryGrid is called by toggleGridInventoryModal, ensure it's global or correctly scoped.
    // promptUnequipItem is called directly within inventory.js for now.

    // Concoction functions from concoction.js
    // Ensure concoction.js is loaded before game.js
    showConcoctionMenu: typeof showConcoctionMenu !== 'undefined' ? showConcoctionMenu : function(...args) { console.error("Game.showConcoctionMenu: concoction.js not loaded or showConcoctionMenu not global.", args); },
    promptConcoctQuantity: typeof promptConcoctQuantity !== 'undefined' ? promptConcoctQuantity : async function(...args) { console.error("Game.promptConcoctQuantity: concoction.js not loaded or promptConcoctQuantity not global.", args); return Promise.resolve(); },
    executeConcoction: typeof executeConcoction !== 'undefined' ? executeConcoction : async function(...args) { console.error("Game.executeConcoction: concoction.js not loaded or executeConcoction not global.", args); return Promise.resolve(); },

    // Market functions from market.js
    // Ensure market.js is loaded before game.js
    showMarketMenu: typeof showMarketMenu !== 'undefined' ? showMarketMenu : function(...args) { console.error("Game.showMarketMenu: market.js not loaded or showMarketMenu not global.", args); },
    marketListItemSelect: typeof marketListItemSelect !== 'undefined' ? marketListItemSelect : async function(...args) { console.error("Game.marketListItemSelect: market.js not loaded or marketListItemSelect not global.", args); return Promise.resolve(); },
    promptListItemForSale: typeof promptListItemForSale !== 'undefined' ? promptListItemForSale : function(...args) { console.error("Game.promptListItemForSale: market.js not loaded or promptListItemForSale not global.", args); },
    confirmListItemForSale: typeof confirmListItemForSale !== 'undefined' ? confirmListItemForSale : async function(...args) { console.error("Game.confirmListItemForSale: market.js not loaded or confirmListItemForSale not global.", args); return Promise.resolve(); },
    showMarketListings: typeof showMarketListings !== 'undefined' ? showMarketListings : async function(...args) { console.error("Game.showMarketListings: market.js not loaded or showMarketListings not global.", args); return Promise.resolve(); },
    purchaseMarketItem: typeof purchaseMarketItem !== 'undefined' ? purchaseMarketItem : async function(...args) { console.error("Game.purchaseMarketItem: market.js not loaded or purchaseMarketItem not global.", args); return Promise.resolve(); },
    promptBuyItem: typeof promptBuyItem !== 'undefined' ? promptBuyItem : async function(...args) { console.error("Game.promptBuyItem: market.js not loaded or promptBuyItem not global.", args); return Promise.resolve(); },
    promptRemoveListing: typeof promptRemoveListing !== 'undefined' ? promptRemoveListing : async function(...args) { console.error("Game.promptRemoveListing: market.js not loaded or promptRemoveListing not global.", args); return Promise.resolve(); },
    executeBuyItem: typeof executeBuyItem !== 'undefined' ? executeBuyItem : async function(...args) { console.error("Game.executeBuyItem: market.js not loaded or executeBuyItem not global.", args); return Promise.resolve(); },
    executeRemoveListing: typeof executeRemoveListing !== 'undefined' ? executeRemoveListing : async function(...args) { console.error("Game.executeRemoveListing: market.js not loaded or executeRemoveListing not global.", args); return Promise.resolve(); },

    // Sect and Sect UI functions
    // Ensure sect.js and sect_ui.js are loaded
    manageSects: typeof manageSects !== 'undefined' ? manageSects : function(...args) { console.error("Game.manageSects: sect_ui.js not loaded or manageSects not global.", args); },
    viewAllSects: typeof viewAllSects !== 'undefined' ? viewAllSects : async function(...args) { console.error("Game.viewAllSects: sect_ui.js not loaded or viewAllSects not global.", args); return Promise.resolve(); },
    joinSectPrompt: typeof joinSectPrompt !== 'undefined' ? joinSectPrompt : async function(...args) { console.error("Game.joinSectPrompt: sect_ui.js not loaded or joinSectPrompt not global.", args); return Promise.resolve(); },
    viewMySectInfo: typeof viewMySectInfo !== 'undefined' ? viewMySectInfo : function(...args) { console.error("Game.viewMySectInfo: sect_ui.js not loaded or viewMySectInfo not global.", args); },
    leaveMySect: typeof leaveMySect !== 'undefined' ? leaveMySect : async function(...args) { console.error("Game.leaveMySect: sect_ui.js not loaded or leaveMySect not global.", args); return Promise.resolve(); },
    showSectCreationPanel: typeof showSectCreationPanel !== 'undefined' ? showSectCreationPanel : function(...args) { console.error("Game.showSectCreationPanel: sect_ui.js not loaded or showSectCreationPanel not global.", args); },
    confirmSectCreation: typeof confirmSectCreation !== 'undefined' ? confirmSectCreation : async function(...args) { console.error("Game.confirmSectCreation: sect_ui.js not loaded or confirmSectCreation not global.", args); return Promise.resolve(); },
    cancelSectCreation: typeof cancelSectCreation !== 'undefined' ? cancelSectCreation : function(...args) { console.error("Game.cancelSectCreation: sect_ui.js not loaded or cancelSectCreation not global.", args); },
    showSectDashboard: typeof showSectDashboard !== 'undefined' ? showSectDashboard : function(...args) { console.error("Game.showSectDashboard: sect_ui.js not loaded or showSectDashboard not global.", args); },
    switchSectDashboardTab: typeof switchSectDashboardTab !== 'undefined' ? switchSectDashboardTab : function(...args) { console.error("Game.switchSectDashboardTab: sect_ui.js not loaded or switchSectDashboardTab not global.", args); },
    donateToSectTreasury: typeof donateToSectTreasury !== 'undefined' ? donateToSectTreasury : async function(...args) { console.error("Game.donateToSectTreasury: sect_ui.js not loaded or donateToSectTreasury not global.", args); return Promise.resolve(); },
    promptRenameSect: typeof promptRenameSect !== 'undefined' ? promptRenameSect : async function(...args) { console.error("Game.promptRenameSect: sect_ui.js not loaded or promptRenameSect not global.", args); return Promise.resolve(); },
    promptEditSectDescription: typeof promptEditSectDescription !== 'undefined' ? promptEditSectDescription : async function(...args) { console.error("Game.promptEditSectDescription: sect_ui.js not loaded or promptEditSectDescription not global.", args); return Promise.resolve(); },
    promptEditSectMotto: typeof promptEditSectMotto !== 'undefined' ? promptEditSectMotto : async function(...args) { console.error("Game.promptEditSectMotto: sect_ui.js not loaded or promptEditSectMotto not global.", args); return Promise.resolve(); },
    promptInviteMemberToSect: typeof promptInviteMemberToSect !== 'undefined' ? promptInviteMemberToSect : async function(...args) { console.error("Game.promptInviteMemberToSect: sect_ui.js not loaded or promptInviteMemberToSect not global.", args); return Promise.resolve(); },
    promptPromoteMember: typeof promptPromoteMember !== 'undefined' ? promptPromoteMember : async function(...args) { console.error("Game.promptPromoteMember: sect_ui.js not loaded or promptPromoteMember not global.", args); return Promise.resolve(); },
    promptDemoteMember: typeof promptDemoteMember !== 'undefined' ? promptDemoteMember : async function(...args) { console.error("Game.promptDemoteMember: sect_ui.js not loaded or promptDemoteMember not global.", args); return Promise.resolve(); },
    confirmKickMember: typeof confirmKickMember !== 'undefined' ? confirmKickMember : async function(...args) { console.error("Game.confirmKickMember: sect_ui.js not loaded or confirmKickMember not global.", args); return Promise.resolve(); },
    startSectEvent: typeof startSectEvent !== 'undefined' ? startSectEvent : async function(...args) { console.error("Game.startSectEvent: sect_ui.js not loaded or startSectEvent not global.", args); return Promise.resolve(); },
    // renderSectHallTab, renderSectMembersTab etc. are usually internal to sect_ui.js
    hasSectPermission(sectId, playerId, permissionKey) { // This is a wrapper for the Sect class method
        const sect = this.sects[sectId];
        if (sect && typeof sect.hasPermission === 'function') {
            return sect.hasPermission(playerId, permissionKey);
        }
        console.error(`Sect with ID ${sectId} not found or has no hasPermission method for Game.hasSectPermission.`);
        return false;
    },
    // Player Search UI
    showPlayerSearch: typeof showPlayerSearch !== 'undefined' ? showPlayerSearch : function(...args) { console.error("Game.showPlayerSearch: player_search.js not loaded or showPlayerSearch not global.", args); },
    // Attribute Allocation UI
    showAttributeAllocationMenu: typeof showAttributeAllocationMenu !== 'undefined' ? showAttributeAllocationMenu : function(...args) { console.error("Game.showAttributeAllocationMenu: attribute_allocation.js not loaded or showAttributeAllocationMenu not global.", args); },
    handleTempAllocatePoint: typeof handleTempAllocatePoint !== 'undefined' ? handleTempAllocatePoint : function(...args) { console.error("Game.handleTempAllocatePoint: attribute_allocation.js not loaded or handleTempAllocatePoint not global.", args); },
    handleTempUnallocatePoint: typeof handleTempUnallocatePoint !== 'undefined' ? handleTempUnallocatePoint : function(...args) { console.error("Game.handleTempUnallocatePoint: attribute_allocation.js not loaded or handleTempUnallocatePoint not global.", args); },
    confirmAttributeAllocations: typeof confirmAttributeAllocations !== 'undefined' ? confirmAttributeAllocations : async function(...args) { console.error("Game.confirmAttributeAllocations: attribute_allocation.js not loaded or confirmAttributeAllocations not global.", args); return Promise.resolve(); },
    cancelAttributeAllocations: typeof cancelAttributeAllocations !== 'undefined' ? cancelAttributeAllocations : function(...args) { console.error("Game.cancelAttributeAllocations: attribute_allocation.js not loaded or cancelAttributeAllocations not global.", args); },
    // Tianji Pavilion UI
    showTianjiPavilion: typeof showTianjiPavilion !== 'undefined' ? showTianjiPavilion : function(...args) { console.error("Game.showTianjiPavilion: tianji_pavilion.js not loaded or showTianjiPavilion not global.", args); },
    tianjiDivine: typeof tianjiDivine !== 'undefined' ? tianjiDivine : async function(...args) { console.error("Game.tianjiDivine: tianji_pavilion.js not loaded or tianjiDivine not global.", args); return Promise.resolve(); },
    tianjiRecords: typeof tianjiRecords !== 'undefined' ? tianjiRecords : function(...args) { console.error("Game.tianjiRecords: tianji_pavilion.js not loaded or tianjiRecords not global.", args); },
    // Artifact Crafting
    forgeArtifact: typeof forgeArtifact !== 'undefined' ? forgeArtifact : async function(...args) { console.error("Game.forgeArtifact: artifact.js not loaded or forgeArtifact not global.", args); return Promise.resolve(); },
    // Talisman Crafting
    drawTalisman: typeof drawTalisman !== 'undefined' ? drawTalisman : async function(...args) { console.error("Game.drawTalisman: talisman.js not loaded or drawTalisman not global.", args); return Promise.resolve(); },
    // PvP
    pvpChallenge: typeof pvpChallenge !== 'undefined' ? pvpChallenge : async function(...args) { console.error("Game.pvpChallenge: pvp.js not loaded or pvpChallenge not global.", args); return Promise.resolve(); },

    // Artifact UI and Logic functions from artifact.js
    // Ensure artifact.js is loaded before game.js
    forgeArtifact: typeof forgeArtifact !== 'undefined' ? forgeArtifact : async function(...args) { console.error("Game.forgeArtifact: artifact.js not loaded or forgeArtifact not global.", args); return Promise.resolve(); },
    displayItemRefiningUI: typeof displayItemRefiningUI !== 'undefined' ? displayItemRefiningUI : function(...args) { console.error("Game.displayItemRefiningUI: artifact.js not loaded or displayItemRefiningUI not global.", args); },
    executeForgeArtifact: typeof executeForgeArtifact !== 'undefined' ? executeForgeArtifact : async function(...args) { console.error("Game.executeForgeArtifact: artifact.js not loaded or executeForgeArtifact not global.", args); return Promise.resolve(); },

    getMonster(areaKey) {
        console.log('game.js: getMonster called for areaKey:', areaKey);
        if (!this.EXPLORATION_AREAS || !this.EXPLORATION_AREAS[areaKey] || !this.EXPLORATION_AREAS[areaKey].monsters || this.EXPLORATION_AREAS[areaKey].monsters.length === 0) {
            console.error(`No monsters defined for area ${areaKey} or area data not found.`);
            // Return a default fallback monster or null
            const fallbackMonsterData = this.MONSTER_DATA['genericRat']; // Assuming a fallback
            if (fallbackMonsterData) {
                return new Monster(
                    fallbackMonsterData.name,
                    fallbackMonsterData.health,
                    fallbackMonsterData.str,
                    fallbackMonsterData.agi,
                    fallbackMonsterData.con,
                    fallbackMonsterData.spr,
                    fallbackMonsterData.intl,
                    fallbackMonsterData.wil,
                    fallbackMonsterData.cultivationLevel,
                    fallbackMonsterData.xpReward,
                    fallbackMonsterData.tamable,
                    fallbackMonsterData.image
                );
            }
            return null;
        }

        const possibleMonsters = this.EXPLORATION_AREAS[areaKey].monsters;
        const monsterKey = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];
        const monsterData = this.MONSTER_DATA[monsterKey];

        if (!monsterData) {
            console.error(`Monster data not found for key: ${monsterKey}`);
            // Fallback if specific monster key is bad but area had monsters
            const fallbackMonsterData = this.MONSTER_DATA['genericRat'];
            if (fallbackMonsterData) {
                 return new Monster(
                    fallbackMonsterData.name,
                    fallbackMonsterData.health,
                    fallbackMonsterData.str,
                    fallbackMonsterData.agi,
                    fallbackMonsterData.con,
                    fallbackMonsterData.spr,
                    fallbackMonsterData.intl,
                    fallbackMonsterData.wil,
                    fallbackMonsterData.cultivationLevel,
                    fallbackMonsterData.xpReward,
                    fallbackMonsterData.tamable,
                    fallbackMonsterData.image
                );
            }
            return null;
        }

        // Create a new instance of the Monster
        return new Monster(
            monsterData.name,
            monsterData.health,
            monsterData.str,
            monsterData.agi,
            monsterData.con,
            monsterData.spr,
            monsterData.intl,
            monsterData.wil,
            monsterData.cultivationLevel,
            monsterData.xpReward,
            monsterData.tamable,
            monsterData.image
        );
    },

    // Data objects will be assigned from data.js
    ITEM_DATA: typeof ITEM_DATA !== 'undefined' ? ITEM_DATA : {},
    MONSTER_DATA: typeof MONSTER_DATA !== 'undefined' ? MONSTER_DATA : {},
    EXPLORATION_AREAS: typeof EXPLORATION_AREAS !== 'undefined' ? EXPLORATION_AREAS : {},
    CULTIVATOR_CLASSES: typeof CULTIVATOR_CLASSES !== 'undefined' ? CULTIVATOR_CLASSES : {},
    CLASS_STAT_GROWTH: typeof CLASS_STAT_GROWTH !== 'undefined' ? CLASS_STAT_GROWTH : {},
    ARTIFACT_RECIPES: typeof ARTIFACT_RECIPES !== 'undefined' ? ARTIFACT_RECIPES : {},
    DEFAULT_SECT_RANKS: typeof DEFAULT_SECT_RANKS !== 'undefined' ? DEFAULT_SECT_RANKS : [],

    // CombatManager will be assigned from combat.js
    CombatManager: typeof CombatManager !== 'undefined' ? CombatManager : null,

    // SECT_PERMISSIONS will be defined here for now, or could be moved to sect.js if preferred
    SECT_PERMISSIONS: {
        RENAME_SECT: "rename_sect",
        PROMOTE_MEMBER: "promote_member_lower_rank",
        DEMOTE_MEMBER: "demote_member_lower_rank",
        KICK_MEMBER: "kick_member_lower_rank",
        ACCEPT_NEW_MEMBER: "accept_new_member",
        START_SECT_EVENT: "start_sect_event",
        DONATE_TO_TREASURY: "donate_to_treasury",
        BUY_FROM_SECT_SHOP: "buy_from_sect_shop",
        MANAGE_TREASURY: "manage_treasury",
        SET_MOTTO: "set_motto",
        EDIT_DESCRIPTION: "edit_description",
        ALL: "all"
    },

    updateLocalPlayerState(serverPlayerData) {
        console.log('game.js: updateLocalPlayerState called for player ID:', serverPlayerData ? serverPlayerData.playerId : 'null');
        if (!serverPlayerData || !serverPlayerData.playerId) {
            console.error("updateLocalPlayerState: Invalid or missing serverPlayerData or playerId", serverPlayerData);
            if (typeof displayMessage === 'function') displayMessage("Error updating player data from server.", "error");
            return;
        }

        let localPlayer = this.players[serverPlayerData.playerId];
        if (localPlayer) {
            // Preserve client-side methods by selectively updating properties
            // This is a shallow merge; deep merge for objects like 'resources' or 'equippedItems' might be needed
            // For example, serverPlayerData might not have all properties of a full Player instance.
            Object.keys(serverPlayerData).forEach(key => {
                if (key !== 'password' && localPlayer.hasOwnProperty(key)) { // Don't overwrite password, ensure property exists
                    if (typeof localPlayer[key] === 'object' && localPlayer[key] !== null && !Array.isArray(localPlayer[key])) {
                        // Simple merge for first-level objects like resources, equippedItems
                        localPlayer[key] = { ...(localPlayer[key] || {}), ...(serverPlayerData[key] || {}) };
                    } else if (Array.isArray(localPlayer[key])) {
                        localPlayer[key] = [ ...(serverPlayerData[key] || []) ];
                    }
                    else {
                        localPlayer[key] = serverPlayerData[key];
                    }
                }
            });
            // Ensure critical calculated fields are updated if they depend on server state
            localPlayer.maxHealth = localPlayer.calculateMaxHealth(); // Recalculate based on potentially updated stats
            localPlayer.health = Math.min(serverPlayerData.health, localPlayer.maxHealth); // Ensure health isn't > new max
            localPlayer.maxQi = localPlayer.calculateMaxQi();
            localPlayer.currentQi = Math.min(serverPlayerData.currentQi, localPlayer.maxQi);

            console.log("Local player state updated for:", serverPlayerData.playerId, localPlayer);
        } else {
            // If player doesn't exist locally (should be rare after login/session restore), create them.
            // Ensure Player.fromFirestoreObject can handle potentially partial data from server.
            console.warn(`Player ${serverPlayerData.playerId} not found locally. Creating new instance from server data.`);
            this.players[serverPlayerData.playerId] = Player.fromFirestoreObject(serverPlayerData, this.ITEM_DATA, this.PILL_RECIPES);
        }
        // It's crucial that updateStatsDisplay uses the updated localPlayer instance
        if (typeof updateStatsDisplay === 'function' && this.players[serverPlayerData.playerId]) {
            updateStatsDisplay(this.players[serverPlayerData.playerId]);
        }
    },

    async fetchPlayerData(playerId) {
        console.log('game.js: fetchPlayerData called for playerId:', playerId);
        if (!db) {
            console.error("Firestore (db) is not initialized.");
            return null;
        }
        try {
            const playerDoc = await db.collection("players").doc(playerId).get();
            if (playerDoc.exists) {
                return playerDoc.data();
            } else {
                console.warn(`No player found with ID: ${playerId}`);
                return null;
            }
        } catch (error) {
            console.error("Error fetching player data:", error);
            return null;
        }
    },

    async initializeGame() {
        console.log('game.js: initializeGame called');
        if (typeof firebase !== 'undefined' && typeof firebase.initializeApp === 'function' && typeof firebaseConfig !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
        } else {
            console.error("Firebase is not available. Game cannot connect to database.");
            if(typeof displayMessage === 'function') displayMessage("Error: Cannot connect to game services. Please refresh.", "error");
            return;
        }

        this.loadPillDataFromCSV(typeof pillCsvData !== 'undefined' ? pillCsvData : ''); // pillCsvData from data.js
        if(typeof displayMessage === 'function') displayMessage("=== Welcome to the Path of the Ascendant Dragon ===", 'important');

        // Assign data from data.js if not already assigned (safeguard)
        this.ITEM_DATA = typeof ITEM_DATA !== 'undefined' ? ITEM_DATA : this.ITEM_DATA;
        this.MONSTER_DATA = typeof MONSTER_DATA !== 'undefined' ? MONSTER_DATA : this.MONSTER_DATA;
        this.EXPLORATION_AREAS = typeof EXPLORATION_AREAS !== 'undefined' ? EXPLORATION_AREAS : this.EXPLORATION_AREAS;
        this.CULTIVATOR_CLASSES = typeof CULTIVATOR_CLASSES !== 'undefined' ? CULTIVATOR_CLASSES : this.CULTIVATOR_CLASSES;
        this.CLASS_STAT_GROWTH = typeof CLASS_STAT_GROWTH !== 'undefined' ? CLASS_STAT_GROWTH : this.CLASS_STAT_GROWTH;
        this.ARTIFACT_RECIPES = typeof ARTIFACT_RECIPES !== 'undefined' ? ARTIFACT_RECIPES : this.ARTIFACT_RECIPES;
        this.DEFAULT_SECT_RANKS = typeof DEFAULT_SECT_RANKS !== 'undefined' ? DEFAULT_SECT_RANKS : this.DEFAULT_SECT_RANKS;


        const urlParams = new URLSearchParams(window.location.search);
        const initialAction = urlParams.get('action');
        // window.history.replaceState({}, document.title, window.location.pathname); // Optional

        const restored = await this.checkAndRestoreSession(); // Use Game object's method
        if (!restored) {
            if (initialAction === 'create') {
                this.showCreateAccountForm(); // Use Game object's method
            } else if (initialAction === 'login') {
                this.showLoginForm(); // Use Game object's method
            } else {
                this.showMainGate(); // Use Game object's method
            }
        }
    },

    async saveCurrentPlayerState() {
        console.log('game.js: saveCurrentPlayerState called for player:', this.currentPlayerId);
        if (!this.currentPlayerId || !this.players[this.currentPlayerId]) {
            console.error("No current player to save.");
            return;
        }
        const player = this.players[this.currentPlayerId];
        try {
            const playerData = player.toFirestoreObject();
            await db.collection("players").doc(player.playerId).set(playerData);
        } catch (error) {
            console.error("Error saving player state:", error);
            if(typeof displayMessage === 'function') displayMessage("Failed to save your progress. Check connection.", "error");
        }
    },

    async saveSectData(sectId) {
        console.log('game.js: saveSectData called for sect:', sectId);
        if (!sectId || !this.sects[sectId]) {
            console.error("No sect data to save for ID:", sectId); return;
        }
        const sect = this.sects[sectId];
        try {
            await db.collection("sects").doc(sectId).set(sect.toFirestoreObject());
        } catch (error) {
            console.error("Error saving sect data:", error);
            if(typeof displayMessage === 'function') displayMessage("Failed to save sect data.", "error");
        }
    },

    getRealmTier: function(cultivationLevel) {
        console.log('game.js: getRealmTier called with cultivationLevel:', cultivationLevel);
        if (cultivationLevel >= 46) return 6;
        if (cultivationLevel >= 37) return 5;
        if (cultivationLevel >= 28) return 4;
        if (cultivationLevel >= 19) return 3;
        if (cultivationLevel >= 10) return 2;
        return 1;
    },

    async handlePlayerChoice(action, value) {
        console.log('game.js: handlePlayerChoice called with action:', action, 'and value:', value);
        try {
            const player = this.players[this.currentPlayerId];
            // Auth actions are handled directly by event listeners in ui.js calling auth.js functions
            // Class selection actions
            if (action === 'show_class_info') { if(typeof showClassInfo === 'function') showClassInfo(value); return; }
            if (action === 'select_class') { if(typeof selectClass === 'function') await selectClass(value); return; }
            // Inventory
            if (action === 'toggle_grid_inventory') { if(typeof toggleGridInventoryModal === 'function') toggleGridInventoryModal(); return; }
            // Market
            if (action === 'show_market_menu') { if(typeof showMarketMenu === 'function') showMarketMenu(); return; }
            if (action === 'market_list_item_select') { if(typeof marketListItemSelect === 'function') await marketListItemSelect(); return; }
            if (action === 'list_item_for_sale_prompt') { if(typeof promptListItemForSale === 'function') promptListItemForSale(value); return; }
            if (action === 'market_view_listings') { if(typeof showMarketListings === 'function') await showMarketListings(); return; }
            // Concoction
            if (action === 'show_concoction_menu') {
                if (player && player.chosenClassKey === 'alchemist' && typeof showConcoctionMenu === 'function') {
                    showConcoctionMenu();
                } else {
                    if(typeof displayMessage === 'function') displayMessage("Only Alchemists can concoct pills.", "error"); this.showLoggedInMenu();
                } return;
            }
            if (action === 'prompt_concoct_quantity') { if(typeof promptConcoctQuantity === 'function') promptConcoctQuantity(value); return; }
            // Exploration
            if (action === 'perform_dedicated_explore_action') { if(typeof this.performDedicatedExploreAction === 'function') await this.performDedicatedExploreAction(value); return; } // Use Game object's method
            if (action === 'leave_dedicated_exploration_area') { if(typeof this.leaveDedicatedExplorationArea === 'function') this.leaveDedicatedExplorationArea(); return; } // Use Game object's method
            // Sect UI
            if (action === 'switch_sect_tab') { if(typeof switchSectDashboardTab === 'function') this.switchSectDashboardTab(value); return; } // switchSectDashboardTab might remain in Game or move to sect_ui.js
            if (action === 'prompt_view_player_profile') { if(typeof promptViewPlayerProfile === 'function') promptViewPlayerProfile(value.playerId, value.playerName); return; }
            if (action === 'view_player_profile') { if(typeof viewPlayerProfile === 'function') viewPlayerProfile(value.playerId, value.playerName); return; }
            if (action === 'show_player_search') { if(typeof showPlayerSearch === 'function') showPlayerSearch(); return; }
            // Attribute Allocation
            if (action === 'show_allocate_attributes') { if(typeof showAttributeAllocationMenu === 'function') showAttributeAllocationMenu(); return; }
            if (action === 'temp_allocate_point') { if(typeof handleTempAllocatePoint === 'function') handleTempAllocatePoint(value); return; }
            if (action === 'temp_unallocate_point') { if(typeof handleTempUnallocatePoint === 'function') handleTempUnallocatePoint(value); return; }
            if (action === 'confirm_attribute_allocations') { if(typeof confirmAttributeAllocations === 'function') await confirmAttributeAllocations(); return; }
            if (action === 'cancel_attribute_allocations') { if(typeof cancelAttributeAllocations === 'function') cancelAttributeAllocations(); return; }
            // Sect Creation
            if (action === 'sect_create_prompt') { if(typeof showSectCreationPanel === 'function') showSectCreationPanel(); return; }
            if (action === 'confirm_sect_creation') { if(typeof confirmSectCreation === 'function') await confirmSectCreation(); return; }
            if (action === 'cancel_sect_creation') { if(typeof cancelSectCreation === 'function') cancelSectCreation(); return; }
            // Tianji Pavilion
            if (action === 'show_tianji_pavilion') { if(typeof showTianjiPavilion === 'function') showTianjiPavilion(); return; }
            if (action === 'tianji_divine') { if(typeof tianjiDivine === 'function') tianjiDivine(); return; }
            if (action === 'tianji_records') { if(typeof tianjiRecords === 'function') tianjiRecords(); return; }


            if (!player && action !== 'logout' && action !== 'show_create_form_action' && action !== 'show_login_form_action' && action !== 'exit_game') {
                 if(typeof displayMessage === 'function') displayMessage("Login required.", 'error'); if(typeof showMainGate === 'function') showMainGate(); return;
            }
            if (player && !player.hasRolledSpiritualRoot && action !== 'logout' && action !== 'roll_spiritual_root') {
                if(typeof displayMessage === 'function') displayMessage("You must first divine your spiritual roots!", "error"); this.showLoggedInMenu(); return;
            }
            if (player && !player.hasClassChosen && action !== 'logout' && action !== 'roll_spiritual_root') {
                if(typeof displayMessage === 'function') displayMessage("You must first choose your cultivation class!", "error"); if(typeof showClassSelectionMenu === 'function') showClassSelectionMenu(); return;
            }


            switch (action) {
                case 'roll_spiritual_root': if (player && !player.hasRolledSpiritualRoot && typeof this.rollSpiritualRoot === 'function') { await this.rollSpiritualRoot(); } break;
                case 'show_logged_in_menu': if(typeof this.showLoggedInMenu === 'function') this.showLoggedInMenu(); break;
                case 'meditate': if(player && typeof player.meditate === 'function') player.meditate(); break;
                case 'explore': if(typeof this.exploreArea === 'function') this.exploreArea(); break; // Use Game object's method
                case 'explore_specific_area': if(typeof this.showDedicatedExplorationView === 'function') this.showDedicatedExplorationView(value); break; // Use Game object's method
                case 'manage_sects': if(typeof manageSects === 'function') manageSects(); break;
                case 'pvp': if(typeof pvpChallenge === 'function') await pvpChallenge(); break;
                case 'logout': if(typeof this.logout === 'function') this.logout(); break; // Use Game object's method
                // Combat actions are now handled by CombatManager.playerAction
                case 'combat_attack': if(this.CombatManager && this.CombatManager.currentCombat) await this.CombatManager.playerAction('attack'); break;
                case 'combat_flee': if(this.CombatManager && this.CombatManager.currentCombat) await this.CombatManager.playerAction('flee'); break;
                case 'combat_attempt_tame': if(this.CombatManager && this.CombatManager.currentCombat) await this.CombatManager.playerAction('attempt_tame'); break;
                case 'combat_use_talisman': if(this.CombatManager && this.CombatManager.currentCombat) await this.CombatManager.playerAction('use_talisman', value); break;
                case 'combat_use_item': if(this.CombatManager && this.CombatManager.currentCombat) await this.CombatManager.playerAction('use_combat_item', value); break;
                case 'combat_devour_essence': if(this.CombatManager && this.CombatManager.currentCombat && this.CombatManager.currentCombat.postCombatAction === 'devour_essence_prompt') await this.CombatManager.devourEssence(); break;
                case 'ignore_devour_essence': if(this.CombatManager && this.CombatManager.currentCombat) this.CombatManager.ignoreDevourEssence(); break;

                case 'forge_artifact': if(player && player.chosenClassKey === 'artifact_refiner' && typeof forgeArtifact === 'function') await forgeArtifact(); break;
                case 'draw_talisman': if(player && player.chosenClassKey === 'talisman_master' && typeof drawTalisman === 'function') await drawTalisman(); break;
                case 'sect_view_all': if(typeof viewAllSects === 'function') viewAllSects(); break;
                case 'sect_join_prompt': if(typeof joinSectPrompt === 'function') await joinSectPrompt(); break;
                case 'sect_view_mine': if(typeof viewMySectInfo === 'function') viewMySectInfo(); break;
                case 'sect_leave': if(typeof leaveMySect === 'function') leaveMySect(); break;
                case 'sect_back_to_main': if(typeof this.showLoggedInMenu === 'function') this.showLoggedInMenu(); break;
                default:
                    if(typeof displayMessage === 'function') displayMessage("Unknown action.", 'error');
                    if(player && typeof this.showLoggedInMenu === 'function') this.showLoggedInMenu(); else if(typeof showMainGate === 'function') showMainGate();
            }
        } catch (e) {
            console.error(`Error in handlePlayerChoice (${action}):`, e);
            if(typeof displayMessage === 'function') displayMessage("Action error.", "error");
            if (Game.currentPlayerId && typeof this.showLoggedInMenu === 'function') Game.showLoggedInMenu(); else if(typeof showMainGate === 'function') showMainGate();
        }
    },

    async rollSpiritualRoot() {
        console.log('game.js: rollSpiritualRoot called');
        const player = this.players[this.currentPlayerId];
        if (!player || player.hasRolledSpiritualRoot) return;
        const roll = Math.random() * 1000;
        let rootName = "", multiplier = 1, qualityMessage = "";
        if (roll < 150) { rootName = "Five Spiritual Roots"; multiplier = 1; qualityMessage = "Common root, slow progress."; }
        else if (roll < 400) { rootName = "Four Spiritual Roots"; multiplier = 2; qualityMessage = "Low talent, chaotic affinity."; }
        else if (roll < 700) { rootName = "Three Spiritual Roots"; multiplier = 4; qualityMessage = "Average talent. Focus is key."; }
        else if (roll < 900) { rootName = "Dual Spiritual Roots"; multiplier = 8; qualityMessage = "Good compatibility, balanced growth."; }
        else if (roll < 980) { rootName = "Single Spiritual Root"; multiplier = 16; qualityMessage = "Extremely rare, high purity, fast cultivation!"; }
        else if (roll < 995) { rootName = "Heavenly Spiritual Root"; multiplier = 32; qualityMessage = "Perfect harmony! Divine potential!"; }
        else { rootName = "Chaos Spiritual Root"; multiplier = 64; qualityMessage = "Mythical root of immense power!";}
        player.spiritualRootName = rootName; player.spiritualRootMultiplier = multiplier; player.hasRolledSpiritualRoot = true;
        if(typeof displayMessage === 'function') {
            displayMessage(`\nSpiritual Roots: <span class="spiritual-root">${rootName}</span>!`, 'important');
            displayMessage(qualityMessage, 'narration'); displayMessage(`Cultivation speed x${multiplier}.`, 'success');
        }
        await this.saveCurrentPlayerState();
        if(typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
        this.showLoggedInMenu();
    },

    showLoggedInMenu() { // This function itself needs to be part of Game
        console.log('game.js: showLoggedInMenu called');
        this.currentGameState = 'LOGGED_IN_MENU';
        if (createAccountFormContainer) createAccountFormContainer.style.display = 'none';
        if (loginFormContainer) loginFormContainer.style.display = 'none';
        if (gameOutput) gameOutput.innerHTML = '';
        const gameHeader = document.querySelector('header.mb-4');
        if (gameHeader) gameHeader.style.display = 'block';
        if (mainContentArea) mainContentArea.style.display = 'flex';
        if (actionButtonsContainer) actionButtonsContainer.style.display = 'grid'; // Changed from flex
        // if (statsPanelAside) statsPanelAside.style.display = 'block'; // Removed to let setMainView handle it

        if (combatInterface) combatInterface.style.display = 'none';
        if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
        if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none';
        if(gridInventoryModal) gridInventoryModal.style.display = 'none';
        if (marketMenuDiv) marketMenuDiv.style.display = 'none';
        if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
        const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
        if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
        if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
        if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
        if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
        if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
        if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";
        if (combatSpecificActions) combatSpecificActions.innerHTML = '';

        if (actionButtonsContainer) actionButtonsContainer.classList.remove('exploration-mode');
        const player = this.players[this.currentPlayerId]; if (!player) { if(typeof logout === 'function') logout(); return; }

        if (!player.hasRolledSpiritualRoot) {
            if(typeof displayMessage === 'function') displayMessage(`\nWelcome, ${player.name}. Your destiny awaits the revealing of your Spiritual Roots.`, 'system');
            if(typeof populateActionButtons === 'function' && actionButtonsContainer) populateActionButtons([
                { text: "Divine Your Spiritual Roots", action: "roll_spiritual_root", style: "divine" },
                { text: "Logout", action: "logout", style: "neutral" }
            ], actionButtonsContainer);
            if(typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
            return;
        }
        if (!player.hasClassChosen) {
            if(typeof showClassSelectionMenu === 'function') showClassSelectionMenu();
            return;
        }

        if (!player.isAlive()) {
            if(typeof displayMessage === 'function') displayMessage("\nIncapacitated. Recover health.", 'error'); player.health = Math.floor(player.maxHealth / 4);
            if(typeof displayMessage === 'function') displayMessage(`Recovered some health. HP: ${player.health}/${player.maxHealth}`, 'success');
            if (!player.isAlive() && typeof displayMessage === 'function') { displayMessage("Still weak. Meditate.", 'error');}
            this.saveCurrentPlayerState();
        }
        if(typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
        if(typeof displayMessage === 'function') displayMessage(`\n--- ${player.name}'s Journey (${player.getCultivationRealmName()}) ---`, 'system');

        let menuActions = [
            { text: "Meditate", action: "meditate", style: "confirm", tooltip: "Recover health and Qi.", iconPath: "assets/icons/meditateicon.png" },
            { text: "Explore Area", action: "explore", tooltip: "Venture into new lands to find resources or face challenges.", iconPath: "assets/icons/exploreicon.png" },
            { text: "Inventory", action: "toggle_grid_inventory", style: "special", tooltip: "View and manage your items.", iconPath: "assets/icons/inventoryicon.png" },
            { text: "Marketplace", action: "show_market_menu", style: "special", tooltip: "Trade items with other cultivators.", iconPath: "assets/icons/marketicon.png" },
            { text: "Tianji Pavilion", action: "show_tianji_pavilion", style: "special", tooltip: "Seek wisdom and uncover secrets. (Placeholder)" }, // No icon specified for Tianji
            { text: "Sect Hall", action: "manage_sects", style: "special", tooltip: "Interact with your sect or find a new one.", iconPath: "assets/icons/secthallicon.png" },
            { text: "Challenge Rival (PvP)", action: "pvp", style: "danger", tooltip: "Test your might against a formidable opponent." } // No specific PvP icon, might use dangerbuttontexture.png if applicable via CSS
        ];
        if (player.freeAttributePoints > 0) {
            menuActions.splice(3, 0, { text: `Allocate Points (${player.freeAttributePoints})`, action: "show_allocate_attributes", style: "confirm", iconPath: "assets/icons/allocatepointsicon.png" });
        }
        if (player.chosenClassKey === 'alchemist') {
            // Assuming basicqirecoverypill.png can represent concocting pills generally or a specific default.
            menuActions.splice(3, 0, { text: "Concoct Pills", action: "show_concoction_menu", style: "crafting_action", iconPath: "assets/icons/basicqirecoverypill.png" });
        }
        if (player.chosenClassKey === 'artifact_refiner') {
             menuActions.splice(4,0, { text: "Forge Artifact", action: "forge_artifact", style: "special" });
        } else if (player.chosenClassKey === 'talisman_master') {
             menuActions.splice(4,0, { text: "Draw Talisman", action: "draw_talisman", style: "special" });
        }
        menuActions.push({ text: "Logout", action: "logout", style: "neutral" });
        if(typeof populateActionButtons === 'function' && actionButtonsContainer) populateActionButtons(menuActions, actionButtonsContainer);
        this.setMainView('gameplay'); // Ensure correct view mode is set
    },

    setMainView(viewType) {
        console.log('game.js: setMainView called with viewType:', viewType);
        if (combatInterface) combatInterface.style.display = 'none';
        if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
        if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none';
        if (marketMenuDiv) marketMenuDiv.style.display = 'none';
        if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
        if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
        if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
        if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
        if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
        const attrAllocMenu = document.getElementById('attribute-allocation-menu');
        if (attrAllocMenu) attrAllocMenu.style.display = 'none';

        if (gameContainer) gameContainer.style.backgroundImage = "url('main.png')";
        if (gameOutput) gameOutput.style.display = 'block';
        if (actionButtonsContainer) actionButtonsContainer.style.display = 'grid';

        document.body.classList.remove('view-mode-gameplay', 'view-mode-profile');

        if (viewType === 'gameplay') {
            document.body.classList.add('view-mode-gameplay');
        } else if (viewType === 'profile') {
            document.body.classList.add('view-mode-profile');
        } else if (viewType === 'player_search') {
            document.body.classList.add('view-mode-gameplay');
        } else if (viewType === 'dedicated_exploration') {
            document.body.classList.add('view-mode-gameplay');
        }
        if (document.body.classList.contains('view-mode-profile') && this.players[this.currentPlayerId] && typeof updateStatsDisplay === 'function') {
            updateStatsDisplay(this.players[this.currentPlayerId]);
        }
    },

    loadPillDataFromCSV(csvData) {
        console.log('game.js: loadPillDataFromCSV called');
        if (!csvData) return;
        const lines = csvData.trim().split('\n');
        if (lines.length < 2) return; // Need header + at least one data line
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const elixirName = values[0];
            const ingredientsStr = values[1];
            const useDescription = values[2];

            const recipeKey = toCamelCase(elixirName); // toCamelCase from utils.js
            const pillItemKey = recipeKey + "Item";
            const recipeItemKey = recipeKey + "Recipe";

            const ingredients = {};
            ingredientsStr.split(' + ').forEach(ingFull => {
                const ingName = ingFull.trim();
                const ingKey = toCamelCase(ingName);
                if (this.ITEM_DATA[ingKey]) {
                    ingredients[ingKey] = (ingredients[ingKey] || 0) + 1;
                } else {
                    console.warn(`Unknown ingredient '${ingName}' (key: '${ingKey}') for pill '${elixirName}'. Define in ITEM_DATA or ensure image ${ingKey}.png exists.`);
                     if (!this.ITEM_DATA[ingKey]) { // Fallback: create basic material
                        this.ITEM_DATA[ingKey] = { name: ingName, description: `Herb for alchemy: ${ingName}.`, type: "material", tier: 1, gameAsset: ingKey + '.png' };
                        console.log(`Fallback: Created basic material for ${ingName} as ${ingKey}`);
                    }
                    ingredients[ingKey] = (ingredients[ingKey] || 0) + 1;
                }
            });

            let qiCost = 5 + Object.keys(ingredients).length * 3 + (elixirName.length / 2);
            let requiredLevel = 1;

            if (elixirName === "Foundation Establishment Pill") requiredLevel = 9;
            else if (elixirName === "Golden Core Nine Revolutions Pill") requiredLevel = 18;
            else if (elixirName === "Nascent Soul Unification Pill") requiredLevel = 27;
            else if (elixirName === "Soul Formation Heaven Pill") requiredLevel = 36;
            else if (elixirName === "Transcendence Void Elixir") requiredLevel = 45;
            else if (elixirName.includes("Advanced") || elixirName.includes("Core")) requiredLevel = 19;
            else if (elixirName.includes("Nascent Soul")) requiredLevel = 28;
            else if (useDescription.toLowerCase().includes("core cultivators")) requiredLevel = 19;
            else if (useDescription.toLowerCase().includes("nascent soul")) requiredLevel = 28;

            this.PILL_RECIPES[recipeKey] = {
                name: elixirName,
                recipeKey: recipeKey,
                ingredients: ingredients,
                producesItemKey: pillItemKey,
                productName: elixirName,
                useDescription: useDescription,
                qiCost: Math.floor(qiCost),
                requiredCultivationLevel: requiredLevel,
                isBasic: elixirName === "Basic Qi Recovery Pill"
            };

            if (!this.ITEM_DATA[pillItemKey]) {
                let isBreakthroughPill = (
                    elixirName === "Foundation Establishment Pill" ||
                    elixirName === "Golden Core Nine Revolutions Pill" ||
                    elixirName === "Nascent Soul Unification Pill" ||
                    elixirName === "Soul Formation Heaven Pill" ||
                    elixirName === "Transcendence Void Elixir"
                );
                let isPermanentStatPill = (
                    elixirName === "Starforge Strength Pill" ||
                    elixirName === "Agility Surge Pill"
                );

                this.ITEM_DATA[pillItemKey] = {
                    name: elixirName,
                    description: useDescription,
                    type: "consumable",
                    gameAsset: pillItemKey + '.png',
                    effect: function(player) { // 'this' will refer to the item object
                        if(typeof displayMessage === 'function') displayMessage(`Using ${this.name}...`, "item-use");
                        let healed = 0, qiRestored = 0;
                        let itemUsedSuccessfully = false;

                        if (elixirName === "Foundation Establishment Pill") {
                            if (player.cultivationLevel === 9 && player.cultivationProgress >= player.getXPForNextLevel()) {
                                player._performMajorBreakthrough(10, "Foundation Establishment"); itemUsedSuccessfully = true;
                            } else { if(typeof displayMessage === 'function') displayMessage("You are not ready for this breakthrough.", "error"); }
                        } else if (elixirName === "Golden Core Nine Revolutions Pill") {
                            if (player.cultivationLevel === 18 && player.cultivationProgress >= player.getXPForNextLevel()) {
                                player._performMajorBreakthrough(19, "Core Formation"); itemUsedSuccessfully = true;
                            } else { if(typeof displayMessage === 'function') displayMessage("You are not ready for this breakthrough.", "error"); }
                        } else if (elixirName === "Nascent Soul Unification Pill") {
                             if (player.cultivationLevel === 27 && player.cultivationProgress >= player.getXPForNextLevel()) {
                                player._performMajorBreakthrough(28, "Nascent Soul"); itemUsedSuccessfully = true;
                            } else { if(typeof displayMessage === 'function') displayMessage("You are not ready for this breakthrough.", "error"); }
                        } else if (elixirName === "Soul Formation Heaven Pill") {
                             if (player.cultivationLevel === 36 && player.cultivationProgress >= player.getXPForNextLevel()) {
                                player._performMajorBreakthrough(37, "Soul Formation"); itemUsedSuccessfully = true;
                            } else { if(typeof displayMessage === 'function') displayMessage("You are not ready for this breakthrough.", "error"); }
                        } else if (elixirName === "Transcendence Void Elixir") {
                             if (player.cultivationLevel === 45 && player.cultivationProgress >= player.getXPForNextLevel()) {
                                player._performMajorBreakthrough(46, "Transcendent"); itemUsedSuccessfully = true;
                            } else { if(typeof displayMessage === 'function') displayMessage("You are not ready for this breakthrough.", "error"); }
                        }
                        else if (this.name === "Basic Qi Recovery Pill") { qiRestored = 20 + Math.floor(player.cultivationLevel / 2); itemUsedSuccessfully = true; }
                        else if (this.name === "Vitality Rejuvenation Pill") { healed = 40 + player.cultivationLevel; player.currentQi = Math.min(player.maxQi, player.currentQi + 10); itemUsedSuccessfully = true;}
                        else if (this.name === "Mind-Calming Elixir") { player.currentQi = Math.min(player.maxQi, player.currentQi + 15); itemUsedSuccessfully = true;}
                        else if (this.name === "Advanced Spirit Pill") { qiRestored = 100 + player.cultivationLevel * 2; healed = 20; itemUsedSuccessfully = true;}
                        else if (this.name === "Nascent Soul Vital Pill") { qiRestored = 200 + player.cultivationLevel * 3; healed = 150 + player.cultivationLevel * 2; itemUsedSuccessfully = true;}
                        else if (this.name === "Starforge Strength Pill") { player.strength += 1; if(typeof displayMessage === 'function') displayMessage("Your physical strength permanently increases by 1!", "success"); itemUsedSuccessfully = true;}
                        else if (this.name === "Agility Surge Pill") { player.agility += 1; if(typeof displayMessage === 'function') displayMessage("Your agility permanently increases by 1!", "success"); itemUsedSuccessfully = true;} // Corrected to agility
                        else if (this.name === "Spirit-Eye Elixir") { qiRestored = 25; itemUsedSuccessfully = true;}
                        else if (this.name === "Flame Infusion Pill") { /* tempAttack = 5; */ if(typeof displayMessage === 'function') displayMessage("You feel a fiery surge!", "item-use"); itemUsedSuccessfully = true;}
                        else if (this.name === "Balance Harmonization Pill") { qiRestored = 30; healed = 10; if(typeof displayMessage === 'function') displayMessage("Your Qi feels more harmonious.", "item-use"); itemUsedSuccessfully = true;}


                        if (healed > 0) { player.health = Math.min(player.maxHealth, player.health + healed); if(typeof displayMessage === 'function') displayMessage(`Restored ${healed} HP.`, "success"); }
                        if (qiRestored > 0) { player.currentQi = Math.min(player.maxQi, player.currentQi + qiRestored); if(typeof displayMessage === 'function') displayMessage(`Restored ${qiRestored} QI.`, "qi-recovery"); }

                        if (itemUsedSuccessfully) {
                            player.resources[pillItemKey]--;
                        }
                    },
                    usableInCombat: !(isBreakthroughPill || isPermanentStatPill)
                };
            }

            if (elixirName !== "Basic Qi Recovery Pill" && !this.ITEM_DATA[recipeItemKey]) {
                this.ITEM_DATA[recipeItemKey] = {
                    name: `Recipe: ${elixirName}`,
                    description: `Teaches the method to concoct ${elixirName}. Ingredients: ${ingredientsStr.replace(/\s\+\s/g, ', ')}.`,
                    type: "recipe",
                    gameAsset: 'recipe.png',
                    learnsRecipeKey: recipeKey,
                    effect: function(player) {
                        if (!player.knownRecipes) player.knownRecipes = [];
                        const recipeKeyToLearn = this.learnsRecipeKey;
                        if (!player.knownRecipes.includes(recipeKeyToLearn)) {
                            player.knownRecipes.push(recipeKeyToLearn);
                            if(typeof displayMessage === 'function') displayMessage(`You learned the recipe for ${Game.PILL_RECIPES[recipeKeyToLearn].name}!`, "success");
                        } else {
                            if(typeof displayMessage === 'function') displayMessage(`You already know the recipe for ${Game.PILL_RECIPES[recipeKeyToLearn].name}.`, "narration");
                        }
                        player.resources[recipeItemKey]--;
                    }
                };
            }
        }
    }
};
