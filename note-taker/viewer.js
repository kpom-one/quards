let gameData = [];
let filteredData = [];

// Emoji mapping for satisfaction levels
const emojiTriads = [
    ['😄', '😐', '😞'],
    ['😎', '😑', '😩'],
    ['🟢', '🟡', '🔴'],
    ['🔥', '💧', '🪨'],
    ['☀️', '⛅', '🌧️'],
    ['🌈', '☁️', '🌩️'],
    ['🎉', '🤷', '😬'],
    ['😁', '😐', '😓'],
    ['🥳', '😶', '😢'],
    ['😌', '😐', '😣'],
    ['🙌', '🤔', '🙁'],
    ['😺', '😼', '😿'],
    ['🐶', '😐', '🐾'],
    ['😇', '😐', '😖'],
    ['📈', '➖', '📉'],
    ['🎯', '🎲', '🧨'],
    ['🥇', '🥈', '🥉'],
    ['👑', '🧢', '🪖']
];

function getSatisfactionEmoji(satisfaction) {
    if (!satisfaction || satisfaction === 'neutral') {
        return '😐'; // Default neutral
    }
    
    // Find the triad that contains this satisfaction value
    for (let triad of emojiTriads) {
        if (satisfaction === 'good') return triad[0];
        if (satisfaction === 'bad') return triad[2];
    }
    
    // If not found, return the original value
    return satisfaction;
}

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

async function loadCSV() {
    try {
        const response = await fetch('/game-data.csv');
        const csvText = await response.text();
        
        if (!csvText.trim()) {
            alert('No game data found. Play some games first!');
            return;
        }
        
        const csv = parseCSV(csvText);
        gameData = csv;
        filteredData = csv;
        displayData();
        calculateStats();
        populateFilters();
        
        document.getElementById('noData').style.display = 'none';
        document.getElementById('statsSection').style.display = 'block';
        document.getElementById('dataTable').style.display = 'table';
        
    } catch (error) {
        console.error('Error loading CSV:', error);
        console.error('CSV text length:', csvText ? csvText.length : 'undefined');
        console.error('Parsed data:', csv ? csv.length : 'undefined');
        alert('Failed to load game data from server.');
    }
}

function displayData() {
    if (filteredData.length === 0) {
        document.getElementById('dataTable').style.display = 'none';
        return;
    }
    
    const table = document.getElementById('dataTable');
    const header = document.getElementById('tableHeader');
    const body = document.getElementById('tableBody');
    
    header.innerHTML = '';
    body.innerHTML = '';
    
    if (filteredData.length > 0) {
        // Create hierarchical header
        const headerRow = document.createElement('tr');
        const headers = ['Matchup', 'Deck', 'Mull', 'Hand', 'Ink', 'Lore', 'End'];
        headers.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        header.appendChild(headerRow);
        
        // Process each game
        for (let i = 1; i < filteredData.length; i++) {
            const gameRow = filteredData[i];
            const gameId = `game-${i}`;
            
            // Create game summary row with deck A data - "S vs Z" format
            const summaryRow = document.createElement('tr');
            summaryRow.className = 'game-row';
            
            // Matchup column with deck names and timestamp
            const matchupTd = document.createElement('td');
            const deckA = gameRow[1];
            const deckB = gameRow[2];
            const winner = gameRow[10];
            
            let matchupText = '';
            if (winner === 'DeckA') {
                matchupText = `★${deckA} vs ${deckB}`;
            } else {
                matchupText = `${deckA} vs ${deckB}★`;
            }
            
            const matchupDiv = document.createElement('div');
            matchupDiv.textContent = matchupText;
            
            const timestampDiv = document.createElement('div');
            timestampDiv.style.fontSize = '0.8em';
            timestampDiv.style.color = '#666';
            const date = new Date(gameRow[0]);
            timestampDiv.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            matchupTd.appendChild(matchupDiv);
            matchupTd.appendChild(timestampDiv);
            summaryRow.appendChild(matchupTd);
            
            // Add deck A data to the parent row
            addDeckDataToRow(summaryRow, gameRow, 'A');
            
            body.appendChild(summaryRow);
            
            // Create deck B row starting from second column
            body.appendChild(createDeckBRow(gameRow, gameId));
            
            // Add notes rows for any notes that exist
            addNotesRows(body, gameRow);
        }
    }
    
    table.style.display = 'table';
}

