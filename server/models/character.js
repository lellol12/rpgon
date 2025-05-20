// Server-side Character and Player classes
// Adapted from public/character.js

// It's assumed that gameData (ITEM_DATA, PILL_RECIPES, CLASS_STAT_GROWTH)
// will be passed or made available to these classes/methods where needed,
// e.g., via constructor, method parameters, or a shared context.
// For now, we'll placeholder direct access with comments.
// const gameData = require('../game_data'); // Example of how it might be imported

// Utility function (toCamelCase might be needed by Player.fromFirestoreObject if not handled elsewhere)
function toCamelCase(str) {
    if (!str) return '';
    let cleanedStr = str.replace(/[^a-zA-Z0-9\s]/g, '');
    return cleanedStr.toLowerCase()
        .replace(/\s+(.)/g, (match, chr) => chr.toUpperCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, (match, chr) => chr.toLowerCase());
}


class Character {
    constructor(name, str, agi, con, spr, intl, wil, cultivationLevel = 0) {
        this.name = name;
        this.strength = str;
        this.agility = agi;
        this.constitution = con;
        this.spirit = spr;
        this.intellect = intl;
        this.willpower = wil;

        this.cultivationLevel = cultivationLevel;
        this.cultivationProgress = 0;

        this.maxHealth = this.calculateMaxHealth();
        this.health = this.maxHealth;
        this.maxQi = this.calculateMaxQi();
        this.currentQi = this.maxQi;
    }

    calculateMaxHealth() { return 50 + (this.constitution || 0) * 10; }
    calculateMaxQi() { return 30 + (this.spirit || 0) * 10; }

    getTotalAttack() { return (this.strength || 0) * 2; }
    getPhysicalDefense() { return (this.constitution || 0) * 1; }
    getSpellPower() { return (this.spirit || 0) * 2; }

    isAlive() { return this.health > 0; }

    takeDamage(damage) {
        const actualDamage = Math.max(0, damage - this.getPhysicalDefense());
        this.health -= actualDamage;
        
        let eventMessages = [`${this.name} takes ${actualDamage} damage. (HP: ${this.health}/${this.maxHealth})`];
        if (!this.isAlive()) {
            eventMessages.push(`${this.name} has been defeated!`);
        }
        return { actualDamage, newHealth: this.health, newMaxHealth: this.maxHealth, isDefeated: !this.isAlive(), messages: eventMessages };
    }

    attackTarget(target) {
        if (!this.isAlive()) return { messages: [`${this.name} cannot attack, they are defeated.`] };

        const damageSourceAttack = this.getTotalAttack();
        const baseDamage = damageSourceAttack;
        const damageVariance = Math.floor(damageSourceAttack / 5);
        const damage = baseDamage + (Math.floor(Math.random() * (damageVariance * 2 + 1)) - damageVariance);

        const damageResult = target.takeDamage(damage);
        
        let eventMessages = [`${this.name} attacks ${target.name}!`];
        eventMessages = eventMessages.concat(damageResult.messages);

        return {
            attacker: this.name,
            target: target.name,
            damageDealt: damageResult.actualDamage,
            targetHealth: damageResult.newHealth,
            targetMaxHealth: damageResult.newMaxHealth,
            targetIsDefeated: damageResult.isDefeated,
            messages: eventMessages
        };
    }

    getCultivationRealmName() {
        const realms = ["Mortal", "Qi Condensation", "Foundation Establishment", "Core Formation", "Nascent Soul", "Soul Formation", "Transcendent"];
        if (this.cultivationLevel === 0) return realms[0];
        if (this.cultivationLevel >= 46) return realms[6];
        if (this.cultivationLevel >= 37) return realms[5];
        if (this.cultivationLevel >= 28) return realms[4];
        if (this.cultivationLevel >= 19) return realms[3];
        if (this.cultivationLevel >= 10) return realms[2];

        const qiCondensationStage = (this.cultivationLevel - 1) % 9 + 1;
        return `${realms[1]} Stage ${qiCondensationStage}`;
    }

