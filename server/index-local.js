import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

const io = new IOServer(httpServer, {
  cors: {
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    methods: ["GET", "POST"],
  },
});

const lobbies = new Map();

function addPlayerToLobby(lobbyId, playerId, username) {
  if (!lobbies.has(lobbyId)) {
    lobbies.set(lobbyId, new Map());
  }
  lobbies.get(lobbyId).set(playerId, username);
}

function removePlayerFromLobby(lobbyId, playerId) {
  if (lobbies.has(lobbyId)) {
    lobbies.get(lobbyId).delete(playerId);
    if (lobbies.get(lobbyId).size === 0) {
      lobbies.delete(lobbyId);
    }
  }
}

function getLobbyPlayers(lobbyId) {
  const lobby = lobbies.get(lobbyId);
  return lobby ? Object.fromEntries(lobby) : {};
}

io.on("connection", (socket) => {
  console.log(`👤 Player connected: ${socket.id}`);
  console.log(`📊 Total connections: ${io.engine.clientsCount}`);

  socket.on("join-lobby", ({ username, lobbyId = "main" }) => {
    try {
      addPlayerToLobby(lobbyId, socket.id, username);
      socket.join(lobbyId);

      socket.to(lobbyId).emit("player-joined", {
        id: socket.id,
        username,
        timestamp: Date.now(),
      });

      const existingPlayers = getLobbyPlayers(lobbyId);
      socket.emit("lobby-state", { players: existingPlayers });

      console.log(`🎮 ${username} joined lobby: ${lobbyId}`);
      console.log(
        `👥 Lobby ${lobbyId} now has ${
          Object.keys(existingPlayers).length
        } players`
      );
    } catch (error) {
      console.error("Error joining lobby:", error);
      socket.emit("error", { message: "Failed to join lobby" });
    }
  });

  socket.on("player-action", ({ lobbyId = "main", action, data }) => {
    console.log(`🎯 Action from ${socket.id}: ${action}`);
    socket.to(lobbyId).emit("player-action", {
      id: socket.id,
      action,
      data,
      timestamp: Date.now(),
    });
  });

  socket.on("chat-message", ({ lobbyId = "main", message }) => {
    if (!message || message.trim().length === 0) return;

    try {
      const players = getLobbyPlayers(lobbyId);
      const username = players[socket.id] || "Anonymous";

      console.log(`💬 Chat from ${username}: ${message.trim()}`);

      io.to(lobbyId).emit("chat-message", {
        id: socket.id,
        username,
        message: message.trim(),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error sending chat message:", error);
    }
  });

  socket.on("disconnect", () => {
    try {
      const rooms = Array.from(socket.rooms);
      for (const room of rooms) {
        if (room !== socket.id) {
          const players = getLobbyPlayers(room);
          const username = players[socket.id] || "Unknown";

          removePlayerFromLobby(room, socket.id);
          socket.to(room).emit("player-left", {
            id: socket.id,
            username,
            timestamp: Date.now(),
          });

          console.log(`👋 ${username} left lobby: ${room}`);
        }
      }
      console.log(`📊 Total connections: ${io.engine.clientsCount}`);
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    environment: "local",
  });
});

app.get("/api/lobbies", (req, res) => {
  try {
    const stats = {
      total_connections: io.engine.clientsCount,
      lobbies: {},
    };

    for (const [lobbyId, players] of lobbies.entries()) {
      stats.lobbies[lobbyId] = {
        players: players.size,
        playerList: Array.from(players.values()),
      };
    }

    res.json(stats);
  } catch (error) {
    console.error("Error getting lobby stats:", error);
    res.status(500).json({ error: "Failed to get lobby stats" });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Multiplayer Lobby Server",
    status: "running",
    endpoints: {
      health: "/health",
      lobbies: "/api/lobbies",
    },
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Multiplayer Server running on port ${PORT}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Lobby stats: http://localhost:${PORT}/api/lobbies`);
  console.log(`📱 Client should connect to: http://localhost:8080`);
});
