import React, { useState, useEffect } from "react";
import { Button } from "@material-ui/core";
import Game from "./Game";

const GamePage = ({ socket, name, room, setLoggedIn }) => {
  const [start, setStart] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [updates, setUpdates] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1); // Add state for round number

  // FIX: useEffect (was useState) to attach socket listeners for player count and start
  useEffect(() => {
    if (!socket || !socket.current) return;

    const sc = socket.current;
    sc.on("player_count", (count) => {
      setPlayerCount(count);
    });
    sc.on("start_game", () => {
      setStart(true);
    });

    return () => {
      sc.off("player_count");
      sc.off("start_game");
    };
  }, [socket]);

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
    <div className="gamepage" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px", boxSizing: "border-box" }}>
      {start ? (
        <Game
          room={room}
          socket={socket}
          name={name}
          setLoggedIn={setLoggedIn}
          roundNumber={roundNumber}
        />
      ) : (
        <div className="flex-centered" style={{ width: "100%", maxWidth: "600px" }}>
          <div className="login flex-centered-column" style={{ width: "100%" }}>
            <h2 style={{ textAlign: "center" }}>
              You have joined room <span style={{ color: "blue" }}>{room}</span>{" "}
            </h2>
            <h2 style={{ textAlign: "center" }}>there are currently {playerCount} player(s) in this room</h2>
            <h1 style={{ textAlign: "center" }}>Start the game?</h1>
            <div className="actions" style={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
              <div className="button">
                <Button
                  color="primary"
                  variant="contained"
                  onClick={startGame}
                  className="abutton"
                  style={{ width: "100%" }}
                >
                  {" "}
                  start{" "}
                </Button>
              </div>
              <div className="button">
                <Button
                  color="primary"
                  variant="contained"
                  onClick={leaveRoom}
                  style={{ width: "100%" }}
                >
                  {" "}
                  Leave room{" "}
                </Button>
              </div>
            </div>
          </div>
          <div className="updates" style={{ marginTop: "20px", width: "100%" }}>
            <ul style={{ padding: "0", listStyleType: "none", textAlign: "center" }}>
              {updates.map((update, index) => (
                <li key={index}>{update}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
