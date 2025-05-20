class Character {
    constructor(name, str, agi, con, spr, intl, wil, cultivationLevel = 0) {
        console.log('character.js: Character constructor called for', name);
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

    calculateMaxHealth() { console.log('character.js: calculateMaxHealth called for', this.name); return 50 + (this.constitution || 0) * 10; }
    calculateMaxQi() { console.log('character.js: calculateMaxQi called for', this.name); return 30 + (this.spirit || 0) * 10; }

    getTotalAttack() { console.log('character.js: getTotalAttack called for', this.name); return (this.strength || 0) * 2; }
    getPhysicalDefense() { console.log('character.js: getPhysicalDefense called for', this.name); return (this.constitution || 0) * 1; }
    getSpellPower() { console.log('character.js: getSpellPower called for', this.name); return (this.spirit || 0) * 2; }

    isAlive() { console.log('character.js: isAlive called for', this.name); return this.health > 0; }

    takeDamage(damage) {
        console.log('character.js: takeDamage called for', this.name, 'with damage:', damage);
        const actualDamage = Math.max(0, damage - this.getPhysicalDefense());
        this.health -= actualDamage;
        let message = `${this.name} takes <strong class="text-yellow-300">${actualDamage}</strong> damage. (HP: ${this.health}/${this.maxHealth})`;
        if (!this.isAlive()) { message += ` ${this.name} has been defeated!`; }
        // const messageStyle = (this instanceof Player) ? 'combat-text-opponent-action' : 'combat-text-player-action'; // Player class not defined yet here
        // For now, let's assume if Game object exists and currentCombat, it's a player. This will be refined.
        const messageStyle = (typeof Game !== 'undefined' && Game.currentCombat && Game.currentCombat.player === this) ? 'combat-text-opponent-action' : 'combat-text-player-action';


        if (typeof Game !== 'undefined' && Game.currentCombat && Game.players && Game.currentPlayerId) {
             // Check if Game and its properties are defined before calling updateCombatUI
            if (typeof updateCombatUI === 'function' && Game.players[Game.currentPlayerId] && Game.currentCombat.opponent) {
                updateCombatUI(Game.players[Game.currentPlayerId], Game.currentCombat.opponent);
            }
        }
        return { actualDamage: actualDamage, message: message, style: messageStyle };
    }

    attackTarget(target) {
        console.log('character.js: attackTarget called for', this.name, 'targeting', target.name);
        if (!this.isAlive()) return;

        // const attackMessageStyle = (this instanceof Player) ? 'combat-text-player-action' : 'combat-text-opponent-action';
        const attackMessageStyle = (typeof Game !== 'undefined' && Game.currentCombat && Game.currentCombat.player === this) ? 'combat-text-player-action' : 'combat-text-opponent-action';

        const damageSourceAttack = this.getTotalAttack();

        if (typeof displayCombatAction === 'function') {
            displayCombatAction(`${this.name} attacks ${target.name}!`, attackMessageStyle);
        }


        const baseDamage = damageSourceAttack;
        const damageVariance = Math.floor(damageSourceAttack / 5);
        const damage = baseDamage + (Math.floor(Math.random() * (damageVariance * 2 + 1)) - damageVariance);

        const damageResult = target.takeDamage(damage);
        if (typeof appendCombatAction === 'function') {
            appendCombatAction(damageResult.message, damageResult.style);
        }
    }

    getCultivationRealmName() {
        console.log('character.js: getCultivationRealmName called for', this.name);
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

    getXPForNextLevel() { console.log('character.js: getXPForNextLevel called for', this.name); return (this.cultivationLevel + 1) * 100; }

    gainCultivationXP(xp) {
        console.log('character.js: gainCultivationXP called for', this.name, 'with xp:', xp);
        if (!this.isAlive()) return;

        if (this instanceof Player && this.isAtMajorBreakthrough()) {
            const requiredPillName = this.getRequiredBreakthroughPillName();
            if (typeof displayMessage === 'function') displayMessage(`You are at the peak of ${this.getCultivationRealmName()} and require a <span class="important">${requiredPillName}</span>. You are not gaining further experience.`, 'system');
            if (this instanceof Player) {
                if (typeof updateStatsDisplay === 'function') updateStatsDisplay(this);
                if (typeof Game !== 'undefined' && typeof Game.saveCurrentPlayerState === 'function') Game.saveCurrentPlayerState();
            }
            return;
        }

        const finalXp = Math.floor(xp * (this.spiritualRootMultiplier || 1));
        let gainedEffectiveXP = finalXp;

        if (this instanceof Player) {
            const player = this;
            const levelBeforePotentialGain = player.cultivationLevel;
            const progressBeforePotentialGain = player.cultivationProgress;
            const xpToNextLevelBeforeGain = player.getXPForNextLevel();

            const isCurrentlyAtBreakthroughLevelButNotFull = (
                (levelBeforePotentialGain === 9 || levelBeforePotentialGain === 18 || levelBeforePotentialGain === 27 || levelBeforePotentialGain === 36 || levelBeforePotentialGain === 45) &&
                progressBeforePotentialGain < xpToNextLevelBeforeGain
            );

            if (isCurrentlyAtBreakthroughLevelButNotFull) {
                const xpCanStillGain = xpToNextLevelBeforeGain - progressBeforePotentialGain;
                if (finalXp > xpCanStillGain) {
                    gainedEffectiveXP = xpCanStillGain;
                    player.cultivationProgress += gainedEffectiveXP;
                    if (typeof displayMessage === 'function') displayMessage(`${player.name} gained ${gainedEffectiveXP} cultivation experience.`, 'success');

                    const requiredPillName = player.getRequiredBreakthroughPillName();
                    if (typeof displayMessage === 'function') displayMessage(`You have reached the peak of ${player.getCultivationRealmName()}. You require a <span class="important">${requiredPillName}</span> to break through!`, 'system');
                    if (typeof displayMessage === 'function') displayMessage(`You are no longer gaining cultivation experience until you break through.`, 'system');

                    if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
                    if (typeof Game !== 'undefined' && typeof Game.saveCurrentPlayerState === 'function') Game.saveCurrentPlayerState();
                    return;
                }
            }
        }

        this.cultivationProgress += gainedEffectiveXP;
        if (gainedEffectiveXP > 0) {
            if (typeof displayMessage === 'function') displayMessage(`${this.name} gained ${gainedEffectiveXP} cultivation experience.`, 'success');
        }

        while (this.cultivationProgress >= this.getXPForNextLevel() && this.isAlive()) {
            this.cultivationProgress -= this.getXPForNextLevel();
            this.cultivationLevel += 1;

            if (this instanceof Player) {
                let pointsAwarded = 0;
                const cl = this.cultivationLevel;
                if (cl >= 1 && cl <= 9) pointsAwarded = 2;
                else if (cl >= 10 && cl <= 18) pointsAwarded = 3;
                else if (cl >= 19 && cl <= 27) pointsAwarded = 4;
                else if (cl >= 28 && cl <= 36) pointsAwarded = 5;
                else if (cl >= 37 && cl <= 45) pointsAwarded = 6;
                else if (cl >= 46) pointsAwarded = 8;
                this.freeAttributePoints = (this.freeAttributePoints || 0) + pointsAwarded;
                if (typeof displayMessage === 'function') displayMessage(`You gained <span class="important">${pointsAwarded}</span> free attribute points! You have ${this.freeAttributePoints} unspent.`, "success");
            }

            if (this instanceof Player && this.chosenClassKey && typeof Game !== 'undefined' && Game.CLASS_STAT_GROWTH && Game.CLASS_STAT_GROWTH[this.chosenClassKey]) {
                const growth = Game.CLASS_STAT_GROWTH[this.chosenClassKey];
                this.strength = (this.strength || 0) + (growth.str || 0);
                this.agility = (this.agility || 0) + (growth.agi || 0);
                this.constitution = (this.constitution || 0) + (growth.con || 0);
                this.spirit = (this.spirit || 0) + (growth.spr || 0);
                this.intellect = (this.intellect || 0) + (growth.intl || 0);
                this.willpower = (this.willpower || 0) + (growth.wil || 0);
                if (typeof displayMessage === 'function') displayMessage("Class-specific stat growth applied.", "system");
            } else {
                this.constitution = (this.constitution || 0) + 1;
                this.spirit = (this.spirit || 0) + 1;
                const otherAttrs = ['strength', 'agility', 'intellect', 'willpower'];
                const randomAttrToIncrease = otherAttrs[Math.floor(Math.random() * otherAttrs.length)];
                this[randomAttrToIncrease] = (this[randomAttrToIncrease] || 0) + 1;
                if (this instanceof Player && typeof displayMessage === 'function') {
                     displayMessage("Generic stat growth applied (no specific class plan found or class not chosen).", "system");
                }
            }

            this.maxHealth = this.calculateMaxHealth();
            this.health = this.maxHealth;
            this.maxQi = this.calculateMaxQi();
            this.currentQi = this.maxQi;

            if (typeof displayMessage === 'function') displayMessage(`Congratulations! ${this.name} has reached ${this.getCultivationRealmName()}!`, 'important');

            if (this instanceof Player) {
                const player = this;
                const currentLevel = player.cultivationLevel;
                const isMajorBreakthroughLevel = (currentLevel === 9 || currentLevel === 18 || currentLevel === 27 || currentLevel === 36 || currentLevel === 45);

                if (isMajorBreakthroughLevel) {
                    player.cultivationProgress = player.getXPForNextLevel();
                    const requiredPillName = player.getRequiredBreakthroughPillName();
                    if (typeof displayMessage === 'function') displayMessage(`You have reached the peak of ${player.getCultivationRealmName()}. You require a <span class="important">${requiredPillName}</span> to break through!`, 'system');
                    if (typeof displayMessage === 'function') displayMessage(`You are no longer gaining cultivation experience until you break through.`, 'system');

                    if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
                    if (typeof Game !== 'undefined' && typeof Game.saveCurrentPlayerState === 'function') Game.saveCurrentPlayerState();
                    return;
                }
            }
        }

        if (this instanceof Player) {
            if (typeof updateStatsDisplay === 'function') updateStatsDisplay(this);
            if (typeof Game !== 'undefined' && typeof Game.saveCurrentPlayerState === 'function') Game.saveCurrentPlayerState();
        }
    }
}

class Player extends Character {
    constructor(username, password, email = null) {
        console.log('character.js: Player constructor called for', username);
        super(username, 5, 5, 5, 5, 5, 5, 1);
        this.username = username; this.password = password;
        this.email = email;
        this.playerId = typeof generateId === 'function' ? generateId() : 'temp_id_' + Math.random(); // Use global generateId
        this.sectId = null;
        this.maxInventorySlots = 50;
        this.resources = {
            commonHerbs: 0, roughIronOre: 0, blankTalismanPaper: 0,
            monsterCoreWeak: 0, beastBoneFragment: 0, spiritDust: 0,
            spiritStoneFragment: 0, spiritStones: 0,
            minorHealingPill: 0, minorQiPill: 0,
            roughSword: 0, minorFireTalisman: 0,
            jadeleafGrass: 0, crimsonSpiritBerry: 0, soothingRainPetal: 0,
            moondewFlower: 0, earthrootGinseng: 0, skyLotusBud: 0,
            whisperingLeaf: 0, radiantSunfruit: 0, cloudmossVine: 0,
            spiritglowMushroom: 0,
            breakthroughVine: 0, dragonboneFern: 0, phoenixbloodHerb: 0,
            ascensionOrchid: 0, heavenpierceRoot: 0, divineFlameGrass: 0,
            lunarBloom: 0, immortalDustleaf: 0, voidberryThorn: 0,
            thunderclapFruit: 0,
            starforgePetal: 0, stoneheartRoot: 0, spiritEyeFlower: 0, heartblossomBud: 0,
            silverstormLeaf: 0, goldenDantianFruit: 0, blackflameGinseng: 0, frostmarrowMoss: 0,
            harmonizingBellvine: 0, eyeOfTheAncients: 0,
            spiritOreFragment: 0, enchantedStoneDust: 0, minorQiConductor: 0, demonCore: 0
        };
        this.spiritualRootName = "Undetermined";
        this.spiritualRootMultiplier = 1;
        this.hasRolledSpiritualRoot = false;
        this.chosenClassName = "Undetermined";
        this.chosenClassKey = null;
        this.hasClassChosen = false;
        this.demonicCorruption = 0;
        this.sectRole = null;
        this.equippedItems = {
            weapon: null, body: null, head: null,
            accessory1: null, feet: null, ring1: null
        };
        this.gender = null;
        this.knownRecipes = [];
        this.freeAttributePoints = 0;
        this.weaponPhysicalAttackBonus = 0; // Initialize this property

        this.maxHealth = this.calculateMaxHealth();
        this.health = this.maxHealth;
        this.maxQi = this.calculateMaxQi();
        this.currentQi = this.maxQi;
    }

    getTotalAttack() {
        console.log('character.js: Player.getTotalAttack called for', this.name);
        return (this.strength || 0) * 2 + (this.weaponPhysicalAttackBonus || 0);
    }

    isAtMajorBreakthrough() {
        console.log('character.js: isAtMajorBreakthrough called for', this.name);
        const xpNeededForNext = this.getXPForNextLevel();
        if (this.cultivationProgress < xpNeededForNext) return false;

        const level = this.cultivationLevel;
        return (level === 9 || level === 18 || level === 27 || level === 36 || level === 45);
    }

    getRequiredBreakthroughPillName() {
        console.log('character.js: getRequiredBreakthroughPillName called for', this.name);
        if (this.cultivationLevel === 9) return "Foundation Establishment Pill";
        if (this.cultivationLevel === 18) return "Golden Core Nine Revolutions Pill";
        if (this.cultivationLevel === 27) return "Nascent Soul Unification Pill";
        if (this.cultivationLevel === 36) return "Soul Formation Heaven Pill";
        if (this.cultivationLevel === 45) return "Transcendence Void Elixir";
        return null;
    }

    _performMajorBreakthrough(newCultivationLevel, newRealmShortName) {
        console.log('character.js: _performMajorBreakthrough called for', this.name, 'to level', newCultivationLevel, 'realm', newRealmShortName);
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
        if (typeof displayMessage === 'function') displayMessage(`Your inventory capacity has expanded to <span class="important">${this.maxInventorySlots}</span> slots!`, 'success');
        if (typeof displayMessage === 'function') displayMessage(`The pill surges through you! You have broken through to the <span class="important">${newRealmShortName}</span> realm!`, 'important');
        if (typeof displayMessage === 'function') displayMessage(`Congratulations! ${this.name} has reached ${this.getCultivationRealmName()}!`, 'important');
    }

    meditate() {
        console.log('character.js: meditate called for', this.name);
        if (!this.isAlive()) { if (typeof displayMessage === 'function') displayMessage("Cannot meditate while defeated.", 'error'); if (typeof Game !== 'undefined' && typeof Game.showLoggedInMenu === 'function') Game.showLoggedInMenu(); return; }
        if (typeof displayMessage === 'function') displayMessage(`\n${this.name} enters a meditative state...`, 'narration');

        let healthRecoveryPercent = 0.25;
        let qiRecoveryPercent = 0.25;

        if (this.chosenClassKey === 'qi_cultivator') {
            qiRecoveryPercent = 0.35;
            healthRecoveryPercent = 0.30;
            if (typeof displayMessage === 'function') displayMessage("Your affinity for Qi enhances your meditation.", 'class-info');
        }

        const healthRecovered = Math.floor(this.maxHealth * healthRecoveryPercent);
        const qiRecovered = Math.floor(this.maxQi * qiRecoveryPercent);

        this.health = Math.min(this.maxHealth, this.health + healthRecovered);
        this.currentQi = Math.min(this.maxQi, this.currentQi + qiRecovered);

        if (typeof displayMessage === 'function') displayMessage(`Health recovered by ${healthRecovered}. Current Health: ${this.health}/${this.maxHealth}`, 'success');
        if (typeof displayMessage === 'function') displayMessage(`Spiritual Energy (QI) recovered by ${qiRecovered}. Current QI: ${this.currentQi}/${this.maxQi}`, 'qi-recovery');

        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(this);
        if (typeof Game !== 'undefined' && typeof Game.saveCurrentPlayerState === 'function') Game.saveCurrentPlayerState();
        if (typeof Game !== 'undefined' && typeof Game.showLoggedInMenu === 'function') Game.showLoggedInMenu();
    }
    toFirestoreObject() {
        console.log('character.js: Player.toFirestoreObject called for', this.name);
        const defaultResources = {
            commonHerbs: 0, roughIronOre: 0, blankTalismanPaper: 0,
            monsterCoreWeak: 0, beastBoneFragment: 0, spiritDust: 0,
            spiritStoneFragment: 0, spiritStones: 0,
            minorHealingPill: 0, minorQiPill: 0,
            roughSword: 0, minorFireTalisman: 0,
            jadeleafGrass: 0, crimsonSpiritBerry: 0, soothingRainPetal: 0,
            moondewFlower: 0, earthrootGinseng: 0, skyLotusBud: 0,
            whisperingLeaf: 0, radiantSunfruit: 0, cloudmossVine: 0,
            spiritglowMushroom: 0,
            breakthroughVine: 0, dragonboneFern: 0, phoenixbloodHerb: 0,
            ascensionOrchid: 0, heavenpierceRoot: 0, divineFlameGrass: 0,
            lunarBloom: 0, immortalDustleaf: 0, voidberryThorn: 0,
            thunderclapFruit: 0,
            starforgePetal: 0, stoneheartRoot: 0, spiritEyeFlower: 0, heartblossomBud: 0,
            silverstormLeaf: 0, goldenDantianFruit: 0, blackflameGinseng: 0, frostmarrowMoss: 0,
            harmonizingBellvine: 0, eyeOfTheAncients: 0,
            spiritOreFragment: 0, enchantedStoneDust: 0, minorQiConductor: 0, demonCore: 0
        };
        // Ensure all known pill and recipe items from Game.PILL_RECIPES are in defaultResources
        if (typeof Game !== 'undefined' && Game.PILL_RECIPES) {
            for (const recipeKey in Game.PILL_RECIPES) {
                const pillRecipe = Game.PILL_RECIPES[recipeKey];
                if (pillRecipe && pillRecipe.producesItemKey && !defaultResources.hasOwnProperty(pillRecipe.producesItemKey)) {
                    defaultResources[pillRecipe.producesItemKey] = 0;
                }
                const recipeItemKey = toCamelCase(pillRecipe.name) + "Recipe";
                if (!pillRecipe.isBasic && !defaultResources.hasOwnProperty(recipeItemKey)) {
                    defaultResources[recipeItemKey] = 0;
                }
            }
        }

        const resourcesToSave = { ...defaultResources };
        for (const key in this.resources) {
            if (this.resources.hasOwnProperty(key)) {
                 // Ensure only known keys or non-undefined values are saved
                if (defaultResources.hasOwnProperty(key) || this.resources[key] !== undefined) {
                    resourcesToSave[key] = this.resources[key];
                }
            }
        }
        
        const data = {
            username: this.username, 
            // DO NOT include password in client-side saves to Firestore. 
            // Password is set at account creation (hashed on server) or via a specific password change flow.
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

        // Remove any top-level undefined fields to prevent Firestore errors
        for (const key in data) {
            if (data[key] === undefined) {
                delete data[key];
            }
        }
        return data;
    }

    static fromFirestoreObject(docData) {
        console.log('character.js: fromFirestoreObject called for', docData.username);
        const player = new Player(docData.username, docData.password, docData.email || null);
        const defaultResources = {
            commonHerbs: 0, roughIronOre: 0, blankTalismanPaper: 0,
            monsterCoreWeak: 0, beastBoneFragment: 0, spiritDust: 0,
            spiritStoneFragment: 0, spiritStones: 0,
            minorHealingPill: 0, minorQiPill: 0,
            roughSword: 0, minorFireTalisman: 0,
            jadeleafGrass: 0, crimsonSpiritBerry: 0, soothingRainPetal: 0,
            moondewFlower: 0, earthrootGinseng: 0, skyLotusBud: 0,
            whisperingLeaf: 0, radiantSunfruit: 0, cloudmossVine: 0,
            spiritglowMushroom: 0,
            breakthroughVine: 0, dragonboneFern: 0, phoenixbloodHerb: 0,
            ascensionOrchid: 0, heavenpierceRoot: 0, divineFlameGrass: 0,
            lunarBloom: 0, immortalDustleaf: 0, voidberryThorn: 0,
            thunderclapFruit: 0,
            starforgePetal: 0, stoneheartRoot: 0, spiritEyeFlower: 0, heartblossomBud: 0,
            silverstormLeaf: 0, goldenDantianFruit: 0, blackflameGinseng: 0, frostmarrowMoss: 0,
            harmonizingBellvine: 0, eyeOfTheAncients: 0,
            spiritOreFragment: 0, enchantedStoneDust: 0, minorQiConductor: 0, demonCore: 0
        };
        if (typeof Game !== 'undefined' && Game.PILL_RECIPES) {
            for (const recipeKey in Game.PILL_RECIPES) {
                const pillItemKey = Game.PILL_RECIPES[recipeKey].producesItemKey;
                if (!defaultResources.hasOwnProperty(pillItemKey)) {
                    defaultResources[pillItemKey] = 0;
                }
                const recipeItemKeyForPill = toCamelCase(Game.PILL_RECIPES[recipeKey].name) + "Recipe";
                if (!Game.PILL_RECIPES[recipeKey].isBasic && !defaultResources.hasOwnProperty(recipeItemKeyForPill)) {
                    defaultResources[recipeItemKeyForPill] = 0;
                }
            }
        }
        const resourcesFromDb = docData.resources || {};
        Object.assign(player, {
            ...docData,
            maxInventorySlots: docData.maxInventorySlots || 50,
            name: docData.name,
            resources: { ...defaultResources, ...resourcesFromDb } ,
            strength: docData.strength || 5,
            agility: docData.agility || 5,
            constitution: docData.constitution || 5,
            spirit: docData.spirit || 5,
            intellect: docData.intellect || 5,
            willpower: docData.willpower || 5,
            knownRecipes: docData.knownRecipes || [],
            sectRole: docData.sectRole || null,
            freeAttributePoints: docData.freeAttributePoints || 0,
            gender: docData.gender || null
        });

        const loadedEqData = docData.equippedItems || {};
        player.equippedItems = {
            weapon: loadedEqData.weapon || docData.equippedWeapon || null,
            body:   loadedEqData.body   || loadedEqData.armor  || null,
            head:   loadedEqData.head   || loadedEqData.helmet || null,
            feet:   loadedEqData.feet   || loadedEqData.boots  || null,
            ring1:  loadedEqData.ring1  || loadedEqData.ring   || null,
            accessory1: loadedEqData.accessory1 || null };

        for (const key in player.resources) {
            player.resources[key] = Number(player.resources[key]) || 0;
        }
        player.demonicCorruption = Number(player.demonicCorruption) || 0;
        player.weaponPhysicalAttackBonus = Number(docData.weaponPhysicalAttackBonus) || 0;
        player.maxHealth = player.calculateMaxHealth();
        player.health = Math.min(docData.health || player.maxHealth, player.maxHealth);
        player.maxQi = player.calculateMaxQi();
        player.currentQi = Math.min(docData.currentQi || player.maxQi, player.maxQi);
        return player;
    }
    joinSect(sectId) {
        console.log('character.js: joinSect called for', this.name, 'with sectId:', sectId);
        if (typeof Game !== 'undefined' && Game.sects && Game.sects[sectId]) {
            if (this.sectId) { if (typeof displayMessage === 'function') displayMessage(`Already in ${Game.sects[this.sectId].name}.`, 'error'); return; }
            Game.sects[sectId].addMember(this.playerId, this.name); // Pass player name
            this.sectId = sectId;
            if (Game.sects[sectId].members && Game.sects[sectId].members[this.playerId]) {
                this.sectRole = Game.sects[sectId].members[this.playerId].role;
                if (typeof displayMessage === 'function') displayMessage(`Joined ${Game.sects[sectId].name} as a ${this.sectRole}!`, 'success');
            } else {
                if (typeof displayMessage === 'function') displayMessage(`Joined ${Game.sects[sectId].name}! (Role not immediately set, check sect data)`, 'narration');
            }
        } else { if (typeof displayMessage === 'function') displayMessage("Sect not found.", 'error'); }
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(this);
        if (typeof Game !== 'undefined' && typeof Game.saveCurrentPlayerState === 'function') Game.saveCurrentPlayerState();
    }
    leaveSect() {
        console.log('character.js: leaveSect called for', this.name);
        if (this.sectId && typeof Game !== 'undefined' && Game.sects && Game.sects[this.sectId]) {
            const sectName = Game.sects[this.sectId].name;
            Game.sects[this.sectId].removeMember(this.playerId); this.sectId = null;
            this.sectRole = null;
            if (typeof displayMessage === 'function') displayMessage(`Left ${sectName}.`, 'narration');
        } else { if (typeof displayMessage === 'function') displayMessage("Not in a sect.", 'error'); }
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(this);
        if (typeof Game !== 'undefined' && typeof Game.saveCurrentPlayerState === 'function') Game.saveCurrentPlayerState();
    }
}
