import { Socket } from "socket.io-client";
import Deck, { Card } from "../../components/game/deck";

// Define a class called GameService
class GameService {

  // Define a method called joinGameRoom that takes in a socket and a roomId, and returns a Promise<boolean>
  public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
      
      // Return a new Promise that takes in two functions, rs (resolve) and rj (reject)
      return new Promise((rs, rj) => {
          
          // Emit a "join_game" event on the socket with the roomId as data
          socket.emit("join_game", { roomId });
          
          // Listen for a "room_joined" event on the socket, and call rs with true if it's received
          socket.on("room_joined", () => rs(true));
          
          // Listen for a "room_join_error" event on the socket, and call rj with the error message if it's received
          socket.on("room_join_error", ({ error }) => rj(error));
      });
  }

  // Define a method called updateGame that takes in a socket, playerOneCards, playerTwoCards, and topCard, and sends an "update_game" event on the socket with that data
  public async updateGame(socket: Socket, playerOneCards: Card[], playerTwoCards: Card[], topCard: Card | undefined) {
      socket.emit("update_game", { playerOneCards, playerTwoCards, topCard });
  }

  // Define a method called onGameUpdate that takes in a socket and a listener function, and listens for "on_game_update" events on the socket. When one is received, call the listener with the playerOneCards, playerTwoCards, and topCard data.
  public async onGameUpdate(
      socket: Socket,
      listener: (playerOneCards: Card[], playerTwoCards: Card[], topCard: Card | undefined) => void
  ) {
      socket.on("on_game_update", ({ playerOneCards, playerTwoCards, topCard }) => {
          listener(playerOneCards, playerTwoCards, topCard);
      });
  }
}

export default new GameService();