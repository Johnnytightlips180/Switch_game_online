import React from 'react';
import { render } from '@testing-library/react';
import { Game } from './index';
import GameContext from '../../gameContext';

test('renders Game component', () => {
    const gameContextValue = {
      isInRoom: false,
      setInRoom: jest.fn(),
      playerSymbol: "1" as "1" | "2", 
      setPlayerSymbol: jest.fn(),
      isPlayerTurn: true,
      setPlayerTurn: jest.fn(),
      isGameStarted: true,
      setGameStarted: jest.fn(),
    };
  
    render(
      <GameContext.Provider value={gameContextValue}>
        <Game />
      </GameContext.Provider>
    );
  });

  