    getXPForNextLevel() { return (this.cultivationLevel + 1) * 100; }

    gainCultivationXP(xp, classStatGrowthData = null, getRequiredPillNameFn = null) {
        let events = [];
        if (!this.isAlive()) {
            events.push({ type: 'info', message: `${this.name} is defeated and cannot gain XP.` });
            return { events, xpGained: 0, leveledUp: false };
        }

        // Check for major breakthrough pill requirement (specific to Player instances)
        if (this.isAtMajorBreakthrough && this.isAtMajorBreakthrough()) { // isAtMajorBreakthrough is a Player method
            const requiredPillName = getRequiredPillNameFn ? getRequiredPillNameFn.call(this) : "a specific breakthrough pill";
            events.push({ type: 'info', message: `${this.name} is at the peak of ${this.getCultivationRealmName()} and requires ${requiredPillName}. No further XP gained.` });
            return { events, xpGained: 0, leveledUp: false };
        }

        const finalXp = Math.floor(xp * (this.spiritualRootMultiplier || 1));
        let gainedEffectiveXP = finalXp;
        let leveledUp = false;

        // Cap XP gain if at a breakthrough level but not yet full (Player specific)
        if (this.isPlayer && classStatGrowthData) { // Assuming 'isPlayer' flag or similar for Player instances
            const levelBeforePotentialGain = this.cultivationLevel;
            const progressBeforePotentialGain = this.cultivationProgress;
            const xpToNextLevelBeforeGain = this.getXPForNextLevel();
            const isBreakthroughLevel = (levelBeforePotentialGain === 9 || levelBeforePotentialGain === 18 || levelBeforePotentialGain === 27 || levelBeforePotentialGain === 36 || levelBeforePotentialGain === 45);

            if (isBreakthroughLevel && progressBeforePotentialGain < xpToNextLevelBeforeGain) {
                const xpCanStillGain = xpToNextLevelBeforeGain - progressBeforePotentialGain;
                if (finalXp > xpCanStillGain) {
                    gainedEffectiveXP = xpCanStillGain;
                    this.cultivationProgress += gainedEffectiveXP;
                    events.push({ type: 'xp_gain', message: `${this.name} gained ${gainedEffectiveXP} cultivation experience.`});
                    const requiredPillName = getRequiredPillNameFn ? getRequiredPillNameFn.call(this) : "a specific breakthrough pill";
                    events.push({ type: 'breakthrough_gate', message: `${this.name} reached the peak of ${this.getCultivationRealmName()}. Requires ${requiredPillName} to break through!`});
                    return { events, xpGained: gainedEffectiveXP, leveledUp: false };
                }
            }
        }
        
        this.cultivationProgress += gainedEffectiveXP;
        if (gainedEffectiveXP > 0) {
            events.push({ type: 'xp_gain', message: `${this.name} gained ${gainedEffectiveXP} cultivation experience.`});
        }

        while (this.cultivationProgress >= this.getXPForNextLevel() && this.isAlive()) {
            leveledUp = true;
            this.cultivationProgress -= this.getXPForNextLevel();
            this.cultivationLevel += 1;
            events.push({ type: 'level_up', message: `Congratulations! ${this.name} has reached ${this.getCultivationRealmName()}!`, newLevel: this.cultivationLevel, newRealm: this.getCultivationRealmName() });

            if (this.isPlayer && classStatGrowthData) { // Player specific logic
                let pointsAwarded = 0;
                const cl = this.cultivationLevel;
                if (cl >= 1 && cl <= 9) pointsAwarded = 2;
                else if (cl >= 10 && cl <= 18) pointsAwarded = 3;
                else if (cl >= 19 && cl <= 27) pointsAwarded = 4;
                else if (cl >= 28 && cl <= 36) pointsAwarded = 5;
                else if (cl >= 37 && cl <= 45) pointsAwarded = 6;
                else if (cl >= 46) pointsAwarded = 8;
                this.freeAttributePoints = (this.freeAttributePoints || 0) + pointsAwarded;
                events.push({ type: 'attribute_points', message: `${this.name} gained ${pointsAwarded} free attribute points! Total: ${this.freeAttributePoints}.`, points: pointsAwarded });

                const growth = classStatGrowthData[this.chosenClassKey] || { str: 1, agi: 0, con: 1, spr: 1, intl: 0, wil: 0 }; // Default growth if class not found
                this.strength = (this.strength || 0) + (growth.str || 0);
                this.agility = (this.agility || 0) + (growth.agi || 0);
                this.constitution = (this.constitution || 0) + (growth.con || 0);
                this.spirit = (this.spirit || 0) + (growth.spr || 0);
                this.intellect = (this.intellect || 0) + (growth.intl || 0);
                this.willpower = (this.willpower || 0) + (growth.wil || 0);
                events.push({ type: 'stat_growth', message: `Class stat growth applied.`});
            } else { // Generic character growth
                this.constitution = (this.constitution || 0) + 1;
                this.spirit = (this.spirit || 0) + 1;
            }

            this.maxHealth = this.calculateMaxHealth();
            this.health = this.maxHealth; // Full heal on level up
            this.maxQi = this.calculateMaxQi();
            this.currentQi = this.maxQi; // Full Qi on level up

            if (this.isPlayer && this.isAtMajorBreakthrough && this.isAtMajorBreakthrough()) {
                 this.cultivationProgress = this.getXPForNextLevel(); // Fill XP to max for current level
                 const requiredPillName = getRequiredPillNameFn ? getRequiredPillNameFn.call(this) : "a specific breakthrough pill";
                 events.push({ type: 'breakthrough_gate', message: `${this.name} reached the peak of ${this.getCultivationRealmName()}. Requires ${requiredPillName} to break through!`});
                 break; // Stop gaining further levels until breakthrough
            }
        }
        return { events, xpGained: gainedEffectiveXP, leveledUp };
    }
}

