import React, { useState } from "react";
import { Button } from "@material-ui/core";
import GameRules from "./GameRules";

const Lobby = ({
  room,
  name,
  playerCount,
  playerNames,
  playerColors,
  playerEmojis,
  updates,
  onStartGame,
  onLeaveRoom
}) => {
  const [rulesExpanded, setRulesExpanded] = useState(false);

  return (
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
          <div className="room-badge">
            <span className="badge-label">Player name:</span>
            <span className="badge-value">{name}</span>
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
                {playerNames.map((playerName, index) => (
                  <div key={index} className="player-avatar">
                    <div 
                      className="avatar-circle"
                      style={{
                        backgroundColor: playerColors[playerName] || '#666666',
                        border: `3px solid ${playerColors[playerName] || '#666666'}`,
                        boxShadow: `0 4px 12px ${playerColors[playerName] ? playerColors[playerName] + '40' : 'rgba(0,0,0,0.2)'}`
                      }}
                    >
                      <span className="avatar-icon" style={{ fontSize: '2.2rem' }}>
                        {playerEmojis[playerName] || '🎮'}
                      </span>
                    </div>
                    <span className="avatar-label">{playerName}</span>
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

        {/* Game Rules Section */}
        <GameRules 
          variant="collapsible" 
          isExpanded={rulesExpanded} 
          onToggle={() => setRulesExpanded(!rulesExpanded)} 
        />

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
            onClick={onStartGame}
            className="lobby-button start-button"
            size="large"
            disabled={playerCount < 2}
          >
            🚀 Start Game
          </Button>
          <Button
            variant="outlined"
            onClick={onLeaveRoom}
            className="lobby-button leave-button"
            size="large"
          >
            🚪 Leave Room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;

