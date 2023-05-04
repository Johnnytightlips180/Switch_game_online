import { Socket } from "socket.io-client";
import Deck, { Card } from "../../components/game/deck";
import { IStartGame } from "../../components/game";

class GameService {
    public async joinGameRoom(socket: Socket, roomId: string): Promise<boolean> {
      return new Promise((rs, rj) => {
        socket.emit("join_game", { roomId });
        socket.on("room_joined", () => rs(true));
        socket.on("room_join_error", ({ error }) => rj(error));
      });
    }

    public async updateGame(
      socket: Socket,
      playerOneCards: Card[],
      playerTwoCards: Card[],
      topCard: Card | undefined,
      currentPlayer: "1" | "2",
      remainingCards: Card[] // Add this line
    ) {
      socket.emit("update_game", {
        playerOneCards,
        playerTwoCards,
        topCard,
        currentPlayer,
        remainingCards, // Add this line
      });
    }
    

    public async onGameUpdate(
      socket: Socket,
      listener: (playerOneCards: Card[], playerTwoCards: Card[], topCard: Card | undefined, remainingCards: Card[]) => void
    ) {
      socket.on("on_game_update", ({ playerOneCards, playerTwoCards, topCard, remainingCards }) => { // Add remainingCards here
        listener(playerOneCards, playerTwoCards, topCard, remainingCards); // Add remainingCards here
      });
    }
    
    public async onStartGame(
      socket: Socket, 
      listener: (options: IStartGame) => void) {
      socket.on("start_game", listener); 
    }

    public async onCurrentPlayerUpdate(
      socket: Socket,
      listener: (currentPlayer: "1" | "2") => void
    ) {
      socket.on("on_current_player_update", (currentPlayer) => {
        listener(currentPlayer);
      });
    }

    public async onDeckUpdate(
      socket: Socket,
      listener: (deck: Card[]) => void
    ) {
      socket.on("on_deck_update", (deck) => {
        listener(deck);
      });
    }
    

    
}

export default new GameService();