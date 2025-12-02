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

const StockCardView = ({ stock = {}, indexes = [], styleCardSize = {}, onPurchase, onSell, canPurchase, canSell, ownedStock, stockOwnershipCounts = {} }) => {
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

  const [isHovered, setIsHovered] = React.useState(false);
  const isCarryover = stock.isCarryover === true;
  const isOwned = ownedStock !== null && ownedStock !== undefined;
  
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
  
  return (
    <div 
      className="stock-card-container" 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="stock-card card" style={{
        ...styleCardSize,
        background: colors.bg,
        ...getBorderStyle(),
        position: 'relative'
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
                {/* Buy button - show if can buy */}
                {onPurchase && (
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

                {/* Sell button - show if can sell */}
                {onSell && ownedStock && (
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
    </div>
  );
};

export default StockCardView;