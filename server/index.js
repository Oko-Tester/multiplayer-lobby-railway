import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import Redis from "ioredis";

const app = express();
const httpServer = createServer(app);
const io = new IOServer(httpServer, { cors: { origin: "*" } });

const pub = new Redis(process.env.REDIS_URL);
const sub = new Redis(process.env.REDIS_URL);
const store = new Redis(process.env.REDIS_URL);

io.adapter(
  require("socket.io-redis")({
    pubClient: pub,
    subClient: sub,
  })
);

io.on("connection", (socket) => {
  // Player-Join
  socket.on("join-lobby", async ({ username, lobbyId }) => {
    await store.hset(`lobby:${lobbyId}`, socket.id, username);
    socket.join(lobbyId);
    io.to(lobbyId).emit("player-joined", { id: socket.id, username });
    logMetric("connections_opened");
  });

  // Movement and Actions
  socket.on("player-action", ({ lobbyId, action }) => {
    socket.to(lobbyId).emit("update-action", { id: socket.id, action });
  });

  // Chat
  socket.on("chat-message", ({ lobbyId, message }) => {
    io.to(lobbyId).emit("chat-message", { id: socket.id, message });
  });

  socket.on("disconnect", async () => {
    // Player-Leave
    logMetric("connections_closed");
  });
});

// Helpfunction: log-based metric
function logMetric(name) {
  console.log(`METRIC:${name}:1`);
}

const PORT = process.env.PORT ?? 3000;
httpServer.listen(PORT, () => console.log(`Lobby-Server on ${PORT}`));
