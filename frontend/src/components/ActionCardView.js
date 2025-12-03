import React from "react";
import { getActionCardColors } from "./ActionCardColors";

/**
 * ActionCardView - Display component for action cards
 * 
 * Extensible design: Add new action types by updating ActionCardColors.js
 * with corresponding styling for the new action type
 */

const ActionCardView = ({ 
  action, 
  styleCardSize, 
  onSelect, 
  canPlay,
  isSelected 
}) => {
  const actionCardSize = {
    width: styleCardSize?.width || "200px",
    height: styleCardSize?.height || "270px"
  };

  const colors = getActionCardColors(action.actionType);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    if (onSelect && canPlay) {
      onSelect(action);
    }
  };

  const getBorderStyle = () => {
    if (isSelected) {
      return {
        border: '4px solid #fbbf24',
        boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)',
        transform: 'translateY(-5px)'
      };
    }
    return {
      borderColor: colors.border,
      borderWidth: '3px'
    };
  };

  return (
    <div 
      className="action-card-container" 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="stock-card card" style={{
        ...actionCardSize,
        background: colors.bg,
        ...getBorderStyle(),
        position: 'relative',
        cursor: canPlay ? 'pointer' : 'not-allowed',
        opacity: canPlay ? 1 : 0.6,
        transition: 'all 0.2s ease',
        boxShadow: isSelected 
          ? '0 0 20px rgba(251, 191, 36, 0.6), 0 4px 12px rgba(0, 0, 0, 0.15)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Card header */}
        <div className="stock-card-top" style={{
          background: colors.header,
          borderBottom: `2px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px'
        }}>
          {/* Show modifier in banner for manipulate/insider trading, emoji for others */}
          {action.actionType === 'manipulate' || action.actionType === 'insider_trading' ? (
            <span style={{ 
              fontSize: '1.1rem',
              fontWeight: 'bold',
              minWidth: '40px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
              color: colors.border
            }}>
              {action.actionType === 'insider_trading' && `-$${action.effectValue}`}
              {action.actionType === 'manipulate' && (
                action.effectValue > 0 ? `+${action.effectValue}` : `${action.effectValue}`
              )}
            </span>
          ) : (
            <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{colors.emoji}</span>
          )}
          <span style={{ flex: 1, fontWeight: 'bold', fontSize: '0.9rem', lineHeight: 1.2 }}>{action.name}</span>
        </div>

        {/* Card content */}
        <div className="stock-card-spacer" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '12px',
          gap: '10px'
        }}>
          {/* Description */}
          <div style={{
            fontSize: '0.8rem',
            lineHeight: '1.4',
            color: '#374151',
            textAlign: 'center',
            fontStyle: 'italic',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '6px'
          }}>
            {action.description}
          </div>

          {/* Effect value display (only for insider trading, not for manipulate cards) */}
          {action.actionType === 'insider_trading' && action.effectValue > 0 && (
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              textAlign: 'center',
              color: colors.border,
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '8px',
              border: `2px dashed ${colors.border}`
            }}>
              ${action.effectValue} OFF
            </div>
          )}

          {/* Card type label */}
          <div style={{
            fontSize: '0.65rem',
            textAlign: 'center',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: 'auto'
          }}>
            Action Card
          </div>
        </div>

        {/* Hover overlay - "SELECT" indicator */}
        {canPlay && isHovered && !isSelected && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}>
            <div style={{
              background: colors.border,
              color: 'white',
              padding: '10px 20px',
              borderRadius: '25px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              SELECT
            </div>
          </div>
        )}

        {/* Selected indicator - checkmark */}
        {isSelected && (
          <>
            <style>
              {`
                @keyframes pulse-check {
                  0%, 100% { transform: translate(-50%, -50%) scale(1); }
                  50% { transform: translate(-50%, -50%) scale(1.1); }
                }
              `}
            </style>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '3rem',
              animation: 'pulse-check 1s ease-in-out infinite',
              textShadow: '0 2px 8px rgba(251, 191, 36, 0.5)',
              pointerEvents: 'none'
            }}>
              ✓
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionCardView;

