import React from "react";

const StockCardView = ({ stock = {}, styleCardSize = {} }) => {
  const name = stock.name || stock.Name || "Unnamed";
  const dividend =
    stock.dividend !== undefined ? stock.dividend : stock.div || 0;
  const growth = stock.growth !== undefined ? stock.growth : stock.g || 0;
  const baseCost =
    stock.baseCost !== undefined ? stock.baseCost : stock.base || stock.cost || 0;

  return (
    <div className="stock-card card" style={styleCardSize}>
      <div className="stock-card-top">{name}</div>
      <div className="stock-card-spacer" />
      <div className="stock-card-bottom">
        <div className="stock-card-bottom-left">
          <div className="stock-card-dividend">💰 {dividend}</div>
          <div className="stock-card-growth">📈 {growth}</div>
        </div>
        <div className="stock-card-bottom-right">💲+{baseCost}</div>
      </div>
    </div>
  );
};

export default StockCardView;
