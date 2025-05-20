const MAX_CHAT_MESSAGES_DISPLAYED = 50; // Moved from ui.js

async function sendChatMessage(messageText) {
    console.log('chat.js: sendChatMessage called with messageText:', messageText);
    // Assumes Game.currentPlayerId, Game.players, db, firebase.firestore.FieldValue, displayMessage are available
    if (!Game.currentPlayerId || !Game.players[Game.currentPlayerId]) {
        console.error("No current player to send chat message.");
        if (typeof displayMessage === 'function') displayMessage("You must be logged in to chat.", "error");
        return;
    }
    if (!messageText || messageText.length > 200) {
        if (typeof displayMessage === 'function') displayMessage("Message is empty or too long (max 200 chars).", "error");
        return;
    }

    const player = Game.players[Game.currentPlayerId];
    const messageData = {
        senderId: player.playerId,
        senderName: player.name,
        text: messageText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection("chatMessages").add(messageData);
        // Message will be displayed via the listener
    } catch (error) {
        console.error("Error sending chat message:", error);
        if (typeof displayMessage === 'function') displayMessage("Failed to send message. Check connection.", "error");
    }
}

function listenForChatMessages() {
    console.log('chat.js: listenForChatMessages called');
    // Assumes Game.chatMessagesListener, db, displayChatMessage (local to this file now), sideChatLogContainer are available
    if (Game.chatMessagesListener) {
        Game.chatMessagesListener(); // Unsubscribe from previous listener
    }

    Game.chatMessagesListener = db.collection("chatMessages")
        .orderBy("timestamp", "asc")
        .limitToLast(MAX_CHAT_MESSAGES_DISPLAYED)
        .onSnapshot(querySnapshot => {
            if (sideChatLogContainer) sideChatLogContainer.innerHTML = ''; // Clear before re-populating
            querySnapshot.forEach(doc => {
                const msgData = doc.data();
                if (msgData.timestamp) { // Ensure timestamp exists
                     displayChatMessageToLog(msgData); // Call the local chat-specific display function
                }
            });
        }, error => {
            console.error("Error listening to chat messages:", error);
            if (typeof displayMessage === 'function') displayMessage("Chat connection error.", "error"); // Use global displayMessage for general errors
        });
}

function stopListeningForChatMessages() {
    console.log('chat.js: stopListeningForChatMessages called');
    // Assumes Game.chatMessagesListener is available
    if (Game.chatMessagesListener) {
        Game.chatMessagesListener();
        Game.chatMessagesListener = null;
        console.log("Stopped listening for chat messages.");
    }
}

// This is the chat-specific display function, moved from ui.js
function displayChatMessageToLog(messageData) {
    console.log('chat.js: displayChatMessageToLog called with messageData:', messageData);
    // Assumes sideChatLogContainer, Game.currentPlayerId are available
    if (!sideChatLogContainer || !Game.currentPlayerId) return;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');

    const senderNameSpan = document.createElement('span');
    senderNameSpan.classList.add('sender-name');
    senderNameSpan.textContent = `${messageData.senderName}:`;
    // Add click event listener for player profiles
    if (messageData.senderId !== Game.currentPlayerId) { // Don't make own name clickable for profile
        senderNameSpan.style.cursor = 'pointer';
        senderNameSpan.style.textDecoration = 'underline';
        senderNameSpan.onclick = () => {
            // Check if currently in combat
            if (Game.CombatManager && Game.CombatManager.currentCombat) {
                if (typeof displayMessage === 'function') {
                    displayMessage("Cannot view profiles during combat.", "error");
                }
                return;
            }
            // Ensure viewPlayerProfile function is available globally or imported
            if (typeof viewPlayerProfile === 'function') {
                viewPlayerProfile(messageData.senderId);
            } else {
                console.warn('viewPlayerProfile function not found. Cannot open profile for senderId:', messageData.senderId);
                // Optionally, display a message to the user if the function is missing
                // displayMessage("Profile viewing feature is currently unavailable.", "system");
            }
        };
    }

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

// Event listeners for chat input and send button (from ui.js, moved here as they are chat-specific)
// These assume sideChatInput and sideChatSendButton are global DOM element constants defined in ui.js
if (typeof sideChatSendButton !== 'undefined' && sideChatSendButton) {
    sideChatSendButton.onclick = () => {
        if (typeof sideChatInput !== 'undefined' && sideChatInput) {
            const messageText = sideChatInput.value.trim();
            if (messageText && typeof Game !== 'undefined' && Game.currentPlayerId && !sideChatSendButton.disabled) {
                sendChatMessage(messageText);
                sideChatInput.value = '';
            }
        }
    };
}

if (typeof sideChatInput !== 'undefined' && sideChatInput) {
    sideChatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !sideChatInput.disabled) {
            event.preventDefault();
            if (typeof sideChatSendButton !== 'undefined' && sideChatSendButton) {
                sideChatSendButton.click();
            }
        }
    });
}
