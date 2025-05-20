async function drawTalisman() {
    console.log('talisman.js: drawTalisman called');
    // Assumes Game.players, Game.currentPlayerId, Game.saveCurrentPlayerState, Game.showLoggedInMenu,
    // Game.currentGameState, Game.currentExploringAreaKey, Game.showDedicatedExplorationView,
    // displayMessage, updateStatsDisplay are available.
    const player = Game.players[Game.currentPlayerId];
    if (!player || player.chosenClassKey !== 'talisman_master') {
        if (typeof displayMessage === 'function') displayMessage("Only Talisman Masters can draw talismans.", "error");
        Game.showLoggedInMenu(); // Or appropriate menu
        return;
    }
    if (typeof displayMessage === 'function') displayMessage("\nAttempting to draw a talisman...", "narration");
    if ((player.resources.blankTalismanPaper || 0) >= 1 && player.currentQi >= 5) {
        player.resources.blankTalismanPaper -= 1;
        player.currentQi -= 5;
        player.resources.minorFireTalisman = (player.resources.minorFireTalisman || 0) + 1;
        if (typeof displayMessage === 'function') displayMessage("Successfully drew a Minor Fire Talisman!", "success");
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay(player);
    } else {
        if (typeof displayMessage === 'function') displayMessage("Not enough Blank Talisman Paper (need 1) or QI (need 5).", "error");
    }
    await Game.saveCurrentPlayerState();
    if (Game.currentGameState === 'IN_DEDICATED_EXPLORATION' && Game.currentExploringAreaKey) {
        Game.showDedicatedExplorationView(Game.currentExploringAreaKey);
    } else {
        Game.showLoggedInMenu();
    }
}
