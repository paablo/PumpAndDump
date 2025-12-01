import React from "react";

const GameHeader = ({
  roundNumber,
  players,
  currentTurn,
  name,
  playerCash,
  playerNetWorths = {},
  updates,
  gameLog,
  logExpanded,
  setLogExpanded,
  ownedStocks = [],
  actionsRemaining = 2,
  onSellStock,
  stockOwnershipCounts = {},
  indexes = [],
}) => {
  const [portfolioExpanded, setPortfolioExpanded] = React.useState(false);

  // Calculate current market price for a stock
  const getStockPrice = (stock) => {
    const index = indexes.find(idx => idx.name === stock.industrySector);
    const indexPrice = index ? index.price : 0;
    const baseCost = stock.baseCost || 0;
    const growth = stock.growth || 0;
    const stocksOwned = stockOwnershipCounts[stock.name] || 0;
    return baseCost + indexPrice + (growth * stocksOwned);
  };
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
                {player === name && player === currentTurn && (
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: actionsRemaining > 0 ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 0, 0, 0.3)',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    border: `1px solid ${actionsRemaining > 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(255, 0, 0, 0.4)'}`,
                  }}>
                    ⚡{actionsRemaining}
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
      </div>

      {/* Player Portfolio */}
      {ownedStocks.length > 0 && (
        <div className="player-portfolio" style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div 
            style={{ 
              padding: '10px 16px',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              userSelect: 'none'
            }}
            onClick={() => setPortfolioExpanded(!portfolioExpanded)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.3rem' }}>📋</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'black' }}>
                  Your Portfolio
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8, color: 'black' }}>
                  {ownedStocks.length} holding{ownedStocks.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <span style={{ 
              fontSize: '18px', 
              color: 'black',
              transition: 'transform 0.3s', 
              transform: portfolioExpanded ? 'rotate(180deg)' : 'rotate(0deg)' 
            }}>
              ▼
            </span>
          </div>
        
          {/* Expanded Portfolio View */}
          {portfolioExpanded && (
            <div style={{ 
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%)',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                {ownedStocks.map((stock, idx) => {
                  const currentPrice = getStockPrice(stock);
                  const profit = currentPrice - (stock.purchasePrice || 0) - stock.growth;
                  const profitPercent = stock.purchasePrice > 0 ? ((profit / stock.purchasePrice) * 100).toFixed(1) : 0;
                  const profitColor = profit > 0 ? '#1CAF00' : profit < 0 ? '#f44336' : '#999';
                  const profitEmoji = profit > 0 ? '📈' : profit < 0 ? '📉' : '➖';
                  const dividend = stock.dividend || 0;
                  
                  return (
                    <div 
                      key={idx}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                        padding: '14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease',
                        color: 'black'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '1.05rem', marginBottom: '4px' }}>
                            {stock.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', opacity: 0.7, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span>🪙 Div: ${dividend}</span>
                            <span>•</span>
                            <span>📈 Growth: {stock.growth || 0}x</span>
                          </div>
                        </div>
                        <div style={{ 
                          textAlign: 'right',
                          fontSize: '0.9rem',
                          color: profitColor,
                          fontWeight: 'bold',
                          padding: '4px 8px',
                          backgroundColor: `${profitColor}11`,
                          borderRadius: '6px',
                          border: `1px solid ${profitColor}99`
                        }}>
                          {profitEmoji} {profit >= 0 ? '+' : ''}${profit}
                          <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>
                            {profitPercent}%
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px 10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        fontSize: '0.85rem'
                      }}>
                        <span>Bought: <strong>${stock.purchasePrice}</strong> <span style={{ opacity: 0.2 }}>(R{stock.purchaseRound})</span></span>
                        <span>→</span>
                        <span>Now: <strong>${currentPrice}</strong></span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSellStock) onSellStock(stock);
                        }}
                        style={{
                          width: '90%',
                          padding: '10px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          fontWeight: 'bold',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#d32f2f';
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f44336';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
                        }}
                      >
                        Sell for ${currentPrice - stock.growth} (inc. growth tax)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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

