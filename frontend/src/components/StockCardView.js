import React from "react";

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

  return (
    <div 
      className="stock-card-container" 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="stock-card card" style={{
        ...styleCardSize,
        border: isCarryover ? '3px solid #FFD700' : undefined,
        boxShadow: isCarryover ? '0 0 10px rgba(255, 215, 0, 0.5)' : undefined,
        position: 'relative'
      }}>
        <div className="stock-card-top">
          {name}
          {isCarryover && (
            <span style={{
              marginLeft: '8px',
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
            💲={baseCost}+{sectorEmoji}+({stocksOwned}x{growth})
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
