import {
    ConnectedSocket,
    MessageBody,
    OnMessage,
    SocketController,
    SocketIO,
  } from "socket-controllers";
  import { Server, Socket } from "socket.io";
  
  @SocketController()
  export class RoomController {
    @OnMessage("join_game")
    public async joinGame(
      @SocketIO() io: Server, // Reference to the Socket.IO server instance
      @ConnectedSocket() socket: Socket, // Reference to the socket instance of the connected client
      @MessageBody() message: any // The message received from the client
    ) {
      console.log("New User joining room: ", message);
  
      // Get all the sockets connected to the game room
      const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);
  
      // Get all the rooms that this socket is currently subscribed to
      const socketRooms = Array.from(socket.rooms.values()).filter(
        (r) => r !== socket.id
      );
  
      // Check if the room is full
      if (
        socketRooms.length > 0 || // If this socket is already connected to a room
        (connectedSockets && connectedSockets.size === 2) // If there are already 2 sockets connected to the room
      ) {
        // Send an error message to the client
        socket.emit("room_join_error", {
          error: "Room is full please choose another room to play!",
        });
      } else {
        // Join the room
        await socket.join(message.roomId);
        // Send a success message to the client
        socket.emit("room_joined");
      }
    }
  }
  