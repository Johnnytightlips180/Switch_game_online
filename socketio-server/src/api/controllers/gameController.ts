import {
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketController,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";

@SocketController()
export class GameController {
  private getSocketGameRoom(socket: Socket): string {
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );
    const gameRoom = socketRooms && socketRooms[0];

    return gameRoom;
  }

  @OnMessage("update_game")
public async updateGame(
  @SocketIO() io: Server,
  @ConnectedSocket() socket: Socket,
  @MessageBody() message: any
) {
  const gameRoom = this.getSocketGameRoom(socket);
  socket.to(gameRoom).emit("on_game_update", message);

  // Add this line to broadcast the currentPlayer
  socket.to(gameRoom).emit("on_current_player_update", message.currentPlayer);

  // Add this line to broadcast the remainingCards
  socket.to(gameRoom).emit("on_remaining_cards_update", message.remainingCards);
}

}
