import React, { useState } from "react";
import { getActionCardColors } from "./ActionCardColors";

const DrawCardDeck = ({ 
  onDraw, 
  canDraw, 
  handFull,
  styleCardSize = { width: "200px", height: "280px" }
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Use default action card colors (cool-grey) for the deck
  const colors = getActionCardColors("default");

  // Stack of cards visual - 3 cards slightly offset
  const cardStack = [
    { offset: 0, zIndex: 3, opacity: 1 },
    { offset: 4, zIndex: 2, opacity: 0.7 },
    { offset: 8, zIndex: 1, opacity: 0.5 }
  ];

  const handleDraw = () => {
    if (canDraw && !handFull && onDraw) {
      onDraw();
    }
  };

  return (
    <div 
      style={{
        position: 'relative',
        display: 'inline-block',
        marginTop: '20px',
        cursor: (canDraw && !handFull) ? 'pointer' : 'not-allowed'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Stack of cards */}
      <div style={{ position: 'relative', width: styleCardSize.width, height: styleCardSize.height }}>
        {cardStack.map((card, index) => (
          <div
            key={index}
            className="stock-card card"
            style={{
              position: 'absolute',
              top: `${card.offset}px`,
              left: `${card.offset}px`,
              width: styleCardSize.width,
              height: styleCardSize.height,
              background: colors.bg,
              border: `3px solid ${colors.border}`,
              borderRadius: '8px',
              boxShadow: `0 4px 12px ${colors.border}40`,
              zIndex: card.zIndex,
              opacity: card.opacity,
              transition: 'all 0.2s ease',
              transform: isHovered && canDraw && !handFull ? 'translateY(-4px)' : 'translateY(0)',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Card header - styled exactly like ActionCardView */}
            <div className="stock-card-top" style={{
              background: colors.header,
              borderBottom: `2px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px'
            }}>
              <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{colors.emoji}</span>
              <span style={{ flex: 1, fontWeight: 'bold', fontSize: '0.9rem', lineHeight: 1.2 }}>Action Cards</span>
            </div>

            {/* Card back design */}
            <div style={{
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              boxSizing: 'border-box'
            }}>
              <div style={{
                fontSize: '3rem',
                opacity: 0.8,
                marginBottom: '10px'
              }}>
                {colors.emoji}
              </div>
            </div>
          </div>
        ))}

        {/* Hover overlay with circular button - positioned inside card stack container to align with top card */}
        {isHovered && (
          <div 
            style={{
              position: 'absolute',
              top: 11,
              left: 11,
              width: styleCardSize.width,
              height: styleCardSize.height,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              zIndex: 10,
              pointerEvents: 'auto'
            }}
          >
          {handFull ? (
            <button
              disabled
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#666',
                color: 'white',
                border: '4px solid white',
                cursor: 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.2s ease',
                transform: 'scale(0.95)',
                opacity: 0.7
              }}
            >
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                HAND FULL
              </div>
            </button>
          ) : canDraw ? (
            <button
              onClick={handleDraw}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                backgroundColor: colors.border,
                color: 'white',
                border: '4px solid white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 16px ${colors.border}99`,
                transition: 'all 0.2s ease',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.boxShadow = `0 8px 20px ${colors.border}CC`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${colors.border}99`;
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>
                {colors.emoji}
              </div>
              <div style={{ fontSize: '14px' }}>
                PICK UP
              </div>
            </button>
          ) : (
            <button
              disabled
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#666',
                color: 'white',
                border: '4px solid white',
                cursor: 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.2s ease',
                transform: 'scale(0.95)',
                opacity: 0.7
              }}
            >
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                NOT YOUR TURN
              </div>
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default DrawCardDeck;

