#!/usr/bin/env python3
import http.server
import socketserver
import json
import csv
import os
from urllib.parse import urlparse, parse_qs
from datetime import datetime

class GameDataHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/save-deck':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                deck_data = json.loads(post_data.decode('utf-8'))
                
                # Save to CSV
                self.save_deck_to_csv(deck_data)
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode())
                
            except Exception as e:
                print(f"Error saving deck data: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode())
        elif self.path == '/save-game':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                game_data = json.loads(post_data.decode('utf-8'))
                
                # Save to CSV
                self.save_to_csv(game_data)
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode())
                
            except Exception as e:
                print(f"Error saving game data: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_GET(self):
        if self.path == '/deck-data.csv':
            try:
                # Serve the deck CSV file
                self.send_response(200)
                self.send_header('Content-type', 'text/csv')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                if os.path.exists('deck_data.csv'):
                    with open('deck_data.csv', 'r', encoding='utf-8') as f:
                        self.wfile.write(f.read().encode('utf-8'))
                else:
                    # Return empty CSV with headers
                    headers = [
                        'Name',
                        'Version',
                        'Dreamborn Link',
                        'Guide Link',
                        'Card List'
                    ]
                    self.wfile.write(','.join(f'"{h}"' for h in headers).encode('utf-8'))
                    
            except Exception as e:
                print(f"Error serving deck CSV: {e}")
                self.send_response(500)
                self.end_headers()
        elif self.path == '/game-data.csv':
            try:
                # Serve the CSV file
                self.send_response(200)
                self.send_header('Content-type', 'text/csv')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                if os.path.exists('game_data.csv'):
                    with open('game_data.csv', 'r', encoding='utf-8') as f:
                        self.wfile.write(f.read().encode('utf-8'))
                else:
                    # Return empty CSV with headers
                    headers = [
                        'Time',
                        'Deck A',
                        'Deck B',
                        'A Mull',
                        'B Mull',
                        'A Hand',
                        'B Hand',
                        'Notes',
                        'Winner',
                        'A Ink',
                        'A Lore',
                        'B Ink',
                        'B Lore',
                        'A End',
                        'B End'
                    ]
                    self.wfile.write(','.join(f'"{h}"' for h in headers).encode('utf-8'))
                    
            except Exception as e:
                print(f"Error serving CSV: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            # Serve static files normally
            super().do_GET()
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def save_to_csv(self, game_data):
        csv_file = 'game_data.csv'
        file_exists = os.path.exists(csv_file)
        
        # Headers for the CSV
        headers = [
            'Time',
            'Deck A',
            'Deck B',
            'A Mull',
            'B Mull',
            'A Hand',
            'B Hand',
            'Notes',
            'Winner',
            'A Ink',
            'A Lore',
            'B Ink',
            'B Lore',
            'A End',
            'B End'
        ]
        
        # Create row data
        row_data = [
            datetime.now().isoformat(),
            game_data.get('deckA', ''),
            game_data.get('deckB', ''),
            game_data.get('deckAMull', '0'),
            game_data.get('deckBMull', '0'),
            game_data.get('deckASatisfaction', 'neutral'),
            game_data.get('deckBSatisfaction', 'neutral'),
            game_data.get('gameNotes', ''),
            game_data.get('winner', ''),
            game_data.get('deckAInk', '0'),
            game_data.get('deckALore', '0'),
            game_data.get('deckBInk', '0'),
            game_data.get('deckBLore', '0'),
            game_data.get('deckAEndSatisfaction', 'neutral'),
            game_data.get('deckBEndSatisfaction', 'neutral')
        ]
        
        # Ensure file ends with newline before appending
        if file_exists:
            with open(csv_file, 'r+', encoding='utf-8') as f:
                f.seek(0, 2)  # Go to end of file
                if f.tell() > 0:  # File is not empty
                    f.seek(f.tell() - 1)  # Go back one character
                    last_char = f.read(1)
                    if last_char != '\n':
                        f.write('\n')  # Add newline if missing
        
        # Write to CSV
        with open(csv_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Write headers if file is new
            if not file_exists:
                writer.writerow(headers)
            
            # Write the data row
            writer.writerow(row_data)
        
        print(f"Game data saved to {csv_file}")
    
    def save_deck_to_csv(self, deck_data):
        csv_file = 'deck_data.csv'
        file_exists = os.path.exists(csv_file)
        
        # Headers for the deck CSV
        headers = [
            'Name',
            'Version',
            'Dreamborn Link',
            'Guide Link',
            'Card List'
        ]
        
        # Create row data
        row_data = [
            deck_data.get('name', ''),
            deck_data.get('version', '1.0'),
            deck_data.get('dreambornLink', ''),
            deck_data.get('guideLink', ''),
            deck_data.get('cardList', '')
        ]
        
        # Ensure file ends with newline before appending
        if file_exists:
            with open(csv_file, 'r+', encoding='utf-8') as f:
                f.seek(0, 2)  # Go to end of file
                if f.tell() > 0:  # File is not empty
                    f.seek(f.tell() - 1)  # Go back one character
                    last_char = f.read(1)
                    if last_char != '\n':
                        f.write('\n')  # Add newline if missing
        
        # Write to CSV
        with open(csv_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Write headers if file is new
            if not file_exists:
                writer.writerow(headers)
            
            # Write the data row
            writer.writerow(row_data)
        
        print(f"Deck data saved to {csv_file}")

if __name__ == "__main__":
    PORT = 8000
    
    with socketserver.TCPServer(("", PORT), GameDataHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()