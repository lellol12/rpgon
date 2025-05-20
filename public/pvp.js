async function pvpChallenge() {
    console.log('pvp.js: pvpChallenge called');
    // Assumes Game.players, Game.currentPlayerId, Game.setMainView, Game.getMonster (or similar for rival), Game.startCombat,
    // Player class, displayMessage, Game.showLoggedInMenu are available
    const player = Game.players[Game.currentPlayerId];
    if (!player) { Game.showMainGate(); return; }
    if (!player.isAlive()) {
        if (typeof displayMessage === 'function') displayMessage("Too weak for duel.", 'error');
        Game.showLoggedInMenu(); return;
    }
    Game.setMainView('gameplay'); // Ensure correct base layout

    const rL = Math.max(1, player.cultivationLevel + (Math.floor(Math.random()*5)-2));
    const rNs = ["Shadow Lin", "Azure Fang", "Silent Gao", "Crimson Hua", "Iron Fist Zhao"];
    const rN = rNs[Math.floor(Math.random()*rNs.length)];

    // Create rival as a Player object for consistent combat, but with stats set like a monster for simplicity
    const rival = new Player("rival_" + generateId(), "p", rN); // username, password, name. generateId from utils.js
    rival.cultivationLevel = rL;
    rival.strength = 5 + Math.floor(rL / 2);
    rival.constitution = 3 + Math.floor(rL / 3);
    rival.spirit = 4 + Math.floor(rL / 2.5);
    // Other attributes can be base or slightly randomized
    rival.maxHealth = rival.calculateMaxHealth() + rL * 5;
    rival.health = rival.maxHealth;
    rival.maxQi = rival.calculateMaxQi(); rival.currentQi = rival.maxQi;
    rival.resources.spiritStones = Math.floor(Math.random() * (rL * 5));

    if (typeof displayMessage === 'function') displayMessage(`\nRival ${rival.name} (${rival.getCultivationRealmName()}) challenges you to a duel!`, 'important');
    if (Game.CombatManager && typeof Game.CombatManager.startCombat === 'function') {
        await Game.CombatManager.startCombat(player, rival);
    } else {
        console.error("Game.CombatManager.startCombat is not a function or CombatManager is not initialized.");
        if(typeof displayMessage === 'function') displayMessage("Error initiating PvP combat sequence.", "error");
        Game.showLoggedInMenu(); // Fallback to main menu
    }
}
