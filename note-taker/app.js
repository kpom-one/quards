let selectedWinner = null;
let selectedDeckA = null;
let selectedDeckB = null;
let selectedMulliganA = 0;
let selectedMulliganB = 0;
let selectedSatisfactionA = 'good';
let selectedSatisfactionB = 'good';
let selectedEndSatisfactionA = 'good';
let selectedEndSatisfactionB = 'good';
let selectedInkA = 3;
let selectedInkB = 3;
let decks = [];

// Emoji triads from triads.emojis file
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

async function loadConfig() {
    try {
        const decksResponse = await fetch('decks.json');
        decks = await decksResponse.json();
        
        populateDeckButtons();
    } catch (error) {
        console.error('Error loading config:', error);
        decks = ['Default Deck 1', 'Default Deck 2', 'Default Deck 3'];
        populateDeckButtons();
    }
}

function populateDeckButtons() {
    const deckAContainer = document.getElementById('deckASelection');
    const deckBContainer = document.getElementById('deckBSelection');
    
    deckAContainer.innerHTML = '';
    deckBContainer.innerHTML = '';
    
    decks.forEach(deck => {
        // Create button for Deck A
        const buttonA = document.createElement('button');
        buttonA.type = 'button';
        buttonA.className = 'deck-button';
        buttonA.textContent = deck;
        buttonA.onclick = () => selectDeck('A', deck, buttonA);
        deckAContainer.appendChild(buttonA);
        
        // Create button for Deck B
        const buttonB = document.createElement('button');
        buttonB.type = 'button';
        buttonB.className = 'deck-button';
        buttonB.textContent = deck;
        buttonB.onclick = () => selectDeck('B', deck, buttonB);
        deckBContainer.appendChild(buttonB);
    });
}


function selectDeck(side, deck, buttonElement) {
    if (side === 'A') {
        selectedDeckA = deck;
        // Remove selected class from all Deck A buttons
        document.querySelectorAll('#deckASelection .deck-button').forEach(btn => btn.classList.remove('selected'));
        
        // Update all Deck A labels
        document.getElementById('deckALabel').textContent = deck;
        document.getElementById('deckAMulliganLabel').textContent = deck + ' Mulligan:';
        document.getElementById('deckAWinnerButton').textContent = deck + ' Wins';
        document.getElementById('deckAEndGameLabel').textContent = deck + ' End Game';
        document.getElementById('deckAInkLabel').textContent = 'Ending Ink:';
        document.getElementById('deckALoreLabel').textContent = 'Ending Lore:';
        
    } else {
        selectedDeckB = deck;
        // Remove selected class from all Deck B buttons
        document.querySelectorAll('#deckBSelection .deck-button').forEach(btn => btn.classList.remove('selected'));
        
        // Update all Deck B labels
        document.getElementById('deckBLabel').textContent = deck;
        document.getElementById('deckBMulliganLabel').textContent = deck + ' Mulligan:';
        document.getElementById('deckBWinnerButton').textContent = deck + ' Wins';
        document.getElementById('deckBEndGameLabel').textContent = deck + ' End Game';
        document.getElementById('deckBInkLabel').textContent = 'Ending Ink:';
        document.getElementById('deckBLoreLabel').textContent = 'Ending Lore:';
        
        // Update textarea placeholder
    }
    
    buttonElement.classList.add('selected');
}

function selectMulligan(deck, count, buttonElement) {
    if (deck === 'A') {
        selectedMulliganA = count;
        // Remove selected class from all Deck A mulligan buttons
        document.querySelectorAll('#deckAMulliganButtons .mulligan-btn').forEach(btn => btn.classList.remove('selected'));
    } else {
        selectedMulliganB = count;
        // Remove selected class from all Deck B mulligan buttons
        document.querySelectorAll('#deckBMulliganButtons .mulligan-btn').forEach(btn => btn.classList.remove('selected'));
    }
    
    buttonElement.classList.add('selected');
}

