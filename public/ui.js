// --- START: FRONTEND UI JAVASCRIPT ---
const gameOutput = document.getElementById('game-output');
const actionButtonsContainer = document.getElementById('action-buttons-container');
const combatInterface = document.getElementById('combat-interface');
const combatPlayerSprite = document.getElementById('combat-player-sprite');
const combatPlayerName = document.getElementById('combat-player-name');
const combatPlayerHbFill = document.getElementById('combat-player-hb-fill');
const combatPlayerHpText = document.getElementById('combat-player-hp-text');
const combatOpponentSprite = document.getElementById('combat-opponent-sprite');
const combatOpponentName = document.getElementById('combat-opponent-name');
const combatOpponentHbFill = document.getElementById('combat-opponent-hb-fill');
const combatOpponentHpText = document.getElementById('combat-opponent-hp-text');
const combatActionText = document.getElementById('combat-action-text');
const defaultOpponentSpriteHTML = combatOpponentSprite ? combatOpponentSprite.innerHTML : ''; // Store initial HTML for fallback
const combatSpecificActions = document.getElementById('combat-specific-actions');
const classSelectionInfoDiv = document.getElementById('class-selection-info');
const inventoryMenuDiv = document.getElementById('inventory-menu'); // Old menu, can be removed if not repurposed
const marketMenuDiv = document.getElementById('market-menu');
const marketListingsViewDiv = document.getElementById('market-listings-view');
const concoctionMenuDiv = document.getElementById('concoction-menu');
const playerSearchViewDiv = document.getElementById('player-search-view');
const sectDashboardPanelDiv = document.getElementById('sect-dashboard-panel');
const sectCreationPanelDiv = document.getElementById('sect-creation-panel');
const statsPanelAside = document.getElementById('stats-panel-aside');
const mainContentArea = document.querySelector('.main-content-area'); // For adjusting space-x
const gameOutputContainer = document.querySelector('.game-output-container');

const gameContainer = document.querySelector('.game-container'); // For background image
const hamburgerIcon = document.getElementById('hamburger-icon');
const sideMenu = document.getElementById('side-menu');
const chatFooter = document.querySelector('.chat-and-input-area'); // Old, likely to be removed

// New Inventory Modal Elements
const gridInventoryModal = document.getElementById('grid-inventory-modal');
const modalInventoryGridContainer = document.getElementById('modal-inventory-grid-container');
const closeInventoryModalButton = document.getElementById('close-inventory-modal-button');

// New Chat UI Elements
const chatToggleButton = document.getElementById('chat-toggle-button');
const sideChatPanel = document.getElementById('side-chat-panel');
const closeSideChatButton = document.getElementById('close-side-chat-button');
let sideChatLogContainer = document.getElementById('side-chat-log-container');
let sideChatInput = document.getElementById('side-chat-input');
let sideChatSendButton = document.getElementById('side-chat-send-button');

// Auth Form Elements
const createAccountFormContainer = document.getElementById('create-account-form-container');
const loginFormContainer = document.getElementById('login-form-container');
const genderSelectionContainer = document.getElementById('gender-selection-container');
const createUsernameInput = document.getElementById('create-username');
const createPasswordInput = document.getElementById('create-password');
const createEmailInput = document.getElementById('create-email');
const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const createFormErrorMessage = document.getElementById('create-form-error-message');
const loginFormErrorMessage = document.getElementById('login-form-error-message');
const statGenderImage = document.getElementById('stat-gender-image');

const statName = document.getElementById('stat-name');
const statClass = document.getElementById('stat-class');
const statRealm = document.getElementById('stat-realm');
const statLevel = document.getElementById('stat-level');
const statSpiritualRoot = document.getElementById('stat-spiritual-root');
const statProgress = document.getElementById('stat-progress');
const statHealth = document.getElementById('stat-health');
const statQi = document.getElementById('stat-qi');
const statStrength = document.getElementById('stat-strength');
const statAgility = document.getElementById('stat-agility');
const statConstitution = document.getElementById('stat-constitution');
const statSpirit = document.getElementById('stat-spirit');
const statIntellect = document.getElementById('stat-intellect');
const statWillpower = document.getElementById('stat-willpower');
const statPhysAttack = document.getElementById('stat-phys-attack');
const statPhysDefense = document.getElementById('stat-phys-defense');
const statSpiritStones = document.getElementById('stat-spirit-stones');
const statDemonicCorruptionContainer = document.getElementById('stat-demonic-corruption-container');
const statDemonicCorruption = document.getElementById('stat-demonic-corruption');
const statSect = document.getElementById('stat-sect');

