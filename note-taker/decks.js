let deckData = [];
let filteredDecks = [];
let gameData = [];

function parseCSV(text) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let row = [];
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            row.push(current);
            current = '';
        } else if (char === '\n' && !inQuotes) {
            row.push(current);
            if (row.some(field => field.trim() !== '')) {
                result.push(row);
            }
            row = [];
            current = '';
        } else {
            current += char;
        }
    }
    
    // Handle last row
    if (current !== '' || row.length > 0) {
        row.push(current);
        if (row.some(field => field.trim() !== '')) {
            result.push(row);
        }
    }
    
    return result;
}

async function loadGameData() {
    try {
        const response = await fetch('/game-data.csv');
        const csvText = await response.text();
        
        if (csvText.trim()) {
            gameData = parseCSV(csvText);
        }
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

async function loadDecks() {
    try {
        // Load both deck and game data
        await Promise.all([
            fetch('/deck-data.csv').then(r => r.text()),
            loadGameData()
        ]).then(([deckCsvText]) => {
            if (!deckCsvText.trim()) {
                document.getElementById('noDecks').style.display = 'block';
                return;
            }
            
            const csv = parseCSV(deckCsvText);
            deckData = csv;
            filteredDecks = csv;
            displayDecks();
            calculateStats();
            
            document.getElementById('noDecks').style.display = 'none';
            document.getElementById('statsSection').style.display = 'block';
            document.getElementById('deckGrid').style.display = 'grid';
        });
        
    } catch (error) {
        console.error('Error loading decks:', error);
        document.getElementById('noDecks').style.display = 'block';
    }
}

function displayDecks() {
    if (filteredDecks.length <= 1) {
        document.getElementById('deckGrid').style.display = 'none';
        return;
    }
    
    const grid = document.getElementById('deckGrid');
    grid.innerHTML = '';
    
    const headers = filteredDecks[0];
    const decks = filteredDecks.slice(1);
    
    decks.forEach((deck, index) => {
        const card = createDeckCard(deck, headers, index);
        grid.appendChild(card);
    });
    
    grid.style.display = 'grid';
}

function createDeckCard(deck, headers, index) {
    const card = document.createElement('div');
    card.className = 'deck-card';
    
    const name = deck[headers.indexOf('Name')] || 'Unnamed Deck';
    const version = deck[headers.indexOf('Version')] || '';
    const dreambornLink = deck[headers.indexOf('Dreamborn Link')] || '';
    const guideLink = deck[headers.indexOf('Guide Link')] || '';
    const cardList = deck[headers.indexOf('Card List')] || '';
    
    // Get deck stats from game data
    const deckStats = getDeckStats(name);
    
    // Create card list preview (first 3 lines)
    const cardLines = cardList.split('\n').filter(line => line.trim());
    const preview = cardLines.slice(0, 3).join('\n');
    const hasMore = cardLines.length > 3;
    
    card.innerHTML = `
        <div class="deck-name">${name}</div>
        <div class="deck-version">Version ${version}</div>
        
        <div class="deck-links">
            ${dreambornLink ? `<a href="${dreambornLink}" target="_blank" class="deck-link">Dreamborn</a>` : ''}
            ${guideLink ? `<a href="${guideLink}" target="_blank" class="deck-link">Guide</a>` : ''}
        </div>
        
        <div class="deck-stats">
            ${deckStats ? `
                Games: ${deckStats.total} | 
                Win Rate: ${deckStats.winRate}% | 
                First: ${deckStats.firstWinRate}% | 
                Second: ${deckStats.secondWinRate}%
            ` : 'No game data available'}
        </div>
        
        ${cardList ? `
            <div class="card-list-preview" id="preview-${index}">${preview}${hasMore ? '...' : ''}</div>
            <div class="card-list-full" id="full-${index}">${cardList}</div>
            ${hasMore ? `<button class="card-list-toggle" onclick="toggleCardList(${index})">Show all cards</button>` : ''}
        ` : ''}
    `;
    
    return card;
}

function toggleCardList(index) {
    const preview = document.getElementById(`preview-${index}`);
    const full = document.getElementById(`full-${index}`);
    const button = preview.nextElementSibling.nextElementSibling;
    
    if (full.style.display === 'none' || !full.style.display) {
        preview.style.display = 'none';
        full.style.display = 'block';
        button.textContent = 'Show less';
    } else {
        preview.style.display = 'block';
        full.style.display = 'none';
        button.textContent = 'Show all cards';
    }
}

function getDeckStats(deckName) {
    if (!gameData || gameData.length <= 1) return null;
    
    const headers = gameData[0];
    const data = gameData.slice(1);
    
    const deckAIndex = headers.indexOf('Deck A');
    const deckBIndex = headers.indexOf('Deck B');
    const winnerIndex = headers.indexOf('Winner');
    
    if (deckAIndex === -1 || deckBIndex === -1 || winnerIndex === -1) return null;
    
    let total = 0;
    let wins = 0;
    let first = 0;
    let firstWins = 0;
    let second = 0;
    let secondWins = 0;
    
    data.forEach(row => {
        const deckA = row[deckAIndex];
        const deckB = row[deckBIndex];
        const winner = row[winnerIndex];
        
        if (deckA === deckName) {
            total++;
            first++;
            if (winner === 'DeckA') {
                wins++;
                firstWins++;
            }
        }
        
        if (deckB === deckName) {
            total++;
            second++;
            if (winner === 'DeckB') {
                wins++;
                secondWins++;
            }
        }
    });
    
    if (total === 0) return null;
    
    const winRate = Math.round((wins / total) * 100);
    const firstWinRate = first > 0 ? Math.round((firstWins / first) * 100) : 0;
    const secondWinRate = second > 0 ? Math.round((secondWins / second) * 100) : 0;
    
    return {
        total,
        wins,
        winRate,
        first,
        firstWins,
        firstWinRate,
        second,
        secondWins,
        secondWinRate
    };
}

function calculateStats() {
    if (deckData.length <= 1) return;
    
    const totalDecks = deckData.length - 1; // Subtract header row
    
    // Calculate active decks (decks with game data)
    let activeDecks = 0;
    const headers = deckData[0];
    const decks = deckData.slice(1);
    
    decks.forEach(deck => {
        const name = deck[headers.indexOf('Name')] || '';
        const stats = getDeckStats(name);
        if (stats && stats.total > 0) {
            activeDecks++;
        }
    });
    
    document.getElementById('totalDecks').textContent = totalDecks;
    document.getElementById('activeDecks').textContent = `${activeDecks} (with games)`;
}

function applyFilters() {
    if (deckData.length <= 1) return;
    
    const nameFilter = document.getElementById('nameFilter').value.toLowerCase();
    const headers = deckData[0];
    const decks = deckData.slice(1);
    
    const filtered = decks.filter(deck => {
        const name = (deck[headers.indexOf('Name')] || '').toLowerCase();
        return name.includes(nameFilter);
    });
    
    filteredDecks = [headers, ...filtered];
    displayDecks();
}

function clearFilters() {
    document.getElementById('nameFilter').value = '';
    filteredDecks = deckData;
    displayDecks();
}

// Check for deck parameter in URL and highlight specific deck
function checkDeckParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetDeck = urlParams.get('deck');
    
    if (targetDeck) {
        // Highlight the specific deck after loading
        setTimeout(() => {
            const deckCards = document.querySelectorAll('.deck-card');
            deckCards.forEach(card => {
                const deckName = card.querySelector('.deck-name').textContent;
                if (deckName === targetDeck) {
                    card.style.border = '2px solid #007bff';
                    card.style.boxShadow = '0 4px 15px rgba(0,123,255,0.3)';
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }, 500);
    }
}

// Auto-load decks when page loads
window.addEventListener('load', () => {
    loadDecks();
    checkDeckParameter();
});