class Player extends Character {
    constructor(username, password, email = null, playerId = null) {
        super(username, 5, 5, 5, 5, 5, 5, 1); // Base stats, level 1
        this.isPlayer = true; // Flag to identify Player instances
        this.username = username;
        this.password = password; // Password should be hashed before storing
        this.email = email;
        this.playerId = playerId; // Should be set by Firestore or passed in
        
        this.sectId = null;
        this.maxInventorySlots = 50;
        this.resources = { /* Initialized in fromFirestoreObject or by default */ };
        this.spiritualRootName = "Undetermined";
        this.spiritualRootMultiplier = 1;
        this.hasRolledSpiritualRoot = false;
        this.chosenClassName = "Undetermined";
        this.chosenClassKey = null;
        this.hasClassChosen = false;
        this.demonicCorruption = 0;
        this.sectRole = null;
        this.equippedItems = { weapon: null, body: null, head: null, accessory1: null, feet: null, ring1: null };
        this.gender = null;
        this.knownRecipes = [];
        this.freeAttributePoints = 0;
        this.weaponPhysicalAttackBonus = 0;

        // Initialize resources with defaults (can be overridden by fromFirestoreObject)
        this.setDefaultResources();

        // Recalculate health/qi based on initial stats
        this.maxHealth = this.calculateMaxHealth();
        this.health = this.maxHealth;
        this.maxQi = this.calculateMaxQi();
        this.currentQi = this.maxQi;
    }

