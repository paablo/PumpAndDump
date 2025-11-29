import React from "react";
import StockCardView from "./StockCardView";
import Indexes from "./Indexes";

const Shares = ({ styleCardSize, styles, stocks = [], indexes = [], activeEvents = [], visualEffects = [] }) => {


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
            return <StockCardView key={idx} stock={s} indexes={indexes} styleCardSize={styleCardSize} />;
          })
        )}
      </div>
    </div>
  );
};

export default Shares;
