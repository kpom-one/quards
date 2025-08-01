// Load recent games on page load
window.addEventListener('load', async () => {
    await loadRecentGames();
    setupEventListeners();
});

async function loadRecentGames() {
    try {
        const response = await fetch('/api/games?limit=5');
        const data = await response.json();
        const games = data.data || [];
        
        renderRecentGames(games);
    } catch (error) {
        console.error('Failed to load recent games:', error);
        renderRecentGames([]);
    }
}

function renderRecentGames(games) {
    const gamesList = document.getElementById('recentGamesList');
    
    if (games.length === 0) {
        gamesList.innerHTML = `
            <div class="empty-state">
                <p>No games found. Create your first game to get started!</p>
            </div>
        `;
        return;
    }
    
    gamesList.innerHTML = games.map(game => {
        const createdDate = new Date(game.created).toLocaleDateString();
        const gameTypeIcon = game.type === 'generated' ? '🎮' : '📝';
        
        return `
            <a href="/?game=${game.id}" class="game-item">
                <div class="game-info">
                    <div class="game-title">${gameTypeIcon} ${game.id}</div>
                    <div class="game-meta">
                        ${game.player1Deck} vs ${game.player2Deck} • ${createdDate}
                        ${game.seed !== null && game.seed !== undefined ? `• Seed: ${String(game.seed)}` : ''}
                    </div>
                </div>
            </a>
        `;
    }).join('');
}

function viewGame(gameId) {
    window.location.href = `/?game=${gameId}`;
}

function setupEventListeners() {
    // Upload log button (placeholder)
    document.getElementById('uploadLogBtn').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Log upload feature coming soon!');
    });
}