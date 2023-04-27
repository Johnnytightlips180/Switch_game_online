import React from "react";

// script for all the gamestates to keep track 
export interface IGameContextProps {
    isInRoom: boolean;
    setInRoom: (inRoom: boolean) => void;
};

// Need a defualt state for when the game starts 
const defaultState: IGameContextProps = {
    isInRoom: false,
    setInRoom: () => {},
}

export default React.createContext(defaultState);