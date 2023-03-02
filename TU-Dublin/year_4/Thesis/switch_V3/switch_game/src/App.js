import './App.css';
import Deck from './deck.js';
import "./deck.css"
import { useState } from 'react';


function App() {
  const [cards, setCards] = useState([[], []]);
  const [topCard, setTopCard] = useState(null);
  const [playerTurn, setPlayerTurn] = useState(0);
  const deck = new Deck();

  deck.shuffle()
  
  function dealCards() {
    const newCards = [[], []];
    for (let i = 0; i < 5; i++) {
      newCards[0].push(deck.pop());
      newCards[1].push(deck.pop());
    }
    setCards(newCards);
    setTopCard(deck.pop());
  }

  function handleCardClick(card, playerIndex) {
    if (playerIndex !== playerTurn) {
      // It's not the current player's turn, do nothing
      return;
    }
    
    setTopCard(card);
    setPlayerTurn(1 - playerTurn); // Switch to the other player's turn
  }
  
  return (
    <body>
      <div className="wrapper">
        <div className="App">
          <div className="board">
            <div className='player-one'>
              {cards[0].map((card, index) => (
                <div key={index} className={`card player1-card-${index+1} ${card.color}`} onClick={() => handleCardClick(card, 0)}>
                  {card.value} {card.suit}
                </div>
              ))}
            </div>
            <button className="deal-btn" onClick={dealCards}>Deal</button>
            <div className='top-card'>
              {topCard && (
                <div className={`card top-card ${topCard.color}`}>
                  {topCard.value} {topCard.suit}
                </div>
              )}
            </div>
            <div className='player-two'>
              {cards[1].map((card, index) => (
                <div key={index} className={`card player2-card-${index+1} ${card.color}`} onClick={() => handleCardClick(card, 1)}>
                  {card.value} {card.suit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </body>
  );
}

export default App;