    setDefaultResources(gameItemData = null, gamePillRecipes = null) {
        const defaultResources = {
            commonHerbs: 0, roughIronOre: 0, blankTalismanPaper: 0, monsterCoreWeak: 0,
            beastBoneFragment: 0, spiritDust: 0, spiritStoneFragment: 0, spiritStones: 0,
            minorHealingPill: 0, minorQiPill: 0, roughSword: 0, minorFireTalisman: 0,
            jadeleafGrass: 0, crimsonSpiritBerry: 0, soothingRainPetal: 0, moondewFlower: 0,
            earthrootGinseng: 0, skyLotusBud: 0, whisperingLeaf: 0, radiantSunfruit: 0,
            cloudmossVine: 0, spiritglowMushroom: 0, breakthroughVine: 0, dragonboneFern: 0,
            phoenixbloodHerb: 0, ascensionOrchid: 0, heavenpierceRoot: 0, divineFlameGrass: 0,
            lunarBloom: 0, immortalDustleaf: 0, voidberryThorn: 0, thunderclapFruit: 0,
            starforgePetal: 0, stoneheartRoot: 0, spiritEyeFlower: 0, heartblossomBud: 0,
            silverstormLeaf: 0, goldenDantianFruit: 0, blackflameGinseng: 0, frostmarrowMoss: 0,
            harmonizingBellvine: 0, eyeOfTheAncients: 0, spiritOreFragment: 0,
            enchantedStoneDust: 0, minorQiConductor: 0, demonCore: 0
        };
        // Add pill items and recipe items if data is available
        if (gameItemData && gamePillRecipes) {
            for (const recipeKey in gamePillRecipes) {
                const pillItemKey = gamePillRecipes[recipeKey].producesItemKey;
                if (!defaultResources.hasOwnProperty(pillItemKey)) {
                    defaultResources[pillItemKey] = 0;
                }
                const recipeItemKeyForPill = toCamelCase(gamePillRecipes[recipeKey].name) + "Recipe";
                if (!gamePillRecipes[recipeKey].isBasic && !defaultResources.hasOwnProperty(recipeItemKeyForPill)) {
                    defaultResources[recipeItemKeyForPill] = 0;
                }
            }
        }
        this.resources = { ...defaultResources, ...this.resources };
    }


    getTotalAttack() {
        return super.getTotalAttack() + (this.weaponPhysicalAttackBonus || 0);
    }

    isAtMajorBreakthrough() {
        const xpNeededForNext = this.getXPForNextLevel();
        if (this.cultivationProgress < xpNeededForNext) return false;
        const level = this.cultivationLevel;
        return (level === 9 || level === 18 || level === 27 || level === 36 || level === 45);
    }

    getRequiredBreakthroughPillName() {
        if (this.cultivationLevel === 9) return "Foundation Establishment Pill";
        if (this.cultivationLevel === 18) return "Golden Core Nine Revolutions Pill";
        if (this.cultivationLevel === 27) return "Nascent Soul Unification Pill";
        if (this.cultivationLevel === 36) return "Soul Formation Heaven Pill";
        if (this.cultivationLevel === 45) return "Transcendence Void Elixir";
        return null;
    }

    _performMajorBreakthrough(newCultivationLevel, newRealmShortName) {
        let events = [];
        this.cultivationProgress = 0;
        this.cultivationLevel = newCultivationLevel;

        this.strength = (this.strength || 0) + 3;
        this.agility = (this.agility || 0) + 3;
        this.constitution = (this.constitution || 0) + 3;
        this.spirit = (this.spirit || 0) + 3;
        this.intellect = (this.intellect || 0) + 3;
        this.willpower = (this.willpower || 0) + 3;

        this.maxHealth = this.calculateMaxHealth();
        this.maxQi = this.calculateMaxQi();
        this.health = this.maxHealth;
        this.currentQi = this.maxQi;

        this.maxInventorySlots = (this.maxInventorySlots || 50) + 50;
        events.push({type: 'inventory_expansion', message: `Inventory capacity expanded to ${this.maxInventorySlots} slots!`, newCapacity: this.maxInventorySlots});
        events.push({type: 'breakthrough_success', message: `Broken through to the ${newRealmShortName} realm! Reached ${this.getCultivationRealmName()}!`, newRealm: this.getCultivationRealmName()});
        return { success: true, events };
    }

