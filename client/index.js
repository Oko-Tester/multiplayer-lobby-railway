const socketUrl = (() => {
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol;

  if (
    currentHost.includes("railway.app") ||
    currentHost.includes("up.railway.app")
  ) {
    return `https://multiplayer-server.up.railway.app`;
  }

  if (currentHost === "localhost" || currentHost === "127.0.0.1") {
    return `${protocol}//${currentHost}:3000`;
  }

  return `${protocol}//${currentHost}:3000`;
})();

console.log("Connecting to:", socketUrl);
const socket = io(socketUrl);

class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: "LobbyScene" });
  }

  preload() {
    console.log("Loading assets...");

    this.load.image(
      "player-fallback",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY3growIYAAA+AQMJxEyqAAAAAElFTkSuQmCC"
    );

    this.load.image(
      "player-sprite",
      "https://labs.phaser.io/assets/sprites/phaser-dude.png"
    );
  }

  create() {
    console.log("Scene created");

    this.players = {};
    this.username = "Player" + Math.floor(Math.random() * 1000);

    this.add.rectangle(400, 300, 800, 600, 0x87ceeb);

    this.add
      .text(400, 50, "Multiplayer Lobby", {
        fontSize: "32px",
        fill: "#000",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    this.statusText = this.add.text(10, 10, "Verbinde...", {
      fontSize: "14px",
      fill: "#000",
    });

    this.connectionInfo = this.add.text(10, 30, `Server: ${socketUrl}`, {
      fontSize: "10px",
      fill: "#666",
    });

    console.log(`Joining lobby as: ${this.username}`);
    socket.emit("join-lobby", { username: this.username, lobbyId: "main" });

    socket.on("connect", () => {
      console.log("Connected to server");
      this.statusText.setText(`🟢 Verbunden als: ${this.username}`);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      this.statusText.setText("🔴 Verbindung getrennt");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.statusText.setText("❌ Verbindungsfehler");
    });

    socket.on("lobby-state", ({ players }) => {
      console.log("Received lobby state:", players);
      Object.entries(players).forEach(([id, username]) => {
        if (id !== socket.id && !this.players[id]) {
          this.createPlayer(id, username);
        }
      });
    });

    socket.on("player-joined", ({ id, username }) => {
      console.log(`Player joined: ${username} (${id})`);
      if (id !== socket.id) {
        this.createPlayer(id, username);
      }
    });

    socket.on("player-left", ({ id, username }) => {
      console.log(`Player left: ${username} (${id})`);
      this.removePlayer(id);
    });

    socket.on("player-action", ({ id, action, data }) => {
      console.log(`Player action: ${id} -> ${action}`);
      const player = this.players[id];
      if (player && action === "move") {
        player.sprite.x = Math.min(750, player.sprite.x + 20);
        player.label.x = player.sprite.x;

        if (player.sprite.x >= 750) {
          player.sprite.x = 50;
          player.label.x = 50;
        }
      }
    });

    this.input.on("pointerdown", () => {
      console.log("Sending move action");
      socket.emit("player-action", { lobbyId: "main", action: "move" });
    });

    this.add
      .text(400, 550, "Klicken Sie um sich zu bewegen • Chat rechts", {
        fontSize: "14px",
        fill: "#666",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);
  }

  createPlayer(id, username) {
    const x = Math.random() * 600 + 100;
    const y = Math.random() * 300 + 200;

    let sprite;
    try {
      sprite = this.add.sprite(x, y, "player-sprite");
      sprite.setScale(0.5);
    } catch (error) {
      console.log("Using fallback sprite");
      sprite = this.add.rectangle(x, y, 32, 48, 0x4169e1);
    }

    const label = this.add
      .text(x, y - 30, username, {
        fontSize: "12px",
        fill: "#000",
        fontFamily: "Arial",
        backgroundColor: "#fff",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5);

    this.players[id] = { sprite, label };
    console.log(`Created player: ${username} at (${x}, ${y})`);
  }

  removePlayer(id) {
    const player = this.players[id];
    if (player) {
      player.sprite.destroy();
      player.label.destroy();
      delete this.players[id];
      console.log(`Removed player: ${id}`);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  scene: [LobbyScene],
  backgroundColor: "#87CEEB",
};

console.log("Starting Phaser game...");
const game = new Phaser.Game(config);

const msgInput = document.getElementById("msgInput");
const messages = document.getElementById("messages");

if (msgInput && messages) {
  msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && msgInput.value.trim()) {
      console.log("Sending chat message:", msgInput.value);
      socket.emit("chat-message", {
        lobbyId: "main",
        message: msgInput.value.trim(),
      });
      msgInput.value = "";
    }
  });

  socket.on("chat-message", ({ username, message, timestamp }) => {
    console.log("Received chat message:", { username, message });
    const el = document.createElement("div");
    el.style.marginBottom = "5px";
    el.style.padding = "2px 4px";
    el.style.fontSize = "12px";

    const time = new Date(timestamp).toLocaleTimeString();
    el.innerHTML = `<strong>${username}:</strong> ${message} <small>(${time})</small>`;

    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  });
}

console.log("Client initialized");
socket.on("connect", () => console.log("Socket connected:", socket.id));
socket.on("disconnect", () => console.log("Socket disconnected"));
socket.on("error", (error) => console.error("Socket error:", error));
