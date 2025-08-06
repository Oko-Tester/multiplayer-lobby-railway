import Phaser from "https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js";
import io from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const socket = io();

class LobbyScene extends Phaser.Scene {
  preload() {
    this.load.image(
      "player",
      "https://labs.phaser.io/assets/sprites/phaser-dude.png"
    );
  }

  create() {
    this.players = {};
    this.username = "Player" + Math.floor(Math.random() * 1000);
    socket.emit("join-lobby", { username: this.username, lobbyId: "main" });

    socket.on("player-joined", ({ id, username }) => {
      const x = Math.random() * 600;
      const y = Math.random() * 400;
      const sprite = this.add.sprite(x, y, "player");
      const label = this.add.text(x, y - 20, username, {
        font: "12px Arial",
        fill: "#000",
      });
      this.players[id] = { sprite, label };
    });

    socket.on("update-action", ({ id, action }) => {
      const p = this.players[id];
      if (p && action === "move") {
        p.sprite.x += 10;
        p.label.x += 10;
      }
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  scene: [LobbyScene],
});

const msgInput = document.getElementById("msgInput");
const messages = document.getElementById("messages");
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && msgInput.value) {
    socket.emit("chat-message", { lobbyId: "main", message: msgInput.value });
    msgInput.value = "";
  }
});

socket.on("chat-message", ({ id, message }) => {
  const el = document.createElement("div");
  el.textContent = message;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
});
