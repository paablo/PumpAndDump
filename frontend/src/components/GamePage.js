import React, { useState, useEffect, useLayoutEffect } from "react";
import Game from "./Game";
import MessageOverlay from "./MessageOverlay";
import Lobby from "./Lobby";

const GamePage = ({ socket, name, room, setLoggedIn }) => {
  const [start, setStart] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [playerNames, setPlayerNames] = useState([]); // Add this state
  const [playerColors, setPlayerColors] = useState({});
  const [playerEmojis, setPlayerEmojis] = useState({});
  const [updates, setUpdates] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false); // Track if player has joined room
  const [snackbars, setSnackbars] = useState([]);
  const [nextSnackbarId, setNextSnackbarId] = useState(0);
  
  const showMessage = (message, action = null) => {
    const id = nextSnackbarId;
    setNextSnackbarId(id + 1);
    setSnackbars(prev => [...prev, { id, message, action }]);
  };
  
  const handleSnackbarClose = (id) => {
    const snackbarToClose = snackbars.find(s => s.id === id);
    setSnackbars(prev => prev.filter(s => s.id !== id));
    
    if (snackbarToClose?.action && typeof snackbarToClose.action === "function") {
      snackbarToClose.action();
    }
  };

  // Set up socket listeners immediately using useLayoutEffect for synchronous setup
  // This ensures listeners are attached before any updates can arrive
  useLayoutEffect(() => {
    if (!socket || !socket.current) return;

    const sc = socket.current;
    
    // Set up listeners first to catch any immediate updates
    const handlePlayerCount = (count) => {
      setPlayerCount(count);
      // Mark as joined when we receive player count
      if (count > 0) {
        setHasJoinedRoom(true);
      }
    };
    
    const handlePlayerNames = (names) => {
      setPlayerNames(names);
      // Mark as joined when we receive player names
      if (names && names.length > 0) {
        setHasJoinedRoom(true);
      }
    };
    
    const handlePlayerColors = (colors) => {
      setPlayerColors(colors || {});
    };
    
    const handlePlayerEmojis = (emojis) => {
      setPlayerEmojis(emojis || {});
    };
    
    sc.on("player_count", handlePlayerCount);
    sc.on("player_names", handlePlayerNames);
    sc.on("player_colors", handlePlayerColors);
    sc.on("player_emojis", handlePlayerEmojis);
    
    // Request current room state immediately after listeners are set up
    // This ensures we have the latest player list
    sc.emit("get_room_state", { room });
    
    return () => {
      sc.off("player_count", handlePlayerCount);
      sc.off("player_names", handlePlayerNames);
      sc.off("player_colors", handlePlayerColors);
      sc.off("player_emojis", handlePlayerEmojis);
    };
  }, [socket, room]);
  
  // Separate useEffect for other listeners and handlers
  useEffect(() => {
    if (!socket || !socket.current) return;

    const sc = socket.current;
    
    sc.on("start_game", () => {
      setStart(true);
    });

    // Connection lost/disconnect handler - only show if player has joined
    sc.on("disconnect", (reason) => {
      console.log("Socket disconnected in lobby:", reason);
      if (hasJoinedRoom) {
        showMessage("❌ Connection to server lost. Returning to home page...", () => {
          setLoggedIn(false);
        });
      } else {
        // If not joined yet, just silently return to home
        setLoggedIn(false);
      }
    });

    sc.on("connect_error", (error) => {
      console.log("Connection error in lobby:", error);
      // Only show error if player has joined
      if (hasJoinedRoom) {
        showMessage("❌ Failed to connect to server. Returning to home page...", () => {
          setLoggedIn(false);
        });
      } else {
        // If not joined yet, just silently return to home
        setLoggedIn(false);
      }
    });

    return () => {
      sc.off("start_game");
      sc.off("disconnect");
      sc.off("connect_error");
    };
  }, [socket, setLoggedIn, hasJoinedRoom, showMessage]);

  useEffect(() => {
    if (!socket || !socket.current) return;

    const sc = socket.current;
    sc.on("update", (msg) => {
      setUpdates((updates) => [...updates, msg]);
    });
    sc.on("round_update", (round) => {
      setRoundNumber(round); // Update round number when received from server
      console.log(round);
    });

    return () => {
      sc.off("update");
      sc.off("round_update");
    };
  }, [socket]);

  const startGame = () => {
    if (playerCount < 2) {
      // use browser alert instead of snackbar
      alert("You need at least 2 players to start the game");
      return null;
    }
    socket.current.emit("start_game", room);
    console.log("start game");
  };

  const leaveRoom = () => {
    socket.current.emit("leave_room", { name, room });
    setLoggedIn(false);
  };

  return (
    <div className="gamepage">
      {start ? (
        <Game
          room={room}
          socket={socket}
          name={name}
          setLoggedIn={setLoggedIn}
          roundNumber={roundNumber}
        />
      ) : (
        <Lobby
          room={room}
          name={name}
          playerCount={playerCount}
          playerNames={playerNames}
          playerColors={playerColors}
          playerEmojis={playerEmojis}
          updates={updates}
          onStartGame={startGame}
          onLeaveRoom={leaveRoom}
        />
      )}
      <MessageOverlay snackbars={snackbars} handleSnackbarClose={handleSnackbarClose} />
    </div>
  );
};

export default GamePage;
