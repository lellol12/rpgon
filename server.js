const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

// --- Firebase Admin SDK Initialization ---
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    // process.exit(1); // Optionally exit if Firebase is critical
}

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Serve specific asset folders first to ensure they are prioritized
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/items', express.static(path.join(__dirname, 'public/items')));
// Then serve the rest of the public directory for root files like index.html, style.css, etc.
app.use(express.static(path.join(__dirname, 'public')));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// --- Basic Routes ---
// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Placeholder for API routes - these would need to be defined
// For example:
// const authRoutes = require('./server/auth_routes'); // Assuming you create auth_routes.js
// app.use('/api/auth', authRoutes);

// const gameRoutes = require('./server/game_routes'); // Assuming you create game_routes.js
// app.use('/api/game', gameRoutes);

// --- Initialize Game Logic Modules ---
const gameData = require('./server/game_data');
const authLogicModule = require('./server/auth_logic');
const explorationLogicModule = require('./server/exploration_logic');

const db = admin.firestore();
const authLogic = authLogicModule(db, admin); // Pass db and admin
const explorationLogic = explorationLogicModule(db, gameData); // Pass db and gameData

// --- API Routes ---
const apiRouter = express.Router();

// Auth Routes
apiRouter.post('/auth/create_account', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }
    const result = await authLogic.handleCreateAccount_logic(username, password, email);
    if (result.error) {
        return res.status(400).json(result);
    }
    res.status(201).json(result);
});

apiRouter.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }
    const result = await authLogic.handleLogin_logic(username, password);
    if (result.error) {
        return res.status(401).json(result); // 401 for unauthorized
    }
    // TODO: Implement session/token generation here
    res.json(result);
});

apiRouter.get('/auth/session/:playerId', async (req, res) => { // Simplified: using playerId in path
    const { playerId } = req.params;
    // In a real app, playerId would come from a secure session/token
    const result = await authLogic.checkAndRestoreSession_logic(playerId);
    if (result.error) {
        return res.status(404).json(result);
    }
    res.json(result);
});

apiRouter.post('/player/:playerId/gender', async (req, res) => {
    const { playerId } = req.params;
    const { gender } = req.body;
    if (!gender) {
        return res.status(400).json({ error: "Gender is required." });
    }
    // TODO: Add authentication/authorization to ensure the logged-in user can update this player
    const result = await authLogic.handleGenderSelection_logic(playerId, gender);
    if (result.error) {
        return res.status(400).json(result);
    }
    res.json(result);
});


// Exploration Routes
apiRouter.post('/explore/:playerId/:areaKey', async (req, res) => {
    const { playerId, areaKey } = req.params;
    // TODO: Add authentication/authorization
    if (!playerId || !areaKey) {
        return res.status(400).json({ error: "Player ID and Area Key are required." });
    }
    const result = await explorationLogic.performDedicatedExplore_logic(playerId, areaKey);
    if (result.error && result.error === "Player not found.") {
        return res.status(404).json(result);
    }
    if (result.error) {
        return res.status(400).json(result);
    }
    res.json(result);
});

apiRouter.post('/explore/:playerId/:areaKey/stealth_resolve', async (req, res) => {
    const { playerId, areaKey } = req.params;
    // TODO: Add authentication/authorization
    if (!playerId || !areaKey) {
        return res.status(400).json({ error: "Player ID and Area Key are required." });
    }
    const result = await explorationLogic.resolveStealthAttempt_logic(playerId, areaKey);
     if (result.error && result.error === "Player not found.") {
        return res.status(404).json(result);
    }
    if (result.error && !result.success) { // Stealth fail is not necessarily a 400 error from client view
        return res.json(result); // Send back the result of failed stealth
    }
    if (result.error) { // Other server errors
         return res.status(500).json(result);
    }
    res.json(result);
});


app.use('/api', apiRouter);


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access the game at http://localhost:${PORT}`);
});

// Basic error handling (optional, can be expanded)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Export app for potential testing or further extension if needed by other modules
module.exports = app;
