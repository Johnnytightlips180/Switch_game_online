import "./App.css";
import io from "socket.io-client";
import { useState, useEffect } from 'react';
import Deck from './deck.js';
import "./deck.css"


const socket = io.connect("http://localhost:3003");

function App() {
  const [cards, setCards] = useState([[], []]);
  const [topCard, setTopCard] = useState(null);
  const [playerTurn, setPlayerTurn] = useState(0);
  const [remainingDeckState, setRemainingDeckState] = useState([]);
  const [player1_name, setPlayer1_name] = useState("");
  const [room, setRoom] = useState("");

  const deck = new Deck();

  const joinRoom = () => {
    if (player1_name !== "" && room !== "") {
      socket.emit("join_room", room)
    }
  }

  function dealCards() {
    const newCards = [[], []];
    const remainingDeck = new Deck();
    remainingDeck.shuffle(); // Shuffle the deck
    const cardsInDeck = remainingDeck.getCards();
    for (let i = 0; i < 5; i++) {
      newCards[0].push(cardsInDeck.pop());
      newCards[1].push(cardsInDeck.pop());
    }
    setCards(newCards);
    setTopCard(cardsInDeck.pop());
    setRemainingDeckState(cardsInDeck);
    console.log(cardsInDeck.length);
  }

  function handleCardClick(card, playerIndex) {
    if (playerIndex !== playerTurn) {
      // It's not the current player's turn, do nothing
      return;
    }

    const newCards = [...cards];
    newCards[playerIndex] = newCards[playerIndex].filter(c => c !== card); // Remove the clicked card from the player's hand
    setCards(newCards);

    setTopCard(card);
    setPlayerTurn(1 - playerTurn); // Switch to the other player's turn
  }

  function handleNewCardClick() {
    const newCards = [...cards];
    const remainingDeck = [...remainingDeckState];
    newCards[playerTurn].push(remainingDeck.pop()); // Add a new card to the current player's hand
    setCards(newCards);
    setRemainingDeckState(remainingDeck);

    setPlayerTurn(1 - playerTurn); // Switch to the other player's turn
    console.log(remainingDeck.length);
  }
  
  return (
    <><div className="joinChatContainer">
      <h3>Join A Game</h3>
      <input
        type="text"
        placeholder="John..."
        onChange={(event) => {
          setPlayer1_name(event.target.value);
        } } />
      <input
        type="text"
        placeholder="Room ID..."
        onChange={(event) => {
          setRoom(event.target.value);
        } } />
      <button onClick={joinRoom}>Join A Game</button>
    </div><div>
        <div className="wrapper">
          <div className="App">
            <div className="board">
              <div className='player-one'>
                {cards[0].map((card, index) => (
                  <div key={index} className={`card player1-card-${index + 1} ${card.color}`} onClick={() => handleCardClick(card, 0)}>
                    {card.value} {card.suit}
                  </div>
                ))}
              </div>
              <button className="deal-btn" onClick={dealCards}>Deal</button>
              <button className="new-card-btn" onClick={handleNewCardClick}>New Card</button>
              <div className='top-card'>
                {topCard && (
                  <div className={`card top-card ${topCard.color}`}>
                    {topCard.value} {topCard.suit}
                  </div>
                )}
              </div>
              <div className='player-two'>
                {cards[1].map((card, index) => (
                  <div key={index} className={`card player2-card-${index + 1} ${card.color}`} onClick={() => handleCardClick(card, 1)}>
                    {card.value} {card.suit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div></>
  );
}

export default App;

