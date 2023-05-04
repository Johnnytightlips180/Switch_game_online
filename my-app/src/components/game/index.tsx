import React, { useContext, useEffect, useState } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { Deck, Card } from "./deck";

import "./deck.css";
import gameContext from "../../gameContext";

export interface IStartGame {
  start: boolean;
  symbol: "1" | "2";
}

export function Game() {
  const deck = new Deck();
  deck.shuffle();
  const [playerOneCards, setPlayerOneCards] = useState<Card[]>([]);
  const [playerTwoCards, setPlayerTwoCards] = useState<Card[]>([]);
  const [topCard, setTopCard] = useState<Card | undefined>(undefined);
  const [currentPlayer, setCurrentPlayer] = useState<"1" | "2">("1");
  const [remainingCards, setRemainingCards] = useState<Card[]>([]);

  const {
    playerSymbol,
    setPlayerSymbol,
    setPlayerTurn,
    isPlayerTurn,
    setGameStarted,
    isGameStarted,
  } = useContext(gameContext);

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

    const topCard = deck.pop();

    if (topCard) {
      setTopCard(topCard);
    }

    setPlayerOneCards(playerOneCards);
    setPlayerTwoCards(playerTwoCards);
    setRemainingCards(deck.getCards());

    if (socketService.socket) {
      gameService.updateGame(
        socketService.socket,
        playerOneCards,
        playerTwoCards,
        topCard,
        currentPlayer,
        remainingCards // Add this line
      );
    }
  };

  const handleCardClick = (card: Card) => {
    if (card === topCard || currentPlayer !== playerSymbol) {
      return;
    }

    if (playerSymbol === "1") {
      setPlayerOneCards(playerOneCards.filter((c) => c !== card));
      setTopCard(card);
      setCurrentPlayer("2");
    } else if (playerSymbol === "2") {
      setPlayerTwoCards(playerTwoCards.filter((c) => c !== card));
      setTopCard(card);
      setCurrentPlayer("1");
    }

    if (socketService.socket) {
      gameService.updateGame(
        socketService.socket,
        playerOneCards.filter((c) => c !== card),
        playerTwoCards.filter((c) => c !== card),
        card,
        currentPlayer === "1" ? "2" : "1",
        remainingCards
      );
    }
  };

  const handleNewCardClick = () => {
    if (remainingCards.length === 0 || currentPlayer !== playerSymbol) {
      return;
    }

    const newCard = remainingCards.shift();
    if (!newCard) {
      return;
    }

    if (playerSymbol === "1") {
      setPlayerOneCards([...playerOneCards, newCard]);
    } else if (playerSymbol === "2") {
      setPlayerTwoCards([...playerTwoCards, newCard]);
    }

    setCurrentPlayer(currentPlayer === "1" ? "2" : "1");

    if (socketService.socket) {
      gameService.updateGame(
        socketService.socket,
        playerSymbol === "1" ? [...playerOneCards, newCard] : playerOneCards,
        playerSymbol === "2" ? [...playerTwoCards, newCard] : playerTwoCards,
        topCard,
        currentPlayer === "1" ? "2" : "1",
        remainingCards
      );
    }
    

    console.log("Remaining cards in the deck:", remainingCards.length);
  };

  const handleGameUpdate = () => {
    if (socketService.socket)
      gameService.onGameUpdate(
        socketService.socket,
        (playerOneCards, playerTwoCards, topCard, remainingCards) => { // Add remainingCards here
          setPlayerOneCards(playerOneCards);
          setPlayerTwoCards(playerTwoCards);
          setTopCard(topCard);
          setRemainingCards(remainingCards); // Add this line
        }
      );
  };
  

  const handleGameStart = () => {
    if (socketService.socket)
      gameService.onStartGame(socketService.socket, (options) => {
        setGameStarted(true);
        setPlayerSymbol(options.symbol);
        if (options.start) setPlayerTurn(true);
        else setPlayerTurn(false);
      });
  };

  const handleCurrentPlayerUpdate = () => {
    if (socketService.socket) {
      gameService.onCurrentPlayerUpdate(
        socketService.socket,
        (currentPlayer) => {
          setCurrentPlayer(currentPlayer);
        }
      );
    }
  };

  // Add this function to handle the received deck
  const handleDeckUpdate = () => {
    if (socketService.socket) {
      gameService.onDeckUpdate(socketService.socket, (deck) => {
        setRemainingCards(deck);
      });
    }
  };

  // Add handleDeckUpdate to the useEffect hook
  useEffect(() => {
    handleGameUpdate();
    handleGameStart();
    handleCurrentPlayerUpdate();
    handleDeckUpdate(); // Add this line
  }, []);

  return (
    <div>
      <div className="wrapper">
        <div className="App">
          <div className="board">
            <h3>Player one</h3>
            <div className="player-one">
              {playerSymbol === "1" &&
                playerOneCards.map((card, index) => (
                  <div
                    key={index}
                    className={`card ${card.color}`}
                    onClick={() => handleCardClick(card)}
                  >
                    {card.value} {card.suit}
                  </div>
                ))}
            </div>
            <button className="deal-btn" onClick={dealCards}>
              Deal
            </button>
            <button className="new-card-btn" onClick={handleNewCardClick}>
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
              {playerSymbol === "2" &&
                playerTwoCards.map((card, index) => (
                  <div
                    key={index}
                    className={`card ${card.color}`}
                    onClick={() => handleCardClick(card)}
                  >
                    {card.value} {card.suit}
                  </div>
                ))}
            </div>
            <h3>Player two</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
