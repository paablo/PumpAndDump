import React from "react";

/**
 * RoundTracker
 * Displays round progression with pills and dividend indicators
 */
const RoundTracker = ({ roundNumber }) => {
  return (
    <div className="round-tracker">
      {[1, 2, 3, 4, 5, 6].map((round) => (
        <React.Fragment key={round}>
          <div 
            className={`round-pill ${roundNumber === round ? 'active' : ''} ${roundNumber > round ? 'completed' : ''}`}
          >
            <span className="round-number">R{round}</span>
          </div>
          {/* Show dividend pill after even rounds */}
          {round % 2 === 0 && (
            <div className={`dividend-pill ${roundNumber > round ? 'paid' : ''}`}>
              <span style={{ fontSize: '1rem' }}>🪙</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default RoundTracker;

