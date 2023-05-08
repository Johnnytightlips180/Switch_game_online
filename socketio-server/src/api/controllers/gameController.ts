import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController() // Decorator for creating a controller for handling WebSocket events
export class GameController {
  private getSocketGameRoom(socket: Socket): string {
    // Private method to get the game room of the socket
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id // Get all socket rooms except the socket's ID (since the socket is always in its own room)
    );
    const gameRoom = socketRooms && socketRooms[0]; // Get the first socket room (i.e. the game room)
    return gameRoom; // Return the game room
  }

  @OnMessage("update_game") // Decorator for handling "update_game" WebSocket events
  public async updateGame(
    @SocketIO() io: Server, // Inject the Socket.IO server instance
    @ConnectedSocket() socket: Socket, // Inject the connected socket instance
    @MessageBody() message: any // Inject the message body of the event
  ) {
    const gameRoom = this.getSocketGameRoom(socket); // Get the game room of the socket
    socket.to(gameRoom).emit("on_game_update", message); // Broadcast the "on_game_update" event to all sockets in the game room (except the sender)

    // Add this line to broadcast the currentPlayer
    socket.to(gameRoom).emit("on_current_player_update", message.currentPlayer);

    // Add this line to broadcast the remainingCards
    socket
      .to(gameRoom)
      .emit("on_remaining_cards_update", message.remainingCards);

    // Add this line to broadcast the activeSuit
    socket.to(gameRoom).emit("on_active_suit_update", message.activeSuit);
  }

  @OnMessage("broadcast_action_message")
  public async broadcastActionMessage(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: any
  ) {
    const gameRoom = this.getSocketGameRoom(socket);
    socket.to(gameRoom).emit("on_action_message_update", message.message);
  }
}
