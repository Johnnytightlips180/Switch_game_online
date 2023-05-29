import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";
import { Deck } from "../../../../my-app/src/components/game/deck";
import { User } from "../controllers/mainController";

@SocketController()
export class RoomController {
  private roomDecks: Map<string, Deck> = new Map();

  // Map to store room and its players
  private roomPlayers: Map<string, User[]> = new Map();

  @OnMessage("join_game")
  public async joinGame(
    @SocketIO() io: Server, // Inject the Socket.IO server instance
    @ConnectedSocket() socket: Socket, // Inject the connected socket instance
    @MessageBody() message: any // Inject the message body of the event
  ) {
    console.log("New User joining room: ", message);

    // Get the connected sockets in the specified room
    const connectedSockets = io.sockets.adapter.rooms.get(message.roomId);

    // Get the rooms of the current socket is connected to
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );

    // Get the user from the message
    const user: User = message.user;

    // Check if the room is already full (2 sockets present) or the socket is already in a room
    if (
      socketRooms.length > 0 ||
      (connectedSockets && connectedSockets.size === 2)
    ) {
      // Emit an error message to the socket indicating the room is full
      socket.emit("room_join_error", {
        error: "Room is full please choose another room to play!",
      });
    } else {
      // Join the specified room
      await socket.join(message.roomId);

      // Emit a confirmation message to the socket indicating successful room join
      socket.emit("room_joined");

      // Check if the room exists in the roomPlayers map
      if (!this.roomPlayers.has(message.roomId)) {
        // If not, initialize an array with the user
        this.roomPlayers.set(message.roomId, [user]);
      } else {
        // If it does, push the user into the array
        this.roomPlayers.get(message.roomId).push(user);
      }

      // Check if this is the first player to join the room
      if (!connectedSockets) {
        // Initialize a deck and shuffle it
        const deck = new Deck();

        deck.shuffle();

        // Store the deck state in the roomDecks map using the roomId as the key
        this.roomDecks.set(message.roomId, deck);
      }

      // Check if there are two players in the room
      if (io.sockets.adapter.rooms.get(message.roomId).size === 2) {
        // Get the players from the roomPlayers map
        const players = this.roomPlayers.get(message.roomId);

        // Emit the start_game event 
        socket.emit("start_game", { start: true, symbol: "1" });
        socket
          .to(message.roomId)
          .emit("start_game", { start: false, symbol: "2" });
      }
    }
  }
}
