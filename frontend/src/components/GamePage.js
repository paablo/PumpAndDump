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
        <div className="lobby-page">
          <div className="lobby-container">
            {/* Lobby Header */}
            <div className="lobby-header">
              <div className="lobby-title">
                <span className="lobby-icon">🎪</span>
                <h1>Game Lobby</h1>
              </div>
              <div className="room-badge">
                <span className="badge-label">Room Code:</span>
                <span className="badge-value">{room}</span>
              </div>
            </div>

            {/* Players Section */}
            <div className="lobby-card players-card">
              <div className="card-header">
                <h2>👥 Players</h2>
                <div className="player-count-badge">
                  {playerCount} {playerCount === 1 ? 'Player' : 'Players'}
                </div>
              </div>
              <div className="card-content">
                {playerCount === 0 ? (
                  <div className="empty-state">
                    <p>⏳ Waiting for players to join...</p>
                  </div>
                ) : (
                  <div className="players-grid">
                    {Array.from({ length: playerCount }).map((_, index) => (
                      <div key={index} className="player-avatar">
                        <div className="avatar-circle">
                          <span className="avatar-icon">🎮</span>
                        </div>
                        <span className="avatar-label">Player {index + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {playerCount < 2 && (
                  <div className="info-message">
                    <span className="info-icon">ℹ️</span>
                    <span>Need at least 2 players to start</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Feed */}
            {updates.length > 0 && (
              <div className="lobby-card activity-card">
                <div className="card-header">
                  <h2>📢 Activity Feed</h2>
                </div>
                <div className="card-content">
                  <div className="activity-list">
                    {updates.slice(-5).reverse().map((update, index) => (
                      <div key={index} className="activity-item">
                        <span className="activity-dot"></span>
                        <span className="activity-text">{update}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="lobby-actions">
              <Button
                color="primary"
                variant="contained"
                onClick={startGame}
                className="lobby-button start-button"
                size="large"
                disabled={playerCount < 2}
              >
                🚀 Start Game
              </Button>
              <Button
                variant="outlined"
                onClick={leaveRoom}
                className="lobby-button leave-button"
                size="large"
              >
                🚪 Leave Room
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