const inputModal = document.getElementById('inputModal');
const modalPrompt = document.getElementById('modalPrompt');
const modalInputField = document.getElementById('modalInputField');
const modalPasswordInputField = document.getElementById('modalPasswordInputField');
const modalSubmitButton = document.getElementById('modalSubmitButton');
const modalCancelButton = document.getElementById('modalCancelButton');
const equipmentToast = document.getElementById('equipment-toast');
const equipmentToastMessage = document.getElementById('equipment-toast-message');
let equipmentToastTimeout = null;
let modalResolve = null;

const MAX_MESSAGES_IN_LOG = 15;

function showEquipmentToast(message) {
    console.log('ui.js: showEquipmentToast called with message:', message);
    if (!equipmentToast || !equipmentToastMessage) return;

    equipmentToastMessage.textContent = message;
    equipmentToast.style.display = 'block';
    equipmentToast.style.opacity = '1';

    if (equipmentToastTimeout) {
        clearTimeout(equipmentToastTimeout);
    }

    equipmentToastTimeout = setTimeout(() => {
        equipmentToast.style.display = 'none';
    }, 3000);
}

function displayFormError(formType, message) {
    console.log('ui.js: displayFormError called for formType:', formType, 'with message:', message);
    const errorDiv = formType === 'create' ? createFormErrorMessage : loginFormErrorMessage;
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}
function clearFormError(formType) {
    console.log('ui.js: clearFormError called for formType:', formType);
    const errorDiv = formType === 'create' ? createFormErrorMessage : loginFormErrorMessage;
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
}

function displayMessage(text, type = '') {
    console.log('ui.js: displayMessage called with text:', text, 'and type:', type);
    try {
        const p = document.createElement('p');
        p.innerHTML = String(text).replace(/\n/g, "<br>");
        if (type) p.classList.add(type);
        if (gameOutput) {
            gameOutput.appendChild(p);
            while (gameOutput.children.length > MAX_MESSAGES_IN_LOG) {
                gameOutput.removeChild(gameOutput.firstChild);
            }
            gameOutput.scrollTop = gameOutput.scrollHeight;
        } else { console.error("gameOutput element not found for displayMessage:", text); }
    } catch (error) { console.error("Error in displayMessage:", error, "Original text:", text); }
}

function displayCombatAction(message, styleClass = '') {
    console.log('ui.js: displayCombatAction called with message:', message, 'and styleClass:', styleClass);
    if (!combatActionText) return;
    combatActionText.innerHTML = '';
    appendCombatAction(message, styleClass);
}

function appendCombatAction(message, styleClass = '') {
    console.log('ui.js: appendCombatAction called with message:', message, 'and styleClass:', styleClass);
    if (!combatActionText) return;
    const p = document.createElement('p');
    p.innerHTML = String(message).replace(/\n/g, "<br>");
    if (styleClass) p.classList.add(styleClass);
    combatActionText.appendChild(p);
    combatActionText.scrollTop = combatActionText.scrollHeight;
}

function updateCombatUI(player, opponent) {
    console.log('ui.js: updateCombatUI called for player:', player.name, 'and opponent:', opponent.name);
    if (!combatInterface || !player || !opponent) return;
    if (combatPlayerName) combatPlayerName.textContent = player.name;
    const playerHpPercent = Math.max(0, (player.health / player.maxHealth) * 100);
    if (combatPlayerHbFill) combatPlayerHbFill.style.width = `${playerHpPercent}%`;
    if (combatPlayerHpText) combatPlayerHpText.textContent = `${player.health}/${player.maxHealth} HP`;
    if (combatPlayerSprite) combatPlayerSprite.className = 'pixel-art-sprite player-sprite';

    if (combatOpponentName) combatOpponentName.textContent = opponent.name;
    const opponentHpPercent = Math.max(0, (opponent.health / opponent.maxHealth) * 100);
    if (combatOpponentHbFill) combatOpponentHbFill.style.width = `${opponentHpPercent}%`;
    if (combatOpponentHpText) combatOpponentHpText.textContent = `${opponent.health}/${opponent.maxHealth} HP`;

    if (combatOpponentSprite) {
        combatOpponentSprite.innerHTML = '';
        if (opponent.image && opponent.image !== "null" && opponent.image !== "") {
            combatOpponentSprite.style.backgroundImage = `url('${opponent.image}')`;
            combatOpponentSprite.style.backgroundSize = 'contain';
            combatOpponentSprite.style.backgroundRepeat = 'no-repeat';
            combatOpponentSprite.style.backgroundPosition = 'center';
            combatOpponentSprite.style.backgroundColor = 'transparent';
            combatOpponentSprite.classList.remove('monster-sprite');
        } else {
            combatOpponentSprite.style.backgroundImage = 'none';
            combatOpponentSprite.innerHTML = defaultOpponentSpriteHTML;
            combatOpponentSprite.classList.add('monster-sprite');
        }
    }
}

