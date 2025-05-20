function safeSetTextContent(element, text) {
    console.log('utils.js: safeSetTextContent called with text:', text);
    if (element) {
        element.textContent = text !== null && text !== undefined ? String(text) : '';
    } else {
        // console.warn("safeSetTextContent: Element is null for text:", text); // Optional: for debugging
    }
}

function toCamelCase(str) {
    console.log('utils.js: toCamelCase called with str:', str);
    if (!str) return '';
    let cleanedStr = str.replace(/[^a-zA-Z0-9\s]/g, '');
    return cleanedStr.toLowerCase()
        .replace(/\s+(.)/g, (match, chr) => chr.toUpperCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, (match, chr) => chr.toLowerCase());
}

// Firebase is initialized in game.js, db will be available globally after that.
// This utility function relies on 'db' being accessible.
function generateId() {
    console.log('utils.js: generateId called');
    // This function assumes 'db' (Firestore instance) is globally available
    // or passed as a parameter if this file is loaded before Firebase initialization.
    // For simplicity in this refactoring, we'll assume db is available when called.
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        // If db is not yet initialized but firebase.firestore is, we can get a temporary db instance.
        // However, it's better if db is initialized before this is heavily used.
        // For now, let's assume db will be initialized in game.js before this is critically needed.
        // A more robust solution might involve passing db or ensuring load order.
        const tempDb = firebase.firestore();
        return tempDb.collection("players").doc().id; // Example collection, can be any
    }
    // Fallback if firebase is not available (e.g. testing outside browser, or script load order issue)
    console.warn("generateId called before Firebase was fully available or 'db' was initialized. Using Math.random fallback.");
    return 'id_' + Math.random().toString(36).substr(2, 9);
}
