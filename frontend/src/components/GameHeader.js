import React from "react";

const GameHeader = ({
  roundNumber,
  players,
  currentTurn,
  name,
  playerCash,
  updates,
  gameLog,
  logExpanded,
  setLogExpanded,
}) => {
  // Get the most recent log entry (market news prioritized over player updates)
  const getLastLogEntry = () => {
    if (gameLog.length > 0) {
      const lastLog = gameLog[gameLog.length - 1];
      return `R${lastLog.round}: ${lastLog.message}`;
    }
    if (updates.length > 0) {
      return updates[updates.length - 1];
    }
    return "No recent activity";
  };

  return (
    <div className="game-header">
      <div className="game-info-bar">
        <div className="round-badge">Round {roundNumber}</div>
        <div className="players-wealth">
          {players.map((player, idx) => (
            <div
              key={idx}
              className={`player-wealth-item ${
                player === currentTurn ? "active" : ""
              } ${player === name ? "current-player" : ""}`}
            >
              <span className="player-name">
                {player === currentTurn && "▶ "}
                {player}
                {player === name && " (You)"}
              </span>
              <span className="player-cash">
                💰 ${playerCash[player] !== undefined ? playerCash[player] : 30}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible Game Log - Integrated into banner */}
      {(updates.length > 0 || gameLog.length > 0) && (
        <div className="game-log-banner">
          <div
            className="log-banner-header clickable"
            onClick={() => setLogExpanded(!logExpanded)}
          >
            <span className="log-banner-icon">📊</span>
            {logExpanded ? (
              <span className="log-banner-title">Game Log & Market News</span>
            ) : (
              <span className="log-banner-preview">{getLastLogEntry()}</span>
            )}
            <span className="collapse-icon">{logExpanded ? "▼" : "▶"}</span>
          </div>
          {logExpanded && (
            <div className="log-list">
              {/* Market News from backend */}
              {gameLog.length > 0 &&
                gameLog
                  .slice(-5)
                  .reverse()
                  .map((entry, index) => (
                    <div key={`log-${index}`} className="log-item log-market">
                      <span className="log-round">R{entry.round}</span>
                      <span className="log-message">{entry.message}</span>
                    </div>
                  ))}

              {/* Player updates */}
              {updates.length > 0 &&
                updates
                  .slice(-5)
                  .reverse()
                  .map((update, index) => (
                    <div key={`update-${index}`} className="log-item log-player">
                      <span className="log-icon">🎴</span>
                      <span className="log-message">{update}</span>
                    </div>
                  ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameHeader;

