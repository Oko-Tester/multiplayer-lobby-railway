# 🎮 Multiplayer Lobby Template

Ein vollständiges Realtime Multiplayer Lobby System mit WebSockets, perfekt für Hackathons, Game Jams oder als Basis für Multiplayer-Spiele.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/0p6PsQ?referralCode=gOe2_D)

## ⚡ Quick Start

1. Klicken Sie auf "Deploy on Railway" ⬆️
2. Warten Sie ~2-3 Minuten bis beide Services deployed sind
3. Öffnen Sie die Client-URL in mehreren Tabs
4. Spieler können sofort miteinander interagieren!

## 🎯 Demo - So sehen Sie das Multiplayer-System live

### Schritt 1: Öffnen Sie mehrere Tabs

- **Tab 1**: Öffnen Sie Ihre Client-URL (z.B. `https://multiplayer-client.up.railway.app`)
- **Tab 2**: Öffnen Sie die gleiche URL in einem neuen Tab
- **Optional**: Teilen Sie die URL mit Freunden für echtes Multiplayer

### Schritt 2: Beobachten Sie die Synchronisation

- **Verbindung**: Jeder Tab zeigt "🟢 Live Chat" wenn verbunden
- **Spieler erscheinen**: Neue Spieler (Player123) erscheinen automatisch
- **Online-Counter**: "🟢 Online: X" zeigt aktuelle Spielerzahl

### Schritt 3: Interaktion testen

- **Bewegung**: Klicken Sie in Tab 1 → Spieler bewegt sich in allen Tabs
- **Chat**: Schreiben Sie in Tab 1 → Nachricht erscheint in allen Tabs
- **Verlassen**: Schließen Sie Tab 1 → Spieler verschwindet in Tab 2

## 🚀 Features

- 🔌 **WebSocket-Kommunikation** mit Socket.IO
- 🎮 **Phaser.js Visualisierung** für 2D-Spieler mit Animationen
- 💬 **Realtime Chat-System** mit Timestamps
- 📦 **Redis Integration** für Skalierbarkeit
- 🐳 **Docker-basiertes Deployment**
- 🔄 **Auto-Reconnect** bei Verbindungsabbruch
- 📊 **Health Checks & Monitoring**
- 📱 **Responsive Design** (Desktop & Mobile)

## 🏗️ Architektur

```
┌─────────────────┐    WebSocket     ┌─────────────────┐    Redis     ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ◄──────────► │                 │
│  Client (Nginx) │                  │ Server (Node.js)│              │ Redis (Plugin)  │
│  - Phaser Game  │    Socket.IO     │ - Socket.IO     │   Optional   │ - Player State  │
│  - Chat UI      │                  │ - Express API   │              │ - Lobby Data    │
└─────────────────┘                  └─────────────────┘              └─────────────────┘
```

## 🛠️ Lokale Entwicklung

```bash
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
```

**URLs:**

- Client: http://localhost:8080
- Server: http://localhost:3000
- API Health: http://localhost:3000/health

## 🎯 API Endpoints

| Endpoint       | Methode | Beschreibung        |
| -------------- | ------- | ------------------- |
| `/health`      | GET     | Server Health Check |
| `/api/lobbies` | GET     | Lobby-Statistiken   |

## 🔌 WebSocket Events

### Client → Server

- `join-lobby` - Lobby beitreten
- `player-action` - Spieler-Aktion senden (Bewegung)
- `chat-message` - Chat-Nachricht senden

### Server → Client

- `player-joined` - Neuer Spieler beigetreten
- `player-left` - Spieler hat verlassen
- `player-action` - Spieler-Aktion empfangen
- `chat-message` - Chat-Nachricht empfangen
- `lobby-state` - Aktueller Lobby-Status

## 🎮 Gameplay Features

### Spieler-Interaktion

- **Bewegung**: Klick irgendwo → Spieler bewegt sich nach rechts
- **Auto-Reset**: Am rechten Rand springt Spieler zurück nach links
- **Echtzeit-Sync**: Alle Bewegungen sind sofort für andere Spieler sichtbar

### Chat-System

