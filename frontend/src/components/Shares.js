import React from "react";
import StockCardView from "./StockCardView";
import Indexes from "./Indexes";

const Shares = ({ styleCardSize, styles, stocks = [], indexes = [] }) => {


  return (
    <div className="shares" style={styles.shares}>
      {/* Indexes rendered via new component */}
      <Indexes indexes={indexes} styleCardSize={styleCardSize} styles={styles} />

      {/* Stock cards below the indexes */}
      <h3 style={{ marginTop: 12 }}>Stock Cards</h3>
      <div className="playerCards" style={{ ...styles.cards, marginTop: 8 }}>
        {stocks.length === 0 ? (
          <div style={{ color: "#666", width: "100%", textAlign: "center" }}>No stocks shown</div>
        ) : (
          stocks.map((s, idx) => {
            return <StockCardView key={idx} stock={s} styleCardSize={styleCardSize} />;
          })
        )}
      </div>
    </div>
  );
};

export default Shares;