function addDeckDataToRow(row, gameRow, deckLetter) {
    const deckIndex = deckLetter === 'A' ? 1 : 2;
    const mullIndex = deckLetter === 'A' ? 3 : 4;
    const handIndex = deckLetter === 'A' ? 5 : 6;
    const notesIndex = deckLetter === 'A' ? 7 : 8;
    const inkIndex = deckLetter === 'A' ? 11 : 13;
    const loreIndex = deckLetter === 'A' ? 12 : 14;
    const endIndex = deckLetter === 'A' ? 15 : 16;
    
    // Deck name (clickable link to deck details)
    const deckTd = document.createElement('td');
    deckTd.className = 'deck-name';
    const deckName = gameRow[deckIndex];
    
    // Create clickable link for deck
    const deckLink = document.createElement('a');
    deckLink.textContent = deckName;
    deckLink.href = `decks.html?deck=${encodeURIComponent(deckName)}`;
    deckLink.style.color = '#007bff';
    deckLink.style.textDecoration = 'none';
    deckLink.style.cursor = 'pointer';
    deckLink.onmouseover = () => deckLink.style.textDecoration = 'underline';
    deckLink.onmouseout = () => deckLink.style.textDecoration = 'none';
    
    deckTd.appendChild(deckLink);
    row.appendChild(deckTd);
    
    // Mulligan
    const mullTd = document.createElement('td');
    mullTd.textContent = gameRow[mullIndex];
    row.appendChild(mullTd);
    
    // Hand satisfaction
    const handTd = document.createElement('td');
    handTd.textContent = getSatisfactionEmoji(gameRow[handIndex]);
    row.appendChild(handTd);
    
    // Ink
    const inkTd = document.createElement('td');
    inkTd.textContent = gameRow[inkIndex];
    row.appendChild(inkTd);
    
    // Lore
    const loreTd = document.createElement('td');
    const loreValue = gameRow[loreIndex];
    loreTd.textContent = loreValue === '20' ? '🏆' : loreValue;
    row.appendChild(loreTd);
    
    // End satisfaction
    const endTd = document.createElement('td');
    endTd.textContent = getSatisfactionEmoji(gameRow[endIndex]);
    row.appendChild(endTd);
}

function createDeckBRow(gameRow, gameId) {
    const row = document.createElement('tr');
    row.className = `deck-row`;
    row.id = `${gameId}-deck-B`;
    
    // Empty matchup cell
    row.appendChild(document.createElement('td'));
    
    // Add deck B data starting from second column
    addDeckDataToRow(row, gameRow, 'B');
    
    return row;
}

function addNotesRows(body, gameRow) {
    // Check for single notes field
    const gameNotes = gameRow[7] && gameRow[7].trim();
    
    if (gameNotes) {
        body.appendChild(createNoteRow(gameNotes, 'game-note'));
    }
}

function createNoteRow(noteText, noteType) {
    const row = document.createElement('tr');
    row.className = `note-row ${noteType}`;
    
    // Empty matchup column
    row.appendChild(document.createElement('td'));
    
    // Note in deck column (spans remaining columns)  
    const noteTd = document.createElement('td');
    noteTd.colSpan = 6; // Spans: Deck, Mull, Hand, Ink, Lore, End
    noteTd.style.fontStyle = 'italic';
    noteTd.style.fontSize = '14px';
    noteTd.style.color = '#666';
    noteTd.style.backgroundColor = '#f8f9fa';
    noteTd.style.padding = '8px 12px';
    noteTd.style.borderLeft = '3px solid #007bff';
    noteTd.textContent = noteText;
    row.appendChild(noteTd);
    
    return row;
}

function createMatchNotesRow(notes) {
    const row = document.createElement('tr');
    row.className = 'match-notes-row';
    
    // Full width cell for notes
    const notesTd = document.createElement('td');
    notesTd.colSpan = 8;
    notesTd.style.fontStyle = 'italic';
    notesTd.style.backgroundColor = '#f8f9fa';
    notesTd.style.padding = '8px';
    notesTd.textContent = notes;
    row.appendChild(notesTd);
    
    return row;
}


function calculateStats() {
    if (gameData.length <= 1) return;
    
    const headers = gameData[0];
    const data = gameData.slice(1);
    
    const deckAIndex = headers.indexOf('Deck A');
    const deckBIndex = headers.indexOf('Deck B');
    const winnerIndex = headers.indexOf('Winner');
    
    if (deckAIndex === -1 || deckBIndex === -1 || winnerIndex === -1) return;
    
    // Calculate deck statistics
    const deckStats = {};
    
    data.forEach(row => {
        const deckA = row[deckAIndex];
        const deckB = row[deckBIndex];
        const winner = row[winnerIndex];
        
        // Initialize deck stats if not exists
        if (!deckStats[deckA]) {
            deckStats[deckA] = { total: 0, wins: 0, first: 0, firstWins: 0, second: 0, secondWins: 0 };
        }
        if (!deckStats[deckB]) {
            deckStats[deckB] = { total: 0, wins: 0, first: 0, firstWins: 0, second: 0, secondWins: 0 };
        }
        
        // Count games and wins
        deckStats[deckA].total++;
        deckStats[deckB].total++;
        
        deckStats[deckA].first++;  // Deck A always goes first
        deckStats[deckB].second++; // Deck B always goes second
        
        if (winner === 'DeckA') {
            deckStats[deckA].wins++;
            deckStats[deckA].firstWins++;
        } else if (winner === 'DeckB') {
            deckStats[deckB].wins++;
            deckStats[deckB].secondWins++;
        }
    });
    
    // Display deck statistics
    displayDeckStats(deckStats);
    
    // Update total games count
    document.getElementById('totalGames').textContent = data.length;
}

