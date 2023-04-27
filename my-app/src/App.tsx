import React, { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import socketService from "./services/socketService";
import { JoinRoom } from "./components/joinRoom";
import GameContext, { IGameContextProps } from "./gameContext";
import { Game } from "./components/game";



function App() {

  // set initial value of isInRoom state to false
  const [isInRoom, setInRoom] = useState(false);

  // async function to connect socket and handle any error
  const connectSocket = async () => {
    const socket = await socketService
      .connect("http://localhost:9000")
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  // useEffect hook to call the connectSocket function only once after component mount
  useEffect(() => {
    connectSocket();
  }, []);

  // create an object with properties isInRoom and setInRoom to pass down to child components via context
  const gameContextValue: IGameContextProps = {
    isInRoom,
    setInRoom
  };


  return (
    <GameContext.Provider value={gameContextValue}>
    <div className="wrapper">
      <div className="App">
        {!isInRoom && <JoinRoom />}
        {isInRoom && <Game/>}
    
      </div>
    </div>
    </GameContext.Provider>

    
        
  );
}

export default App;