function updateStatsDisplay(player) {
    console.log('ui.js: updateStatsDisplay called for player:', player ? player.name : 'null');
    if (!player) return;
    try {
        safeSetTextContent(statName, player.name);
        safeSetTextContent(statClass, player.chosenClassName || "Undetermined");
        safeSetTextContent(statRealm, player.getCultivationRealmName());
        safeSetTextContent(statLevel, player.cultivationLevel);
        if (statGenderImage) {
            if (player.gender === 'male') {
                statGenderImage.src = 'assets/UI/male.png'; statGenderImage.style.display = 'inline-block';
            } else if (player.gender === 'female') {
                statGenderImage.src = 'assets/UI/female.png'; statGenderImage.style.display = 'inline-block';
            } else { statGenderImage.style.display = 'none'; statGenderImage.src = ''; }
        }
        safeSetTextContent(statSpiritualRoot, player.spiritualRootName || "Undetermined");
        safeSetTextContent(statProgress, `${player.cultivationProgress}/${player.getXPForNextLevel()} XP`);
        safeSetTextContent(statHealth, `${player.health}/${player.maxHealth}`);
        safeSetTextContent(statQi, `${player.currentQi}/${player.maxQi}`);
        safeSetTextContent(statStrength, player.strength);
        safeSetTextContent(statAgility, player.agility);
        safeSetTextContent(statConstitution, player.constitution);
        safeSetTextContent(statSpirit, player.spirit);
        safeSetTextContent(statIntellect, player.intellect);
        safeSetTextContent(statWillpower, player.willpower);
        safeSetTextContent(statPhysAttack, player.getTotalAttack());
        safeSetTextContent(statPhysDefense, player.getPhysicalDefense());
        safeSetTextContent(statSpiritStones, player.resources.spiritStones !== undefined ? player.resources.spiritStones : 0);
        safeSetTextContent(statSect, player.sectId && Game.sects[player.sectId] ? Game.sects[player.sectId].name : "None");

        if (typeof updateProfileEquipmentSlotsUI === 'function') {
            updateProfileEquipmentSlotsUI(player);
        } else {
            console.warn("updateProfileEquipmentSlotsUI function is not defined. Equipment slots will not be updated in the profile stats display.");
        }

        if (statDemonicCorruptionContainer && statDemonicCorruption) {
            if (player.chosenClassKey === 'demon_cultivator' && player.demonicCorruption > 0) {
                statDemonicCorruption.textContent = player.demonicCorruption;
                statDemonicCorruptionContainer.style.display = 'block';
            } else {
                statDemonicCorruptionContainer.style.display = 'none';
            }
        }
    } catch (error) { console.error("Error updating stats display:", error); displayMessage("Error updating player stats.", "error");}
}

