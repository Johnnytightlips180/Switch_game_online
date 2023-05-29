import React, { useState, useContext, useEffect } from "react";
import "./joinLobby.css"
import gameContext from "../../gameContext";
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';


interface DecodedToken {
  id: number;
  username: string;
  iat: number;
  exp: number;
}

// Get the token from sessionStorage
const token = sessionStorage.getItem('token');

if (token) {
  // Decode the token
  const decoded = jwt_decode<DecodedToken>(token);

  // Access the username
  const username = decoded.username;

  console.log(username); // Logs the username to the console

}

interface IJoinRoomProps {}

export function JoinRoom(props: IJoinRoomProps) {
  const [roomName, setRoomName] = useState("");
  const [isJoining, setJoining] = useState(false);
  const [username, setUsername] = useState('');
  

  const { setInRoom } = useContext(gameContext);
  const navigate = useNavigate();

   //useEffect to get username from token when component mounts
   useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode<DecodedToken>(token);
      setUsername(decoded.username); // Set the username
    }
  }, []);

  const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
    const value = e.target.value;
    setRoomName(value);
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const socket = socketService.socket;

    if (!roomName || roomName.trim() === "" || !socket) return;

    setJoining(true);

    const joined = await gameService.joinGameRoom(socket, roomName).catch((err) => {
      alert(err);
    });

    if (joined) {
      setInRoom(true);
      navigate("/Game"); // Redirect to the Game component
    }

    setJoining(false);
  };

  return (
    <form onSubmit={joinRoom}>
      <div className="joinGameContainer">
        <h3>Welcome, {username}! Enter a room ID to be able to join a game</h3>
        <input type="text" placeholder="Game1" onChange={handleRoomNameChange} />
        <button type="submit" disabled={isJoining}>
          {isJoining ? "Joining..." : "Join Game"}
        </button>
      </div>
    </form>
  );
}