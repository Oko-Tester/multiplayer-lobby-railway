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

const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const serverInfo = document.getElementById("server-info");

function updateStatus(status, message) {
  statusText.innerHTML = message;
  statusIndicator.className = `status-indicator ${status}`;

  if (status === "connected") {
    serverInfo.textContent = `🔗 ${socketUrl}`;
  }
}

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

    this.cameras.main.setBackgroundColor("#4F46E5");

    this.createBackground();

    const titleText = this.add
      .text(400, 60, "Multiplayer Lobby", {
        fontSize: "36px",
        fill: "#ffffff",
        fontFamily: "Inter, Arial",
        fontStyle: "bold",
        stroke: "#1e1b4b",
        strokeThickness: 2,
        shadow: {
          offsetX: 0,
          offsetY: 4,
          color: "#1e1b4b",
          blur: 8,
          fill: true,
        },
      })
      .setOrigin(0.5);

    this.playerCountText = this.add
      .text(400, 100, "🟢 Online: 1", {
        fontSize: "16px",
        fill: "#a5b4fc",
        fontFamily: "Inter, Arial",
      })
      .setOrigin(0.5);

    console.log(`Joining lobby as: ${this.username}`);
    socket.emit("join-lobby", { username: this.username, lobbyId: "main" });

    socket.on("connect", () => {
      console.log("Connected to server");
      updateStatus(
        "connected",
        `🟢 Verbunden als: <strong>${this.username}</strong>`
      );
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      updateStatus("disconnected", "🔴 Verbindung getrennt");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      updateStatus("error", "❌ Verbindungsfehler");
    });

    socket.on("lobby-state", ({ players }) => {
      console.log("Received lobby state:", players);
      const playerCount = Object.keys(players).length;
      this.playerCountText.setText(`🟢 Online: ${playerCount}`);

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
        this.showNotification(`${username} ist beigetreten`, "#22c55e");
      }
      this.updatePlayerCount();
    });

    socket.on("player-left", ({ id }) => {
      console.log(`Player left: ${id}`);
      if (this.players[id]) {
        const username = this.players[id].username;
        this.removePlayer(id);
        this.showNotification(`${username} hat verlassen`, "#ef4444");
      }
      this.updatePlayerCount();
    });

    socket.on("player-action", ({ id, action, data }) => {
      console.log(`Player action: ${id} -> ${action}`);
      const player = this.players[id];
      if (player && action === "move") {
        this.animatePlayerMovement(player);
      }
    });

    this.input.on("pointerdown", (pointer) => {
      console.log("Sending move action");
      socket.emit("player-action", { lobbyId: "main", action: "move" });

      this.createClickEffect(pointer.x, pointer.y);
    });

    this.add
      .text(400, 550, "Klicken Sie irgendwo um sich zu bewegen", {
        fontSize: "14px",
        fill: "#a5b4fc",
        fontFamily: "Inter, Arial",
      })
      .setOrigin(0.5);
  }

  createBackground() {
    for (let i = 0; i < 20; i++) {
      const circle = this.add.circle(
        Math.random() * 800,
        Math.random() * 600,
        Math.random() * 3 + 1,
        0x8b5cf6,
        0.3
      );

      this.tweens.add({
        targets: circle,
        alpha: { from: 0.1, to: 0.5 },
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  createPlayer(id, username) {
    const x = Math.random() * 600 + 100;
    const y = Math.random() * 300 + 200;

    let sprite;
    try {
      sprite = this.add.sprite(x, y, "player-sprite");
      sprite.setScale(0.6);
    } catch (error) {
      console.log("Using modern fallback sprite");
      sprite = this.add.circle(x, y, 24, 0x3b82f6);
    }

    const labelBg = this.add.rectangle(x, y - 40, 0, 24, 0x1f2937, 0.9);
    labelBg.setStrokeStyle(1, 0x3b82f6);

    const label = this.add
      .text(x, y - 40, username, {
        fontSize: "12px",
        fill: "#ffffff",
        fontFamily: "Inter, Arial",
        fontWeight: "500",
      })
      .setOrigin(0.5);

    labelBg.width = label.width + 16;

    const glow = this.add.circle(x, y, 30, 0x3b82f6, 0.2);

    this.players[id] = {
      sprite,
      label,
      labelBg,
      glow,
      username: username,
    };

    sprite.setScale(0);
    this.tweens.add({
      targets: sprite,
      scaleX: 0.6,
      scaleY: 0.6,
      duration: 300,
      ease: "Back.easeOut",
    });

    console.log(`Created player: ${username} at (${x}, ${y})`);
  }

  animatePlayerMovement(player) {
    const newX = Math.min(750, player.sprite.x + 50);
    const resetX = newX >= 750 ? 50 : newX;
    const finalX = newX >= 750 ? 50 : newX;

    this.tweens.add({
      targets: [player.sprite, player.label, player.labelBg, player.glow],
      x: finalX,
      duration: 300,
      ease: "Power2.easeOut",
    });

    this.tweens.add({
      targets: player.glow,
      alpha: { from: 0.4, to: 0.1 },
      duration: 200,
      yoyo: true,
      ease: "Power2.easeInOut",
    });
  }

  createClickEffect(x, y) {
    const effect = this.add.circle(x, y, 5, 0x22c55e, 0.8);

    this.tweens.add({
      targets: effect,
      radius: 30,
      alpha: 0,
      duration: 400,
      ease: "Power2.easeOut",
      onComplete: () => effect.destroy(),
    });
  }

  showNotification(message, color) {
    const notification = this.add
      .text(400, 150, message, {
        fontSize: "16px",
        fill: color,
        fontFamily: "Inter, Arial",
        fontWeight: "500",
        backgroundColor: "#ffffff",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5);

    notification.setAlpha(0);
    this.tweens.add({
      targets: notification,
      alpha: 1,
      duration: 200,
      ease: "Power2.easeOut",
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: notification,
            alpha: 0,
            duration: 300,
            ease: "Power2.easeIn",
            onComplete: () => notification.destroy(),
          });
        });
      },
    });
  }

  updatePlayerCount() {
    const count = Object.keys(this.players).length + 1;
    this.playerCountText.setText(`🟢 Online: ${count}`);
  }

  removePlayer(id) {
    const player = this.players[id];
    if (player) {
      this.tweens.add({
        targets: [player.sprite, player.label, player.labelBg, player.glow],
        alpha: 0,
        scale: 0,
        duration: 200,
        ease: "Power2.easeIn",
        onComplete: () => {
          player.sprite.destroy();
          player.label.destroy();
          player.labelBg.destroy();
          player.glow.destroy();
        },
      });
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
  backgroundColor: "#4F46E5",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
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

    const messageEl = document.createElement("div");
    messageEl.className = "message";

    const time = new Date(timestamp).toLocaleTimeString();

    messageEl.innerHTML = `
      <div class="message-header">
        <span class="message-username">${username}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-text">${message}</div>
    `;

    messages.appendChild(messageEl);
    messages.scrollTop = messages.scrollHeight;

    if (messages.children.length > 50) {
      messages.removeChild(messages.firstChild);
    }
  });
}

updateStatus("connecting", '<span class="loading-spinner"></span> Verbinde...');
serverInfo.textContent = `🔗 ${socketUrl}`;

console.log("Client initialized");
socket.on("connect", () => console.log("Socket connected:", socket.id));
socket.on("disconnect", () => console.log("Socket disconnected"));
socket.on("error", (error) => console.error("Socket error:", error));
