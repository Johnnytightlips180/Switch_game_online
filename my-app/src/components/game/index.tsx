// Import required dependencies and components
import React, { useContext, useEffect, useState, useCallback } from "react";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import { Deck, Card } from "./deck";
import "./deck.css";
import gameContext from "../../gameContext";

// Start game options
export interface IStartGame {
  start: boolean;
  symbol: "1" | "2";
}

export function Game() {
  // State variables
  const [playerOneCards, setPlayerOneCards] = useState<Card[]>([]);
  const [playerTwoCards, setPlayerTwoCards] = useState<Card[]>([]);
  const [topCard, setTopCard] = useState<Card | undefined>(undefined);
  const [currentPlayer, setCurrentPlayer] = useState<"1" | "2">("1");
  const [remainingCards, setRemainingCards] = useState<Card[]>([]);
  const [hasDealt, setHasDealt] = useState<boolean>(false);
  const [flipDeck, setFlipDeck] = useState<Card[]>([]);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [rulesVisible, setRulesVisible] = useState(false);

  // Retrieve state variables from gameContext
  const {
    playerSymbol,
    setPlayerSymbol,
    setPlayerTurn,
    isPlayerTurn,
    setGameStarted,
    isGameStarted,
  } = useContext(gameContext);

  const dealCards = () => {
    setActionMessage("");

    // Create a new deck and shuffle it
    const newDeck = new Deck();
    newDeck.shuffle();

    // Players hand
    const playerOneCards: Card[] = [];
    const playerTwoCards: Card[] = [];

    // Deal five cards to each player
    for (let i = 0; i < 5; i++) {
      const card1 = newDeck.pop();
      const card2 = newDeck.pop();

      if (card1) {
        playerOneCards.push(card1);
      }

      if (card2) {
        playerTwoCards.push(card2);
      }
    }

    // Set the top card and remaining cards
    const topCard = newDeck.pop();
    if (topCard) {
      setTopCard(topCard);
    }
    setPlayerOneCards(playerOneCards);
    setPlayerTwoCards(playerTwoCards);
    setRemainingCards(newDeck.getCards());

    // Update the game on the server if a socket connection is available
    if (socketService.socket) {
      gameService.updateGame(
        socketService.socket,
        playerOneCards,
        playerTwoCards,
        topCard,
        currentPlayer,
        remainingCards
      );
    }

    // Set hasDealt state variable to true
    setHasDealt(true);

    // Broadcast that the action message has been cleared
    if (socketService.socket) {
      gameService.broadcastActionMessage(socketService.socket, "");
    }
  };

  const handleCardClick = (card: Card) => {
    // Check if the move is valid before proceeding
    if (
      !isValidMove(card, topCard) ||
      card === topCard ||
      currentPlayer !== playerSymbol
    ) {
      // If the move is not valid or it's not the current player's turn, return without doing anything
      return;
    }

    // Remove the clicked card from the player's hand and set it as the new top card
    // Inside handleCardClick function
    if (playerSymbol === "1") {
      setPlayerOneCards(playerOneCards.filter((c) => c !== card));
      setTopCard(card);
    } else if (playerSymbol === "2") {
      setPlayerTwoCards(playerTwoCards.filter((c) => c !== card));
      setTopCard(card);
    }

    // Check if the clicked card is a pick up two card
    if (isPickUpTwoCard(card)) {
      const opponentCards =
        playerSymbol === "1" ? playerTwoCards : playerOneCards;
      const newCards = remainingCards.splice(0, 2);
      setRemainingCards(remainingCards.slice(2));

      // Give the opponent new cards and update their hand
      if (playerSymbol === "1") {
        setPlayerTwoCards([...opponentCards, ...newCards]);
      } else if (playerSymbol === "2") {
        setPlayerOneCards([...opponentCards, ...newCards]);
      }
    }

    // Check if the clicked card is the King of Hearts
    if (card.value === "K" && card.suit === "♥") {
      const opponentCards =
        playerSymbol === "1" ? playerTwoCards : playerOneCards;
      const newCards = remainingCards.splice(0, 5);
      setRemainingCards(remainingCards.slice(5));

      // Give the opponent new cards and update their hand
      if (playerSymbol === "1") {
        setPlayerTwoCards([...opponentCards, ...newCards]);
      } else if (playerSymbol === "2") {
        setPlayerOneCards([...opponentCards, ...newCards]);
      }
    }

    // Check if the clicked card is a skip, pick up two, or pick up five card, and update the current player accordingly
    if (isSkipCard(card) || isPickUpTwoCard(card) || isPickUpFiveCard(card)) {
      setCurrentPlayer(currentPlayer === "1" ? "1" : "2");
    } else {
      setCurrentPlayer(currentPlayer === "1" ? "2" : "1");
    }

    // If the function was called from the player's own device, update the game state on the server
    if (socketService.socket) {
      gameService.updateGame(
        socketService.socket,
        playerOneCards.filter((c) => c !== card),
        playerTwoCards.filter((c) => c !== card),
        card,
        currentPlayer === "1"
          ? isSkipCard(card) || isPickUpTwoCard(card) || isPickUpFiveCard(card)
            ? "1"
            : "2"
          : isSkipCard(card) || isPickUpTwoCard(card) || isPickUpFiveCard(card)
          ? "2"
          : "1",
        remainingCards
      );
    }
    setFlipDeck([...flipDeck, card]);

    let message = ""; // Declare message variable

    if (isSkipCard(card)) {
      const nextPlayer = playerSymbol === "1" ? "2" : "1";
      message = `Player ${playerSymbol} has played a skip card. Player ${nextPlayer} turn is skipped.`;
    } else if (isPickUpTwoCard(card)) {
      const nextPlayer = playerSymbol === "1" ? "2" : "1";
      message = `Player ${playerSymbol} has played a pick up 2 cards card. Player ${nextPlayer} must pick up 2 cards and skip their turn.`;
    } else if (isPickUpFiveCard(card)) {
      const nextPlayer = playerSymbol === "1" ? "2" : "1";
      message = `Player ${playerSymbol} has played a pick up 5 cards card. Player ${nextPlayer} must pick up 5 cards and skip their turn.`;
    }

    // Move setActionMessage call inside this condition
    if (socketService.socket) {
      gameService.broadcastActionMessage(socketService.socket, message);
      setActionMessage(message); // Set the action message for the current player
    }
  };

  const handleNewCardClick = () => {
    if (currentPlayer !== playerSymbol) {
      return;
    }

    // If there are no remaining cards in the deck, create a new deck from the played cards
    if (remainingCards.length === 0) {
      const newDeck = new Deck(flipDeck.slice(0, -1)); // Exclude the last played card
      newDeck.shuffle();
      setRemainingCards(newDeck.getCards());
      setFlipDeck([flipDeck[flipDeck.length - 1]]); // Keep only the last played card
    }

    // Draw a new card from the deck
    const newCard = remainingCards.shift();
    if (!newCard) {
      return;
    }

    // Add the new card to the player's hand
    if (playerSymbol === "1") {
      setPlayerOneCards([...playerOneCards, newCard]);
    } else if (playerSymbol === "2") {
      setPlayerTwoCards([...playerTwoCards, newCard]);
    }

    // If there are no remaining cards in the deck, create a new deck from the played cards
    if (remainingCards.length === 0) {
      const newDeck = new Deck(flipDeck.slice(0, -1)); // Exclude the last played card
      newDeck.shuffle();
      setRemainingCards(newDeck.getCards());
      setFlipDeck([flipDeck[flipDeck.length - 1]]); // Keep only the last played card
    }

    // Change the current player
    setCurrentPlayer(currentPlayer === "1" ? "2" : "1");

    // Update the game state on the server
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

  const isValidMove = (clickedCard: Card, topCard: Card | undefined) => {
    // If there is no top card, the move is not valid
    if (!topCard) {
      return false;
    }
    // The move is valid if the clicked card has the same suit, value or is an ace card
    return (
      clickedCard.suit === topCard.suit ||
      clickedCard.value === topCard.value ||
      clickedCard.value === "A"
    );
  };

  const handleGameUpdate = useCallback(() => {
    if (socketService.socket) {
      gameService.onGameUpdate(
        socketService.socket,
        (playerOneCards, playerTwoCards, topCard, remainingCards) => {
          setPlayerOneCards(playerOneCards);
          setPlayerTwoCards(playerTwoCards);
          setTopCard(topCard);
          setRemainingCards(remainingCards);
        }
      );
    }
  }, []);

  const handleGameStart = useCallback(() => {
    if (socketService.socket)
      gameService.onStartGame(socketService.socket, (options) => {
        setGameStarted(true);
        setPlayerSymbol(options.symbol);
        if (options.start) setPlayerTurn(true);
        else setPlayerTurn(false);
      });
  }, [setGameStarted, setPlayerSymbol, setPlayerTurn]);

  const handleCurrentPlayerUpdate = useCallback(() => {
    if (socketService.socket) {
      gameService.onCurrentPlayerUpdate(
        socketService.socket,
        (currentPlayer) => {
          setCurrentPlayer(currentPlayer);
        }
      );
    }
  }, []);

  const handleDeckUpdate = useCallback(() => {
    if (socketService.socket) {
      gameService.onDeckUpdate(socketService.socket, (deck) => {
        setRemainingCards(deck);
      });
    }
  }, []);

  const handleGameReset = useCallback(() => {
    // Reset the game state by setting all state variables to their initial values
    setPlayerOneCards([]);
    setPlayerTwoCards([]);
    setTopCard(undefined);
    setHasDealt(false);

    if (socketService.socket) {
      // Reset game on the server side
      gameService.resetGame(socketService.socket);
    }
  }, [setPlayerOneCards, setPlayerTwoCards, setTopCard, setHasDealt]);

  const resetGame = useCallback(() => {
    // Reset the game state
    handleGameReset();
  }, [handleGameReset]);

  const notifyGameOver = useCallback(
    (winner: "1" | "2", loser: "1" | "2") => {
      if (playerSymbol === winner) {
        setActionMessage("Congratulations! You have won the game!");
      } else if (playerSymbol === loser) {
        setActionMessage("Sorry, you have lost the game.");
      }

      if (socketService.socket) {
        gameService.broadcastActionMessage(
          socketService.socket,
          winner === "1"
            ? "Player 1 has won the game!"
            : "Player 2 has won the game!"
        );
      }

      resetGame();
    },
    [playerSymbol, setActionMessage, resetGame]
  );

  const checkGameOver = useCallback(() => {
    // Check if the game is over
    if (
      hasDealt &&
      (playerOneCards.length === 0 || playerTwoCards.length === 0)
    ) {
      // If the game is over, notify the winner and the loser
      if (playerOneCards.length === 0) {
        notifyGameOver("1", "2");
      } else {
        notifyGameOver("2", "1");
      }
    }
  }, [hasDealt, playerOneCards, playerTwoCards, notifyGameOver]); // Adding necessary dependencies to the useCallback hook

  const isSkipCard = (card: Card) => {
    // Check if a card is a skip card
    return ["7", "8", "J"].includes(card.value);
  };

  const isPickUpTwoCard = (card: Card) => {
    // Check if a card is a pick up two card
    return card.value === "2";
  };

  const isPickUpFiveCard = (card: Card) => {
    // Check if a card is a pick up five card
    return card.value === "K" && card.suit === "♥";
  };

  const handleRulesClick = () => {
    setRulesVisible(!rulesVisible);
  };

  function Rules() {
    return (
      <div className="rules">
        <h2>Game Rules</h2>
        <h3>Valid Move:</h3>
        <ul>
          <li>Card with the same suit as the flipped card</li>
          <li>Card with same number as the flipped card</li>
          <li>Aces are wild and can be played at any time</li>
        </ul>
        <h3>Trick Cards:</h3>
        <h4>Skip Cards:</h4>
        <ul>
          <li>Cards with the number 7, 8, and Jacks</li>
        </ul>
        <h4>Pick Up 2 Cards:</h4>
        <ul>
          <li>Any card with the number 2</li>
        </ul>
        <h4>Pick Up 5 Cards:</h4>
        <ul>
          <li>King of hearts</li>
        </ul>
      </div>
    );
  }
  

  useEffect(() => {
    handleGameUpdate();
    handleGameStart();
    handleCurrentPlayerUpdate();
    handleDeckUpdate();

    // Add the action message listener
    if (socketService.socket) {
      gameService.onActionMessageUpdate(
        socketService.socket,
        (message: string) => {
          if (message === "Player 1 has won the game!") {
            setActionMessage(
              playerSymbol === "1"
                ? "Congratulations! You have won the game!"
                : "Sorry, you have lost the game."
            );
          } else if (message === "Player 2 has won the game!") {
            setActionMessage(
              playerSymbol === "2"
                ? "Congratulations! You have won the game!"
                : "Sorry, you have lost the game."
            );
          } else {
            setActionMessage(message);
          }
        }
      );
    }
  }, [
    handleGameUpdate,
    handleGameStart,
    handleCurrentPlayerUpdate,
    handleDeckUpdate,
    playerSymbol, // You will need to add this new dependency
  ]);

  // Add a new useEffect hook to call checkGameOver() whenever the playerOneCards or playerTwoCards states change
  useEffect(() => {
    checkGameOver();
  }, [checkGameOver]); // Adding checkGameOver to the dependencies

  return (
    <div>
      <div className="wrapper">
        <button onClick={handleRulesClick} className="rules-btn">
          Rules
        </button>
        {rulesVisible && <Rules />}
        <div className="App">
          {!isGameStarted && (
            <h2>Waiting for another play to join the game lobby</h2>
          )}
          <div className="board">
            <div className="action-message">{actionMessage}</div>
            <div className="player-one">
              <div className="turn-indicator-player-one">
                Player One{" "}
                {playerSymbol === "1" &&
                  currentPlayer === "1" &&
                  " - It's your turn!"}
              </div>
              {playerSymbol === "1"
                ? playerOneCards.map((card, index) => (
                    <div
                      key={index}
                      className={`card ${card.color}`}
                      onClick={() => handleCardClick(card)}
                    >
                      {card.value} {card.suit}
                    </div>
                  ))
                : playerOneCards.map((_, index) => (
                    <div key={index} className="card blocked-card"></div>
                  ))}
            </div>
            <button
              className="deal-btn"
              onClick={dealCards}
              disabled={playerSymbol !== "1"}
            >
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
              <div className="turn-indicator-player-two">
                Player Two{" "}
                {playerSymbol === "2" &&
                  currentPlayer === "2" &&
                  " - It's your turn!"}
              </div>
              {playerSymbol === "2"
                ? playerTwoCards.map((card, index) => (
                    <div
                      key={index}
                      className={`card ${card.color}`}
                      onClick={() => handleCardClick(card)}
                    >
                      {card.value} {card.suit}
                    </div>
                  ))
                : playerTwoCards.map((_, index) => (
                    <div key={index} className="card blocked-card"></div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
