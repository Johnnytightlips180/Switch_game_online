import {
    ConnectedSocket,
    MessageBody,
    OnMessage,
    SocketController,
    SocketIO,
  } from "socket-controllers";
  import { Server, Socket } from "socket.io";
  import { Deck } from "../../../../my-app/src/components/game/deck";

  
  
  @SocketController()
export class RoomController {
  private roomDecks: Map<string, Deck> = new Map();

  @OnMessage("join_game")
public async joinGame(
  @SocketIO() io: Server,
  @ConnectedSocket() socket: Socket,
  @MessageBody() message: any
) {
  console.log("New User joining room: ", message);

  // What sockets are in the join room. It gets the name of the room and other socket joining 
  const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);

  // The rooms of the current socket is connected to. Each socket has its own default room, we filter that out
  const socketRooms = Array.from(socket.rooms.values()).filter(
    (r) => r !== socket.id
  );

  // check if there is more than 2 sockets in a room, if not then join the room
  if (
    socketRooms.length > 0 ||
    (connectedSockets && connectedSockets.size === 2)
  ) {
    socket.emit("room_join_error", {
      error: "Room is full please choose another room to play!",
    });
  } else {
    await socket.join(message.roomId);
    socket.emit("room_joined");

    // Check if this is the first player to join the room
    if (!connectedSockets) {
      // Initialize deck and shuffle
      const deck = new Deck();
      deck.shuffle();

      // Store deck state in the roomDecks map
      this.roomDecks.set(message.roomId, deck);
    }

    if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
      socket.emit("start_game", { start: true, symbol: "1" });
      socket.to(message.roomId).emit("start_game", { start: false, symbol: "2" });
    }
  }
}
}