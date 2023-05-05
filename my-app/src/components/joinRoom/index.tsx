import React, { useState, useContext } from "react";
import "./joinLobby.css"
import gameContext from "../../gameContext";
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";


interface IJoinRoomProps {}


export function JoinRoom(props: IJoinRoomProps){

    // State Variables 
    const [roomName, setRoomName] = useState("");
    const [isJoining, setJoining] = useState(false);

    // gameContext to access the setInRoom and isInRoom variables
    const { setInRoom, isInRoom } = useContext(gameContext);

    // When the user changes the room name
    const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
        const value = e.target.value;
        setRoomName(value);
    };

    // Join the game room when form is submitted
    const joinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Get the socket from the socketService
        const socket = socketService.socket;

        // If the room name is empty or the socket is not available, do nothing
        if(!roomName || roomName.trim() === "" || !socket) return;

        // Set isJoining to true
        setJoining(true);

        // Attempt to join the game room using gameService, and catch any errors
        const joined = await gameService.joinGameRoom(socket, roomName).catch((err) => {
            alert(err);
        });

        // If joined is true, set isInRoom to true

        if (joined)
            setInRoom(true);

        setJoining(false);

    }

    return (
        <form onSubmit={joinRoom}>
            <div className="joinGameContainer">
                <h3>Enter a room ID to be able to join A Game</h3>
                <input
                    type="text"
                    placeholder="Game1"
                    onChange={handleRoomNameChange}
                />
                <button type="submit" disabled={isJoining}>{ isJoining ? "Joining... " : "Join Game" }</button>
            </div>
        </form>

    )
}
