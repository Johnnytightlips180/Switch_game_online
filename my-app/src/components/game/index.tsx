import React, { useEffect, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import Deck, { Card } from "./deck";
import "./deck.css";

export function Game() {
  const deck = new Deck();
  deck.shuffle();
  const [playerOneCards, setPlayerOneCards] = useState<Card[]>([]);
  const [playerTwoCards, setPlayerTwoCards] = useState<Card[]>([]);
  const [topCard, setTopCard] = useState<Card | undefined>(undefined);

  const dealCards = () => {
    const playerOneCards: Card[] = [];
    const playerTwoCards: Card[] = [];
  
    for (let i = 0; i < 5; i++) {
      const card1 = deck.pop();
      const card2 = deck.pop();
  
      if (card1) {
        playerOneCards.push(card1);
      }
  
      if (card2) {
        playerTwoCards.push(card2);
      }
    }
  
    drawTopCard();
  
  
    setPlayerOneCards(playerOneCards);
    setPlayerTwoCards(playerTwoCards);
  
    if (socketService.socket) {
      gameService.updateGame(
        socketService.socket,
        playerOneCards,
        playerTwoCards,
        topCard
      );
    }
  };
  

  const handleGameUpdate = () => {
    if (socketService.socket)
      gameService.onGameUpdate(socketService.socket, (playerOneCards, playerTwoCards, topCard) => {
        setPlayerOneCards(playerOneCards);
        setPlayerTwoCards(playerTwoCards);
        setTopCard(topCard);
      });
  };

  useEffect(() => {
    handleGameUpdate();
  }, []);

  const drawTopCard = () => {
    const card = deck.pop();
    if (card) {
      setTopCard(card);

      if (socketService.socket) {
        // Emit an event to the server to update the top card state
        socketService.socket.emit("updateTopCard", card);
      }
    }
  };

  useEffect(() => {
    // Handle the "updateTopCard" event on the second client and update the top card state
    if (socketService.socket) {
      socketService.socket.on("updateTopCard", (card) => {
        setTopCard(card);
      });
    }
  }, []);

  return (
    <div>
      <div className="wrapper">
        <div className="App">
          <div className="board">
            <div className="player-one">
              {playerOneCards.map((card, index) => (
                <div key={index} className={`card ${card.color}`}>
                  {card.value} {card.suit}
                </div>
              ))}
            </div>
            <button className="deal-btn" onClick={dealCards}>
              Deal
            </button>
            <button className="new-card-btn" onClick={drawTopCard}>
              New Card
            </button>
            <div className="top-card">
              {topCard ? (
                <div className={`card ${topCard.color}`}>
                  {topCard.value} {topCard.suit}
                </div>
              ) : null}
            </div>
            <div className="player-two">
              {playerTwoCards.map((card, index) => (
                <div key={index} className={`card ${card.color}`}>
                  {card.value} {card.suit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
