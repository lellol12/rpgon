function showMainGate() {
    console.log('client_auth.js: showMainGate called');
    // Assumes Game.currentGameState, Game.currentPlayerId, combatInterface, classSelectionInfoDiv, etc. are available
    // Assumes displayMessage, populateActionButtons, actionButtonsContainer, statName, etc. (UI elements) are available
    Game.currentGameState = 'MAIN_GATE';
    Game.currentPlayerId = null;
    if (combatInterface) combatInterface.style.display = 'none';
    if (classSelectionInfoDiv) classSelectionInfoDiv.style.display = 'none';
    if (inventoryMenuDiv) inventoryMenuDiv.style.display = 'none';
    if (gridInventoryModal) gridInventoryModal.style.display = 'none';
    if (marketMenuDiv) marketMenuDiv.style.display = 'none';
    if (marketListingsViewDiv) marketListingsViewDiv.style.display = 'none';
    if (concoctionMenuDiv) concoctionMenuDiv.style.display = 'none';
    if (sectCreationPanelDiv) sectCreationPanelDiv.style.display = 'none';
    if (sectDashboardPanelDiv) sectDashboardPanelDiv.style.display = 'none';
    if (playerSearchViewDiv) playerSearchViewDiv.style.display = 'none';
    const attrAllocMenu = document.getElementById('attribute-allocation-menu');
    if (attrAllocMenu) attrAllocMenu.style.display = 'none';

    if (createAccountFormContainer) createAccountFormContainer.style.display = 'none';
    if (loginFormContainer) loginFormContainer.style.display = 'none';
    if (genderSelectionContainer) genderSelectionContainer.style.display = 'none';

    const gameHeader = document.querySelector('header.mb-4');
    if (gameHeader) gameHeader.style.display = 'block';
    if (mainContentArea) mainContentArea.style.display = 'flex';
    if (actionButtonsContainer) actionButtonsContainer.style.display = 'grid'; // Changed from flex to grid
    if (statsPanelAside) statsPanelAside.style.display = 'none';
    if (gameOutput) gameOutput.innerHTML = '';
    if (chatFooter) chatFooter.style.display = 'none'; // Old chat
    if (sideChatPanel) sideChatPanel.classList.remove('active');
    document.body.classList.remove('chat-visible');

    if (typeof displayMessage === 'function') {
        displayMessage("=== Welcome to the Path of the Ascendant Dragon ===", 'important');
        displayMessage("A Wuxia Cultivation RPG", 'narration');
        displayMessage("\n--- Main Gate ---", 'system');
    }

    if (typeof populateActionButtons === 'function' && actionButtonsContainer) {
        populateActionButtons([
            { text: "Create Cultivator", action: "show_create_form_action", style: "confirm" },
            { text: "Login", action: "show_login_form_action", style: "confirm" },
            { text: "Exit (Reload Page)", action: "exit_game", style: "danger" }
        ], actionButtonsContainer);
    }
    if (statName) statName.textContent = "Nameless One";
    if (statClass) statClass.textContent = "Undetermined";
    if (statRealm) statRealm.textContent = "Mortal";
    if (statLevel) statLevel.textContent = "0";
    if (statSpiritualRoot) statSpiritualRoot.textContent = "Undetermined";
    if (statProgress) statProgress.textContent = "0/0 XP";
    if (statHealth) statHealth.textContent = "N/A";
    if (statQi) statQi.textContent = "N/A";
    if (statStrength) statStrength.textContent = "N/A";
    if (statAgility) statAgility.textContent = "N/A";
    if (statConstitution) statConstitution.textContent = "N/A";
    if (statSpirit) statSpirit.textContent = "N/A";
    if (statIntellect) statIntellect.textContent = "N/A";
    if (statWillpower) statWillpower.textContent = "N/A";
    if (statPhysAttack) statPhysAttack.textContent = "N/A";
    if (statPhysDefense) statPhysDefense.textContent = "N/A";
    if (statSpiritStones) statSpiritStones.textContent = "N/A";
    if (statGenderImage) { statGenderImage.style.display = 'none'; statGenderImage.src = ''; }
    if (statSect) statSect.textContent = "None";
    if (statDemonicCorruptionContainer) statDemonicCorruptionContainer.style.display = 'none';

    if (sideChatInput) {
        sideChatInput.disabled = true;
        sideChatInput.placeholder = "Login to chat...";
        sideChatInput.value = '';
    }
    if (sideChatSendButton) sideChatSendButton.disabled = true;
    if (sideChatLogContainer) sideChatLogContainer.innerHTML = '';
}

