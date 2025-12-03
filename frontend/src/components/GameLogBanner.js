import React from "react";

/**
 * GameLogBanner
 * Displays game log and market news in a collapsible banner
 */
const GameLogBanner = ({ updates = [], gameLog = [], logExpanded, setLogExpanded }) => {
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

  if (updates.length === 0 && gameLog.length === 0) {
    return null;
  }

  return (
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
              .slice(-15)
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
              .slice(-15)
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
  );
};

export default GameLogBanner;

