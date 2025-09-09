# Game Tracker Data Entry Specification

## Data Fields to Collect

### Game Setup
1. **Start Game** (button trigger)
2. **Deck Selection** 
   - P1 Deck: (dropdown from config file list)
   - P2 Deck: (dropdown from config file list)
3. **Player Selection**
   - P1: (dropdown from player list)  
   - P2: (dropdown from player list)

### Pre-Game
4. **P1 Mulligan**: (integer input)
5. **P2 Mulligan**: (integer input)

### Game Notes
6. **Freeform Notes**: (text area for mid-game observations)

### Post-Game Results  
7. **Winner**: (P1 | P2 buttons)
8. **P1 Ending Ink**: (integer)
9. **P1 Ending Lore**: (integer)
10. **P2 Ending Ink**: (integer)
11. **P2 Ending Lore**: (integer)

### Additional Metrics (Optional)
12. **Game Length**: (integer - turns or minutes)
13. **P1 Cards Remaining**: (integer)
14. **P2 Cards Remaining**: (integer)
15. **Key Plays/Combos**: (text field)

## Output Format
Data will be saved to CSV with columns matching the fields above, with timestamp for each game entry.

## Configuration Files Needed
- `decks.json` - List of available deck names
- `players.json` - List of player names