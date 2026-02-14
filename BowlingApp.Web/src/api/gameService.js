// =============================================================================================
// LIVE API implementation for frontend
// =============================================================================================
const API_BASE_URL = "http://localhost:5000/api/game"; // Update port if necessary

export const createGame = async (playerNames) => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerNames)
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Failed to create game: ${response.status} ${txt}`);
    }

    return await response.json();
};

export const getGame = async (gameId) => {
    const response = await fetch(`${API_BASE_URL}/${gameId}`);
    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Failed to get game: ${response.status} ${txt}`);
    }
    return await response.json();
};

export const rollBall = async (gameId, playerId, pins) => {
    const response = await fetch(`${API_BASE_URL}/${gameId}/roll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, pins })
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Failed to submit roll: ${response.status} ${txt}`);
    }

    return await response.json().catch(() => null);
};
