class Monster extends Character {
    constructor(name, health, str, agi, con, spr, intl, wil, cultivationLevel, xpReward, tamable = false, image = null) {
        console.log('monster.js: Monster constructor called for', name);
        super(name, str, agi, con, spr, intl, wil, cultivationLevel);
        this.xpReward = xpReward;
        this.spiritualRootMultiplier = 1;
        this.tamable = tamable;
        this.image = image;

        this.maxHealth = health;
        this.health = health;
        this.maxQi = this.calculateMaxQi();
        this.currentQi = this.maxQi;
    }

    getCultivationRealmName() {
        console.log('monster.js: getCultivationRealmName called for', this.name);
        if (this.cultivationLevel < 5) return "Weak Beast";
        if (this.cultivationLevel < 15) return "Fierce Beast";
        if (this.cultivationLevel < 25) return "Demonic Beast";
        if (this.cultivationLevel < 35) return "Spirit Beast";
        return "Ancient Terror";
    }
    getLootDrops(player) {
        console.log('monster.js: getLootDrops called for', this.name, 'with player:', player.name);
        let loot = [];
        const currentAreaKey = (typeof Game !== 'undefined' && Game.currentExploringAreaKey) ? Game.currentExploringAreaKey : null;
        const monsterRealmTier = (typeof Game !== 'undefined' && typeof Game.getRealmTier === 'function') ? Game.getRealmTier(this.cultivationLevel) : 1;
        const playerRealmTier = (typeof Game !== 'undefined' && typeof Game.getRealmTier === 'function') ? Game.getRealmTier(player.cultivationLevel) : 1;


        if (Math.random() < 0.7) {
            const stonesFound = Math.floor(Math.random() * (playerRealmTier * 2)) + playerRealmTier;
            loot.push({itemId: 'spiritStones', quantity: stonesFound});
        }
        if (Math.random() < 0.5) { loot.push({itemId: 'spiritStoneFragment', quantity: 1});}
        if (Math.random() < 0.25) { loot.push({itemId: 'monsterCoreWeak', quantity: 1});}
        if (Math.random() < 0.15 && playerRealmTier > 1) { loot.push({itemId: 'beastBoneFragment', quantity: 1});}

        if (currentAreaKey && typeof Game !== 'undefined' && Game.EXPLORATION_AREAS && Game.EXPLORATION_AREAS[currentAreaKey] && Game.EXPLORATION_AREAS[currentAreaKey].lootTable) {
            const areaLootTable = Game.EXPLORATION_AREAS[currentAreaKey].lootTable;
            areaLootTable.forEach(lootEntry => {
                if (Math.random() < lootEntry.chance) {
                    const quantity = Math.floor(Math.random() * (lootEntry.maxQuantity - lootEntry.minQuantity + 1)) + lootEntry.minQuantity;
                    const itemData = (typeof Game !== 'undefined' && Game.ITEM_DATA) ? Game.ITEM_DATA[lootEntry.itemId] : null;

                    if (itemData && itemData.type === 'recipe') {
                        const recipeItemKey = lootEntry.itemId;
                        const recipeLearnsKey = itemData.learnsRecipeKey;
                        const pillRecipe = (typeof Game !== 'undefined' && Game.PILL_RECIPES) ? Game.PILL_RECIPES[recipeLearnsKey] : null;
                        let canDropRecipe = true;
                        if (pillRecipe) {
                            canDropRecipe = player.cultivationLevel >= (pillRecipe.requiredCultivationLevel - 8) &&
                                            player.cultivationLevel <= (pillRecipe.requiredCultivationLevel + 8);
                        } else {
                            console.warn(`Recipe ${recipeLearnsKey} for item ${recipeItemKey} not found in Game.PILL_RECIPES.`);
                            canDropRecipe = false;
                        }

                        if (canDropRecipe && (!player.knownRecipes || !player.knownRecipes.includes(recipeLearnsKey)) && (!player.resources[recipeItemKey] || player.resources[recipeItemKey] < 1)) {
                            loot.push({itemId: recipeItemKey, quantity: quantity});
                        }
                    } else if (itemData && itemData.type !== 'refining_material') {
                        loot.push({itemId: lootEntry.itemId, quantity: quantity});
                    }
                }
            });
        } else {
            console.warn(`Monster defeated in area '${currentAreaKey}' which has no lootTable, or currentExploringAreaKey not set. Skipping area-specific loot.`);
        }

        const REFINING_MATERIAL_GENERAL_DROP_CHANCE = 0.65;
        const REFINING_MATERIAL_PER_TIER_CHANCE = 0.8;

        if (this.cultivationLevel >= 1 && Math.random() < REFINING_MATERIAL_GENERAL_DROP_CHANCE) {
            for (let tier = 1; tier <= monsterRealmTier; tier++) {
                if (Math.random() < REFINING_MATERIAL_PER_TIER_CHANCE) {
                    const materialsOfThisTier = [];
                    if (typeof Game !== 'undefined' && Game.ITEM_DATA) {
                        for (const itemKey in Game.ITEM_DATA) {
                            const item = Game.ITEM_DATA[itemKey];
                            if (item.type === 'refining_material' && item.tier === tier) {
                                materialsOfThisTier.push(itemKey);
                            }
                        }
                    }
                    if (materialsOfThisTier.length > 0) {
                        const chosenItemKey = materialsOfThisTier[Math.floor(Math.random() * materialsOfThisTier.length)];
                        if (!loot.find(l => l.itemId === chosenItemKey)) {
                            loot.push({ itemId: chosenItemKey, quantity: 1 });
                        }
                    }
                }
            }
        }

        const DEMON_CORE_DROP_CHANCE = 0.15;
        if (this.cultivationLevel >= 19 && Math.random() < DEMON_CORE_DROP_CHANCE) {
            if (!loot.find(l => l.itemId === 'demonCore')) {
                loot.push({ itemId: 'demonCore', quantity: 1 });
            }
        }

        return loot;
    }
}
