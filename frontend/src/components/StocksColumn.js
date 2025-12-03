import React from "react";
import EventsAndIndexes from "./IndexCards";
import StockCardView from "./StockCardView";
import StyledSection from "./StyledSection";

/**
 * StocksColumn
 * Handles rendering of indexes plus the grid of stock cards.
 */
const StocksColumn = ({
  indexes = [],
  styleCardSize,
  activeEvents = [],
  visualEffects = [],
  stocks = [],
  playerPortfolios = {},
  playerName = "",
  onPurchaseStock,
  onSellStock,
  myTurn,
  actionsRemaining,
  actionMode,
  selectedActionCard,
  stockOwnershipCounts = {},
  stockOwnershipByPlayer = {},
  playerColors = {},
  playerEmojis = {}
}) => {
  const myActions = actionsRemaining[playerName] || 0;
  const canBuy = myTurn && myActions > 0;

  return (
    <div className="indexes-column">
      <StyledSection
        title="Indexes"
        icon="📈"
        isEmpty={indexes.length === 0}
        emptyMessage="No indexes available"
      >
        <EventsAndIndexes
          indexes={indexes}
          styleCardSize={styleCardSize}
          activeEvents={activeEvents}
          visualEffects={visualEffects}
        />
      </StyledSection>

      <StyledSection
        title="Stocks"
        icon="💼"
        isEmpty={stocks.length === 0}
        emptyMessage="No stocks available"
        containerStyle={{ marginTop: "20px" }}
      >
        <div className="playerCards" style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          {stocks.map((stock, idx) => {
            const ownedStock =
              (playerPortfolios[playerName] || []).find(
                (owned) => owned.name === stock.name
              ) || null;

            const canSellThis =
              myTurn &&
              myActions > 0 &&
              (ownedStock || actionMode === "selecting_stock_down");

            return (
              <StockCardView
                key={`${stock.name}-${idx}`}
                stock={stock}
                indexes={indexes}
                styleCardSize={styleCardSize}
                onPurchase={onPurchaseStock}
                onSell={onSellStock}
                canPurchase={canBuy}
                canSell={canSellThis}
                ownedStock={ownedStock}
                stockOwnershipCounts={stockOwnershipCounts}
                stockOwnershipByPlayer={stockOwnershipByPlayer[stock.name] || {}}
                playerColors={playerColors}
                playerEmojis={playerEmojis}
                actionMode={actionMode}
                selectedActionCard={selectedActionCard}
              />
            );
          })}
        </div>
      </StyledSection>
    </div>
  );
};

export default StocksColumn;


