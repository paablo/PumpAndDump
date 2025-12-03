import React from "react";

const GameRules = ({ variant = "card", isExpanded, onToggle, showTitle = true }) => {
  const rulesContent = (
    <div className="rules-content">
      <div className="rule-section">
        <h3>🎯 Objective</h3>
        <p>Finish with the highest net worth (cash + stock value) to win!</p>
      </div>

      <div className="rule-section">
        <h3>🔄 Turns & Actions</h3>
        <ul className="rules-list">
          <li>Each player gets <strong>3 actions per turn</strong></li>
          <li>Actions can be used to: <strong>Buy stocks</strong>, <strong>Sell stocks</strong>, or <strong>Draw action cards</strong></li>
          <li>When your turn starts, you'll see your actions remaining (⚡)</li>
        </ul>
      </div>

      <div className="rule-section">
        <h3>💰 Stocks</h3>
        <ul className="rules-list">
          <li>Stock price = <strong>Base Cost + Index Price + (Growth × Shares Owned)</strong></li>
          <li>Each stock pays <strong>dividends every 2 rounds</strong> (even rounds)</li>
          <li><strong>Growth</strong> increases price based on total shares owned by all players</li>
        </ul>
      </div>

      <div className="rule-section">
        <h3>📈 Indexes</h3>
        <ul className="rules-list">
          <li>Index prices change based on <strong>events</strong></li>
          <li>Each stock belongs to an index sector: <strong>Tech</strong>, <strong>Finance</strong>, <strong>Industrial</strong>, <strong>Health & Science</strong></li>
        </ul>
      </div>

      <div className="rule-section">
        <h3>📰 Events</h3>
        <ul className="rules-list">
          <li>Events affect index prices when <strong>triggered</strong></li>
          <li>Some events have <strong>conditional effects</strong> (bubble pops) that trigger later</li>
        </ul>
      </div>

      <div className="rule-section">
        <h3>🎴 Action Cards</h3>
        <ul className="rules-list">
          <li>Draw action cards from the deck (max <strong>4 in hand</strong>)</li>
          <li>Use action cards to manipulate the market:
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li><strong>Forecast:</strong> See upcoming events</li>
              <li><strong>Shuffle:</strong> Reshuffle event deck</li>
              <li><strong>Manipulate:</strong> Change stock prices</li>
              <li><strong>Insider Trading:</strong> Buy stocks at a discount</li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="rule-section">
        <h3>🏆 Winning</h3>
        <p>After <strong>6 rounds</strong>, the player with the highest net worth wins!</p>
      </div>
    </div>
  );

  if (variant === "popup") {
    return (
      <div style={{
        width: '100%',
        maxHeight: '70vh',
        overflowY: 'auto',
        padding: '20px 24px',
        boxSizing: 'border-box'
      }}>
        {showTitle && <h2 style={{ marginTop: 0, marginBottom: '20px' }}>📖 Game Rules</h2>}
        {rulesContent}
      </div>
    );
  }

  if (variant === "collapsible") {
    return (
      <div className="lobby-card">
        <div 
          className="card-header"
          style={{ cursor: 'pointer' }}
          onClick={onToggle}
        >
          <h2>📖 Game Rules</h2>
          <span style={{ 
            fontSize: '18px', 
            transition: 'transform 0.3s', 
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' 
          }}>
            ▼
          </span>
        </div>
        
        {isExpanded && (
          <div className="card-content">
            {rulesContent}
          </div>
        )}
      </div>
    );
  }

  // Default: card variant (for login page)
  return (
    <div className="rules-card">
      <div className="rules-header">
        <h2>🎮 How to Play</h2>
      </div>
      {rulesContent}
    </div>
  );
};

export default GameRules;

