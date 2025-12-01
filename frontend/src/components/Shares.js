import React from "react";
import StockCardView from "./StockCardView";
import Indexes from "./Indexes";

const Shares = ({ 
  styleCardSize, 
  styles, 
  stocks = [], 
  indexes = [], 
  activeEvents = [], 
  visualEffects = [],
  onPurchaseStock,
  onSellStock,
  myTurn,
  actionsRemaining,
  stockOwnershipCounts = {},
  ownedStocks = []
}) => {

  return (
    <div className="shares" style={styles.shares}>
      {/* Indexes rendered via new component */}
      <Indexes indexes={indexes} styleCardSize={styleCardSize} styles={styles} activeEvents={activeEvents} visualEffects={visualEffects} />

      {/* Stock cards below the indexes */}
      <div className="playerCards" style={{ ...styles.cards, marginTop: 8 }}>
        {stocks.length === 0 ? (
          <div style={{ color: "#666", width: "100%", textAlign: "center" }}>No stocks shown</div>
        ) : (
          stocks.map((s, idx) => {
            // Check if player owns this stock
            const ownedStock = ownedStocks.find(owned => owned.name === s.name);
            
            // Both buy and sell can be available if player has actions
            // Buy is available if: has actions and doesn't own it
            // Sell is available if: has actions and owns it
            const canBuy = myTurn && actionsRemaining > 0;
            const canSellThis = myTurn && actionsRemaining > 0 && ownedStock;
            
            return (
              <StockCardView 
                key={idx} 
                stock={s} 
                indexes={indexes} 
                styleCardSize={styleCardSize}
                onPurchase={onPurchaseStock}
                onSell={onSellStock}
                canPurchase={canBuy}
                canSell={canSellThis}
                ownedStock={ownedStock}
                stockOwnershipCounts={stockOwnershipCounts}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Shares;
