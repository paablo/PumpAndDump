import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
//import GithubCorner from "react-github-corner";

// importing components
import LoginPage from "./components/LoginPage";
import GamePage from "./components/GamePage";

// const CONNECTION = 'localhost:4000';
const CONNECTION = "/";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("test");

  const socket = useRef();

  useEffect(() => {
    socket.current = io(CONNECTION, {
      transports: ["websocket"],
    });
  }, [socket]);

  // Auto-login in dev mode
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev && socket.current && !loggedIn) {
      // Generate random name
      const adjectives = ['Swift', 'Bold', 'Clever', 'Mighty', 'Lucky', 'Brave', 'Wise', 'Quick', 'Cool', 'Sharp'];
      const nouns = ['Tiger', 'Eagle', 'Lion', 'Wolf', 'Bear', 'Fox', 'Hawk', 'Dragon', 'Phoenix', 'Panther'];
      const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 100)}`;
      
      console.log(`[DEV MODE] Auto-joining room "${room}" as "${randomName}"`);
      
      setName(randomName);
      socket.current.emit('join_room', { room, name: randomName });
      setLoggedIn(true);
    }
  }, [socket.current, loggedIn, room]);

  

  return (
    <div className="App flex-centered">
      {loggedIn ? (
        <GamePage
          room={room}
          socket={socket}
          name={name}
          setLoggedIn={setLoggedIn}
        />
      ) : (
        <LoginPage
          socket={socket}
          setLoggedIn={setLoggedIn}
          name={name}
          setName={setName}
          room={room}
          setRoom={setRoom}
        />
      )}

    </div>
  );
};

export default App;
