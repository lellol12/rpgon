window.onload = () => {
    console.log('main.js: window.onload called');
    try {
        if (typeof Game !== 'undefined' && typeof Game.initializeGame === 'function') {
            Game.initializeGame();
        } else {
            console.error("Game object or Game.initializeGame function not found. Ensure game.js is loaded before main.js.");
            // Optionally, display an error to the user on the page itself
            const body = document.querySelector('body');
            if (body) {
                body.innerHTML = '<div style="color:red;padding:20px;font-size:18px;text-align:center;">A critical error occurred loading the game. Game files might be missing or corrupted. Please check the console (F12) for details and try reloading.</div>';
            }
        }
    } catch (e) {
        console.error("Initialization Error in main.js:", e);
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = '<div style="color:red;padding:20px;font-size:18px;text-align:center;">A fatal error occurred during game initialization. Please check the console (F12) for details and try reloading.</div>';
        }
    }
};
