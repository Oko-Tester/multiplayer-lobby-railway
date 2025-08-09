import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new IOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let redisClient;
if (process.env.REDIS_URL) {
  try {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    redisClient = pubClient;
    console.log("✅ Redis connected and adapter configured");
  } catch (error) {
    console.warn(
      "⚠️ Redis connection failed, using in-memory storage:",
      error.message
    );
  }
} else {
  console.log("ℹ️ No REDIS_URL provided, using in-memory storage");
}

const lobbies = new Map();

async function addPlayerToLobby(lobbyId, playerId, username) {
  if (redisClient) {
    await redisClient.hSet(`lobby:${lobbyId}`, playerId, username);
  } else {
    if (!lobbies.has(lobbyId)) {
      lobbies.set(lobbyId, new Map());
    }
    lobbies.get(lobbyId).set(playerId, username);
  }
}

async function removePlayerFromLobby(lobbyId, playerId) {
  if (redisClient) {
    await redisClient.hDel(`lobby:${lobbyId}`, playerId);
  } else {
    if (lobbies.has(lobbyId)) {
      lobbies.get(lobbyId).delete(playerId);
    }
  }
}

async function getLobbyPlayers(lobbyId) {
  if (redisClient) {
    return await redisClient.hGetAll(`lobby:${lobbyId}`);
  } else {
    const lobby = lobbies.get(lobbyId);
    return lobby ? Object.fromEntries(lobby) : {};
  }
}

io.on("connection", (socket) => {
  console.log(`👤 Player connected: ${socket.id}`);

  socket.on("join-lobby", async ({ username, lobbyId = "main" }) => {
    try {
      await addPlayerToLobby(lobbyId, socket.id, username);
      socket.join(lobbyId);

      socket.to(lobbyId).emit("player-joined", {
        id: socket.id,
        username,
        timestamp: Date.now(),
      });

      const existingPlayers = await getLobbyPlayers(lobbyId);
      socket.emit("lobby-state", { players: existingPlayers });

      console.log(`🎮 ${username} joined lobby: ${lobbyId}`);
    } catch (error) {
      console.error("Error joining lobby:", error);
      socket.emit("error", { message: "Failed to join lobby" });
    }
  });

  socket.on("player-action", ({ lobbyId = "main", action, data }) => {
    socket.to(lobbyId).emit("player-action", {
      id: socket.id,
      action,
      data,
      timestamp: Date.now(),
    });
    console.log(`🎯 Player ${socket.id} action: ${action} in lobby ${lobbyId}`);
  });

  socket.on("chat-message", async ({ lobbyId = "main", message }) => {
    if (!message || message.trim().length === 0) return;

    try {
      const players = await getLobbyPlayers(lobbyId);
      const username = players[socket.id] || "Anonymous";

      io.to(lobbyId).emit("chat-message", {
        id: socket.id,
        username,
        message: message.trim(),
        timestamp: Date.now(),
      });

      console.log(`💬 Chat message from ${username}: ${message.trim()}`);
    } catch (error) {
      console.error("Error sending chat message:", error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      const rooms = Array.from(socket.rooms);
      for (const room of rooms) {
        if (room !== socket.id) {
          await removePlayerFromLobby(room, socket.id);
          socket.to(room).emit("player-left", {
            id: socket.id,
            timestamp: Date.now(),
          });
        }
      }
      console.log(`👋 Player disconnected: ${socket.id}`);
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
    redis_connected: !!redisClient,
  });
});

app.get("/api/lobbies", async (req, res) => {
  try {
    const stats = {
      total_connections: io.engine.clientsCount,
      lobbies: {},
    };

    if (redisClient) {
      const keys = await redisClient.keys("lobby:*");
      for (const key of keys) {
        const lobbyId = key.replace("lobby:", "");
        const playerCount = await redisClient.hLen(key);
        stats.lobbies[lobbyId] = { players: playerCount };
      }
    } else {
      for (const [lobbyId, players] of lobbies.entries()) {
        stats.lobbies[lobbyId] = { players: players.size };
      }
    }

    res.json(stats);
  } catch (error) {
    console.error("Error getting lobby stats:", error);
    res.status(500).json({ error: "Failed to get lobby stats" });
  }
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  const url = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${PORT}`;
  console.log(`🚀 Multiplayer Server running on ${url}`);
  console.log(`🔌 WebSocket endpoint: ${url}`);
});
