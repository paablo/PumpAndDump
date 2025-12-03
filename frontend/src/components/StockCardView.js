import React from "react";

// Subtle color scheme for each sector - just hints and accents (matches IndexCardView)
const getSectorColors = (sector = "") => {
  const s = sector.toLowerCase();
  
  if (s === "tech") {
    return {
      bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 245, 255, 0.95)), linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%)",
      border: "#3b82f6",
      header: "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))",
      headerBorder: "rgba(59, 130, 246, 0.3)"
    };
  }
  
  if (s === "finance") {
    return {
      bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 253, 244, 0.95)), linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%)",
      border: "#22c55e",
      header: "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(22, 163, 74, 0.08))",
      headerBorder: "rgba(34, 197, 94, 0.3)"
    };
  }
  
  if (s === "industrial") {
    return {
      bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 251, 235, 0.95)), linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.05) 100%)",
      border: "#f59e0b",
      header: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08))",
      headerBorder: "rgba(245, 158, 11, 0.3)"
    };
  }
  
  if (s === "health and science") {
    return {
      bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(250, 245, 255, 0.95)), linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(147, 51, 234, 0.05) 100%)",
      border: "#a855f7",
      header: "linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(147, 51, 234, 0.08))",
      headerBorder: "rgba(168, 85, 247, 0.3)"
    };
  }
  
  // Default colors (if sector doesn't match)
  return {
    bg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.95)), linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
    border: "#2c2c2c",
    header: "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
    headerBorder: "rgba(102, 126, 234, 0.3)"
  };
};

const getSectorEmoji = (sector = "") => {
  const s = sector.toLowerCase();
  if (s === "tech") return "💻";
  if (s === "finance") return "🏦";
  if (s === "industrial") return "🏭";
  if (s === "health and science") return "🧬";
  return "";
};