async function checkAndRestoreSessionUI() {
    console.log('client_auth.js: checkAndRestoreSessionUI called');
    const storedPlayerId = localStorage.getItem('currentPlayerId');
    if (storedPlayerId) {
        try {
            // This will be replaced by a call to auth_logic.js (e.g., via fetch)
            const playerDataFromServer = await auth_logic.checkAndRestoreSession_logic(storedPlayerId); // Placeholder

            if (playerDataFromServer) {
                const player = Player.fromFirestoreObject(playerDataFromServer.player); // Assuming Player class is available
                player.playerId = playerDataFromServer.player.playerId; // Ensure playerId is set

                Game.players[player.playerId] = player;
                Game.currentPlayerId = player.playerId;

                if (playerDataFromServer.sect) {
                     Game.sects[playerDataFromServer.sect.id] = Sect.fromFirestoreObject(playerDataFromServer.sect.data, playerDataFromServer.sect.id); // Assuming Sect class
                }

                if (typeof displayMessage === 'function') displayMessage(`Welcome back, ${player.name}! Session restored.`, 'success');
                if (sideChatInput) { sideChatInput.disabled = false; sideChatInput.placeholder = "Type your message..."; }
                if (sideChatSendButton) sideChatSendButton.disabled = false;
                Game.listenForChatMessages();
                Game.showLoggedInMenu();
                return true;
            } else {
                localStorage.removeItem('currentPlayerId');
            }
        } catch (error) {
            console.error("Error restoring session (UI):", error);
            localStorage.removeItem('currentPlayerId');
        }
    }
    return false;
}

function showCreateAccountForm() {
    console.log('client_auth.js: showCreateAccountForm called');
    Game.currentGameState = 'CREATE_ACCOUNT_FORM';
    const gameHeader = document.querySelector('header.mb-4');
    if (gameHeader) gameHeader.style.display = 'none';
    if (mainContentArea) mainContentArea.style.display = 'none';
    if (actionButtonsContainer) actionButtonsContainer.style.display = 'none';
    if (loginFormContainer) loginFormContainer.style.display = 'none';
    if (genderSelectionContainer) genderSelectionContainer.style.display = 'none';
    if (createAccountFormContainer) {
        createAccountFormContainer.style.display = 'block';
        if (typeof clearFormError === 'function') clearFormError('create');
        if (createUsernameInput) createUsernameInput.value = '';
        if (createPasswordInput) createPasswordInput.value = '';
        if (createEmailInput) createEmailInput.value = '';
        if (createUsernameInput) createUsernameInput.focus();
    }
    if (statsPanelAside) statsPanelAside.style.display = 'none';
    if (gameOutput) gameOutput.innerHTML = '';
    if (chatFooter) chatFooter.style.display = 'none';
}

function showLoginForm() {
    console.log('client_auth.js: showLoginForm called');
    Game.currentGameState = 'LOGIN_FORM';
    const gameHeader = document.querySelector('header.mb-4');
    if (gameHeader) gameHeader.style.display = 'none';
    if (mainContentArea) mainContentArea.style.display = 'none';
    if (actionButtonsContainer) actionButtonsContainer.style.display = 'none';
    if (createAccountFormContainer) createAccountFormContainer.style.display = 'none';
    if (genderSelectionContainer) genderSelectionContainer.style.display = 'none';
    if (loginFormContainer) {
        loginFormContainer.style.display = 'block';
        if (typeof clearFormError === 'function') clearFormError('login');
        if (loginUsernameInput) loginUsernameInput.value = '';
        if (loginPasswordInput) loginPasswordInput.value = '';
        if (loginUsernameInput) loginUsernameInput.focus();
    }
    if (statsPanelAside) statsPanelAside.style.display = 'none';
    if (gameOutput) gameOutput.innerHTML = '';
    if (chatFooter) chatFooter.style.display = 'none';
}

