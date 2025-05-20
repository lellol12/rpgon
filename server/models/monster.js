// Server-side Monster class
// Adapted from public/monster.js

const { Character } = require('./character'); // Assuming Character is exported from character.js

// Helper function to get realm tier, can be moved to a utility or Character class
function getRealmTierForLevel(cultivationLevel) {
    if (cultivationLevel >= 46) return 6;
    if (cultivationLevel >= 37) return 5;
    if (cultivationLevel >= 28) return 4;
    if (cultivationLevel >= 19) return 3;
    if (cultivationLevel >= 10) return 2;
    return 1;
}

class Monster extends Character {
    constructor(name, health, str, agi, con, spr, intl, wil, cultivationLevel, xpReward, tamable = false, image = null) {
        super(name, str, agi, con, spr, intl, wil, cultivationLevel);
        this.xpReward = xpReward;
        this.spiritualRootMultiplier = 1; // Monsters typically don't have varied spiritual roots affecting XP
        this.tamable = tamable;
        this.image = image; // For client-side display reference

        // Override health calculation if specific health is provided for monster
        this.maxHealth = health;
        this.health = health;
        // Qi can still be based on spirit or a fixed value for monsters
        this.maxQi = super.calculateMaxQi(); // Or a monster-specific calculation
        this.currentQi = this.maxQi;
    }

    // Monster-specific realm names
    getCultivationRealmName() {
        if (this.cultivationLevel < 5) return "Weak Beast";
        if (this.cultivationLevel < 15) return "Fierce Beast";
        if (this.cultivationLevel < 25) return "Demonic Beast";
        if (this.cultivationLevel < 35) return "Spirit Beast";
        return "Ancient Terror";
    }

    // Server-side adapted loot drop logic
    getLootDrops(player, currentAreaKey, gameData) {
        // gameData should contain ITEM_DATA, EXPLORATION_AREAS, PILL_RECIPES
        const { ITEM_DATA, EXPLORATION_AREAS, PILL_RECIPES } = gameData;
        let loot = [];

        const monsterRealmTier = getRealmTierForLevel(this.cultivationLevel);
        const playerRealmTier = getRealmTierForLevel(player.cultivationLevel);

        // Basic common drops
        if (Math.random() < 0.7) {
            const stonesFound = Math.floor(Math.random() * (playerRealmTier * 2)) + playerRealmTier;
            if (stonesFound > 0) loot.push({ itemId: 'spiritStones', quantity: stonesFound });
        }
        if (Math.random() < 0.5) { loot.push({ itemId: 'spiritStoneFragment', quantity: 1 }); }
        if (Math.random() < 0.25) { loot.push({ itemId: 'monsterCoreWeak', quantity: 1 }); }
        if (Math.random() < 0.15 && playerRealmTier > 1) { loot.push({ itemId: 'beastBoneFragment', quantity: 1 }); }

        // Area-specific loot
        if (currentAreaKey && EXPLORATION_AREAS && EXPLORATION_AREAS[currentAreaKey] && EXPLORATION_AREAS[currentAreaKey].lootTable) {
            const areaLootTable = EXPLORATION_AREAS[currentAreaKey].lootTable;
            areaLootTable.forEach(lootEntry => {
                if (Math.random() < lootEntry.chance) {
                    const quantity = Math.floor(Math.random() * (lootEntry.maxQuantity - lootEntry.minQuantity + 1)) + lootEntry.minQuantity;
                    if (quantity <= 0) return;

                    const itemData = ITEM_DATA ? ITEM_DATA[lootEntry.itemId] : null;

                    if (itemData && itemData.type === 'recipe') {
                        const recipeItemKey = lootEntry.itemId; // This should be the key for the recipe item itself, e.g. "basicQiRecoveryPillRecipe"
                        const recipeLearnsKey = itemData.learnsRecipeKey; // This is the key for the actual recipe definition, e.g. "basicQiRecoveryPill"
                        
                        const pillRecipe = PILL_RECIPES ? PILL_RECIPES[recipeLearnsKey] : null;
                        let canDropRecipe = true;
                        if (pillRecipe) {
                            canDropRecipe = player.cultivationLevel >= (pillRecipe.requiredCultivationLevel - 8) &&
                                            player.cultivationLevel <= (pillRecipe.requiredCultivationLevel + 8);
                        } else {
                            // console.warn(`Server: Recipe ${recipeLearnsKey} for item ${recipeItemKey} not found in PILL_RECIPES.`);
                            canDropRecipe = false;
                        }

                        if (canDropRecipe && (!player.knownRecipes || !player.knownRecipes.includes(recipeLearnsKey))) {
                             // Check if player already has the recipe item in inventory (less common check for recipe drops)
                            if (!player.resources || !player.resources[recipeItemKey] || player.resources[recipeItemKey] < 1) {
                                loot.push({ itemId: recipeItemKey, quantity: quantity });
                            }
                        }
                    } else if (itemData && itemData.type !== 'refining_material') { // Avoid double-dropping refining materials if handled below
                        loot.push({ itemId: lootEntry.itemId, quantity: quantity });
                    }
                }
            });
        } else {
            // console.warn(`Server: Monster defeated in area '${currentAreaKey}' which has no lootTable, or currentExploringAreaKey not set. Skipping area-specific loot.`);
        }

        // Refining material drops based on monster tier
        const REFINING_MATERIAL_GENERAL_DROP_CHANCE = 0.65;
        const REFINING_MATERIAL_PER_TIER_CHANCE = 0.8;

        if (this.cultivationLevel >= 1 && Math.random() < REFINING_MATERIAL_GENERAL_DROP_CHANCE && ITEM_DATA) {
            for (let tier = 1; tier <= monsterRealmTier; tier++) {
                if (Math.random() < REFINING_MATERIAL_PER_TIER_CHANCE) {
                    const materialsOfThisTier = [];
                    for (const itemKey in ITEM_DATA) {
                        const item = ITEM_DATA[itemKey];
                        if (item.type === 'refining_material' && item.tier === tier) {
                            materialsOfThisTier.push(itemKey);
                        }
                    }
                    if (materialsOfThisTier.length > 0) {
                        const chosenItemKey = materialsOfThisTier[Math.floor(Math.random() * materialsOfThisTier.length)];
                        // Ensure not to add duplicate item types, sum quantity if already present or add new
                        const existingLootEntry = loot.find(l => l.itemId === chosenItemKey);
                        if (existingLootEntry) {
                            existingLootEntry.quantity += 1;
                        } else {
                            loot.push({ itemId: chosenItemKey, quantity: 1 });
                        }
                    }
                }
            }
        }

        // Demon Core drop for higher-level monsters
        const DEMON_CORE_DROP_CHANCE = 0.15;
        if (this.cultivationLevel >= 19 && Math.random() < DEMON_CORE_DROP_CHANCE) {
            const existingLootEntry = loot.find(l => l.itemId === 'demonCore');
            if (existingLootEntry) {
                existingLootEntry.quantity += 1;
            } else {
                loot.push({ itemId: 'demonCore', quantity: 1 });
            }
        }
        
        // Filter out zero quantity items just in case
        return loot.filter(l => l.quantity > 0);
    }
}

module.exports = { Monster };