const StockCardView = ({ stock = {}, indexes = [], styleCardSize = {}, onPurchase, onSell, canPurchase, canSell, ownedStock, stockOwnershipCounts = {}, stockOwnershipByPlayer = {}, playerColors = {}, playerEmojis = {}, actionMode = null, selectedActionCard = null }) => {
  const name = stock.name || stock.Name || "Unnamed";
  const dividend =
    stock.dividend !== undefined ? stock.dividend : stock.div || 0;
  const growth = stock.growth !== undefined ? stock.growth : stock.g || 0;
  const baseCost =
    stock.baseCost !== undefined ? stock.baseCost : stock.base || stock.cost || 0;
  const sector = stock.industrySector || "";
  const sectorEmoji = getSectorEmoji(sector);
  const description = stock.description || "";
  
  // Get colors for this sector
  const colors = getSectorColors(sector);

  // Find the related index and calculate market price: baseCost + indexPrice + (growth * stocksOwned)
  const relatedIndex = indexes.find(idx => idx.name === sector);
  const indexPrice = relatedIndex ? relatedIndex.price : 0;
  const stocksOwned = stockOwnershipCounts[name] || 0;
  const marketPrice = baseCost + indexPrice + (growth * stocksOwned);

  const handlePurchase = () => {
    if (onPurchase && canPurchase) {
      onPurchase(stock);
    }
  };

  const handleSell = () => {
    if (onSell && canSell && ownedStock) {
      onSell(ownedStock);
    }
  };

  const handleApplyAction = () => {
    if (!selectedActionCard || !actionMode) return;
    
    // Reset hover state immediately when action is applied
    setIsHovered(false);
    
    // Determine which handler to call based on action mode
    if (actionMode === "selecting_stock_up" || actionMode === "selecting_stock_buy") {
      // Use purchase handler for "up" manipulations and insider trading
      if (onPurchase) {
        onPurchase(stock);
      }
    } else if (actionMode === "selecting_stock_down") {
      // Use sell handler for "down" manipulations
      if (onSell) {
        onSell(stock);
      }
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const isCarryover = stock.isCarryover === true;
  const isOwned = ownedStock !== null && ownedStock !== undefined;
  
  // Reset hover state when action mode is cleared (action was applied)
  React.useEffect(() => {
    if (!actionMode && !selectedActionCard) {
      setIsHovered(false);
    }
  }, [actionMode, selectedActionCard]);
  
  // Get applied action cards for this stock (exclude insider trading - those don't show in stack)
  const appliedActionCards = (stock.appliedActionCards || []).filter(
    card => card.actionType !== 'insider_trading'
  );
  
  // Determine border and glow based on ownership and carryover status
  const getBorderStyle = () => {
    if (isOwned && isCarryover) {
      // Both owned and carryover - use a gradient border
      return {
        border: '3px solid',
        borderImage: 'linear-gradient(135deg, #4CAF50 0%, #FFD700 100%) 1',
        boxShadow: '0 0 15px rgba(76, 175, 80, 0.4), 0 0 10px rgba(255, 215, 0, 0.3)'
      };
    } else if (isOwned) {
      // Just owned - green border
      return {
        border: '3px solid #4CAF50',
        boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)',
        backgroundColor: 'rgba(76, 175, 80, 0.05)'
      };
    } else if (isCarryover) {
      // Just carryover - gold border
      return {
        border: '3px solid #FFD700',
        boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
      };
    }
    // Default - use sector color
    return {
      borderColor: colors.border
    };
  };
  
  // Calculate total height needed for action card banners above
  // Each card header is 36px, and we want each subsequent card to show more of its header
  const headerHeight = 36;
  const headerOverlap = 6; // How much each card overlaps the previous one (showing 30px of each header)
  const actionCardsHeight = appliedActionCards.length > 0 
    ? headerHeight + (appliedActionCards.length - 1) * (headerHeight - headerOverlap)
    : 0;

  return (
    <div 
      className="stock-card-container" 
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        paddingTop: `${actionCardsHeight}px`,
        overflow: 'visible' // Important: allow overflow to show cards above
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Applied Action Cards Stack - Positioned Behind Stock Card */}
      {/* Reverse array so newest cards appear on top (closest to stock card) */}
      {appliedActionCards.length > 0 && [...appliedActionCards].reverse().map((actionCard, index) => {
        // Get action card colors (matching ActionCardView styling)
        const getActionCardColors = (card) => {
          if (card.actionType === 'insider_trading') {
            return {
              header: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
              border: '#10b981',
              emoji: '🤫'
            };
          } else if (card.actionType === 'manipulate') {
            // All manipulation cards use the same styling (amber/orange)
            return {
              header: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
              border: '#f59e0b',
              emoji: '📊'
            };
          } else if (card.actionType === 'forecast') {
            return {
              header: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
              border: '#3b82f6',
              emoji: '🔮'
            };
          } else if (card.actionType === 'shuffle') {
            return {
              header: 'linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(75, 85, 99, 0.1))',
              border: '#6b7280',
              emoji: '🔀'
            };
          }
          return {
            header: 'linear-gradient(135deg, rgba(156, 163, 175, 0.15), rgba(107, 114, 128, 0.1))',
            border: '#9ca3af',
            emoji: '🎴'
          };
        };

        // Format the modifier display
        const getModifierDisplay = (card) => {
          if (card.actionType === 'insider_trading') {
            return `-$${card.effectValue || 3}`;
          } else if (card.actionType === 'manipulate') {
            // Use effectValue sign to determine modifier display
            const value = card.effectValue || 0;
            return value > 0 ? `+${value}` : `${value}`;
          }
          return '';
        };

        const colors = getActionCardColors(actionCard);
        const modifierText = getModifierDisplay(actionCard);
        const cardHeight = styleCardSize?.height || '280px';
        const headerHeight = 36;
        const headerOverlap = 6; // How much each card overlaps the previous one (showing 30px of each header)
        const offset = index * (headerHeight - headerOverlap); // Each card offset to show more header (30px per card)
        // Calculate z-index: cards with higher offsets (older cards) need higher z-index
        // so their headers appear above newer cards' bodies, but all cards stay behind stock (zIndex < 10)
        const totalCards = appliedActionCards.length;
        // Reverse z-index: older cards (higher index) get higher z-index so headers are visible
        const zIndex = index + 1; // Newest card (index 0) gets zIndex 1, oldest gets highest

        return (
          <div
            key={`${actionCard.name}-${index}-${actionCard.playerName || ''}`}
            style={{
              position: 'absolute',
              top: `${offset}px`, // Position in the paddingTop area
              left: 0,
              right: 0,
              height: cardHeight, // Full card height (most hidden behind stock)
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(240, 248, 255, 0.98))',
              borderRadius: '8px',
              border: `3px solid ${colors.border}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: zIndex, // Higher z-index for newer cards, but all < 10 (stock card)
              pointerEvents: 'none',
              overflow: 'visible' // Allow header to be visible
            }}
          >
            {/* Action card header - this is what peeks out */}
            <div style={{
              height: `${headerHeight}px`,
              background: colors.header,
              borderBottom: `2px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 10px',
              color: '#374151',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              position: 'relative',
              zIndex: zIndex + 1 // Header should be above its own card body
            }}>
              {modifierText ? (
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
                  {modifierText}
                </span>
              ) : (
                <span style={{ fontSize: '1.3rem' }}>{colors.emoji}</span>
              )}
              <span style={{ flex: 1 }}>{actionCard.name}</span>
            </div>
            {/* Rest of card is hidden behind stock card */}
          </div>
        );
      })}
      
      <div className="stock-card card" style={{
        ...styleCardSize,
        background: colors.bg,
        ...getBorderStyle(),
        position: 'relative',
        zIndex: 10 // Ensure stock card is on top
      }}>
        <div className="stock-card-top" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          background: colors.header,
          borderBottom: `2px solid ${colors.headerBorder}`
        }}>
          {sectorEmoji && (
            <span style={{ 
              fontSize: '1.2rem',
              lineHeight: 1 
            }}>
              {sectorEmoji}
            </span>
          )}
          <span style={{ flex: 1 }}>
            {name}
          </span>
          {isOwned && (
            <span style={{
              borderRadius: '4px'
            }}>
    
            </span>
          )}
          {isCarryover && (
            <span style={{
              fontSize: '0.8rem',
              backgroundColor: '#FFD700',
              color: '#000',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              ⭐
            </span>
          )}
        </div>
        
        {description && (
          <div className="stock-card-description">
            {description}
          </div>
        )}
        
        <div className="stock-card-spacer" />
        
        <div className="stock-card-bottom">
          <div className="stock-card-stats-row">
            <div className="stock-card-dividend">🪙 {dividend}</div>
            <div className="stock-card-growth">📈 {growth}x</div>
          </div>
          <div className="stock-card-cost-bar">
            💲{baseCost}+{sectorEmoji}+({stocksOwned}x{growth})={marketPrice}
          </div>
        </div>

        {/* Transparent overlay with buy/sell button(s) */}
        {(onPurchase || onSell) && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background-color 0.2s ease',
              pointerEvents: isHovered ? 'auto' : 'none',
              borderRadius: '8px'
            }}
          >
            {isHovered && (
              <>
                {/* Action Card Apply Button - show when action card is selected */}
                {selectedActionCard && actionMode && (
                  <button
                    onClick={handleApplyAction}
                    style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: '4px solid white',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 16px rgba(33, 150, 243, 0.6)',
                      transition: 'all 0.2s ease',
                      transform: 'scale(1)',
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.15)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(33, 150, 243, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(33, 150, 243, 0.6)';
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>
                      🎴
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      APPLY
                    </div>
                  </button>
                )}
                
                {/* Buy button - show if can buy (hide when action card mode is active) */}
                {onPurchase && !selectedActionCard && (
                  <button
                    onClick={handlePurchase}
                    disabled={!canPurchase}
                    style={{
                      width: canSell ? '85px' : '100px',
                      height: canSell ? '85px' : '100px',
                      borderRadius: '50%',
                      backgroundColor: canPurchase ? '#4CAF50' : '#666',
                      color: 'white',
                      border: '4px solid white',
                      cursor: canPurchase ? 'pointer' : 'not-allowed',
                      fontSize: canSell ? '16px' : '18px',
                      fontWeight: 'bold',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                      transition: 'all 0.2s ease',
                      transform: canPurchase ? 'scale(1)' : 'scale(0.95)',
                      opacity: canPurchase ? 1 : 0.7
                    }}
                    onMouseEnter={(e) => {
                      if (canPurchase) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = canPurchase ? 'scale(1)' : 'scale(0.95)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                    }}
                  >
                    <div style={{ fontSize: canSell ? '12px' : '14px', marginBottom: '4px' }}>
                      {canPurchase ? 'BUY' : 'NO ACTS'}
                    </div>
                    <div style={{ fontSize: canSell ? '18px' : '20px', fontWeight: 'bold' }}>
                      ${marketPrice}
                    </div>
                  </button>
                )}

                {/* Sell button - show if can sell (hide when action card mode is active) */}
                {onSell && ownedStock && !selectedActionCard && (
                  <button
                    onClick={handleSell}
                    disabled={!canSell}
                    style={{
                      width: canPurchase ? '85px' : '100px',
                      height: canPurchase ? '85px' : '100px',
                      borderRadius: '50%',
                      backgroundColor: canSell ? '#f44336' : '#666',
                      color: 'white',
                      border: '4px solid white',
                      cursor: canSell ? 'pointer' : 'not-allowed',
                      fontSize: canPurchase ? '16px' : '18px',
                      fontWeight: 'bold',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                      transition: 'all 0.2s ease',
                      transform: canSell ? 'scale(1)' : 'scale(0.95)',
                      opacity: canSell ? 1 : 0.7
                    }}
                    onMouseEnter={(e) => {
                      if (canSell) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = canSell ? 'scale(1)' : 'scale(0.95)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                    }}
                  >
                    <div style={{ fontSize: canPurchase ? '12px' : '14px', marginBottom: '4px' }}>
                      {canSell ? 'SELL' : 'NO ACTS'}
                    </div>
                    <div style={{ fontSize: canPurchase ? '18px' : '20px', fontWeight: 'bold' }}>
                      ${marketPrice - growth}
                    </div>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Player ownership tokens - shown below the stock card */}
      {Object.keys(stockOwnershipByPlayer).length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginTop: '8px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {Object.entries(stockOwnershipByPlayer).map(([playerName, shareCount]) => (
            <div
              key={playerName}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                backgroundColor: playerColors[playerName] || '#666666',
                borderRadius: '50%',
                border: `3px solid ${playerColors[playerName] || '#666666'}`,
                boxShadow: `0 3px 8px ${playerColors[playerName] ? playerColors[playerName] + '80' : 'rgba(0,0,0,0.3)'}, inset 0 1px 2px rgba(255,255,255,0.2)`,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${playerColors[playerName] ? playerColors[playerName] + 'A0' : 'rgba(0,0,0,0.4)'}, inset 0 1px 2px rgba(255,255,255,0.2)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 3px 8px ${playerColors[playerName] ? playerColors[playerName] + '80' : 'rgba(0,0,0,0.3)'}, inset 0 1px 2px rgba(255,255,255,0.2)`;
              }}
              title={`${playerName}: ${shareCount} share${shareCount !== 1 ? 's' : ''}`}
            >
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>
                {playerEmojis[playerName] || '🎮'}
              </span>
              <span style={{ fontSize: '0.75rem', lineHeight: 1, marginTop: '2px' }}>x{shareCount}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 6px 16px rgba(33, 150, 243, 0.6);
            }
            50% {
              box-shadow: 0 6px 24px rgba(33, 150, 243, 0.9);
            }
          }
          
        `}
      </style>
    </div>
  );
};

export default StockCardView;