function populateModalInventoryGrid(player) {
    console.log('ui.js: populateModalInventoryGrid called for player:', player ? player.name : 'null');
    if (!modalInventoryGridContainer) {
        console.error("Modal inventory grid container not found!");
        return;
    }
    modalInventoryGridContainer.innerHTML = '';

    if (!player || !player.resources) {
        const emptySlot = document.createElement('div');
        emptySlot.classList.add('inventory-slot');
        const nameDiv = document.createElement('div');
        nameDiv.classList.add('inventory-slot-name');
        nameDiv.textContent = 'N/A';
        emptySlot.appendChild(nameDiv);
        modalInventoryGridContainer.appendChild(emptySlot);
        return;
    }

    const itemsToDisplay = [];
    const sortedItemKeys = Object.keys(player.resources).sort((a, b) => {
        const itemA = Game.ITEM_DATA[a];
        const itemB = Game.ITEM_DATA[b];
        if (!itemA || !itemB) return 0;
        return (itemA.name || a).localeCompare(itemB.name || b);
    });

    for (const itemKey of sortedItemKeys) {
        if (player.resources[itemKey] > 0 && Game.ITEM_DATA[itemKey] && Game.ITEM_DATA[itemKey].type !== 'currency') {
            itemsToDisplay.push({ key: itemKey, quantity: player.resources[itemKey], data: Game.ITEM_DATA[itemKey] });
        }
    }

    const totalSlots = player.maxInventorySlots || 50;

    for (let i = 0; i < totalSlots; i++) {
        const slotDiv = document.createElement('div');
        slotDiv.classList.add('inventory-slot');

        const frameDiv = document.createElement('div');
        frameDiv.classList.add('inventory-slot-frame');

        if (i < itemsToDisplay.length) {
            const item = itemsToDisplay[i];
            slotDiv.classList.add('has-item');
            frameDiv.title = `${item.data.name} (x${item.quantity})\n${item.data.description || ''}`;

            const iconDiv = document.createElement('div');
            iconDiv.classList.add('inventory-slot-icon');

            if (item.data.gameAsset) {
                iconDiv.style.backgroundImage = `url('${item.data.gameAsset}')`;
                iconDiv.textContent = '';
                iconDiv.style.backgroundSize = 'contain';
                iconDiv.style.backgroundRepeat = 'no-repeat';
                iconDiv.style.backgroundPosition = 'center';
            } else if (item.data.iconChar) {
                iconDiv.style.backgroundImage = 'none';
                iconDiv.textContent = item.data.iconChar;
            } else {
                iconDiv.style.backgroundImage = 'none';
                iconDiv.textContent = item.data.name ? item.data.name.substring(0, 1).toUpperCase() : '?';
            }
            frameDiv.appendChild(iconDiv);

            const nameDiv = document.createElement('div');
            nameDiv.classList.add('inventory-slot-name');
            nameDiv.textContent = item.data.name || 'Unknown Item';

            if (item.quantity > 0) {
                const quantityDiv = document.createElement('div');
                quantityDiv.classList.add('inventory-slot-quantity');
                quantityDiv.textContent = `x${item.quantity}`;
                frameDiv.appendChild(quantityDiv);
            }

            slotDiv.appendChild(frameDiv);
            slotDiv.appendChild(nameDiv);

            frameDiv.onclick = () => Game.promptUseItem(item.key, item.data.name);
        } else {
            slotDiv.appendChild(frameDiv);
            const emptyNameDiv = document.createElement('div');
            emptyNameDiv.classList.add('inventory-slot-name');
            emptyNameDiv.innerHTML = '&nbsp;';
            slotDiv.appendChild(emptyNameDiv);
        }
        modalInventoryGridContainer.appendChild(slotDiv);
    }
}

function populateActionButtons(choices, containerElement) {
    console.log('ui.js: populateActionButtons called with', choices ? choices.length : 0, 'choices');
    if (!containerElement) return;
    containerElement.innerHTML = '';
    try {
        if (choices && choices.length > 0) {
            choices.forEach(choice => {
                const button = document.createElement('button');
                button.classList.add('action-button', 'm-1');

                // Create a span for the text
                const textSpan = document.createElement('span');
                textSpan.textContent = choice.text;

                // Create an img element for the icon if iconPath is provided
                if (choice.iconPath) {
                    const iconImg = document.createElement('img');
                    iconImg.src = choice.iconPath;
                    iconImg.classList.add('action-button-icon'); // Add a class for styling
                    button.appendChild(iconImg); // Add icon before text
                }

                button.appendChild(textSpan); // Add text after icon

                if (choice.tooltip) {
                    button.title = choice.tooltip;
                }

                if (choice.action === 'show_create_form_action') {
                    button.onclick = () => typeof showCreateAccountForm === 'function' && showCreateAccountForm();
                } else if (choice.action === 'show_login_form_action') {
                    button.onclick = () => typeof showLoginForm === 'function' && showLoginForm();
                } else if (choice.action === 'exit_game') {
                    button.onclick = () => window.location.reload();
                } else if (choice.action === 'show_class_info') {
                    button.onclick = () => Game.showClassInfo(choice.value);
                } else if (choice.action === 'use_item') {
                    const itemDataForButton = Game.ITEM_DATA[choice.value];
                    const itemNameForButton = itemDataForButton ? itemDataForButton.name : "Item";
                    button.onclick = () => Game.promptUseItem(choice.value, itemNameForButton);
                } else if (choice.action === 'list_item_for_sale_prompt') {
                    button.onclick = () => Game.promptListItemForSale(choice.value);
                } else if (choice.action === 'prompt_concoct_quantity') {
                    button.onclick = () => Game.promptConcoctQuantity(choice.value);
                }
                else {
                    button.onclick = () => Game.handlePlayerChoice(choice.action, choice.value);
                }
                containerElement.appendChild(button);
            });
        }
    } catch (error) { console.error("Error populating action buttons:", error); displayMessage("Error displaying choices.", "error");}
}