function selectInk(deck, amount, buttonElement) {
    if (deck === 'A') {
        selectedInkA = amount;
        // Remove selected class from all Deck A ink buttons
        document.querySelectorAll('#deckAInkButtons .stat-btn').forEach(btn => btn.classList.remove('selected'));
    } else {
        selectedInkB = amount;
        // Remove selected class from all Deck B ink buttons
        document.querySelectorAll('#deckBInkButtons .stat-btn').forEach(btn => btn.classList.remove('selected'));
    }
    
    buttonElement.classList.add('selected');
}

function selectEndSatisfaction(deck, satisfaction, buttonElement) {
    if (deck === 'A') {
        selectedEndSatisfactionA = satisfaction;
        // Remove selected class from all Deck A end satisfaction buttons
        document.querySelectorAll('#deckAEndSatisfactionButtons .satisfaction-btn').forEach(btn => btn.classList.remove('selected'));
    } else {
        selectedEndSatisfactionB = satisfaction;
        // Remove selected class from all Deck B end satisfaction buttons
        document.querySelectorAll('#deckBEndSatisfactionButtons .satisfaction-btn').forEach(btn => btn.classList.remove('selected'));
    }
    
    buttonElement.classList.add('selected');
}

function selectSatisfaction(deck, satisfaction, buttonElement) {
    if (deck === 'A') {
        selectedSatisfactionA = satisfaction;
        // Remove selected class from all Deck A satisfaction buttons
        document.querySelectorAll('#deckASatisfactionButtons .satisfaction-btn').forEach(btn => btn.classList.remove('selected'));
    } else {
        selectedSatisfactionB = satisfaction;
        // Remove selected class from all Deck B satisfaction buttons
        document.querySelectorAll('#deckBSatisfactionButtons .satisfaction-btn').forEach(btn => btn.classList.remove('selected'));
    }
    
    buttonElement.classList.add('selected');
}


function selectWinner(winner) {
    selectedWinner = winner;
    
    const buttons = document.querySelectorAll('.btn-winner');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    const selectedButton = winner === 'DeckA' 
        ? document.querySelector('.winner-p1') 
        : document.querySelector('.winner-p2');
    selectedButton.classList.add('selected');
    
    // Auto-fill winner's lore to 20
    const deckALore = document.getElementById('deckALore');
    const deckBLore = document.getElementById('deckBLore');
    
    if (selectedWinner === 'DeckA') {
        deckALore.value = 20;
        deckALore.classList.add('winner');
        deckBLore.classList.remove('winner');
    } else if (selectedWinner === 'DeckB') {
        deckBLore.value = 20;
        deckBLore.classList.add('winner');
        deckALore.classList.remove('winner');
    } else {
        deckALore.classList.remove('winner');
        deckBLore.classList.remove('winner');
    }
}

function loadRandomEmojis() {
    // Pick two random triads - one for hand satisfaction, one for end satisfaction
    const handTriad = emojiTriads[Math.floor(Math.random() * emojiTriads.length)];
    const endTriad = emojiTriads[Math.floor(Math.random() * emojiTriads.length)];
    
    // Update hand satisfaction buttons
    document.getElementById('deckAHandGood').textContent = handTriad[0];
    document.getElementById('deckAHandNeutral').textContent = handTriad[1];
    document.getElementById('deckAHandBad').textContent = handTriad[2];
    document.getElementById('deckBHandGood').textContent = handTriad[0];
    document.getElementById('deckBHandNeutral').textContent = handTriad[1];
    document.getElementById('deckBHandBad').textContent = handTriad[2];
    
    // Update end satisfaction buttons
    document.getElementById('deckAEndGood').textContent = endTriad[0];
    document.getElementById('deckAEndNeutral').textContent = endTriad[1];
    document.getElementById('deckAEndBad').textContent = endTriad[2];
    document.getElementById('deckBEndGood').textContent = endTriad[0];
    document.getElementById('deckBEndNeutral').textContent = endTriad[1];
    document.getElementById('deckBEndBad').textContent = endTriad[2];
}