function displayDeckStats(deckStats) {
    const statsContainer = document.querySelector('.stats');
    
    // Clear existing stats except the action buttons
    const actionButtons = statsContainer.querySelectorAll('.stat-card[onclick]');
    statsContainer.innerHTML = '';
    
    // Add total games card
    const totalCard = document.createElement('div');
    totalCard.className = 'stat-card';
    totalCard.innerHTML = `<h3 id="totalGames">0</h3><p>Total Games</p>`;
    statsContainer.appendChild(totalCard);
    
    // Add deck stats
    Object.entries(deckStats).forEach(([deck, stats]) => {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.style.minWidth = '200px';
        
        const overallWinRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;
        const firstWinRate = stats.first > 0 ? Math.round((stats.firstWins / stats.first) * 100) : 0;
        const secondWinRate = stats.second > 0 ? Math.round((stats.secondWins / stats.second) * 100) : 0;
        
        card.innerHTML = `
            <h3 style="font-size: 16px; margin-bottom: 8px;">${deck}</h3>
            <div style="font-size: 14px;">
                <div>Overall: ${overallWinRate}% (${stats.wins}/${stats.total})</div>
                <div>Going First: ${firstWinRate}% (${stats.firstWins}/${stats.first})</div>
                <div>Going Second: ${secondWinRate}% (${stats.secondWins}/${stats.second})</div>
            </div>
        `;
        
        statsContainer.appendChild(card);
    });
    
    // Re-add all action buttons
    actionButtons.forEach(button => {
        statsContainer.appendChild(button);
    });
}

function populateFilters() {
    if (gameData.length <= 1) return;
    
    const headers = gameData[0];
    const data = gameData.slice(1);
    
    const decks = new Set();
    
    const deckAIndex = headers.indexOf('Deck A');
    const deckBIndex = headers.indexOf('Deck B');
    
    data.forEach(row => {
        if (deckAIndex >= 0) decks.add(row[deckAIndex]);
        if (deckBIndex >= 0) decks.add(row[deckBIndex]);
    });
    
    const deckFilter = document.getElementById('deckFilter');
    
    deckFilter.innerHTML = '<option value="">All Decks</option>';
    
    Array.from(decks).sort().forEach(deck => {
        const option = document.createElement('option');
        option.value = deck;
        option.textContent = deck;
        deckFilter.appendChild(option);
    });
}

function applyFilters() {
    if (gameData.length <= 1) return;
    
    const headers = gameData[0];
    const data = gameData.slice(1);
    
    const winnerFilter = document.getElementById('winnerFilter').value;
    const deckFilter = document.getElementById('deckFilter').value;
    
    const deckAIndex = headers.indexOf('Deck A');
    const deckBIndex = headers.indexOf('Deck B');
    const winnerIndex = headers.indexOf('Winner');
    
    const filtered = data.filter(row => {
        let passesFilter = true;
        
        if (winnerFilter && winnerIndex >= 0) {
            if (row[winnerIndex] !== winnerFilter) passesFilter = false;
        }
        
        if (deckFilter) {
            const hasDeck = (deckAIndex >= 0 && row[deckAIndex] === deckFilter) ||
                           (deckBIndex >= 0 && row[deckBIndex] === deckFilter);
            if (!hasDeck) passesFilter = false;
        }
        
        return passesFilter;
    });
    
    filteredData = [headers, ...filtered];
    displayData();
}

function clearFilters() {
    document.getElementById('winnerFilter').value = '';
    document.getElementById('deckFilter').value = '';
    filteredData = gameData;
    displayData();
}

function showNotes(noteText, noteType) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'notes-overlay';
    overlay.onclick = () => document.body.removeChild(overlay);
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'notes-modal';
    modal.onclick = (e) => e.stopPropagation();
    
    const title = document.createElement('h3');
    title.textContent = noteType;
    
    const content = document.createElement('p');
    content.textContent = noteText;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'btn btn-primary';
    closeBtn.onclick = () => document.body.removeChild(overlay);
    
    modal.appendChild(title);
    modal.appendChild(content);
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    
    document.body.appendChild(overlay);
}

// Auto-load data when page loads
window.addEventListener('load', () => {
    loadCSV();
});