function getModalInput(promptText, type = 'text') {
    console.log('ui.js: getModalInput called with promptText:', promptText, 'and type:', type);
    return new Promise((resolve) => {
        try {
            if (!inputModal || !modalPrompt || !modalInputField || !modalPasswordInputField) {
                console.error("Modal DOM elements not found!"); displayMessage("Error: UI input missing.", "error"); resolve(null); return;
            }
            modalPrompt.textContent = promptText;
            modalInputField.value = ''; modalPasswordInputField.value = '';
            if (type === 'password') {
                modalInputField.style.display = 'none'; modalPasswordInputField.style.display = 'block'; modalPasswordInputField.focus();
            } else {
                modalInputField.style.display = 'block'; modalPasswordInputField.style.display = 'none'; modalInputField.type = type; modalInputField.focus();
            }
            inputModal.style.display = 'flex';
            modalResolve = resolve;
        } catch (error) { console.error("Error in getModalInput:", error); displayMessage("Error preparing input.", "error"); resolve(null); }
    });
}

if (modalSubmitButton) {
    modalSubmitButton.onclick = () => {
        try {
            if (modalResolve) {
                const value = modalPasswordInputField.style.display === 'none' ? modalInputField.value : modalPasswordInputField.value;
                modalResolve(value.trim());
            }
        } catch (error) { console.error("Error in modalSubmitButton:", error); if (modalResolve) modalResolve(null); }
        finally { if (inputModal) inputModal.style.display = 'none'; modalResolve = null; }
    };
}

if (modalCancelButton) {
    modalCancelButton.onclick = () => {
        try { if (modalResolve) { modalResolve(null); } }
        catch (error) { console.error("Error in modalCancelButton:", error); }
        finally { if (inputModal) inputModal.style.display = 'none'; modalResolve = null; }
    };
}

function getYesNoModalInput(promptText) {
    console.log('ui.js: getYesNoModalInput called with promptText:', promptText);
    return new Promise((resolve) => {
        if (!inputModal || !modalPrompt || !modalInputField || !modalPasswordInputField || !modalSubmitButton || !modalCancelButton) {
            console.error("Modal DOM elements not found for Yes/No prompt!");
            resolve(null);
            return;
        }
        const originalSubmitText = modalSubmitButton.textContent;
        const originalCancelText = modalCancelButton.textContent;
        const originalSubmitOnClick = modalSubmitButton.onclick;
        const originalCancelOnClick = modalCancelButton.onclick;
        const originalZIndex = inputModal.style.zIndex;

        modalPrompt.textContent = promptText;
        modalInputField.style.display = 'none';
        modalPasswordInputField.style.display = 'none';

        modalSubmitButton.textContent = "Yes";
        modalCancelButton.textContent = "No";

        const cleanupAndResolve = (value) => {
            if (inputModal) inputModal.style.display = 'none';
            modalSubmitButton.textContent = originalSubmitText;
            modalCancelButton.textContent = originalCancelText;
            modalSubmitButton.onclick = originalSubmitOnClick;
            modalCancelButton.onclick = originalCancelOnClick;
            inputModal.style.zIndex = originalZIndex;
            resolve(value);
        };

        inputModal.style.zIndex = '210';
        modalSubmitButton.onclick = () => cleanupAndResolve(true);
        modalCancelButton.onclick = () => cleanupAndResolve(false);

        inputModal.style.display = 'flex';
    });
}

