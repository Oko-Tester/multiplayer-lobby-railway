🎮 Multiplayer Lobby Template

Ein vollständiges Realtime Multiplayer Lobby System mit WebSockets, perfekt für Hackathons, Game Jams oder als Basis für Multiplayer-Spiele.

⚡ Quick Start
Klicken Sie auf "Deploy on Railway" ⬆️
Warten Sie ~2-3 Minuten bis beide Services deployed sind
Öffnen Sie die Client-URL in mehreren Tabs
Spieler können sofort miteinander interagieren!
🚀 Features
🔌 WebSocket-Kommunikation mit Socket.IO
🎮 Phaser.js Visualisierung für 2D-Spieler
💬 Realtime Chat-System
📦 Redis Integration für Skalierbarkeit
🐳 Docker-basiertes Deployment
🔄 Auto-Reconnect bei Verbindungsabbruch
📊 Health Checks & Monitoring
🏗️ Architektur
┌─────────────────┐    WebSocket     ┌─────────────────┐    Redis     ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ◄──────────► │                 │
│  Client (Nginx) │                  │ Server (Node.js)│              │ Redis (Plugin)  │
│  - Phaser Game  │    Socket.IO     │ - Socket.IO     │   Optional   │ - Player State  │
│  - Chat UI      │                  │ - Express API   │              │ - Lobby Data    │
└─────────────────┘                  └─────────────────┘              └─────────────────┘
🛠️ Lokale Entwicklung
bash
# Repository klonen
git clone <ihr-repo-url>
cd multiplayer-lobby-template

# Server starten
cd server
npm install
npm run dev

# Client starten (in neuem Terminal)
cd client
python3 -m http.server 8080
# Oder mit Live Server Extension in VS Code
URLs:

Client: http://localhost:8080
Server: http://localhost:3000
API Health: http://localhost:3000/health
🎯 API Endpoints
Endpoint	Methode	Beschreibung
/health	GET	Server Health Check
/api/lobbies	GET	Lobby-Statistiken
🔌 WebSocket Events
Client → Server
join-lobby - Lobby beitreten
player-action - Spieler-Aktion senden
chat-message - Chat-Nachricht senden
Server → Client
player-joined - Neuer Spieler beigetreten
player-left - Spieler hat verlassen
player-action - Spieler-Aktion empfangen
chat-message - Chat-Nachricht empfangen
lobby-state - Aktueller Lobby-Status
🔧 Konfiguration
Umgebungsvariablen
Variable	Standard	Beschreibung
PORT	3000	Server Port
NODE_ENV	development	Umgebung
REDIS_URL	-	Redis Verbindung (optional)
Railway-spezifisch
Redis wird automatisch als Plugin hinzugefügt
Domains werden automatisch konfiguriert
Health Checks sind eingebaut
🚀 Deployment
Mit Railway Template
Klicken Sie auf den Deploy-Button oben
Forken Sie das Repository
Railway deployed automatisch beide Services
Manuell
Repository in Railway importieren
Zwei Services konfigurieren:
Server: server/Dockerfile
Client: client/Dockerfile
Redis Plugin hinzufügen
Deployen
🎮 Erweitungsideen
Spiel-Modi: Verschiedene Minigames implementieren
Matchmaking: Automatische Spieler-Zuordnung
Leaderboards: Punkte und Rankings
KI-Bots: NPCs für Solo-Spieler
Räume: Private/öffentliche Lobbies
Authentication: User-Accounts & Profile
🐛 Troubleshooting
Client kann nicht verbinden:

Prüfen Sie die WebSocket-URL in client/index.js
Stellen Sie sicher, dass beide Services laufen
Redis Fehler:

Server funktioniert auch ohne Redis (In-Memory Fallback)
Prüfen Sie REDIS_URL Umgebungsvariable
CORS Probleme:

Passen Sie CORS-Einstellungen in server/index.js an
Für Production: Spezifische Domains konfigurieren
📄 Lizenz
MIT License - Verwenden Sie es für alles!

🤝 Contributing
Fork das Repository
Feature Branch erstellen
Changes committen
Pull Request öffnen
Gebaut für die Railway Community 🚂

Haben Sie Fragen? Öffnen Sie ein Issue oder kontaktieren Sie uns auf Discord!

