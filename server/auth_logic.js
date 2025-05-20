const bcrypt = require('bcryptjs');
const { Player } = require('./models/character'); // Corrected path
const { Sect } = require('./models/sect'); // Corrected path
const gameData = require('./game_data'); // Corrected path

module.exports = function(db, admin) { // db is Firestore, admin for FieldValue
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;

    async function checkAndRestoreSession_logic(storedPlayerId) {
        console.log('auth_logic.js: checkAndRestoreSession_logic called for playerId:', storedPlayerId);
        if (storedPlayerId) {
            try {
                const playerDoc = await db.collection("players").doc(storedPlayerId).get();
                if (playerDoc.exists) {
                    const rawPlayerData = playerDoc.data();
                    // Use Player.fromFirestoreObject to reconstruct player instance if needed for consistency
                    // For session restore, often just raw data is enough for client to re-initialize
                    // const playerInstance = Player.fromFirestoreObject(rawPlayerData, gameData.ITEM_DATA, gameData.PILL_RECIPES);
                    // const playerDataForClient = playerInstance.toFirestoreObject(); // Or a simplified version for client

                    let sectFullData = null;
                    if (rawPlayerData.sectId) {
                        const sectDoc = await db.collection("sects").doc(rawPlayerData.sectId).get();
                        if (sectDoc.exists) {
                            // const sectInstance = Sect.fromFirestoreObject(sectDoc.data(), sectDoc.id, gameData.DEFAULT_SECT_RANKS);
                            // sectFullData = sectInstance.toFirestoreObject(serverTimestamp);
                             sectFullData = { id: sectDoc.id, ...sectDoc.data() }; // Simpler for now
                        }
                    }
                    return { player: { ...rawPlayerData, playerId: playerDoc.id }, sect: sectFullData };
                }
            } catch (error) {
                console.error("Error restoring session (logic):", error);
                return { error: "Error restoring session." };
            }
        }
        return { error: "No stored player ID."};
    }

    async function handleCreateAccount_logic(username, password, email) {
        console.log('auth_logic.js: handleCreateAccount_logic called for username:', username);
        try {
            const existingUserQuery = await db.collection("players").where("username", "==", username).get();
            if (!existingUserQuery.empty) {
                return { error: "This username is already taken. Please choose another." };
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newPlayerId = db.collection("players").doc().id; // Generate ID with Firestore
            const newPlayer = new Player(username, hashedPassword, email, newPlayerId);
            
            // Initialize default resources using gameData
            newPlayer.setDefaultResources(gameData.ITEM_DATA, gameData.PILL_RECIPES);
            
            let playerDataForFirestore = newPlayer.toFirestoreObject(); // Initial object from class method
            // Ensure timestamps are server timestamps if applicable (e.g. createdAt if Player model had it)

            console.log("[Server auth_logic.handleCreateAccount_logic] Data from toFirestoreObject():", JSON.stringify(playerDataForFirestore, null, 2)); // Log 1

            // Ensure a plain object is sent to Firestore to rule out prototype issues
            playerDataForFirestore = JSON.parse(JSON.stringify(playerDataForFirestore));
            console.log("[Server auth_logic.handleCreateAccount_logic] Plain object for Firestore set():", JSON.stringify(playerDataForFirestore, null, 2)); // Log 2 (after JSON dance)

            await db.collection("players").doc(newPlayerId).create(playerDataForFirestore); // Changed from set() to create()

            // Return only necessary info, not the hashed password back to client
            const { password: _, ...playerDataToReturn } = playerDataForFirestore;
            return { success: true, playerId: newPlayerId, playerData: playerDataToReturn };

        } catch (e) {
            console.error("Create Account Error (logic):", e);
            return { error: "Account creation failed due to a server error." };
        }
    }

    async function handleGenderSelection_logic(playerId, selectedGender) {
        console.log('auth_logic.js: handleGenderSelection_logic called for playerId:', playerId, 'gender:', selectedGender);
        if (!playerId || !selectedGender) {
            return { error: "Player ID and gender are required." };
        }
        try {
            const playerRef = db.collection("players").doc(playerId);
            await playerRef.update({ gender: selectedGender });
            return { success: true, message: "Gender saved successfully." };
        } catch (error) {
            console.error("Error saving gender (logic):", error);
            return { error: "Failed to save gender due to a server error." };
        }
    }

    async function handleLogin_logic(username, password) {
        console.log('auth_logic.js: handleLogin_logic called for username:', username);
        try {
            const playerQuery = await db.collection("players").where("username", "==", username).get();
            if (playerQuery.empty) {
                return { error: "Invalid username or password." };
            }

            let foundPlayerData = null;
            let foundPlayerId = null;
            let sectFullData = null;

            for (const doc of playerQuery.docs) {
                const playerDataFromDb = doc.data();
                // Add a check for playerDataFromDb.password
                if (typeof playerDataFromDb.password !== 'string' || playerDataFromDb.password.length === 0) {
                    // If password hash is not a valid string, it cannot be compared.
                    // Log this server-side for admin attention if needed.
                    console.warn(`User ${username} (ID: ${doc.id}) has an invalid or missing password hash in the database.`);
                    continue; // Treat as a password mismatch for this document
                }
                const passwordMatch = await bcrypt.compare(password, playerDataFromDb.password);

                if (passwordMatch) {
                    foundPlayerId = doc.id;
                    // Use Player.fromFirestoreObject to ensure consistent data structure if needed
                    // const playerInstance = Player.fromFirestoreObject(playerDataFromDb, gameData.ITEM_DATA, gameData.PILL_RECIPES);
                    // foundPlayerData = playerInstance.toFirestoreObject();
                    foundPlayerData = { ...playerDataFromDb, playerId: doc.id }; // Simpler for now


                    if (playerDataFromDb.sectId) {
                        const sectDoc = await db.collection("sects").doc(playerDataFromDb.sectId).get();
                        if (sectDoc.exists) {
                            // const sectInstance = Sect.fromFirestoreObject(sectDoc.data(), sectDoc.id, gameData.DEFAULT_SECT_RANKS);
                            // sectFullData = sectInstance.toFirestoreObject(serverTimestamp);
                            sectFullData = { id: sectDoc.id, ...sectDoc.data() }; // Simpler for now
                        }
                    }
                    break; 
                }
            }

            if (foundPlayerId) {
                // Don't send hashed password to client
                const { password: _, ...playerDataToReturn } = foundPlayerData;
                return {
                    success: true,
                    playerId: foundPlayerId,
                    playerData: playerDataToReturn,
                    sectData: sectFullData // Send full sect data object
                };
            } else {
                return { error: "Invalid username or password." };
            }
        } catch (e) {
            console.error("Login Error (logic):", e);
            return { error: "Login failed due to a server error." };
        }
    }

    return {
        checkAndRestoreSession_logic,
        handleCreateAccount_logic,
        handleGenderSelection_logic,
        handleLogin_logic
    };
};