if (closeInventoryModalButton) {
    closeInventoryModalButton.onclick = () => Game.toggleGridInventoryModal();
}

if (hamburgerIcon && sideMenu) {
    hamburgerIcon.addEventListener('click', () => {
        hamburgerIcon.classList.toggle('active');
        sideMenu.classList.toggle('active');
    });
}

function closeSideMenu() {
    console.log('ui.js: closeSideMenu called');
    if (hamburgerIcon && sideMenu) {
        hamburgerIcon.classList.remove('active');
        sideMenu.classList.remove('active');
    }
}

document.getElementById('menu-nav-home')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeSideMenu();
    if (Game.currentCombat) {
        displayMessage("Cannot return home during combat!", "error");
        return;
    }
    if (Game.currentExploringAreaKey) {
        Game.currentExploringAreaKey = null;
        if (gameContainer) gameContainer.classList.remove('dedicated-exploration-background');
    }
    Game.showLoggedInMenu();
    Game.setMainView('gameplay');
});
document.getElementById('menu-nav-profile')?.addEventListener('click', (e) => {
    e.preventDefault();
    Game.setMainView('profile');
    closeSideMenu();
});
document.getElementById('menu-nav-players')?.addEventListener('click', (e) => {
    e.preventDefault();
    Game.showPlayerSearch();
    closeSideMenu();
});
document.getElementById('menu-nav-chat')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.toggle('chat-visible');
    if (document.body.classList.contains('chat-visible') && sideMenu && sideMenu.classList.contains('active')) {
        closeSideMenu();
    }
});
document.getElementById('menu-nav-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.remove('chat-visible');
    closeSideMenu();
    Game.logout();
});

document.getElementById('submit-create-account')?.addEventListener('click', () => Game.handleCreateAccountFormSubmit());
document.getElementById('cancel-create-account')?.addEventListener('click', () => Game.showMainGate());
document.getElementById('submit-login')?.addEventListener('click', () => Game.handleLoginFormSubmit());
document.getElementById('cancel-login')?.addEventListener('click', () => Game.showMainGate());

createUsernameInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter' && createPasswordInput) createPasswordInput.focus(); });
createPasswordInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter' && createEmailInput) createEmailInput.focus(); });
createEmailInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') Game.handleCreateAccountFormSubmit(); });
loginUsernameInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter' && loginPasswordInput) loginPasswordInput.focus(); });
loginPasswordInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') Game.handleLoginFormSubmit(); });

if (chatToggleButton) {
    chatToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('chat-visible');
        if (document.body.classList.contains('chat-visible') && sideMenu && sideMenu.classList.contains('active')) {
            closeSideMenu();
        }
    });
}
if (closeSideChatButton) {
    closeSideChatButton.addEventListener('click', () => {
        document.body.classList.remove('chat-visible');
    });
}

