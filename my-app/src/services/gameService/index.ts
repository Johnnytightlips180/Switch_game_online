import { Socket } from "socket.io-client";
import Deck, { Card } from "../../components/game/deck";

class GameService {
    public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
      return new Promise((rs, rj) => {
        socket.emit("join_game", { roomId });
        socket.on("room_joined", () => rs(true));
        socket.on("room_join_error", ({ error }) => rj(error));
      });
    }

    public async updateGame(socket: Socket, playerOneCards: Card[], playerTwoCards: Card[], topCard: Card | undefined) {
      socket.emit("update_game", { playerOneCards, playerTwoCards, topCard });
    }

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