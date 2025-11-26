import React from "react";

const Shares = ({ styleCardSize, styles }) => {
  return (
    <div className="shares" style={styles.shares}>
      <h3>Indexes</h3>
      <div className="share-cards" style={styles.cards}>
        <div className="card" style={styleCardSize}></div>
        <div className="card" style={styleCardSize}></div>
        <div className="card" style={styleCardSize}></div>
        <div className="card" style={styleCardSize}></div>
      </div>
    </div>
  );
};

export default Shares;