async function handleCreateAccountFormSubmitUI() {
    console.log('client_auth.js: handleCreateAccountFormSubmitUI called');
    if (typeof clearFormError === 'function') clearFormError('create');
    const u = createUsernameInput.value.trim();
    const p = createPasswordInput.value.trim();
    const email = createEmailInput.value.trim() || null;

    if (!u || !p) {
        if (typeof displayFormError === 'function') displayFormError('create', "Username and Password cannot be empty.");
        return;
    }

    try {
        // This will be replaced by a call to auth_logic.js (e.g., via fetch)
        const result = await auth_logic.handleCreateAccount_logic(u, p, email); // Placeholder

        if (result.error) {
            if (typeof displayFormError === 'function') displayFormError('create', result.error);
            return;
        }

        const newPlayer = Player.fromFirestoreObject(result.playerData); // Assuming Player class
        newPlayer.playerId = result.playerId;

        Game.players[newPlayer.playerId] = newPlayer;
        Game.currentPlayerId = newPlayer.playerId;
        localStorage.setItem('currentPlayerId', newPlayer.playerId);

        if (createAccountFormContainer) createAccountFormContainer.style.display = 'none';
        if (typeof displayMessage === 'function') displayMessage(`\nWelcome, ${newPlayer.name}! Account created. Now, choose your form.`, 'success');
        showGenderSelection();

    } catch (e) {
        console.error("Create Account Error (UI):", e);
        if (typeof displayMessage === 'function') displayMessage("Account creation error. Check console.", "error");
        showMainGate(); // Use client_auth's showMainGate
    }
}

function showGenderSelection() {
    console.log('client_auth.js: showGenderSelection called');
    Game.currentGameState = 'GENDER_SELECTION';
    const gameHeader = document.querySelector('header.mb-4');
    if (gameHeader) gameHeader.style.display = 'none';
    if (mainContentArea) mainContentArea.style.display = 'none';
    if (actionButtonsContainer) actionButtonsContainer.style.display = 'none';
    if (createAccountFormContainer) createAccountFormContainer.style.display = 'none';
    if (loginFormContainer) loginFormContainer.style.display = 'none';
    if (statsPanelAside) statsPanelAside.style.display = 'none';
    if (gameOutput) gameOutput.innerHTML = '';
    if (chatFooter) chatFooter.style.display = 'none';

    if (genderSelectionContainer) {
        genderSelectionContainer.style.display = 'block';
        const maleOption = document.getElementById('gender-select-male');
        // Ensure Game.handleGenderSelection is updated or this calls a client_auth version
        if (maleOption) maleOption.onclick = () => handleGenderSelectionUI('male');
        const femaleOption = document.getElementById('gender-select-female');
        if (femaleOption) femaleOption.onclick = () => handleGenderSelectionUI('female');
    }
}

async function handleGenderSelectionUI(selectedGender) {
    console.log('client_auth.js: handleGenderSelectionUI called with selectedGender:', selectedGender);
    const player = Game.players[Game.currentPlayerId];
    if (!player) {
        if (typeof displayMessage === 'function') displayMessage("Error: Player not found for gender selection.", "error");
        showMainGate(); // Use client_auth's showMainGate
        return;
    }
    player.gender = selectedGender;

    try {
        // This will be replaced by a call to auth_logic.js (e.g., via fetch)
        await auth_logic.handleGenderSelection_logic(Game.currentPlayerId, selectedGender); // Placeholder

        if (typeof displayMessage === 'function') displayMessage(`You have chosen the ${selectedGender} form.`, "success");

        if (genderSelectionContainer) genderSelectionContainer.style.display = 'none';
        if (sideChatInput) { sideChatInput.disabled = false; sideChatInput.placeholder = "Type your message..."; }
        if (sideChatSendButton) sideChatSendButton.disabled = false;
        Game.listenForChatMessages();
        Game.showLoggedInMenu();
    } catch (error) {
        console.error("Error saving gender (UI):", error);
        if (typeof displayMessage === 'function') displayMessage("Error saving gender. Check console.", "error");
        showMainGate(); // Use client_auth's showMainGate
    }
}