function resetForm() {
    document.getElementById('gameForm').reset();
    selectedWinner = null;
    selectedDeckA = null;
    selectedDeckB = null;
    selectedMulliganA = 0;
    selectedMulliganB = 0;
    selectedSatisfactionA = 'good';
    selectedSatisfactionB = 'good';
    selectedEndSatisfactionA = 'good';
    selectedEndSatisfactionB = 'good';
    selectedInkA = 3;
    selectedInkB = 3;
    
    const buttons = document.querySelectorAll('.btn-winner, .deck-button, .mulligan-btn, .stat-btn, .satisfaction-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Reset mulligan buttons to 0 selected
    document.querySelector('#deckAMulliganButtons .mulligan-btn[onclick*="0"]').classList.add('selected');
    document.querySelector('#deckBMulliganButtons .mulligan-btn[onclick*="0"]').classList.add('selected');
    
    // Reset satisfaction buttons to good selected
    document.querySelector('#deckASatisfactionButtons .satisfaction-btn[onclick*="good"]').classList.add('selected');
    document.querySelector('#deckBSatisfactionButtons .satisfaction-btn[onclick*="good"]').classList.add('selected');
    document.querySelector('#deckAEndSatisfactionButtons .satisfaction-btn[onclick*="good"]').classList.add('selected');
    document.querySelector('#deckBEndSatisfactionButtons .satisfaction-btn[onclick*="good"]').classList.add('selected');
    
    // Reset ink buttons to 3 selected
    document.querySelector('#deckAInkButtons .stat-btn[onclick*="3"]').classList.add('selected');
    document.querySelector('#deckBInkButtons .stat-btn[onclick*="3"]').classList.add('selected');
    
    // Reset lore inputs
    document.getElementById('deckALore').value = 0;
    document.getElementById('deckBLore').value = 0;
    document.getElementById('deckALore').classList.remove('winner');
    document.getElementById('deckBLore').classList.remove('winner');
    
    // Reset all labels back to default
    document.getElementById('deckALabel').textContent = 'Deck A';
    document.getElementById('deckAMulliganLabel').textContent = 'Deck A Mulligan:';
    document.getElementById('deckAWinnerButton').textContent = 'Deck A Wins';
    document.getElementById('deckAEndGameLabel').textContent = 'Deck A End Game';
    
    document.getElementById('deckBLabel').textContent = 'Deck B';
    document.getElementById('deckBMulliganLabel').textContent = 'Deck B Mulligan:';
    document.getElementById('deckBWinnerButton').textContent = 'Deck B Wins';
    document.getElementById('deckBEndGameLabel').textContent = 'Deck B End Game';
    
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('gameForm').style.display = 'none';
}

async function saveToServer(gameData) {
    try {
        const response = await fetch('/save-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gameData)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            return true;
        } else {
            console.error('Server error:', result.message);
            return false;
        }
    } catch (error) {
        console.error('Network error:', error);
        return false;
    }
}

async function saveGameData() {
    if (!selectedWinner) {
        alert('Please select a winner before saving!');
        return false;
    }
    
    if (!selectedDeckA || !selectedDeckB) {
        alert('Please select both decks before saving!');
        return false;
    }
    
    const gameData = {
        deckA: selectedDeckA,
        deckB: selectedDeckB,
        deckAMull: selectedMulliganA,
        deckBMull: selectedMulliganB,
        deckASatisfaction: selectedSatisfactionA,
        deckBSatisfaction: selectedSatisfactionB,
        deckAEndSatisfaction: selectedEndSatisfactionA,
        deckBEndSatisfaction: selectedEndSatisfactionB,
        gameNotes: document.getElementById('gameNotes').value,
        winner: selectedWinner,
        deckAInk: selectedInkA,
        deckALore: document.getElementById('deckALore').value,
        deckBInk: selectedInkB,
        deckBLore: document.getElementById('deckBLore').value
    };
    
    const success = await saveToServer(gameData);
    
    if (success) {
        // Redirect to home page (viewer)
        window.location.href = '/';
    } else {
        alert('Failed to save game data. Check console for errors.');
    }
    
    return false;
}

document.getElementById('gameForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveGameData();
});

window.addEventListener('load', () => {
    loadConfig();
    loadRandomEmojis();
});