    meditate() {
        let events = [];
        if (!this.isAlive()) {
            events.push({type: 'error', message: "Cannot meditate while defeated."});
            return { events };
        }
        events.push({type: 'info', message: `${this.name} enters a meditative state...`});

        let healthRecoveryPercent = 0.25;
        let qiRecoveryPercent = 0.25;

        if (this.chosenClassKey === 'qi_cultivator') {
            qiRecoveryPercent = 0.35;
            healthRecoveryPercent = 0.30;
            events.push({type: 'class_bonus', message: "Affinity for Qi enhances meditation."});
        }

        const healthRecovered = Math.floor(this.maxHealth * healthRecoveryPercent);
        const qiRecovered = Math.floor(this.maxQi * qiRecoveryPercent);

        this.health = Math.min(this.maxHealth, this.health + healthRecovered);
        this.currentQi = Math.min(this.maxQi, this.currentQi + qiRecovered);

        events.push({type: 'recovery', message: `Health recovered by ${healthRecovered}. Current Health: ${this.health}/${this.maxHealth}`});
        events.push({type: 'recovery', message: `Spiritual Energy (QI) recovered by ${qiRecovered}. Current QI: ${this.currentQi}/${this.maxQi}`});
        return { events, newHealth: this.health, newQi: this.currentQi };
    }

    toFirestoreObject() {
        console.log(`[Server Player.toFirestoreObject] For user: ${this.username}, this.password type: ${typeof this.password}, value: "${this.password}"`); // Diagnostic log
        // Ensure all resource keys defined in ITEM_DATA (including pills/recipes from CSV) are present
        const allResourceKeys = {};
        // This part needs access to the final ITEM_DATA from game_data.js
        // For now, we'll use a simplified default set.
        // In a real setup, Player class would be instantiated with gameData or have access to it.
        const tempDefaultResources = { commonHerbs: 0, roughIronOre: 0, /* ... other initial items */ };
        Object.keys(tempDefaultResources).forEach(key => allResourceKeys[key] = 0);
        // A more robust way: iterate ITEM_DATA from game_data.js to build allResourceKeys

        const resourcesToSave = { ...allResourceKeys, ...this.resources };
        
        const data = {
            username: this.username,
            // password: this.password, // Password should always be present and hashed on server.
                                     // If it's undefined here, it means an issue during Player instance creation from DB data.
                                     // However, to prevent Firestore error, we ensure it's not undefined.
            name: this.name, playerId: this.playerId,
            email: this.email, strength: this.strength, agility: this.agility, constitution: this.constitution,
            spirit: this.spirit, intellect: this.intellect, willpower: this.willpower,
            maxHealth: this.maxHealth, health: this.health,
            cultivationLevel: this.cultivationLevel, cultivationProgress: this.cultivationProgress,
            sectId: this.sectId,
            maxInventorySlots: this.maxInventorySlots,
            resources: resourcesToSave,
            spiritualRootName: this.spiritualRootName,
            spiritualRootMultiplier: this.spiritualRootMultiplier, hasRolledSpiritualRoot: this.hasRolledSpiritualRoot,
            chosenClassName: this.chosenClassName,
            chosenClassKey: this.chosenClassKey,
            hasClassChosen: this.hasClassChosen,
            maxQi: this.maxQi,
            currentQi: this.currentQi,
            demonicCorruption: this.demonicCorruption,
            equippedItems: this.equippedItems,
            weaponPhysicalAttackBonus: this.weaponPhysicalAttackBonus,
            knownRecipes: this.knownRecipes || [],
            freeAttributePoints: this.freeAttributePoints || 0,
            sectRole: this.sectRole,
            gender: this.gender
        };

        // Crucially, include password only if it's a valid string (the hash)
        // This prevents 'undefined' password field from causing Firestore errors.
        // Assumes this.password holds the correct hashed password from the DB.
        // If this.password could legitimately be undefined after fetching from DB (e.g. selective field fetch),
        // then the Player constructor or fromFirestoreObject should handle initializing it to null or a default.
        if (typeof this.password === 'string' && this.password.length > 0) {
            data.password = this.password;
        } else if (this.password === null) {
            // If password can be explicitly null in the DB and we want to preserve that
            // data.password = null; // Or omit if null shouldn't be written
        }
        // If this.password is undefined, it will be omitted by the conditional logic above.

        // Re-enable the loop that deletes other undefined properties.
        // This ensures no undefined fields are sent to Firestore.
        for (const key in data) {
            if (data[key] === undefined) {
                delete data[key];
            }
        }
        return data;
    }

