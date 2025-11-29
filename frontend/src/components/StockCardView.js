import React from "react";

const getSectorEmoji = (sector = "") => {
  const s = sector.toLowerCase();
  if (s === "tech") return "💻";
  if (s === "finance") return "🏦";
  if (s === "industrial") return "🏭";
  if (s === "health and science") return "🧬";
  return "";
};

const StockCardView = ({ stock = {}, indexes = [], styleCardSize = {} }) => {
  const name = stock.name || stock.Name || "Unnamed";
  const dividend =
    stock.dividend !== undefined ? stock.dividend : stock.div || 0;
  const growth = stock.growth !== undefined ? stock.growth : stock.g || 0;
  const baseCost =
    stock.baseCost !== undefined ? stock.baseCost : stock.base || stock.cost || 0;
  const sector = stock.industrySector || "";
  const sectorEmoji = getSectorEmoji(sector);
  const description = stock.description || "";

  // Find the related index and calculate market price
  const relatedIndex = indexes.find(idx => idx.name === sector);
  const indexPrice = relatedIndex ? relatedIndex.price : 0;
  const marketPrice = baseCost + indexPrice;

  return (
    <div className="stock-card card" style={styleCardSize}>
      <div className="stock-card-top">{name}</div>
      
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
          💲= {baseCost}+{sectorEmoji}+📈 ({marketPrice})
        </div>
      </div>
    </div>
  );
};

export default StockCardView;