async function handleLoginFormSubmitUI() {
    console.log('client_auth.js: handleLoginFormSubmitUI called');
    if (typeof clearFormError === 'function') clearFormError('login');
    const u = loginUsernameInput.value.trim();
    const p = loginPasswordInput.value.trim();

    if (!u || !p) {
        if (typeof displayFormError === 'function') displayFormError('login', "Username and Password cannot be empty.");
        return;
    }

    try {
        // This will be replaced by a call to auth_logic.js (e.g., via fetch)
        const result = await auth_logic.handleLogin_logic(u, p); // Placeholder

        if (result.error) {
            if (typeof displayFormError === 'function') displayFormError('login', result.error);
            return;
        }

        const foundPlayer = Player.fromFirestoreObject(result.playerData); // Assuming Player class
        foundPlayer.playerId = result.playerId;

        Game.players[foundPlayer.playerId] = foundPlayer;
        Game.currentPlayerId = foundPlayer.playerId;

        if (result.sectData) {
            Game.sects[result.sectId] = Sect.fromFirestoreObject(result.sectData, result.sectId); // Assuming Sect class
        }

        if (loginFormContainer) loginFormContainer.style.display = 'none';
        if (genderSelectionContainer) genderSelectionContainer.style.display = 'none';

        localStorage.setItem('currentPlayerId', foundPlayer.playerId);
        if (typeof displayMessage === 'function') displayMessage(`Welcome back, ${foundPlayer.name}!`, 'success');

        if (sideChatInput) {
            sideChatInput.disabled = false;
            sideChatInput.placeholder = "Type your message...";
        }
        if (sideChatSendButton) sideChatSendButton.disabled = false;
        Game.listenForChatMessages();
        Game.showLoggedInMenu();
    } catch (e) {
        console.error("Login Error (UI):", e);
        if (typeof displayFormError === 'function') displayFormError('login', "Login error. Check console or try again.");
    }
}

function logout() {
    console.log('client_auth.js: logout called');
    if (Game.currentPlayerId && Game.players[Game.currentPlayerId]) {
        if (typeof displayMessage === 'function') displayMessage(`Safe travels, ${Game.players[Game.currentPlayerId].name}.`, 'narration');
    } else {
        if (typeof displayMessage === 'function') displayMessage("Logged out.", 'narration');
    }

    localStorage.removeItem('currentPlayerId');
    Game.stopListeningForChatMessages(); // Assuming this is client-side
    if (sideChatInput) {
        sideChatInput.disabled = true;
        sideChatInput.placeholder = "Login to chat...";
        sideChatInput.value = '';
    }
    if (sideChatSendButton) sideChatSendButton.disabled = true;
    if (sideChatLogContainer) sideChatLogContainer.innerHTML = '';
    document.body.classList.remove('chat-visible');

    if (Game.currentPlayerId) delete Game.players[Game.currentPlayerId];
    Game.currentPlayerId = null;
    showMainGate(); // Use client_auth's showMainGate
}

// API interaction layer for authentication
const auth_logic = {
    checkAndRestoreSession_logic: async (playerId) => {
        try {
            const response = await fetch(`/api/auth/session/${playerId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
                console.error("Session restore error:", errorData.error);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error("Network error during session restore:", error);
            return null;
        }
    },
    handleCreateAccount_logic: async (username, password, email) => {
        try {
            const response = await fetch('/api/auth/create_account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email })
            });
            return await response.json(); // Server sends back { success: true, playerId, playerData } or { error: ... }
        } catch (error) {
            console.error("Network error during account creation:", error);
            return { error: "Network error. Could not create account." };
        }
    },
    handleGenderSelection_logic: async (playerId, gender) => {
        try {
            const response = await fetch(`/api/player/${playerId}/gender`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gender })
            });
            return await response.json(); // Server sends back { success: true, message } or { error: ... }
        } catch (error) {
            console.error("Network error during gender selection:", error);
            return { error: "Network error. Could not save gender." };
        }
    },
    handleLogin_logic: async (username, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await response.json(); // Server sends back { success: true, playerId, playerData, sectData } or { error: ... }
        } catch (error) {
            console.error("Network error during login:", error);
            return { error: "Network error. Could not login." };
        }
    }
};