    static fromFirestoreObject(docData, gameItemData = null, gamePillRecipes = null) {
        const player = new Player(docData.username, docData.password, docData.email || null, docData.playerId);
        
        // Initialize default resources, potentially using game data
        player.setDefaultResources(gameItemData, gamePillRecipes);

        const resourcesFromDb = docData.resources || {};
        Object.assign(player, {
            ...docData, // This will overwrite defaults if present in docData
            name: docData.name || docData.username, // Ensure name is set
            resources: { ...player.resources, ...resourcesFromDb } , // Merge DB resources over defaults
            strength: docData.strength || 5,
            agility: docData.agility || 5,
            constitution: docData.constitution || 5,
            spirit: docData.spirit || 5,
            intellect: docData.intellect || 5,
            willpower: docData.willpower || 5,
            knownRecipes: docData.knownRecipes || [],
            sectRole: docData.sectRole || null,
            freeAttributePoints: docData.freeAttributePoints || 0,
            gender: docData.gender || null,
            maxInventorySlots: docData.maxInventorySlots || 50,
            weaponPhysicalAttackBonus: Number(docData.weaponPhysicalAttackBonus) || 0,
            demonicCorruption: Number(docData.demonicCorruption) || 0,
        });

        const loadedEqData = docData.equippedItems || {};
        player.equippedItems = {
            weapon: loadedEqData.weapon || docData.equippedWeapon || null,
            body:   loadedEqData.body   || loadedEqData.armor  || null,
            head:   loadedEqData.head   || loadedEqData.helmet || null,
            feet:   loadedEqData.feet   || loadedEqData.boots  || null,
            ring1:  loadedEqData.ring1  || loadedEqData.ring   || null,
            accessory1: loadedEqData.accessory1 || null 
        };

        for (const key in player.resources) {
            player.resources[key] = Number(player.resources[key]) || 0;
        }
        
        player.maxHealth = player.calculateMaxHealth(); // Recalculate based on loaded stats
        player.health = Math.min(docData.health || player.maxHealth, player.maxHealth);
        player.maxQi = player.calculateMaxQi(); // Recalculate based on loaded stats
        player.currentQi = Math.min(docData.currentQi || player.maxQi, player.maxQi);
        
        return player;
    }

    // Sect interactions would need access to a SectManager or db instance on the server
    // For now, these are placeholders or would be handled by a service layer.
    joinSect(sectId /*, sectManager */) {
        // Logic to interact with sectManager or db to update player's sectId and sect's member list
        this.sectId = sectId;
        // this.sectRole = sectManager.getSectById(sectId).getDefaultRoleForNewMember(); // Example
        return { success: true, message: `Player ${this.name} joined sect ${sectId}.`};
    }

    leaveSect(/* sectManager */) {
        // Logic to interact with sectManager or db
        const oldSectId = this.sectId;
        this.sectId = null;
        this.sectRole = null;
        return { success: true, message: `Player ${this.name} left sect ${oldSectId}.`};
    }
}

module.exports = { Character, Player };