function displayChatMessage(messageData) {
    console.log('ui.js: displayChatMessage called with messageData:', messageData);
    if (!sideChatLogContainer || !Game.currentPlayerId) return;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');

    const senderNameSpan = document.createElement('span');
    senderNameSpan.classList.add('sender-name');
    senderNameSpan.textContent = `${messageData.senderName}:`;

    const messageTextSpan = document.createElement('span');
    messageTextSpan.classList.add('message-text');
    messageTextSpan.textContent = ` ${messageData.text}`;

    messageDiv.appendChild(senderNameSpan);
    messageDiv.appendChild(messageTextSpan);

    if (messageData.timestamp && messageData.timestamp.toDate) {
        const timestampSpan = document.createElement('span');
        timestampSpan.classList.add('timestamp');
        timestampSpan.textContent = `(${new Date(messageData.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        messageDiv.appendChild(timestampSpan);
    }

    if (messageData.senderId === Game.currentPlayerId) {
        messageDiv.classList.add('my-message');
    } else {
        messageDiv.classList.add('other-message');
    }

    sideChatLogContainer.appendChild(messageDiv);
    sideChatLogContainer.scrollTop = sideChatLogContainer.scrollHeight;
}

if (sideChatSendButton) {
    sideChatSendButton.onclick = () => {
        const messageText = sideChatInput.value.trim();
        if (messageText && Game.currentPlayerId && !sideChatSendButton.disabled) {
            Game.sendChatMessage(messageText);
            sideChatInput.value = '';
        }
    };
}

if (sideChatInput) {
    sideChatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !sideChatInput.disabled) {
            event.preventDefault();
            if(sideChatSendButton) sideChatSendButton.click();
        }
    });
}

function toggleGridInventoryModal() {
    console.log('ui.js: toggleGridInventoryModal called');
    if (!gridInventoryModal) {
        console.error("Grid inventory modal element not found!");
        return;
    }
    const player = Game.players[Game.currentPlayerId]; // Assumes Game.players and Game.currentPlayerId are available
    if (!player) {
        if (typeof displayMessage === 'function') displayMessage("Player not found.", "error");
        return;
    }

    const currentDisplay = window.getComputedStyle(gridInventoryModal).display;
    if (currentDisplay === 'none') {
        if (typeof populateModalInventoryGrid === 'function') {
            populateModalInventoryGrid(player); // populateModalInventoryGrid from inventory.js
        } else {
            console.error("populateModalInventoryGrid function is not available to fill the inventory.");
        }
        gridInventoryModal.style.display = 'flex'; // Or 'block', depending on desired layout
    } else {
        gridInventoryModal.style.display = 'none';
    }
}

// Function to view another player's profile
async function viewPlayerProfile(targetPlayerId) {
    console.log('ui.js: viewPlayerProfile called for targetPlayerId:', targetPlayerId);
    if (!targetPlayerId) {
        displayMessage("No player ID provided to view profile.", "error");
        return;
    }

    // Close side menu if open
    closeSideMenu();
    // Close chat panel if open
    if (document.body.classList.contains('chat-visible')) {
        document.body.classList.remove('chat-visible');
    }

    try {
        const targetPlayerData = await Game.fetchPlayerData(targetPlayerId);
        if (!targetPlayerData) {
            displayMessage("Could not find player data.", "error");
            return;
        }

        // Create a temporary player object for display purposes
        // This avoids modifying the main Game.players object or needing full Player class instantiation
        // We might need to expand this if more complex methods are called by updateStatsDisplay
        const tempPlayerForDisplay = { ...targetPlayerData }; // Shallow copy is okay if updateStatsDisplay only reads properties

        // Mock methods that might be called by updateStatsDisplay if not present on raw data
        // This is a simplified approach. A more robust solution might involve a lightweight Player-like object.
        if (typeof tempPlayerForDisplay.getCultivationRealmName !== 'function') {
            tempPlayerForDisplay.getCultivationRealmName = () => Game.REALM_NAMES[tempPlayerForDisplay.cultivationRealm] || "Unknown Realm";
        }
        if (typeof tempPlayerForDisplay.getXPForNextLevel !== 'function') {
            tempPlayerForDisplay.getXPForNextLevel = () => {
                const nextLevel = tempPlayerForDisplay.cultivationLevel + 1;
                return Game.XP_PER_LEVEL[nextLevel] || Infinity;
            };
        }
        if (typeof tempPlayerForDisplay.getTotalAttack !== 'function') {
            // Simplified: just use base strength or a default. Real calculation might be complex.
            tempPlayerForDisplay.getTotalAttack = () => tempPlayerForDisplay.strength || 0;
        }
        if (typeof tempPlayerForDisplay.getPhysicalDefense !== 'function') {
            // Simplified: just use base constitution or a default.
            tempPlayerForDisplay.getPhysicalDefense = () => tempPlayerForDisplay.constitution || 0;
        }
         // Ensure resources object exists
        if (!tempPlayerForDisplay.resources) {
            tempPlayerForDisplay.resources = {};
        }
        // Ensure equipment object exists
        if (!tempPlayerForDisplay.equipment) {
            tempPlayerForDisplay.equipment = {};
        }


        // Update the stats panel with the target player's data
        updateStatsDisplay(tempPlayerForDisplay);
        Game.setMainView('profile'); // Switch to profile view

        // Add a button to return to the current player's view or main menu
        // This could be a temporary button in the profile view or a modification to existing nav
        // For simplicity, let's log a message and rely on existing nav for now.
        // A more integrated solution would be better.
        displayMessage(`Viewing profile of ${targetPlayerData.name}. Use menu to navigate.`, "system");

    } catch (error) {
        console.error("Error fetching or displaying player profile:", error);
        displayMessage("Failed to load player profile.", "error");
    }
}
// --- END: FRONTEND UI JAVASCRIPT ---