- **Live-Nachrichten**: Sofortige Übertragung an alle Spieler
- **Timestamps**: Jede Nachricht zeigt Uhrzeit
- **Auto-Scroll**: Chat scrollt automatisch zu neuen Nachrichten
- **Nachrichten-Limit**: Maximal 50 Nachrichten im Verlauf

### Spieler-Management

- **Auto-Namen**: Zufällige Namen wie "Player123"
- **Join/Leave Notifications**: Benachrichtigungen bei Spieler-Wechsel
- **Online-Counter**: Live-Anzeige der verbundenen Spieler

## 🔧 Konfiguration

### Umgebungsvariablen

| Variable    | Standard    | Beschreibung                |
| ----------- | ----------- | --------------------------- |
| `PORT`      | 3000        | Server Port                 |
| `NODE_ENV`  | development | Umgebung                    |
| `REDIS_URL` | -           | Redis Verbindung (optional) |

### Railway-spezifisch

- Redis wird automatisch als Plugin hinzugefügt
- Domains werden automatisch konfiguriert
- Health Checks sind eingebaut

## 🚀 Deployment

### Mit Railway Template

1. Klicken Sie auf den Deploy-Button oben
2. Forken Sie das Repository
3. Railway deployed automatisch beide Services

### Manuell

1. Repository in Railway importieren
2. Zwei Services konfigurieren:
   - **Server**: `server/Dockerfile`
   - **Client**: `client/Dockerfile`
3. Redis Plugin hinzufügen
4. Deployen

## 🎮 Erweitungsideen

- **Spiel-Modi**: Verschiedene Minigames implementieren
- **Matchmaking**: Automatische Spieler-Zuordnung
- **Leaderboards**: Punkte und Rankings
- **KI-Bots**: NPCs für Solo-Spieler
- **Räume**: Private/öffentliche Lobbies
- **Authentication**: User-Accounts & Profile
- **Powerups**: Sammelbare Items
- **Kollision**: Spieler-Interaktion
- **Sound**: Audio-Feedback

## 🐛 Troubleshooting

### Client kann nicht verbinden:

- Prüfen Sie die WebSocket-URL in `client/index.js`
- Stellen Sie sicher, dass beide Services laufen
- Überprüfen Sie Browser-Console auf Fehler

### Redis Fehler:

- Server funktioniert auch ohne Redis (In-Memory Fallback)
- Prüfen Sie `REDIS_URL` Umgebungsvariable
- Redis Plugin in Railway aktivieren

### CORS Probleme:

- Passen Sie CORS-Einstellungen in `server/index.js` an
- Für Production: Spezifische Domains konfigurieren

### Performance Issues:

- Überprüfen Sie Server-Logs in Railway
- Monitoring über `/health` und `/api/lobbies` Endpoints
- Bei vielen Spielern: Redis für bessere Skalierung

## 📊 Monitoring

### Health Check

```bash
curl https://YOUR-SERVER.up.railway.app/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-08-09T12:00:00.000Z",
  "connections": 5,
  "redis_connected": true
}
```

### Lobby Statistics

```bash
curl https://YOUR-SERVER.up.railway.app/api/lobbies
```

**Response:**

```json
{
  "total_connections": 8,
  "lobbies": {
    "main": { "players": 8 }
  }
}
```

## 📄 Lizenz

MIT License - Verwenden Sie es für alles!

## 🤝 Contributing

1. Fork das Repository
2. Feature Branch erstellen
3. Changes committen
4. Pull Request öffnen

## 🎯 Live Demo

Testen Sie das Template hier: [Demo Link]

**Multiplayer testen:**

1. Öffnen Sie die Demo in 2+ Browser-Tabs
2. Klicken Sie in Tab 1 → Bewegung in Tab 2 sichtbar
3. Chatten Sie zwischen den Tabs
4. Schließen Sie einen Tab → Spieler verschwindet

---

Gebaut für die Railway Community 🚂

**[Deploy Now](https://railway.com/deploy/0p6PsQ?referralCode=gOe2_D)** | **[Live Demo](#)** | **[Documentation](#)** | **[GitHub](#)**
