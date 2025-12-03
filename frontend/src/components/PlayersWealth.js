import React from "react";

/**
 * PlayersWealth
 * Displays player information including name, emoji, cash, net worth, and actions remaining
 */
const PlayersWealth = ({
  players = [],
  currentTurn,
  name,
  playerCash = {},
  playerNetWorths = {},
  playerColors = {},
  playerEmojis = {},
  actionsRemaining = {}
}) => {
  return (
    <div className="players-wealth" style={{ flex: 1 }}>
      {players.map((player, idx) => (
        <div
          key={idx}
          className={`player-wealth-item ${
            player === currentTurn ? "active" : ""
          } ${player === name ? "current-player" : ""}`}
          style={{
            borderLeft: `8px solid ${playerColors[player] || '#666666'}`,
            backgroundColor: `${playerColors[player] || '#666666'}15`,
            border: `2px solid ${playerColors[player] || '#666666'}40`,
            borderLeftWidth: '8px',
            boxShadow: `0 2px 6px ${playerColors[player] || '#666666'}30`,
          }}
        >
          <span className="player-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.3rem', fontWeight: '600' }}>
            <span style={{ fontSize: '1.8rem' }}>
              {playerEmojis[player] || '🎮'}
            </span>
            {player === currentTurn && <span style={{ fontSize: '1.3rem' }}>▶</span>}
            <span>{player}</span>
            {player === name && <span style={{ fontSize: '1.1rem', opacity: 0.8 }}>(You)</span>}
            {player === currentTurn && (
              <span style={{
                marginLeft: '8px',
                padding: '4px 12px',
                backgroundColor: (actionsRemaining[player] || 0) > 0 ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 0, 0, 0.3)',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: `2px solid ${(actionsRemaining[player] || 0) > 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(255, 0, 0, 0.4)'}`,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
              }}>
                ⚡{actionsRemaining[player] || 0}
              </span>
            )}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span className="player-cash">
              💰 ${playerCash[player] !== undefined ? playerCash[player] : 30}
            </span>
            <span className="player-net-worth" style={{
              fontSize: '0.85rem',
              color: '#aaa',
              fontStyle: 'italic'
            }}>
              Net: ${playerNetWorths[player] !== undefined ? playerNetWorths[player] : 40}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayersWealth;

