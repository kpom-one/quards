document.getElementById('deckForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const deckData = {
        name: formData.get('deckName'),
        version: formData.get('version') || '1.0',
        dreambornLink: formData.get('dreambornLink') || '',
        guideLink: formData.get('guideLink') || '',
        cardList: formData.get('cardList') || ''
    };
    
    // Validate required fields
    if (!deckData.name.trim()) {
        showError('Deck name is required');
        return;
    }
    
    try {
        const response = await fetch('/save-deck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deckData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
            showSuccess('Deck saved successfully!');
            
            // Clear form
            document.getElementById('deckForm').reset();
            
            // Redirect to decks page after a delay
            setTimeout(() => {
                window.location.href = 'decks.html';
            }, 1500);
        } else {
            showError(result.message || 'Failed to save deck');
        }
    } catch (error) {
        console.error('Error saving deck:', error);
        showError('Network error. Please check your connection and try again.');
    }
});

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const errorDiv = document.getElementById('errorMessage');
    
    errorDiv.style.display = 'none';
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

function showError(message) {
    const successDiv = document.getElementById('successMessage');
    const errorDiv = document.getElementById('errorMessage');
    
    successDiv.style.display = 'none';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}