const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { Socket } = require("dgram");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
    console.log("User Connected", socket.id);

    socket.on("join_room", (data) => {
      socket.join(data);
      console.log(`user with ID: ${Socket.id} joined room: ${data} `)
    })
  
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });
  
  server.listen(3003, () => {
    console.log("SERVER RUNNING");
  });