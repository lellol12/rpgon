const CombatManager = {
    currentCombat: null,

    async startCombat(player, opponentDataFromServer) { // opponentDataFromServer is a plain object
        console.log('combat.js: startCombat called with player:', player.name, 'and opponent data:', opponentDataFromServer.name);
        
        // Instantiate a client-side Monster object
        const opponent = new Monster( // Monster class from public/monster.js
            opponentDataFromServer.name,
            opponentDataFromServer.maxHealth, // Monster constructor uses this for both maxHealth and initial health
            opponentDataFromServer.strength || 5, // Default if not provided
            opponentDataFromServer.agility || 5,
            opponentDataFromServer.constitution || 5,
            opponentDataFromServer.spirit || 5,
            opponentDataFromServer.intellect || 1,
            opponentDataFromServer.willpower || 1,
            opponentDataFromServer.cultivationLevel || 1,
            opponentDataFromServer.xpReward || 0,
            opponentDataFromServer.tamable || false,
            opponentDataFromServer.image || null
        );

        // If the server sent current health different from maxHealth (e.g. pre-damaged monster)
        if (opponentDataFromServer.health !== undefined && opponentDataFromServer.health < opponentDataFromServer.maxHealth) {
            opponent.health = opponentDataFromServer.health;
        }

        // Assumes Game.currentGameState, Game.setMainView, combatInterface, actionButtonsContainer, combatActionText,
        // displayMessage, updateCombatUI, Game.players, Game.currentPlayerId, Game.saveCurrentPlayerState,
        // Game.currentExploringAreaKey, Game.showDedicatedExplorationView, Game.showLoggedInMenu are available
        Game.currentGameState = 'COMBAT';
        Game.setMainView('gameplay');
        if (combatInterface) combatInterface.style.display = 'block';
        if (actionButtonsContainer) actionButtonsContainer.innerHTML = '';
        if (combatActionText) combatActionText.innerHTML = '';
        const attributeAllocationDiv = document.getElementById('attribute-allocation-menu');
        if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
        if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
        if (attributeAllocationDiv) attributeAllocationDiv.style.display = 'none';
        if(gridInventoryModal) gridInventoryModal.style.display = 'none';

        if (typeof displayMessage === 'function') displayMessage(`Encounter: ${opponent.name} (${opponent.getCultivationRealmName()})`, 'important');
        if (typeof updateCombatUI === 'function') updateCombatUI(player, opponent);

        this.currentCombat = {
            player: player,
            opponent: opponent,
            turn: 'player',
            postCombatAction: null,
        };
        this.promptPlayerAction();
    },

    async playerAction(action, itemKey) {
        console.log('combat.js: playerAction called with action:', action, 'and itemKey:', itemKey);
        if (!this.currentCombat || this.currentCombat.turn !== 'player' || !this.currentCombat.player.isAlive() || !this.currentCombat.opponent.isAlive()) return;
        const player = this.currentCombat.player;
        const opponent = this.currentCombat.opponent;

        if (action === 'attack') {
            player.attackTarget(opponent);
            if (typeof updateCombatUI === 'function') updateCombatUI(player, opponent);
        } else if (action === 'flee') {
            if (typeof displayCombatAction === 'function') displayCombatAction("Attempting to flee...", 'combat-text-narration');
            if (Math.random() < 0.5) {
                if (typeof displayMessage === 'function') displayMessage("Fled successfully!",'success');
                const areaKeyToReturnTo = Game.currentExploringAreaKey;
                this.currentCombat = null;
                if (areaKeyToReturnTo) {
                    Game.showDedicatedExplorationView(areaKeyToReturnTo);
                } else {
                    Game.showLoggedInMenu();
                }
                return;
            } else {
                if (typeof appendCombatAction === 'function') appendCombatAction("Failed to flee!", 'combat-text-opponent-action');
            }
        } else if (action === 'attempt_tame') {
            if (typeof displayCombatAction === 'function') displayCombatAction(`${player.name} attempts to tame the ${opponent.name}...`, 'combat-text-player-action');
            if (player.currentQi >= 15) {
                player.currentQi -= 15;
                if (typeof appendCombatAction === 'function') appendCombatAction(`The ${opponent.name} seems wary... (Taming WIP)`, 'combat-text-narration');
            } else {
                if (typeof appendCombatAction === 'function') appendCombatAction("Not enough QI to attempt taming!", 'error');
            }
            if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
            await Game.saveCurrentPlayerState();
        } else if (action === 'use_talisman') {
            const talismanData = Game.ITEM_DATA[itemKey];
            if (player.resources[itemKey] > 0 && talismanData && talismanData.effectInCombat) {
                if (talismanData.effectInCombat(player, opponent)) {
                    player.resources[itemKey]--;
                    if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
                    if (typeof updateCombatUI === 'function') updateCombatUI(player, opponent);
                }
            } else {
                if (typeof appendCombatAction === 'function') appendCombatAction("Cannot use this talisman now.", "error");
            }
        } else if (action === 'use_combat_item') {
             const combatItemData = Game.ITEM_DATA[itemKey];
             if (player.resources[itemKey] > 0 && combatItemData && combatItemData.usableInCombat && typeof combatItemData.effect === 'function') {
                 combatItemData.effect(player); // This should handle its own messages and stat updates
                 if (typeof updateCombatUI === 'function') updateCombatUI(player, opponent);
             } else {
                 if (typeof appendCombatAction === 'function') appendCombatAction("Cannot use this item now.", "error");
                 this.promptPlayerAction();
                 return;
             }
        } else {
            if (typeof displayCombatAction === 'function') displayCombatAction("Invalid action.",'error');
            this.promptPlayerAction(); return;
        }

        if (!opponent.isAlive()) {
            await this.endCombat(true);
        } else {
            this.currentCombat.turn = 'opponent';
            setTimeout(() => this.opponentTurn(), 1000);
        }
    },

    async opponentTurn() {
        console.log('combat.js: opponentTurn called');
        if (!this.currentCombat || this.currentCombat.turn !== 'opponent' || !this.currentCombat.opponent.isAlive() || !this.currentCombat.player.isAlive()) return;
        if (typeof displayCombatAction === 'function') displayCombatAction(`--- ${this.currentCombat.opponent.name}'s Turn ---`, 'combat-text-opponent-turn');
        setTimeout(async () => {
           this.currentCombat.opponent.attackTarget(this.currentCombat.player);
           if (typeof updateCombatUI === 'function') updateCombatUI(this.currentCombat.player, this.currentCombat.opponent);
           if (!this.currentCombat.player.isAlive()) {
               await this.endCombat(false);
           } else {
               this.currentCombat.turn = 'player';
               this.promptPlayerAction();
           }
        }, 1000);
    },

    promptPlayerAction() {
        console.log('combat.js: promptPlayerAction called');
        if (!this.currentCombat || !this.currentCombat.player.isAlive() || !this.currentCombat.opponent.isAlive()) return;
        if (typeof displayCombatAction === 'function') displayCombatAction(`--- Your Turn ---`, 'combat-text-player-turn');
        let combatActionsList = [
            { text: "Attack", action: "combat_attack", style: "danger" },
        ];

        const player = Game.players[Game.currentPlayerId]; // Assumes Game.players and Game.currentPlayerId are set
        if (Game.ITEM_DATA) { // Check if ITEM_DATA is loaded
            for (const itemKey in player.resources) {
                if (player.resources[itemKey] > 0 && Game.ITEM_DATA[itemKey] && Game.ITEM_DATA[itemKey].usableInCombat) {
                    const item = Game.ITEM_DATA[itemKey];
                    if (item.type === 'talisman') {
                         combatActionsList.push({ text: `Use ${item.name} (x${player.resources[itemKey]})`, action: 'combat_use_talisman', value: itemKey, style: 'special'});
                    } else if (item.type === 'consumable') {
                        combatActionsList.push({ text: `Use ${item.name} (x${player.resources[itemKey]})`, action: 'combat_use_item', value: itemKey, style: 'confirm'});
                    }
                }
            }
        }


        if (player.chosenClassKey === 'beast_tamer' && this.currentCombat.opponent.tamable) {
            combatActionsList.push({ text: "Attempt Tame (15 QI)", action: "combat_attempt_tame", style: "special" });
        }
        combatActionsList.push({ text: "Flee", action: "combat_flee", style: "neutral" });
        if (typeof populateActionButtons === 'function' && combatSpecificActions) {
             populateActionButtons(combatActionsList, combatSpecificActions);
        }
    },

    async endCombat(playerWon) {
        console.log('combat.js: endCombat called with playerWon:', playerWon);
        if (!this.currentCombat) return;
        if (combatInterface) combatInterface.style.display = 'none';
        if (combatSpecificActions) combatSpecificActions.innerHTML = '';
        const player = this.currentCombat.player;
        const opponent = this.currentCombat.opponent;

        if (playerWon) {
            if (typeof displayMessage === 'function') displayMessage(`${opponent.name} slain!`, 'success');
            let baseXp = opponent.xpReward || 0;

            if (player.chosenClassKey === 'heavenly_oracle' && Math.random() < 0.2) {
                const bonusXpOracle = Math.floor(baseXp * 0.15);
                baseXp += bonusXpOracle;
                if (typeof displayMessage === 'function') displayMessage("A Glimpse of Fortune blesses you with extra insight!", 'spiritual-root');
            }
            if (baseXp > 0) player.gainCultivationXP(baseXp);

            let lootFoundMessage = [];
            if (opponent instanceof Monster) { // Monster class needs to be defined
                const droppedLoot = opponent.getLootDrops(player);
                droppedLoot.forEach(lootItem => {
                    player.resources[lootItem.itemId] = (player.resources[lootItem.itemId] || 0) + lootItem.quantity;
                    if (Game.ITEM_DATA && Game.ITEM_DATA[lootItem.itemId]) {
                        lootFoundMessage.push(`${Game.ITEM_DATA[lootItem.itemId].name} (x${lootItem.quantity})`);
                    }
                });
            }

            if(lootFoundMessage.length > 0 && typeof displayMessage === 'function') {
                displayMessage(`Loot: ${lootFoundMessage.join(', ')}!`, "loot");
            }
            if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);


            if (opponent instanceof Player && typeof displayMessage === 'function') displayMessage("Duel victory! Reputation grows.", 'success'); // Player class needs to be defined

            if (player.chosenClassKey === 'demon_cultivator') {
                if (typeof displayMessage === 'function') displayMessage("The defeated foe's essence lingers... A dark opportunity presents itself.", 'demonic');
                this.currentCombat.postCombatAction = 'devour_essence_prompt';
                if (typeof populateActionButtons === 'function' && actionButtonsContainer) {
                    populateActionButtons([
                        { text: "Devour Essence", action: "combat_devour_essence", style: "danger" },
                        { text: "Ignore", action: "ignore_devour_essence", style: "neutral" }
                    ], actionButtonsContainer);
                }
                await Game.saveCurrentPlayerState();
                return;
            }

        } else {
            if (typeof displayMessage === 'function') displayMessage("Defeated...", 'error');
            player.health = 1;
            if (typeof displayMessage === 'function') displayMessage("Awakened, weakened.", 'narration');
            if (opponent instanceof Player) { // Player class needs to be defined
                player.cultivationProgress = Math.max(0, player.cultivationProgress - 20);
                if (typeof displayMessage === 'function') displayMessage("Humbling duel loss.", 'narration');
            }
        }
        await Game.saveCurrentPlayerState();
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);

        const areaKeyToReturnTo = Game.currentExploringAreaKey;
        this.currentCombat = null;

        if (areaKeyToReturnTo) {
            Game.showDedicatedExplorationView(areaKeyToReturnTo);
        } else {
            Game.showLoggedInMenu();
        }
    },

    ignoreDevourEssence() {
        console.log('combat.js: ignoreDevourEssence called');
        if (!this.currentCombat) return;
        this.currentCombat.postCombatAction = null;
        const areaKeyToReturnTo = Game.currentExploringAreaKey;
        this.currentCombat = null; // Clear combat state after handling post-combat action
        if (areaKeyToReturnTo) {
            Game.showDedicatedExplorationView(areaKeyToReturnTo);
        } else { Game.showLoggedInMenu(); }
    },

    async devourEssence() {
        console.log('combat.js: devourEssence called');
        if (!this.currentCombat) return;
        const player = this.currentCombat.player;
        if (!player || player.chosenClassKey !== 'demon_cultivator') return;

        const bonusXp = Math.floor(Math.random() * 20) + 10;
        const corruptionGain = Math.floor(Math.random() * 3) + 1;

        player.demonicCorruption = (player.demonicCorruption || 0) + corruptionGain;
        if (typeof displayMessage === 'function') {
            displayMessage(`You devour the lingering essence, gaining ${bonusXp} bonus Cultivation XP!`, 'demonic');
            displayMessage(`Your Demonic Corruption increases by ${corruptionGain}. Total: ${player.demonicCorruption}`, 'demonic');
        }
        player.gainCultivationXP(bonusXp);

        this.currentCombat.postCombatAction = null;
        const areaKeyToReturnTo = Game.currentExploringAreaKey;
        this.currentCombat = null; // Clear combat state after handling post-combat action
        if (areaKeyToReturnTo) {
            Game.showDedicatedExplorationView(areaKeyToReturnTo);
        } else {
            Game.showLoggedInMenu();
        }
    }
};

// Make CombatManager globally accessible or integrate it into the Game object in game.js
// For now, assuming Game object will call these methods like Game.CombatManager.startCombat(...)
// If Game object itself is not defined yet, this might need adjustment.
if (typeof Game !== 'undefined') {
    Game.CombatManager = CombatManager;
    // Overwrite Game's own combat methods if they existed directly on Game
    Game.startCombat = (player, opponent) => CombatManager.startCombat(player, opponent);
    Game.devourEssence = () => CombatManager.devourEssence();
    Game.ignoreDevourEssence = () => CombatManager.ignoreDevourEssence();
}
