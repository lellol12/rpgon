const { Player } = require('./models/character'); // Corrected path
const { Monster } = require('./models/monster'); // Corrected path

// Helper to get monster details (simplified from client-side Game.getMonster)
function getMonsterForArea(areaKey, gameData) {
    const { EXPLORATION_AREAS, MONSTER_DATA } = gameData;
    if (!EXPLORATION_AREAS || !EXPLORATION_AREAS[areaKey] || !EXPLORATION_AREAS[areaKey].monsters || EXPLORATION_AREAS[areaKey].monsters.length === 0) {
        // console.warn(`Server: No monsters defined for area ${areaKey} or area data not found.`);
        return null; // Or a default fallback monster if desired
    }

    const possibleMonsters = EXPLORATION_AREAS[areaKey].monsters;
    const monsterKey = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];
    const monsterData = MONSTER_DATA[monsterKey];

    if (!monsterData) {
        // console.warn(`Server: Monster data not found for key: ${monsterKey}`);
        return null; // Or a fallback
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
}


module.exports = function(db, gameData) { // db is Firestore, gameData holds all static game definitions
    const { ITEM_DATA, PILL_RECIPES, EXPLORATION_AREAS, CLASS_STAT_GROWTH } = gameData;

    async function performDedicatedExplore_logic(playerId, areaKey) {
        console.log(`exploration_logic.js: performDedicatedExplore_logic for P:${playerId} A:${areaKey}`);
        const playerDocRef = db.collection("players").doc(playerId);
        let playerInstance;
        let events = []; // To collect messages and notable occurrences

        try {
            const playerSnapshot = await playerDocRef.get();
            if (!playerSnapshot.exists) {
                return { error: "Player not found.", updatedPlayer: null, events };
            }
            // Instantiate Player object
            playerInstance = Player.fromFirestoreObject(playerSnapshot.data(), ITEM_DATA, PILL_RECIPES);
            playerInstance.playerId = playerId; // Ensure playerId is set on the instance

            if (!playerInstance.isAlive()) {
                events.push({ type: 'info', message: "Too weak to explore." });
                return { error: "Too weak to explore.", updatedPlayer: playerInstance.toFirestoreObject(), events };
            }

            const areaData = EXPLORATION_AREAS[areaKey];
            if (!areaData) {
                events.push({ type: 'error', message: "Invalid area selected." });
                return { error: "Invalid area selected.", updatedPlayer: playerInstance.toFirestoreObject(), events };
            }

            const realmTierToQiCost = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6:8 }; // Tier 6 cost was missing, assumed 8
            const qiCost = realmTierToQiCost[areaData.requiredRealmTier] || 2;

            if (playerInstance.currentQi < qiCost) {
                events.push({ type: 'info', message: `Not enough Qi. Need ${qiCost}, have ${playerInstance.currentQi}.` });
                return { error: `Not enough Qi. Need ${qiCost}, have ${playerInstance.currentQi}.`, updatedPlayer: playerInstance.toFirestoreObject(), events };
            }

            playerInstance.currentQi -= qiCost;
            events.push({ type: 'qi_change', message: `Spent ${qiCost} Qi exploring.`, newQi: playerInstance.currentQi });

            let itemsFoundThisExplore = [];
            let foundSomething = false;
            let xpGainedThisExplore = 0;

            // Loot Table Processing
            if (areaData.lootTable && Math.random() < 0.65) { // Loot chance
                areaData.lootTable.forEach(lootEntry => {
                    if (Math.random() < lootEntry.chance) {
                        const quantity = Math.floor(Math.random() * (lootEntry.maxQuantity - lootEntry.minQuantity + 1)) + lootEntry.minQuantity;
                        if (quantity <=0) return;

                        const itemInfo = ITEM_DATA[lootEntry.itemId];

                        if (itemInfo && itemInfo.type === 'recipe') {
                            const recipeLearnsKey = itemInfo.learnsRecipeKey;
                            const pillRecipe = PILL_RECIPES[recipeLearnsKey];
                            let canDropRecipe = true;
                            if (pillRecipe) {
                                canDropRecipe = playerInstance.cultivationLevel >= (pillRecipe.requiredCultivationLevel - 5) &&
                                                playerInstance.cultivationLevel <= (pillRecipe.requiredCultivationLevel + 10);
                            } else {
                                // console.warn(`Server: Recipe ${recipeLearnsKey} for item ${lootEntry.itemId} not found.`);
                                canDropRecipe = false;
                            }

                            if (canDropRecipe && (!playerInstance.knownRecipes || !playerInstance.knownRecipes.includes(recipeLearnsKey))) {
                                 if (!playerInstance.resources[lootEntry.itemId] || playerInstance.resources[lootEntry.itemId] < 1) { // Check if player already has the recipe item
                                    playerInstance.resources[lootEntry.itemId] = (playerInstance.resources[lootEntry.itemId] || 0) + quantity;
                                    itemsFoundThisExplore.push({itemId: lootEntry.itemId, name: itemInfo.name, quantity: quantity});
                                    foundSomething = true;
                                 }
                            }
                        } else if (itemInfo) {
                            playerInstance.resources[lootEntry.itemId] = (playerInstance.resources[lootEntry.itemId] || 0) + quantity;
                            itemsFoundThisExplore.push({itemId: lootEntry.itemId, name: itemInfo.name, quantity: quantity});
                            foundSomething = true;
                        }
                    }
                });
            }
            if(itemsFoundThisExplore.length > 0) {
                events.push({type: 'loot', message: "Found items!", items: itemsFoundThisExplore});
            }


            // Alchemist Bonus
            if (playerInstance.chosenClassKey === 'alchemist' && Math.random() < 0.15) {
                if (areaData.lootTable && areaData.lootTable.length > 0) {
                    const randomBonusHerbEntry = areaData.lootTable[Math.floor(Math.random() * areaData.lootTable.length)];
                    const itemInfo = ITEM_DATA[randomBonusHerbEntry.itemId];
                    if (itemInfo && itemInfo.type === 'material') {
                        playerInstance.resources[randomBonusHerbEntry.itemId] = (playerInstance.resources[randomBonusHerbEntry.itemId] || 0) + 1;
                        const bonusItem = {itemId: randomBonusHerbEntry.itemId, name: `an extra ${itemInfo.name} (Alchemist bonus)`, quantity: 1};
                        itemsFoundThisExplore.push(bonusItem); // Also add to overall list for client
                        events.push({type: 'loot_bonus', message: "Alchemist bonus!", items: [bonusItem]});
                        foundSomething = true;
                    }
                }
            }
            
            let stealthOpportunity = false;
            if (playerInstance.chosenClassKey === 'poison_master' && Math.random() < 0.3) {
                stealthOpportunity = true;
                events.push({type: 'stealth_opportunity', message: "A chance for a stealthy approach!"});
            }

            let monsterEncountered = false;
            let monsterDetailsForClient = null;
            if (!stealthOpportunity && areaData.monsters && areaData.monsters.length > 0 && Math.random() < 0.7) {
                const monsterInstance = getMonsterForArea(areaKey, gameData);
                if (monsterInstance) {
                    monsterEncountered = true;
                    monsterDetailsForClient = {
                        name: monsterInstance.name,
                        health: monsterInstance.health, // Current health (usually full for new encounter)
                        maxHealth: monsterInstance.maxHealth,
                        strength: monsterInstance.strength,
                        agility: monsterInstance.agility,
                        constitution: monsterInstance.constitution,
                        spirit: monsterInstance.spirit,
                        intellect: monsterInstance.intellect,
                        willpower: monsterInstance.willpower,
                        cultivationLevel: monsterInstance.cultivationLevel,
                        xpReward: monsterInstance.xpReward,
                        tamable: monsterInstance.tamable,
                        image: monsterInstance.image
                    };
                    events.push({type: 'monster_encounter', message: `Encountered a ${monsterInstance.name}!`, monster: monsterDetailsForClient });
                }
            }

            if (!monsterEncountered && !stealthOpportunity) {
                if (!foundSomething) { // No loot, no monster, no stealth
                    const baseXp = Math.floor(Math.random() * (3 + playerInstance.cultivationLevel / 2)) + 2;
                    const xpResult = playerInstance.gainCultivationXP(baseXp, CLASS_STAT_GROWTH, playerInstance.getRequiredBreakthroughPillName);
                    xpGainedThisExplore += xpResult.xpGained;
                    events = events.concat(xpResult.events);
                    if (xpResult.xpGained > 0) foundSomething = true; // Gaining XP counts as "something"
                }
            }
            
            playerInstance.resources = playerInstance.resources || {}; // Ensure initialization
            playerInstance.knownRecipes = playerInstance.knownRecipes || [];

            await playerDocRef.set(playerInstance.toFirestoreObject());

            return {
                success: true,
                updatedPlayer: playerInstance.toFirestoreObject(),
                itemsFound: itemsFoundThisExplore, // Renamed for clarity
                xpGained: xpGainedThisExplore, // Renamed for clarity
                monsterEncountered: monsterEncountered,
                monsterDetails: monsterDetailsForClient,
                foundSomething: foundSomething, // Overall flag if anything happened
                stealthOpportunity: stealthOpportunity,
                events: events
            };

        } catch (error) {
            console.error("Error in performDedicatedExplore_logic:", error);
            const fallbackPlayerState = playerInstance ? playerInstance.toFirestoreObject() : (playerId ? {playerId} : null);
            events.push({type: 'error', message: "Server error during exploration."});
            return { error: "Server error during exploration.", updatedPlayer: fallbackPlayerState, events };
        }
    }

    async function resolveStealthAttempt_logic(playerId, areaKey) {
        console.log(`exploration_logic.js: resolveStealthAttempt_logic for P:${playerId} A:${areaKey}`);
        const playerDocRef = db.collection("players").doc(playerId);
        let playerInstance;
        let events = [];

        try {
            const playerSnapshot = await playerDocRef.get();
            if (!playerSnapshot.exists) {
                 return { success: false, message: "Player not found.", updatedPlayer: null, events };
            }
            playerInstance = Player.fromFirestoreObject(playerSnapshot.data(), ITEM_DATA, PILL_RECIPES);
            playerInstance.playerId = playerId;

            let xpGained = 0;
            let monsterDetailsForClient = null;
            let monsterEncountered = false;

            if (Math.random() < 0.7) { // Stealth success chance
                xpGained = Math.floor(Math.random() * 5) + 3;
                const xpResult = playerInstance.gainCultivationXP(xpGained, CLASS_STAT_GROWTH, playerInstance.getRequiredBreakthroughPillName);
                events = events.concat(xpResult.events);
                events.push({type: 'stealth_success', message: "Stealth successful!"});
                
                await playerDocRef.set(playerInstance.toFirestoreObject());
                return { 
                    success: true, 
                    message: "Stealth successful!", 
                    xpGained: xpResult.xpGained, // Actual XP gained after multipliers/caps
                    updatedPlayer: playerInstance.toFirestoreObject(),
                    events
                };
            } else {
                // Stealth failed, trigger monster encounter
                events.push({type: 'stealth_fail', message: "Stealth attempt failed! A creature noticed you!"});
                const monsterInstance = getMonsterForArea(areaKey, gameData);
                if (monsterInstance) {
                    monsterEncountered = true;
                    monsterDetailsForClient = {
                        name: monsterInstance.name,
                        health: monsterInstance.health,
                        maxHealth: monsterInstance.maxHealth,
                        strength: monsterInstance.strength,
                        agility: monsterInstance.agility,
                        constitution: monsterInstance.constitution,
                        spirit: monsterInstance.spirit,
                        intellect: monsterInstance.intellect,
                        willpower: monsterInstance.willpower,
                        cultivationLevel: monsterInstance.cultivationLevel,
                        xpReward: monsterInstance.xpReward,
                        tamable: monsterInstance.tamable,
                        image: monsterInstance.image
                    };
                    events.push({type: 'monster_encounter', message: `Encountered a ${monsterInstance.name} after failed stealth!`, monster: monsterDetailsForClient });
                }
                // No XP gain on failed stealth leading to combat
                await playerDocRef.set(playerInstance.toFirestoreObject()); // Save player state (e.g. if Qi was used for something before stealth)
                return { 
                    success: false, // Overall stealth failed
                    message: "Stealth attempt failed! A creature noticed you!",
                    updatedPlayer: playerInstance.toFirestoreObject(),
                    monsterEncountered: monsterEncountered,
                    monsterDetails: monsterDetailsForClient,
                    events
                };
            }
        } catch (error) {
            console.error("Error in resolveStealthAttempt_logic:", error);
            events.push({type: 'error', message: "Server error during stealth attempt."});
            const fallbackPlayerState = playerInstance ? playerInstance.toFirestoreObject() : (playerId ? {playerId} : null);
            return { success: false, message: "Server error during stealth attempt.", updatedPlayer: fallbackPlayerState, events };
        }
    }
    
    return {
        performDedicatedExplore_logic,
        resolveStealthAttempt_logic
    };
};
